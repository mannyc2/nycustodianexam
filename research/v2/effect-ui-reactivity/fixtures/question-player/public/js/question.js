import { decodeQuestionFixture } from "./fixture-decoder.js"

export const question = decodeQuestionFixture({
  id: "fixture-fire-door-001",
  version: "2026-08-21.1",
  prompt: "Which action best preserves a fire door's protective function?",
  options: [
    { id: "a", label: "Prop it open while the corridor is occupied" },
    { id: "b", label: "Keep it unobstructed and allow it to close and latch" },
    { id: "c", label: "Remove the closer if it shuts too quickly" },
    { id: "d", label: "Cover the latch so the door opens silently" }
  ]
})
