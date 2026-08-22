export interface FixtureQuestion {
  readonly id: string
  readonly prompt: string
  readonly choices: readonly string[]
  readonly correctIndex: number
}

export const fixtureQuestion: FixtureQuestion = {
  id: "fixture-001",
  prompt: "Which tool is designed to grip and turn pipe?",
  choices: ["Pipe wrench", "Claw hammer", "Putty knife", "Level"],
  correctIndex: 0
}
