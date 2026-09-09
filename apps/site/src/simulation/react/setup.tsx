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
import { studyContentProfileId } from "../../study-content.ts"
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
  const profileId = studyContentProfileId
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
  const [requestedLength, setRequestedLength] = useState(Math.min(...bootstrap.advertisedLengths))
  const lengths = [...new Set([
    ...(format === "questions" ? bootstrap.advertisedLengths : [1, 5, 10]),
    ...(capacity > 0 ? [capacity] : []),
    requestedLength
  ])].sort((left, right) => left - right)
  const length = requestedLength
  const lengthValid = length > 0 && length <= capacity
  const changeFormat = (next: SimulationFormat): void => {
    if (next === format) return
    const nextCategories = next === "questions"
      ? simulationCategoryCapacities(bootstrap.inventory, profileId)
      : simulationHazardCategoryCapacities(bootstrap.hazards, profileId)
    setFormat(next)
    if ((next === "questions") !== (format === "questions")) {
      setSelectedCategories(nextCategories.map(({ category }) => category))
      setRequestedLength(next === "questions" ? Math.min(...bootstrap.advertisedLengths) : 1)
    }
  }
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

  const start = (): void => {
    if (
      status.tag === "creating" || selectedProfile === undefined || capacity === 0 || !lengthValid ||
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
    <section aria-labelledby="simulation-settings-heading" className="reference-card simulation-settings">
      <div className="setup-scope-note">
        <h2>What every set draws on</h2>
        <p>One bank of {bootstrap.inventory.length} original questions for the New York Entry-Level Custodians and Janitors series. Your choices change how many items you answer and which subject areas they come from. Nothing here selects an examination.</p>
        <p><a href="/practice/#covers">What practice covers</a>{" · "}<a href="/exams/">Compare with your announcement</a></p>
      </div>
      <h2 id="simulation-settings-heading">Full simulation</h2>
      <p className="player-selection-note">Choose content and timing. Your answers stay editable until you submit the whole simulation. This is original practice, never an official test or score.</p>
      {selectedProfile === undefined ? <p className="notice notice-warning" role="alert">The shared study bank is unavailable in this release. A different bank will not be substituted.</p> : null}
      <fieldset className="simulation-format-fields">
        <legend>Practice format</legend>
        <label><input checked={format === "questions"} disabled={status.tag === "creating"} name="simulation-format" onChange={() => changeFormat("questions")} type="radio" /> Multiple-choice questions</label>
        <label><input checked={format === "visual-hazards"} disabled={status.tag === "creating" || bootstrap.hazards.length === 0} name="simulation-format" onChange={() => changeFormat("visual-hazards")} type="radio" /> Visual hazard scenes</label>
        <label><input checked={format === "nonvisual-hazards"} disabled={status.tag === "creating" || bootstrap.hazards.length === 0} name="simulation-format" onChange={() => changeFormat("nonvisual-hazards")} type="radio" /> Hazard scenes — keyboard, no image</label>
        <p className="field-hint">Visual and keyboard hazard results are tracked separately because they are different tasks.</p>
      </fieldset>
      {format === "questions" || categories.length > 1 ? <fieldset className="simulation-mix-fields">
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
        {capacity === 0 ? <p className="field-hint" role="status">Select at least one content category to create a simulation.</p> : null}
        <p className="field-hint">Items are shuffled once across the selected areas. There is no missed-question weighting or illustrated/written quota.</p>
      </fieldset> : <p className="setup-inventory-note">All {capacity} released scenes are available. The visual task uses markers; the keyboard task uses written zones.</p>}
      <fieldset className="simulation-length-fields">
        <legend>Set length</legend>
        <p className="field-hint">{format === "questions"
          ? `${bootstrap.advertisedLengths.join(", ")} are preset question lengths.`
          : "1, 5 and 10 are preset scene counts."} You can also use all matching {format === "questions" ? "questions" : "scenes"}. No set is padded with repeats or quietly shortened.</p>
        {!lengthValid && capacity > 0 ? <p className="notice notice-warning" role="status">Your chosen length of {length} no longer fits: {capacity} items match. Choose a replacement length before starting.</p> : null}
        <div className="answer-list">
          {lengths.map((candidate) => {
            const available = candidate <= capacity
            return <label className="answer-option" key={candidate}>
              <input
                checked={lengthValid && length === candidate}
                disabled={!available || status.tag === "creating"}
                name="simulation-length"
                onChange={() => setRequestedLength(candidate)}
                type="radio"
                value={candidate}
              />
              <span>{candidate} items{candidate === capacity ? " — all matching" : ""}{available
                ? " — available without repeats"
                : ` — unavailable; ${capacity} unique items in this release`}</span>
            </label>
          })}
        </div>
      </fieldset>
      <fieldset className="simulation-timing-fields">
        <legend>Practice timing</legend>
        <label><input checked={timingMode === "untimed"} disabled={status.tag === "creating"} name="simulation-timing" onChange={() => setTimingMode("untimed")} type="radio" /> Untimed</label>
        <label><input checked={timingMode === "timed"} disabled={status.tag === "creating"} name="simulation-timing" onChange={() => setTimingMode("timed")} type="radio" /> Timed practice</label>
        {timingMode === "timed" ? <>
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
        </> : null}
      </fieldset>
      {status.tag === "failure" && <section className="error-panel" role="alert">
        <h3 ref={failureRef} tabIndex={-1}>Simulation was not created</h3><p>{status.detail}</p>
      </section>}
    </section>
    <aside className="reference-card simulation-preview" aria-labelledby="simulation-availability-heading">
      <p className="eyebrow">Before you start</p>
      <h2 id="simulation-availability-heading">Your simulation, before you start</h2>
      <dl className="simulation-preview-facts">
        <div><dt>Format</dt><dd>{format === "questions" ? "Multiple-choice questions" : format === "visual-hazards" ? "Visual hazard scenes" : "Hazard scenes — keyboard, no image"}</dd></div>
        <div><dt>Length</dt><dd>{capacity === 0 ? "Choose your content mix" : !lengthValid ? "Choose a replacement length" : `${length} ${length === 1 ? "item" : "items"}`}</dd></div>
        <div><dt>Timing</dt><dd>{timingMode === "untimed" ? "Untimed — work at your own pace" : timingValid ? `${durationMinutes} minutes${autoSubmit ? " · auto-submit on" : " · auto-submit off"}` : "Enter a duration from 1 to 240 minutes"}</dd></div>
        <div><dt>Feedback</dt><dd>After final submission</dd></div>
        <div><dt>Saved</dt><dd>Answers and flags stay editable on this device until you submit.</dd></div>
      </dl>
      <p className="simulation-practice-note">This is original practice. The length, content mix, and results do not represent an official exam.</p>
      <details className="simulation-inclusions">
      <summary>What your simulation includes</summary>
      <ul>
        <li>Multiple-choice question sets</li>
        <li>Visual hazard scenes, with the images saved on this device</li>
        <li>Keyboard hazard scenes with no image</li>
        <li>Answers and flags that autosave on this device and stay editable until you finish</li>
        <li>Practice-only results with the set's actual mix — never an official score</li>
      </ul>
      <p>Your answers are saved on this device as you go. No answer or explanation is revealed until you submit the whole simulation.</p>
      </details>
    </aside>
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
      <div className="player-action-bar">
        <button
          className="button button-primary"
          disabled={status.tag === "creating" || selectedProfile === undefined || capacity === 0 || !lengthValid || seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength || !timingValid}
          onClick={start}
          type="button"
        >{status.tag === "creating" ? "Preparing your simulation…" : "Start simulation"}</button>
        <span className="player-action-note">No account needed · Saved on this device</span>
      </div>
  </div>
}
