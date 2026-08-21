import { initialState, Phase, transition } from "./model.js"

const typedError = (error) => Object.freeze({
  tag: typeof error?._tag === "string" ? error._tag : "CommitFailure",
  message: error instanceof Error ? error.message : String(error),
  retryable: true
})

export function createQuestionController({ question, persistence, grade, render, commitMode = () => "success" }) {
  let state = initialState(question)
  let disposed = false
  const emit = (command) => {
    state = transition(state, command)
    render(state, api)
    return state
  }

  const persistSession = () => persistence.saveSession({
    selectedOptionId: state.selectedOptionId,
    attemptId: state.attemptId,
    flagged: state.flagged
  }).catch(() => undefined)

  const start = async () => {
    render(state, api)
    const session = await persistence.restoreSession()
    if (!disposed) emit({ type: "restored", session })
  }

  const select = (optionId) => {
    if (disposed) return
    if (!question.options.some((option) => option.id === optionId)) throw new TypeError("Unknown option")
    emit({ type: "select", optionId })
    void persistSession()
  }

  const toggleFlag = () => {
    if (disposed) return
    emit({ type: "flag", flagged: !state.flagged })
    void persistSession()
  }

  const commit = async () => {
    if (disposed || !state.selectedOptionId || state.phase === Phase.committing || state.phase === Phase.revealed) return
    const attemptId = state.attemptId ?? crypto.randomUUID()
    emit({ type: "commit-started", attemptId })
    const attempt = Object.freeze({
      attemptId,
      questionId: question.id,
      questionVersion: question.version,
      selectedOptionId: state.selectedOptionId,
      flagged: state.flagged,
      committedAt: new Date().toISOString()
    })

    try {
      try {
        await persistence.commitAttempt(attempt, commitMode())
      } catch (error) {
        if (error?._tag !== "CommitOutcomeUnknown") throw error
        const reconciled = await persistence.findAttempt(attemptId)
        if (!reconciled) throw error
      }
      const result = await grade(attempt)
      if (!disposed) emit({ type: "revealed", result })
    } catch (error) {
      if (!disposed) emit({ type: "commit-failed", error: typedError(error) })
    }
  }

  const next = async () => {
    if (disposed || state.phase !== Phase.revealed) return
    await persistence.clearSessionForNext()
    if (!disposed) emit({ type: "next" })
  }

  const acknowledgeFocus = (revision) => {
    if (disposed) return
    emit({ type: "focus-handled", revision })
  }

  const dispose = () => {
    if (disposed) return
    disposed = true
    persistence.close()
    state = transition(state, { type: "dispose" })
    render(state, api)
  }

  const api = Object.freeze({
    start,
    select,
    toggleFlag,
    commit,
    next,
    acknowledgeFocus,
    dispose,
    getState: () => state,
    isDisposed: () => disposed
  })
  return api
}
