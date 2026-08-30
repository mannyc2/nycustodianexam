import { useEffect, useMemo, useRef, useState } from "react"
import {
  createLocallyClosedSimulation,
  type SimulationEffectRunner
} from "../controller.ts"
import {
  assembleSimulation,
  simulationCapacity,
  simulationCategoryCapacities,
  simulationHazardCapacity,
  simulationHazardCategoryCapacities
} from "../generation.ts"
import {
  SimulationBootstrap,
  SimulationTimingSettings,
  type SimulationFormat,
  simulationQuestionPath
} from "../model.ts"
import { deterministicSeedMaxLength } from "../../deterministic-seed.ts"

const createSessionId = (): string => `sim-${crypto.randomUUID().toLowerCase()}`

const failureDetail = (cause: unknown): string => {
  console.error("Unable to create the simulation", cause)
  return "The simulation could not be saved on this device. Nothing was created — check free storage, then try again."
}

export const SimulationSetup = ({
  bootstrap,
  navigate,
  runtime
}: {
  readonly bootstrap: SimulationBootstrap
  readonly navigate: (path: string) => void
  readonly runtime: SimulationEffectRunner
}) => {
  const [profileId, setProfileId] = useState("")
  const [format, setFormat] = useState<SimulationFormat>("questions")
  const selectedProfile = bootstrap.profiles.find((profile) => profile.id === profileId)
  const categories = useMemo(
    () => format === "questions"
      ? simulationCategoryCapacities(bootstrap.inventory, profileId)
      : simulationHazardCategoryCapacities(bootstrap.hazards, profileId),
    [bootstrap.hazards, bootstrap.inventory, format, profileId]
  )
  const [selectedCategories, setSelectedCategories] = useState<ReadonlyArray<string>>(
    categories.map(({ category }) => category)
  )
  const capacity = format === "questions"
    ? simulationCapacity(bootstrap.inventory, selectedCategories, profileId)
    : simulationHazardCapacity(bootstrap.hazards, selectedCategories, profileId)
  const lengths = useMemo(
    () => [...new Set([
      ...(capacity > 0 ? [capacity] : []),
      ...(format === "questions"
        ? bootstrap.advertisedLengths
        : [1, 5, 10].filter((candidate) => candidate <= capacity))
    ])].sort((left, right) => left - right),
    [bootstrap.advertisedLengths, capacity, format]
  )
  const [length, setLength] = useState(0)
  const [seed, setSeed] = useState(`${bootstrap.releaseId}-practice`)
  const [timingMode, setTimingMode] = useState<"untimed" | "timed">("untimed")
  const [durationMinutes, setDurationMinutes] = useState(120)
  const [timerHidden, setTimerHidden] = useState(false)
  const [autoSubmit, setAutoSubmit] = useState(false)
  const timingValid = timingMode === "untimed" ||
    Number.isSafeInteger(durationMinutes) && durationMinutes >= 1 && durationMinutes <= 240
  const [status, setStatus] = useState<
    | { readonly tag: "idle" }
    | { readonly tag: "creating" }
    | { readonly tag: "failure"; readonly detail: string }
  >({ tag: "idle" })
  const failureRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (status.tag === "failure") failureRef.current?.focus()
  }, [status.tag])

  useEffect(() => {
    if (capacity > 0) setLength((current) => Math.min(Math.max(1, current), capacity))
  }, [capacity])

  useEffect(() => {
    const profileCategories = categories.map(({ category }) => category)
    setSelectedCategories(profileCategories)
    setLength(format === "questions"
      ? simulationCapacity(bootstrap.inventory, profileCategories, profileId)
      : simulationHazardCapacity(bootstrap.hazards, profileCategories, profileId))
  }, [bootstrap.hazards, bootstrap.inventory, categories, format, profileId])

  const start = (): void => {
    if (
      status.tag === "creating" || selectedProfile === undefined || capacity === 0 || length > capacity ||
      seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength || !timingValid
    ) return
    setStatus({ tag: "creating" })
    const sessionId = createSessionId()
    let session
    try {
      session = assembleSimulation({
        bootstrap,
        sessionId,
        profileId,
        format,
        length,
        seed,
        selectedCategories,
        timing: new SimulationTimingSettings(timingMode === "untimed"
          ? { mode: "untimed", durationSeconds: null, timerVisible: false, autoSubmit: false }
          : {
              mode: "timed",
              durationSeconds: durationMinutes * 60,
              timerVisible: !timerHidden,
              autoSubmit
            }),
        now: Date.now()
      })
    } catch (cause) {
      setStatus({ tag: "failure", detail: failureDetail(cause) })
      return
    }
    void runtime.runPromise(createLocallyClosedSimulation(session)).then(
      (saved) => navigate(simulationQuestionPath(saved.id, 1)),
      (cause) => setStatus({
        tag: "failure",
        detail: failureDetail(cause)
      })
    )
  }

  return <div className="simulation-setup-panel">
    <section aria-labelledby="simulation-settings-heading" className="reference-card">
      <h2 id="simulation-settings-heading">Simulation settings</h2>
      <label className="field-label" htmlFor="simulation-profile">Practicing for</label>
      <select
        disabled={status.tag === "creating"}
        id="simulation-profile"
        onChange={(event) => setProfileId(event.target.value)}
        value={profileId}
      >
        <option disabled value="">Choose a study profile</option>
        {bootstrap.profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>{profile.label} · {profile.jurisdiction}</option>
        ))}
      </select>
      {selectedProfile === undefined
        ? <p className="source-note">Choose the statewide series or a jurisdiction-specific profile before starting. The choice controls which practice content can appear.</p>
        : <p className="source-note"><strong>Practicing for: {selectedProfile.label}.</strong> {selectedProfile.disclaimer}</p>}
      <fieldset>
        <legend>Practice format</legend>
        <label><input checked={format === "questions"} disabled={status.tag === "creating"} name="simulation-format" onChange={() => setFormat("questions")} type="radio" /> Multiple-choice questions</label>
        <label><input checked={format === "visual-hazards"} disabled={status.tag === "creating" || bootstrap.hazards.length === 0} name="simulation-format" onChange={() => setFormat("visual-hazards")} type="radio" /> Visual hazard scenes</label>
        <label><input checked={format === "nonvisual-hazards"} disabled={status.tag === "creating" || bootstrap.hazards.length === 0} name="simulation-format" onChange={() => setFormat("nonvisual-hazards")} type="radio" /> Hazard scenes — keyboard, no image</label>
        <p className="field-hint">Visual and keyboard hazard results are tracked separately because they are different tasks.</p>
      </fieldset>
      <fieldset>
        <legend>Content mix</legend>
        {categories.map(({ category, count }) => <label key={category}>
          <input
            checked={selectedCategories.includes(category)}
            disabled={status.tag === "creating"}
            onChange={(event) => setSelectedCategories((current) => event.target.checked
              ? [...current, category].sort()
              : current.filter((candidate) => candidate !== category))}
            type="checkbox"
          /> {category} ({count} unique {count === 1 ? "item" : "items"})
        </label>)}
        <p><strong>Available items for this mix:</strong> {capacity}</p>
        {selectedProfile === undefined
          ? <p className="field-hint" role="status">Choose a study profile to see the available content categories.</p>
          : capacity === 0
            ? <p className="field-hint" role="status">Select at least one content category to create a simulation.</p>
            : null}
      </fieldset>
      <fieldset>
        <legend>Set length</legend>
        <div className="answer-list">
          {lengths.map((candidate) => {
            const available = candidate <= capacity
            return <label className="answer-option" key={candidate}>
              <input
                checked={length === candidate}
                disabled={!available || status.tag === "creating"}
                name="simulation-length"
                onChange={() => setLength(candidate)}
                type="radio"
                value={candidate}
              />
              <span>{candidate} items{available
                ? " — available without repeats"
                : ` — unavailable; ${capacity} unique items in this release`}</span>
            </label>
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend>Practice timing</legend>
        <label><input checked={timingMode === "untimed"} disabled={status.tag === "creating"} name="simulation-timing" onChange={() => setTimingMode("untimed")} type="radio" /> Untimed</label>
        <label><input checked={timingMode === "timed"} disabled={status.tag === "creating"} name="simulation-timing" onChange={() => setTimingMode("timed")} type="radio" /> Timed practice</label>
        <label htmlFor="simulation-duration">Practice duration (minutes)</label>
        <input
          disabled={timingMode !== "timed" || status.tag === "creating"}
          id="simulation-duration"
          max={240}
          min={1}
          onChange={(event) => setDurationMinutes(event.currentTarget.valueAsNumber)}
          type="number"
          value={durationMinutes}
        />
        <label><input checked={timerHidden} disabled={timingMode !== "timed" || status.tag === "creating"} onChange={(event) => setTimerHidden(event.target.checked)} type="checkbox" /> Start with timer hidden</label>
        <label><input checked={autoSubmit} disabled={timingMode !== "timed" || status.tag === "creating"} onChange={(event) => setAutoSubmit(event.target.checked)} type="checkbox" /> Auto-submit when practice time expires</label>
        <p className="field-hint">Auto-submit is off unless you opt in. A timed simulation without it stays editable after the timer reaches zero.</p>
      </fieldset>
      <details className="source-note">
        <summary>Repeat this exact set</summary>
        <label className="field-label" htmlFor="simulation-seed">Set code (seed)</label>
        <input
          className="text-input"
          disabled={status.tag === "creating"}
          id="simulation-seed"
          maxLength={deterministicSeedMaxLength}
          onChange={(event) => setSeed(event.target.value)}
          value={seed}
        />
        <p>The same available release, format, settings, and code produce the same item order. A saved simulation records the exact items it was created with; it can restore them while that saved browser data remains available.</p>
      </details>
      <button
        className="button button-primary"
        disabled={status.tag === "creating" || selectedProfile === undefined || capacity === 0 || length > capacity || seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength || !timingValid}
        onClick={start}
        type="button"
      >{status.tag === "creating" ? "Preparing your simulation…" : "Start simulation"}</button>
      {status.tag === "failure" && <section className="error-panel" role="alert">
        <h3 ref={failureRef} tabIndex={-1}>Simulation was not created</h3><p>{status.detail}</p>
      </section>}
    </section>
    <aside className="reference-card" aria-labelledby="simulation-availability-heading">
      <h2 id="simulation-availability-heading">Available in this release</h2>
      <ul>
        <li>Multiple-choice question sets</li>
        <li>Visual hazard scenes, with the images saved on this device</li>
        <li>Keyboard hazard scenes with no image</li>
        <li>Answers and flags that autosave on this device and stay editable until you finish</li>
        <li>Practice-only results with the set's actual mix — never an official score</li>
      </ul>
      <p>Your answers are saved on this device as you go. No answer or explanation is revealed until you submit the whole simulation.</p>
    </aside>
  </div>
}
