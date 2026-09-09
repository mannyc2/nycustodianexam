import type { ReactNode } from "react"
import type { SimulationPlayerController } from "../controller.ts"
import { SimulationQuestionContext, type SimulationQuestionValue } from "./question-context.tsx"

export const SimulationQuestionProvider = ({ controller, state, meta, children }: {
  readonly controller: SimulationPlayerController
  readonly state: SimulationQuestionValue["state"]
  readonly meta: SimulationQuestionValue["meta"]
  readonly children: ReactNode
}) => <SimulationQuestionContext value={{ state, meta, actions: {
  selectPresentation: (presentation) => controller.dispatch({ tag: "select-presentation", presentation }),
  selectOption: (optionId) => controller.dispatch({ tag: "select-option", optionId }),
  toggleFlag: () => controller.dispatch({ tag: "toggle-flag" })
} }}>{children}</SimulationQuestionContext>
