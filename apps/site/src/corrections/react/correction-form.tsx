import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState } from "react"
import {
  localFailureReport,
  type LocalFailureReport
} from "../../local-failure-detail.ts"
import {
  CorrectionDraftPersistence,
  type CorrectionDraftPersistenceError
} from "../persistence.ts"
import {
  CorrectionDraftRecord,
  correctionReportFromDraft,
  emptyCorrectionDraft
} from "../model.ts"
import {
  fetchCorrectionIntakeStatus,
  submitCorrectionReport,
  type CorrectionIntakeStatus
} from "../client.ts"

interface CorrectionEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, CorrectionDraftPersistence>
  ) => Promise<A>
}

const freshDraft = (): CorrectionDraftRecord =>
  emptyCorrectionDraft(crypto.randomUUID())

type CorrectionField = "pagePath" | "summary" | "details" | "publicSourceUrl" | "affirmation"
type CorrectionValidationErrors = Partial<Record<CorrectionField, string>>

const validateCorrectionDraft = (draft: CorrectionDraftRecord): CorrectionValidationErrors => {
  const errors: CorrectionValidationErrors = {}
  const pagePath = draft.pagePath.trim()
  const pageSegments = pagePath === "/"
    ? []
    : pagePath.slice(1, pagePath.endsWith("/") ? -1 : undefined).split("/")
  if (
    pagePath.length > 500 ||
    !(
      pagePath === "/" ||
      /^\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+\/?$/.test(pagePath)
    ) ||
    pageSegments.some((segment) => segment === "." || segment === "..")
  ) {
    errors.pagePath = "Enter a root-relative public path without a domain, query, or fragment."
  }
  if (draft.summary.trim().length === 0) errors.summary = "Enter a short summary."
  if (draft.details.trim().length === 0) errors.details = "Enter the correction details."
  if (draft.publicSourceUrl.trim().length > 0) {
    try {
      const source = new URL(draft.publicSourceUrl.trim())
      if (source.protocol !== "https:" || source.username !== "" || source.password !== "") {
        errors.publicSourceUrl = "Use an HTTPS public source URL without credentials."
      }
    } catch {
      errors.publicSourceUrl = "Enter a valid HTTPS public source URL."
    }
  }
  if (!draft.affirmsNoSecureExamMaterial) {
    errors.affirmation = "Confirm that the report contains no secure or remembered exam material."
  }
  return errors
}

