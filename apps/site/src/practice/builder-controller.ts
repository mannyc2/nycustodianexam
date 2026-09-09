import { makeScreenStore } from "../screen/store.ts"
import type { ReviewQuestionSource } from "../review/model.ts"
import { practiceInventoryFromReview } from "./review-source.ts"
import { assemblePracticeQuestions } from "./question-set.ts"
import { practiceSetSeedLimit } from "./set.ts"

export const createPracticeBuilderController = (input: {
  readonly sources: ReadonlyArray<ReviewQuestionSource>
  readonly navigate: (path: string) => void
}) => {
  const inventory = practiceInventoryFromReview(input.sources)
  const categories = [...new Set(inventory.map(({ category }) => category))].sort()
  let selected: ReadonlyArray<string> = categories
  let length = 45
  let seed = "practice"
  let failure: string | null = null
  let navigating = false
  let disposed = false
  const project = () => {
    const capacity = inventory.filter(({ category }) => selected.includes(category)).length
    const lengths = [...new Set([45, 60, 90, length, ...(capacity > 0 ? [capacity] : [])])].sort((a, b) => a - b)
    const valid = !navigating && Number.isSafeInteger(length) && length > 0 && length <= capacity && seed.trim().length > 0 && seed.trim().length <= practiceSetSeedLimit
    return { inventory, categories, selected, length, seed, failure, navigating, capacity, lengths, valid }
  }
  const screen = makeScreenStore<ReturnType<typeof project>, "failure">({ initialState: project(), requestIdPrefix: "practice-builder-" })
  const update = (change: () => void) => {
    if (disposed || navigating) return
    change()
    failure = null
    screen.publish(project())
  }
  const actions = {
    selectCategory: (category: string, checked: boolean) => {
      if (!categories.includes(category)) return
      update(() => { selected = checked ? [...new Set([...selected, category])] : selected.filter((value) => value !== category) })
    },
    setLength: (value: number) => update(() => { length = value }),
    setSeed: (value: string) => update(() => { seed = value }),
    start: () => {
      if (disposed || !screen.getSnapshot().state.valid) return
      try {
        const first = assemblePracticeQuestions(inventory, { seed, categories: selected, length })[0]
        if (first === undefined) throw new Error("No matching items")
        navigating = true
        screen.publish(project())
        if (!disposed) input.navigate(first.href)
      } catch {
        if (disposed) return
        navigating = false
        failure = "This set could not be prepared from the available study material. Check your choices and try again."
        screen.publish(project(), { focus: "failure" })
      }
    }
  }
  return { getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot, subscribe: screen.subscribe,
    acknowledgeRequest: screen.acknowledgeRequest, actions, dispose: () => { disposed = true; screen.dispose() } }
}
export type PracticeBuilderController = ReturnType<typeof createPracticeBuilderController>
