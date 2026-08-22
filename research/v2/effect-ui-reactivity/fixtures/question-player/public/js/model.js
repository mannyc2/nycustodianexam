export const Phase = Object.freeze({
  restoring: "restoring",
  ready: "ready",
  committing: "committing",
  commitFailed: "commit-failed",
  revealed: "revealed",
  disposed: "disposed"
})

const freeze = (state) => Object.freeze(state)

export function initialState(question) {
  return freeze({
    revision: 0,
    phase: Phase.restoring,
    question,
    selectedOptionId: null,
    attemptId: null,
    result: null,
    error: null,
    flagged: false,
    itemIndex: 0,
    liveMessage: "Restoring saved study state.",
    focusIntent: null
  })
}

export function transition(state, command) {
  if (state.phase === Phase.disposed && command.type !== "dispose") return state
  const next = (patch) => freeze({ ...state, ...patch, revision: state.revision + 1 })
  switch (command.type) {
    case "restored":
      return next({
        phase: Phase.ready,
        selectedOptionId: command.session?.selectedOptionId ?? null,
        attemptId: command.session?.attemptId ?? null,
        flagged: command.session?.flagged ?? false,
        error: null,
        result: null,
        liveMessage: "Study item ready.",
        focusIntent: null
      })
    case "select":
      if (state.phase === Phase.committing || state.phase === Phase.revealed) return state
      return next({
        phase: Phase.ready,
        selectedOptionId: command.optionId,
        attemptId: command.optionId === state.selectedOptionId ? state.attemptId : null,
        error: null,
        liveMessage: `Selected option ${command.optionId.toUpperCase()}.`,
        focusIntent: null
      })
    case "commit-started":
      if (!state.selectedOptionId) return state
      return next({
        phase: Phase.committing,
        attemptId: command.attemptId,
        error: null,
        result: null,
        liveMessage: "Saving the answer before showing feedback.",
        focusIntent: null
      })
    case "commit-failed":
      return next({
        phase: Phase.commitFailed,
        error: command.error,
        result: null,
        liveMessage: "The answer was not confirmed as saved. Feedback remains hidden.",
        focusIntent: "error"
      })
    case "revealed":
      return next({
        phase: Phase.revealed,
        error: null,
        result: Object.freeze(command.result),
        liveMessage: command.result.correct ? "Answer saved. Correct." : "Answer saved. Incorrect.",
        focusIntent: "outcome"
      })
    case "flag":
      return next({
        flagged: command.flagged,
        liveMessage: command.flagged ? "Item flagged for review." : "Review flag removed.",
        focusIntent: null
      })
    case "next":
      if (state.phase !== Phase.revealed) return state
      return next({
        phase: Phase.ready,
        selectedOptionId: null,
        attemptId: null,
        result: null,
        error: null,
        flagged: false,
        itemIndex: state.itemIndex + 1,
        liveMessage: "Next item ready.",
        focusIntent: "question"
      })
    case "focus-handled":
      if (command.revision !== state.revision) return state
      return freeze({ ...state, focusIntent: null })
    case "dispose":
      return next({
        phase: Phase.disposed,
        error: null,
        result: null,
        liveMessage: "Question player disposed.",
        focusIntent: null
      })
    default:
      throw new TypeError(`Unknown command: ${String(command.type)}`)
  }
}
