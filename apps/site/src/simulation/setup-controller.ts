import { makeScreenStore } from "../screen/store.ts"
import { studyContentProfileId } from "../study-content.ts"
import { deterministicSeedMaxLength } from "../deterministic-seed.ts"
import { assembleSimulation, simulationCapacity, simulationCategoryCapacities, simulationHazardCapacity, simulationHazardCategoryCapacities } from "./generation.ts"
import { SimulationTimingSettings, simulationQuestionPath, type SimulationBootstrap, type SimulationFormat, type SimulationSessionRecord } from "./model.ts"

interface Settings {
  readonly format: SimulationFormat
  readonly selectedCategories: ReadonlyArray<string>
  readonly requestedLength: number
  readonly seed: string
  readonly timingMode: "untimed" | "timed"
  readonly durationMinutes: number
  readonly timerHidden: boolean
  readonly autoSubmit: boolean
}
type Status = { readonly tag: "idle" } | { readonly tag: "creating" } | { readonly tag: "failure"; readonly detail: string }

export const createSimulationSetupController = (input: {
  readonly bootstrap: SimulationBootstrap
  readonly createSessionId: () => string
  readonly now: () => number
  readonly save: (session: SimulationSessionRecord) => Promise<SimulationSessionRecord>
  readonly navigate: (path: string) => void
}) => {
  const { bootstrap } = input
  const profileId = studyContentProfileId
  const categoriesFor = (format: SimulationFormat) => format === "questions"
    ? simulationCategoryCapacities(bootstrap.inventory, profileId)
    : simulationHazardCategoryCapacities(bootstrap.hazards, profileId)
  let settings: Settings = {
    format: "questions", selectedCategories: categoriesFor("questions").map(({ category }) => category),
    requestedLength: Math.min(...bootstrap.advertisedLengths), seed: `${bootstrap.releaseId}-practice`,
    timingMode: "untimed", durationMinutes: 120, timerHidden: false, autoSubmit: false
  }
  let status: Status = { tag: "idle" }
  let disposed = false
  const project = () => {
    const categories = categoriesFor(settings.format)
    const capacity = settings.format === "questions"
      ? simulationCapacity(bootstrap.inventory, settings.selectedCategories, profileId)
      : simulationHazardCapacity(bootstrap.hazards, settings.selectedCategories, profileId)
    const selectedProfile = bootstrap.profiles.find((profile) => profile.id === profileId)
    const length = settings.requestedLength
    const lengthValid = length > 0 && length <= capacity
    const timingValid = settings.timingMode === "untimed" || Number.isSafeInteger(settings.durationMinutes) && settings.durationMinutes >= 1 && settings.durationMinutes <= 240
    const lengths = [...new Set([...(settings.format === "questions" ? bootstrap.advertisedLengths : [1, 5, 10]), ...(capacity > 0 ? [capacity] : []), length])].sort((left, right) => left - right)
    const canStart = status.tag !== "creating" && selectedProfile !== undefined && capacity > 0 && lengthValid && settings.seed.trim().length > 0 && settings.seed.trim().length <= deterministicSeedMaxLength && timingValid
    return { ...settings, bootstrap, status, categories, capacity, selectedProfile, length, lengthValid, timingValid, lengths, canStart }
  }
  const screen = makeScreenStore<ReturnType<typeof project>, "failure">({ initialState: project(), requestIdPrefix: "simulation-setup-" })
  const update = (patch: Partial<Settings>) => {
    if (disposed || status.tag === "creating") return
    settings = { ...settings, ...patch }
    screen.publish(project())
  }
  const start = async () => {
    if (disposed || !screen.getSnapshot().state.canStart) return
    status = { tag: "creating" }
    screen.publish(project())
    let saved: SimulationSessionRecord
    try {
      const session = assembleSimulation({ bootstrap, sessionId: input.createSessionId(), profileId,
        format: settings.format, length: settings.requestedLength, seed: settings.seed,
        selectedCategories: settings.selectedCategories,
        timing: new SimulationTimingSettings(settings.timingMode === "untimed"
          ? { mode: "untimed", durationSeconds: null, timerVisible: false, autoSubmit: false }
          : { mode: "timed", durationSeconds: settings.durationMinutes * 60, timerVisible: !settings.timerHidden, autoSubmit: settings.autoSubmit }),
        now: input.now()
      })
      saved = await input.save(session)
    } catch (cause) {
      if (disposed) return
      console.error("Unable to create the simulation", cause)
      status = { tag: "failure", detail: "The simulation could not be saved on this device. Nothing was created — check free storage, then try again." }
      screen.publish(project(), { focus: "failure" })
      return
    }
    if (!disposed) input.navigate(simulationQuestionPath(saved.id, 1))
  }
  const actions = {
    changeFormat: (format: SimulationFormat) => {
      if (format === settings.format) return
      update((format === "questions") !== (settings.format === "questions")
        ? { format, selectedCategories: categoriesFor(format).map(({ category }) => category), requestedLength: format === "questions" ? Math.min(...bootstrap.advertisedLengths) : 1 }
        : { format })
    },
    selectCategory: (category: string, selected: boolean) => {
      if (!categoriesFor(settings.format).some((entry) => entry.category === category)) return
      update({ selectedCategories: selected ? [...new Set([...settings.selectedCategories, category])].sort() : settings.selectedCategories.filter((candidate) => candidate !== category) })
    },
    setRequestedLength: (requestedLength: number) => update({ requestedLength }),
    setSeed: (seed: string) => update({ seed }),
    setTimingMode: (timingMode: Settings["timingMode"]) => update({ timingMode }),
    setDurationMinutes: (durationMinutes: number) => update({ durationMinutes }),
    setTimerHidden: (timerHidden: boolean) => update({ timerHidden }),
    setAutoSubmit: (autoSubmit: boolean) => update({ autoSubmit }),
    start: () => { void start() }
  }
  return { getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot, subscribe: screen.subscribe,
    acknowledgeRequest: screen.acknowledgeRequest, actions,
    dispose: () => { disposed = true; screen.dispose() }
  }
}
export type SimulationSetupController = ReturnType<typeof createSimulationSetupController>
