import type { ReactNode } from "react"
import { useSimulationPlayer } from "./player-provider.tsx"
import { SimulationQuestionContext, type SimulationQuestionValue } from "./question-context.tsx"

export const SimulationQuestionProvider = ({ state, meta, children }: {
  readonly state: SimulationQuestionValue["state"]
  readonly meta: SimulationQuestionValue["meta"]
  readonly children: ReactNode
}) => {
  const { actions } = useSimulationPlayer()
  return <SimulationQuestionContext value={{ state, meta, actions }}>{children}</SimulationQuestionContext>
}
