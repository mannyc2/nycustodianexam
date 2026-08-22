import { html, nothing, render as renderTemplate } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { Phase } from "./model.js"

export function createLitView() {
  const root = document.getElementById("player")
  const host = document.getElementById("lit-host")
  const live = document.getElementById("live-region")
  let focusRevision = -1

  const template = (state, api) => {
    const locked = state.phase === Phase.committing || state.phase === Phase.revealed || state.phase === Phase.disposed
    const commitDisabled = !state.selectedOptionId || locked
    return html`
      <form
        id="question-form"
        @change=${(event) => {
          const target = event.target
          if (target instanceof HTMLInputElement && target.name === "answer") api.select(target.value)
        }}
        @submit=${(event) => {
          event.preventDefault()
          void api.commit()
        }}
      >
        <fieldset>
          <legend id="question-heading" tabindex="-1">${state.question.prompt}</legend>
          <div class="options">
            ${repeat(state.question.options, (option) => option.id, (option) => html`
              <label>
                <input
                  type="radio"
                  name="answer"
                  value=${option.id}
                  .checked=${option.id === state.selectedOptionId}
                  ?disabled=${locked}
                >
                <span>${option.label}</span>
              </label>
            `)}
          </div>
        </fieldset>
        <div class="actions">
          <button id="commit-button" type="submit" ?disabled=${commitDisabled}>
            ${state.phase === Phase.committing ? "Saving..." : state.phase === Phase.commitFailed ? "Retry save" : "Commit answer"}
          </button>
          <button
            id="flag-button"
            type="button"
            aria-pressed=${String(state.flagged)}
            ?disabled=${state.phase === Phase.committing || state.phase === Phase.disposed}
            @click=${() => api.toggleFlag()}
          >${state.flagged ? "Remove review flag" : "Flag for review"}</button>
          ${state.phase === Phase.revealed ? html`
            <button id="next-button" type="button" @click=${() => void api.next()}>Next item</button>
          ` : nothing}
          <button
            id="leave-button"
            type="button"
            ?disabled=${state.phase === Phase.disposed}
            @click=${() => api.dispose()}
          >Leave player</button>
        </div>
      </form>
      ${state.phase === Phase.commitFailed ? html`
        <section id="error-panel" class="panel error" tabindex="-1" role="alert">
          <h2>Save failed</h2>
          <p id="error-text">${state.error.message}</p>
        </section>
      ` : nothing}
      ${state.phase === Phase.revealed ? html`
        <section id="outcome-panel" class="panel outcome">
          <h2 id="outcome-heading" tabindex="-1">${state.result.correct ? "Correct" : "Incorrect"}</h2>
          <p id="explanation">${state.result.explanation}</p>
        </section>
      ` : nothing}
    `
  }

  const render = (state, api) => {
    root.dataset.phase = state.phase
    root.dataset.renderer = "lit-html"
    renderTemplate(template(state, api), host)
    live.textContent = state.liveMessage

    if (state.focusIntent && focusRevision !== state.revision) {
      focusRevision = state.revision
      queueMicrotask(() => {
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