export const CorrectionForm = ({ runtime }: { readonly runtime: CorrectionEffectRunner }) => {
  const [draft, setDraft] = useState<CorrectionDraftRecord>(freshDraft)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("Checking this device for a saved draft…")
  const [problem, setProblem] = useState<LocalFailureReport | null>(null)
  const [intakeStatus, setIntakeStatus] = useState<CorrectionIntakeStatus | "unchecked" | "checking">("unchecked")
  const [validationErrors, setValidationErrors] = useState<CorrectionValidationErrors>({})
  const [acceptedRemotely, setAcceptedRemotely] = useState<string | null>(null)
  const [receiptStorageProblem, setReceiptStorageProblem] = useState(false)
  const problemHeading = useRef<HTMLHeadingElement>(null)
  const receiptHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let active = true
    void runtime.runPromise(
      Effect.gen(function*() {
        const persistence = yield* CorrectionDraftPersistence
        return yield* persistence.findLatest()
      })
    ).then((stored) => {
      if (!active) return
      if (stored !== undefined) setDraft(stored)
      setNotice(stored === undefined
        ? "No saved draft was found on this device. Nothing has been sent."
        : stored.submissionState === "accepted"
        ? "Your accepted report receipt is saved on this device."
        : "Your saved draft was restored. Nothing was sent.")
      setLoading(false)
    }).catch((cause: CorrectionDraftPersistenceError) => {
      if (!active) return
      setProblem(localFailureReport(cause, "Saved drafts could not be read from this device\u2019s storage."))
      setNotice("Nothing was sent.")
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [runtime])

  // No status request happens on page load; the learner asks explicitly.
  const checkIntake = async (): Promise<void> => {
    setIntakeStatus("checking")
    setIntakeStatus(await fetchCorrectionIntakeStatus(fetch))
  }

  useEffect(() => {
    if (problem !== null) problemHeading.current?.focus()
  }, [problem])

  useEffect(() => {
    if (draft.submissionState === "accepted") receiptHeading.current?.focus()
  }, [draft.submissionState, receiptStorageProblem])

  const update = <K extends keyof CorrectionDraftRecord>(
    key: K,
    value: CorrectionDraftRecord[K]
  ): void => {
    setProblem(null)
    const validationKey: CorrectionField | undefined = key === "affirmsNoSecureExamMaterial"
      ? "affirmation"
      : key === "pagePath" || key === "summary" || key === "details" || key === "publicSourceUrl"
      ? key
      : undefined
    if (validationKey !== undefined) {
      setValidationErrors((current) => ({ ...current, [validationKey]: undefined }))
    }
    setDraft(new CorrectionDraftRecord({ ...draft, [key]: value }))
  }

  const persist = async (candidate: CorrectionDraftRecord): Promise<CorrectionDraftRecord> =>
    runtime.runPromise(
      Effect.gen(function*() {
        const persistence = yield* CorrectionDraftPersistence
        return yield* persistence.save(candidate)
      })
    )

  const saveLocally = async (): Promise<void> => {
    setBusy(true)
    setProblem(null)
    try {
      const saved = await persist(new CorrectionDraftRecord({
        ...draft,
        submissionState: "draft",
        acceptedAt: null
      }))
      setDraft(saved)
      setNotice("Draft saved in this browser. It was not submitted. Browser data can be cleared; export a backup from Settings if you want to keep it.")
    } catch (cause) {
      setProblem(localFailureReport(cause, "The draft could not be saved to this device\u2019s storage. What you typed is still shown."))
      setNotice("The draft was not saved, and nothing was sent.")
    } finally {
      setBusy(false)
    }
  }

  const submit = async (): Promise<void> => {
    if (acceptedRemotely !== null) return
    if (intakeStatus !== "active") {
      setNotice("Reports cannot be sent right now. Nothing was sent. Use Save draft on this device if you want to keep what is shown.")
      return
    }
    setBusy(true)
    setProblem(null)
    let report
    const errors = validateCorrectionDraft(draft)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setProblem({ message: "Correct the labeled fields below before submitting this report.", diagnostic: null })
      setNotice("Nothing was sent.")
      setBusy(false)
      return
    }
    try {
      report = correctionReportFromDraft(draft)
    } catch {
      setProblem({ message: "Correct the labeled fields below before submitting this report.", diagnostic: null })
      setNotice("Nothing was sent.")
      setBusy(false)
      return
    }

    try {
      const saved = await persist(new CorrectionDraftRecord({
        ...draft,
        submissionState: "draft",
        acceptedAt: null
      }))
      setDraft(saved)
      const result = await submitCorrectionReport(fetch, report)
      if (result.tag === "inactive") {
        setIntakeStatus("inactive")
        setNotice("Online intake is off, so nothing was sent. Your draft remains saved in this browser.")
        return
      }
      if (result.tag === "rate-limited") {
        setProblem({
          message: `Too many reports are arriving right now. Wait about ${result.retryAfterSeconds} seconds, then choose Submit again.`,
          diagnostic: null
        })
        setNotice("Your draft remains saved in this browser. It will not retry on its own.")
        return
      }
      if (result.tag === "failed") {
        setProblem({ message: result.detail, diagnostic: null })
        setNotice("Your draft remains saved in this browser. It will not retry on its own.")
        return
      }

      const acceptedCandidate = new CorrectionDraftRecord({
        ...saved,
        submissionState: "accepted",
        acceptedAt: Date.now()
      })
      setAcceptedRemotely(result.clientReceiptId)
      setDraft(acceptedCandidate)
      try {
        const accepted = await persist(acceptedCandidate)
        setDraft(accepted)
        setReceiptStorageProblem(false)
        setNotice("The report was accepted, and its receipt is saved on this device. Acceptance does not mean it will be published.")
      } catch (cause) {
        console.error("Unable to save the accepted-report receipt", cause)
        setReceiptStorageProblem(true)
        setProblem(null)
        setNotice(
          "The service accepted the report, but its receipt could not be saved on this device. " +
          "Do not submit this report again — retry only the receipt save."
        )
      }
    } catch (cause) {
      setProblem(localFailureReport(cause, "The draft could not be written to this device\u2019s storage before sending, so nothing was sent."))
      setNotice("Nothing will retry on its own. Review or save the fields again.")
    } finally {
      setBusy(false)
    }
  }

  const retryReceiptSave = async (): Promise<void> => {
    if (acceptedRemotely === null || draft.submissionState !== "accepted") return
    setBusy(true)
    setProblem(null)
    try {
      const accepted = await persist(draft)
      setDraft(accepted)
      setReceiptStorageProblem(false)
      setNotice("The accepted report\u2019s receipt is now saved on this device. Nothing new was sent.")
    } catch (cause) {
      console.error("Unable to save the accepted-report receipt", cause)
      setReceiptStorageProblem(true)
      setNotice(
        "The report remains accepted, but its receipt still could not be saved on this device. You can retry the receipt save."
      )
    } finally {
      setBusy(false)
    }
  }

  const startAnotherReport = (): void => {
    setAcceptedRemotely(null)
    setReceiptStorageProblem(false)
    setProblem(null)
    setDraft(freshDraft())
    setNotice("A new unsaved report is ready. Nothing new has been submitted.")
  }

  const deleteDraft = async (): Promise<void> => {
    const deletingAcceptedReceipt = draft.submissionState === "accepted"
    if (!window.confirm(deletingAcceptedReceipt
      ? "Delete this accepted report\u2019s local receipt from this device? This will not withdraw the submitted report."
      : "Delete this local correction draft from this device?")) return
    setBusy(true)
    setProblem(null)
    try {
      await runtime.runPromise(
        Effect.gen(function*() {
          const persistence = yield* CorrectionDraftPersistence
          yield* persistence.remove(draft.id)
        })
      )
      setDraft(freshDraft())
      setAcceptedRemotely(null)
      setReceiptStorageProblem(false)
      setNotice(deletingAcceptedReceipt
        ? "The local receipt was deleted. The report remains submitted; deleting its local receipt did not withdraw it."
        : "The local draft was deleted. Nothing was submitted.")
    } catch (cause) {
      setProblem(localFailureReport(
        cause,
        deletingAcceptedReceipt
          ? "The accepted report\u2019s local receipt could not be deleted from this device\u2019s storage. The report remains submitted and was not withdrawn."
          : "The draft could not be deleted from this device\u2019s storage. Nothing was sent."
      ))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p role="status">{notice}</p>

  if (draft.submissionState === "accepted") {
    return (
      <section className="local-data-state" aria-labelledby="correction-receipt-heading">
        <h2 id="correction-receipt-heading" ref={receiptHeading} tabIndex={-1}>
          {receiptStorageProblem
            ? "Report accepted — receipt not saved on this device yet"
            : "Report receipt saved on this device"}
        </h2>
        <p>{notice}</p>
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
      <fieldset className="form-field-group">
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
