import type { CorrectionDraftRecord } from "../model.ts"
import { useCorrection } from "./provider.tsx"

export const CorrectionForm = () => {
  const { state, actions, meta } = useCorrection()
  const { draft, loading, busy, notice, problem, intakeStatus, validationErrors, receiptStatus } = state
  const receiptStorageProblem = receiptStatus === "unsaved"
  const { update, saveLocally, submit, checkIntake, retryReceiptSave, startAnotherReport, deleteDraft } = actions
  const { problemHeading, receiptHeading, formFields } = meta
  if (loading) return <p role="status">{notice}</p>

  if (draft.submissionState === "accepted") {
    return (
      <section className="local-data-state" aria-labelledby="correction-receipt-heading">
        <h2 id="correction-receipt-heading" ref={receiptHeading} tabIndex={-1}>
          {receiptStatus === "saving"
            ? "Report accepted — saving receipt on this device"
            : receiptStorageProblem
            ? "Report accepted — receipt not saved on this device yet"
            : "Report receipt saved on this device"}
        </h2>
        {problem === null ? null : <section className="local-data-error" role="alert" aria-labelledby="correction-error-heading">
          <h3 id="correction-error-heading" ref={problemHeading} tabIndex={-1}>This local action did not finish</h3>
          <p>{problem.message}</p>
          {problem.diagnostic === null ? null : <details className="feedback-sources"><summary>Technical details</summary><p><code>{problem.diagnostic}</code></p></details>}
        </section>}
        <p role="status" aria-live="polite">{notice}</p>
        <details className="source-note">
          <summary>Technical details</summary>
          <p><strong>Client receipt ID:</strong> <code>{draft.id}</code></p>
        </details>
        <div className="question-controls">
          {receiptStorageProblem ? (
            <button className="button button-primary" disabled={busy} onClick={() => void retryReceiptSave()} type="button">
              Retry saving the receipt
            </button>
          ) : null}
          <button className="button button-primary" disabled={busy} onClick={startAnotherReport} type="button">
            Start another report
          </button>
          <button className="button button-secondary" disabled={busy} onClick={() => void deleteDraft()} type="button">
            Delete local receipt
          </button>
        </div>
      </section>
    )
  }

  return (
    <form className="local-data-form" noValidate onSubmit={(event) => {
      event.preventDefault()
      void submit()
    }}>
      {problem === null ? null : (
        <section className="local-data-error" role="alert" aria-labelledby="correction-error-heading">
          <h2 id="correction-error-heading" ref={problemHeading} tabIndex={-1}>Report not submitted</h2>
          <p>{problem.message}</p>
          {problem.diagnostic === null ? null : (
            <details className="feedback-sources">
              <summary>Technical details</summary>
              <p><code>{problem.diagnostic}</code></p>
            </details>
          )}
        </section>
      )}
      <fieldset className="form-field-group" ref={formFields} tabIndex={-1}>
        <legend>Correction report details</legend>
      <div className="form-field">
        <label htmlFor="correction-category">Concern category</label>
        <select
          disabled={busy}
          id="correction-category"
          value={draft.category}
          onChange={(event) => update("category", event.target.value as CorrectionDraftRecord["category"])}
        >
          <option value="fact">Fact</option>
          <option value="question">Original practice question</option>
          <option value="explanation">Explanation</option>
          <option value="image">Image</option>
          <option value="accessibility">Accessibility</option>
          <option value="translation">Translation</option>
          <option value="rights">Rights</option>
          <option value="security">Security concern</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="correction-page">Public page path</label>
        <input
          disabled={busy}
          id="correction-page"
          value={draft.pagePath}
          onChange={(event) => update("pagePath", event.target.value)}
          required
          pattern="/|/(?:[A-Za-z0-9._~-]+/)*[A-Za-z0-9._~-]+/?"
          maxLength={500}
          inputMode="url"
          aria-invalid={validationErrors.pagePath === undefined ? undefined : true}
          aria-describedby={`correction-page-help${validationErrors.pagePath === undefined ? "" : " correction-page-error"}`}
        />
        <p id="correction-page-help" className="field-help">Example: <code>/atlas/tool/pipe-wrench/</code>. Do not include a domain, query, or fragment.</p>
        {validationErrors.pagePath === undefined ? null : (
          <p id="correction-page-error" className="field-error">{validationErrors.pagePath}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="correction-summary">Short summary</label>
        <input
          disabled={busy}
          id="correction-summary"
          value={draft.summary}
          onChange={(event) => update("summary", event.target.value)}
          required
          maxLength={240}
          aria-invalid={validationErrors.summary === undefined ? undefined : true}
          aria-describedby={validationErrors.summary === undefined ? undefined : "correction-summary-error"}
        />
        {validationErrors.summary === undefined ? null : (
          <p id="correction-summary-error" className="field-error">{validationErrors.summary}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="correction-details">Details</label>
        <textarea
          disabled={busy}
          id="correction-details"
          value={draft.details}
          onChange={(event) => update("details", event.target.value)}
          required
          maxLength={8_000}
          rows={9}
          aria-invalid={validationErrors.details === undefined ? undefined : true}
          aria-describedby={validationErrors.details === undefined ? undefined : "correction-details-error"}
        />
        {validationErrors.details === undefined ? null : (
          <p id="correction-details-error" className="field-error">{validationErrors.details}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="correction-source">Optional public source URL</label>
        <input
          disabled={busy}
          id="correction-source"
          value={draft.publicSourceUrl}
          onChange={(event) => update("publicSourceUrl", event.target.value)}
          type="url"
          pattern="https://.*"
          maxLength={2_048}
          aria-invalid={validationErrors.publicSourceUrl === undefined ? undefined : true}
          aria-describedby={validationErrors.publicSourceUrl === undefined ? undefined : "correction-source-error"}
        />
        {validationErrors.publicSourceUrl === undefined ? null : (
          <p id="correction-source-error" className="field-error">{validationErrors.publicSourceUrl}</p>
        )}
      </div>
      <div className="affirmation-control">
        <input
          disabled={busy}
          id="correction-security-affirmation"
          type="checkbox"
          checked={draft.affirmsNoSecureExamMaterial}
          onChange={(event) => update("affirmsNoSecureExamMaterial", event.target.checked)}
          required
          aria-invalid={validationErrors.affirmation === undefined ? undefined : true}
          aria-describedby={validationErrors.affirmation === undefined ? undefined : "correction-affirmation-error"}
        />
        <label htmlFor="correction-security-affirmation">
          I did not include secure exam questions, options, reconstructed drawings, photographs,
          or review-session notes.
        </label>
      </div>
      {validationErrors.affirmation === undefined ? null : (
        <p id="correction-affirmation-error" className="field-error">{validationErrors.affirmation}</p>
      )}
      </fieldset>
      <p role="status" aria-live="polite">{notice}</p>
      <details className="source-note"><summary>Technical details</summary><p>Client receipt ID: <code>{draft.id}</code></p></details>
      <div className="question-controls">
        <button className="button button-primary" disabled={busy} onClick={() => void saveLocally()} type="button">
          {busy ? "Working…" : "Save local draft"}
        </button>
        {intakeStatus === "active" ? (
          <button className="button button-secondary" disabled={busy} type="submit">
            {busy ? "Submitting…" : "Submit report"}
          </button>
        ) : null}
        <button className="button button-secondary" disabled={busy} onClick={() => void deleteDraft()} type="button">
          Delete local draft
        </button>
      </div>
      {intakeStatus === "active" ? null : (
        <p className="source-note" role="status">
          {intakeStatus === "unchecked"
            ? "Reports cannot be sent unless online intake is on. Save your draft on this device, or check whether sending is available."
            : intakeStatus === "checking"
              ? "Checking whether reports can be sent…"
              : intakeStatus === "inactive"
                ? "Reports cannot be sent right now — online intake is off. Use Save draft on this device if you want to keep what is shown."
                : "Whether reports can be sent could not be checked; you may be offline. Use Save draft on this device if you want to keep what is shown."}
          {intakeStatus === "unchecked" || intakeStatus === "inactive" || intakeStatus === "unknown" ? (
            <>
              {" "}
              <button className="button button-secondary" disabled={busy} onClick={() => void checkIntake()} type="button">
                {intakeStatus === "unchecked" ? "Check whether reports can be sent" : "Check again"}
              </button>
            </>
          ) : null}
        </p>
      )}
    </form>
  )
}
