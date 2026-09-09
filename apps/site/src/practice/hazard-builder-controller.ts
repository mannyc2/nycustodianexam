import { makeScreenStore } from "../screen/store.ts"
import type { ReviewSceneSource } from "../review/model.ts"
import { assembleHazardDrill, type HazardPracticeMode } from "./hazard-set.ts"
import { practiceSetSeedLimit } from "./set.ts"

export const createHazardBuilderController = (input: {
  readonly sources: ReadonlyArray<ReviewSceneSource>
  readonly navigate: (path: string) => void
}) => {
  const { sources } = input
  const counts = [...new Set([1, 5, 10, ...(sources.length > 0 ? [sources.length] : [])])].sort((a, b) => a - b)
  let length = 1
  let mode: HazardPracticeMode = "visual"
  let seed = "practice"
  let failure = false
  let navigating = false
  let disposed = false
  const project = () => ({ sources, counts, length, mode, seed, failure, navigating,
    valid: !navigating && Number.isSafeInteger(length) && length > 0 && length <= sources.length && seed.trim().length > 0 && seed.trim().length <= practiceSetSeedLimit })
  const screen = makeScreenStore<ReturnType<typeof project>, "failure">({ initialState: project(), requestIdPrefix: "hazard-builder-" })
  const update = (change: () => void) => {
    if (disposed || navigating) return
    change()
    failure = false
    screen.publish(project())
  }
  const actions = {
    setLength: (value: number) => update(() => { length = value }),
    setMode: (value: HazardPracticeMode) => update(() => { mode = value }),
    setSeed: (value: string) => update(() => { seed = value }),
    start: () => {
      if (disposed || !screen.getSnapshot().state.valid) return
      try {
        const first = assembleHazardDrill(sources, { seed, length, mode })[0]
        if (first === undefined) throw new Error("Unavailable drill")
        navigating = true
        screen.publish(project())
        if (!disposed) input.navigate(first.href)
      } catch {
        if (disposed) return
        navigating = false
        failure = true
        screen.publish(project(), { focus: "failure" })
      }
    }
  }
  return { getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot, subscribe: screen.subscribe,
    acknowledgeRequest: screen.acknowledgeRequest, actions, dispose: () => { disposed = true; screen.dispose() } }
}
export type HazardBuilderController = ReturnType<typeof createHazardBuilderController>
