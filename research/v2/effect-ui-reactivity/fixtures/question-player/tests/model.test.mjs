import test from "node:test"
import assert from "node:assert/strict"
import { initialState, Phase, transition } from "../public/js/model.js"

const question = Object.freeze({
  id: "q", version: "1", prompt: "p",
  options: Object.freeze([{ id: "a", label: "A" }, { id: "b", label: "B" }])
})

test("failure cannot reveal and retry retains the attempt id", () => {
  let state = transition(initialState(question), { type: "restored", session: null })
  state = transition(state, { type: "select", optionId: "b" })
  state = transition(state, { type: "commit-started", attemptId: "attempt-1" })
  state = transition(state, { type: "commit-failed", error: { tag: "CommitRejected", message: "no", retryable: true } })
  assert.equal(state.phase, Phase.commitFailed)
  assert.equal(state.result, null)
  assert.equal(state.attemptId, "attempt-1")
  state = transition(state, { type: "commit-started", attemptId: state.attemptId })
  state = transition(state, { type: "revealed", result: { correct: true, explanation: "x" } })
  assert.equal(state.phase, Phase.revealed)
  assert.equal(state.result.correct, true)
})

test("changing the selection invalidates the prior idempotency id", () => {
  let state = transition(initialState(question), { type: "restored", session: null })
  state = transition(state, { type: "select", optionId: "a" })
  state = transition(state, { type: "commit-started", attemptId: "attempt-a" })
  state = transition(state, { type: "commit-failed", error: { tag: "CommitRejected", message: "no", retryable: true } })
  state = transition(state, { type: "select", optionId: "b" })
  assert.equal(state.attemptId, null)
  assert.equal(state.result, null)
})

test("disposed state ignores later UI commands", () => {
  let state = transition(initialState(question), { type: "restored", session: null })
  state = transition(state, { type: "dispose" })
  const later = transition(state, { type: "select", optionId: "a" })
  assert.equal(later, state)
  assert.equal(later.phase, Phase.disposed)
})
