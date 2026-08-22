import { Phase } from "./model.js"

const byId = (id) => document.getElementById(id)

export function createDirectView() {
  const root = byId("player")
  const form = byId("question-form")
  const commitButton = byId("commit-button")
  const errorPanel = byId("error-panel")
  const errorText = byId("error-text")
  const outcomePanel = byId("outcome-panel")
  const outcomeHeading = byId("outcome-heading")
  const explanation = byId("explanation")
  const live = byId("live-region")
  const flagButton = byId("flag-button")
  const nextButton = byId("next-button")
  const leaveButton = byId("leave-button")
  const questionHeading = byId("question-heading")
  let controller
  let focusRevision = -1

  form.addEventListener("change", (event) => {
    const target = event.target
    if (target instanceof HTMLInputElement && target.name === "answer") controller.select(target.value)
  })
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    void controller.commit()
  })
  flagButton.addEventListener("click", () => controller.toggleFlag())
  nextButton.addEventListener("click", () => void controller.next())
  leaveButton.addEventListener("click", () => controller.dispose())

  const render = (state, api) => {
    controller = api
    root.dataset.phase = state.phase
    root.dataset.renderer = "direct-dom"
    for (const input of form.elements.answer) {
      input.checked = input.value === state.selectedOptionId
      input.disabled = state.phase === Phase.committing || state.phase === Phase.revealed || state.phase === Phase.disposed
    }
    commitButton.disabled = !state.selectedOptionId || state.phase === Phase.committing || state.phase === Phase.revealed || state.phase === Phase.disposed
    commitButton.textContent = state.phase === Phase.committing ? "Saving..." : state.phase === Phase.commitFailed ? "Retry save" : "Commit answer"
    errorPanel.hidden = state.phase !== Phase.commitFailed
    errorText.textContent = state.error?.message ?? ""
    outcomePanel.hidden = state.phase !== Phase.revealed
    if (state.phase === Phase.revealed) {
      outcomeHeading.textContent = state.result.correct ? "Correct" : "Incorrect"
      explanation.textContent = state.result.explanation
    } else {
      outcomeHeading.textContent = ""
      explanation.textContent = ""
    }
    flagButton.setAttribute("aria-pressed", String(state.flagged))
    flagButton.textContent = state.flagged ? "Remove review flag" : "Flag for review"
    flagButton.disabled = state.phase === Phase.committing || state.phase === Phase.disposed
    nextButton.hidden = state.phase !== Phase.revealed
    leaveButton.disabled = state.phase === Phase.disposed
    live.textContent = state.liveMessage

    if (state.focusIntent && focusRevision !== state.revision) {
      focusRevision = state.revision
      queueMicrotask(() => {
        if (state.focusIntent === "outcome") outcomeHeading.focus()
        if (state.focusIntent === "error") errorPanel.focus()
        if (state.focusIntent === "question") questionHeading.focus()
        api.acknowledgeFocus(state.revision)
      })
    }
  }

  return Object.freeze({ render })
}
