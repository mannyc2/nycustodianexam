import { Phase } from "./model.js"

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;")

const checked = (condition) => condition ? " checked" : ""
const disabled = (condition) => condition ? " disabled" : ""

export function createTemplateView() {
  const root = document.getElementById("player")
  const host = document.getElementById("template-host")
  const live = document.getElementById("live-region")
  let controller
  let focusRevision = -1

  root.addEventListener("change", (event) => {
    const target = event.target
    if (target instanceof HTMLInputElement && target.name === "answer") controller.select(target.value)
  })
  root.addEventListener("submit", (event) => {
    if (event.target instanceof HTMLFormElement) {
      event.preventDefault()
      void controller.commit()
    }
  })
  root.addEventListener("click", (event) => {
    const action = event.target instanceof Element ? event.target.closest("[data-action]")?.getAttribute("data-action") : null
    if (action === "flag") controller.toggleFlag()
    if (action === "next") void controller.next()
    if (action === "leave") controller.dispose()
  })

  const markup = (state) => {
    const locked = state.phase === Phase.committing || state.phase === Phase.revealed || state.phase === Phase.disposed
    const options = state.question.options.map((option) => `
      <label>
        <input type="radio" name="answer" value="${escapeHtml(option.id)}"${checked(option.id === state.selectedOptionId)}${disabled(locked)}>
        <span>${escapeHtml(option.label)}</span>
      </label>`).join("")
    const error = state.phase === Phase.commitFailed ? `
      <section id="error-panel" class="panel error" tabindex="-1" role="alert">
        <h2>Save failed</h2>
        <p id="error-text">${escapeHtml(state.error.message)}</p>
      </section>` : ""
    const outcome = state.phase === Phase.revealed ? `
      <section id="outcome-panel" class="panel outcome">
        <h2 id="outcome-heading" tabindex="-1">${state.result.correct ? "Correct" : "Incorrect"}</h2>
        <p id="explanation">${escapeHtml(state.result.explanation)}</p>
      </section>` : ""
    return `
      <form id="question-form">
        <fieldset>
          <legend id="question-heading" tabindex="-1">${escapeHtml(state.question.prompt)}</legend>
          <div class="options">${options}</div>
        </fieldset>
        <div class="actions">
          <button id="commit-button" type="submit"${disabled(!state.selectedOptionId || state.phase === Phase.committing || state.phase === Phase.revealed || state.phase === Phase.disposed)}>${state.phase === Phase.committing ? "Saving..." : state.phase === Phase.commitFailed ? "Retry save" : "Commit answer"}</button>
          <button id="flag-button" type="button" data-action="flag" aria-pressed="${String(state.flagged)}"${disabled(state.phase === Phase.committing || state.phase === Phase.disposed)}>${state.flagged ? "Remove review flag" : "Flag for review"}</button>
          ${state.phase === Phase.revealed ? '<button id="next-button" type="button" data-action="next">Next item</button>' : ""}
          <button id="leave-button" type="button" data-action="leave"${disabled(state.phase === Phase.disposed)}>Leave player</button>
        </div>
      </form>
      ${error}
      ${outcome}`
  }

  const render = (state, api) => {
    controller = api
    root.dataset.phase = state.phase
    root.dataset.renderer = "native-template-replace"
    host.innerHTML = markup(state)
    live.textContent = state.liveMessage
    if (state.focusIntent && focusRevision !== state.revision) {
      focusRevision = state.revision
      queueMicrotask(() => {
        // Acknowledge first because this renderer replaces the whole host on every render.
        // Focusing before acknowledgement would focus a node that the acknowledgement
        // render immediately removes. Resolve the target after the replacement render.
        const intent = state.focusIntent
        api.acknowledgeFocus(state.revision)
        const target = intent === "outcome" ? document.getElementById("outcome-heading")
          : intent === "error" ? document.getElementById("error-panel")
          : document.getElementById("question-heading")
        target?.focus()
      })
    }
  }

  return Object.freeze({ render })
}
