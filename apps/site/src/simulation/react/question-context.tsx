import { createContext, use, type RefObject } from "react"
import type { SimulationPlayerState } from "../controller.ts"
import type { SimulationSessionItem, SimulationResponse } from "../model.ts"
import type { QuestionPresentation } from "../../question-presentation.ts"

export interface SimulationQuestionValue {
  readonly state: {
    readonly snapshot: Extract<SimulationPlayerState, { readonly tag: "ready" }>
    readonly item: SimulationSessionItem
    readonly position: number
    readonly response: SimulationResponse | undefined
    readonly answerEditBlocked: boolean
  }
  readonly actions: {
    readonly selectPresentation: (presentation: QuestionPresentation) => void
    readonly selectOption: (optionId: string) => void
    readonly toggleFlag: () => void
  }
  readonly meta: { readonly presentationToggleRef: RefObject<HTMLButtonElement | null> }
}

export const SimulationQuestionContext = createContext<SimulationQuestionValue | null>(null)
export const useSimulationQuestion = (): SimulationQuestionValue => {
  const value = use(SimulationQuestionContext)
  if (value === null) throw new Error("Simulation question pieces require SimulationQuestionProvider")
  return value
}
