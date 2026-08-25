import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState } from "react"
import { localFailureDetail } from "../../local-failure-detail.ts"
import {
  CorrectionDraftPersistence,
  type CorrectionDraftPersistenceError
} from "../persistence.ts"
import {
  CorrectionDraftRecord,
  correctionReportFromDraft,
  emptyCorrectionDraft
} from "../model.ts"
import { submitCorrectionReport } from "../client.ts"

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
  const [notice, setNotice] = useState("Loading any explicitly saved local draft…")
  const [problem, setProblem] = useState<string | null>(null)
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
        ? "No saved local draft was found. Nothing has been sent."
        : stored.submissionState === "accepted"
        ? "This device retained the accepted report receipt."
        : "Your explicitly saved local draft was restored. Nothing was sent.")
      setLoading(false)
    }).catch((cause: CorrectionDraftPersistenceError) => {
      if (!active) return
      setProblem(localFailureDetail(cause, "Local correction-draft storage is unavailable."))
      setNotice("Nothing was sent.")
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [runtime])

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
      setNotice("Draft saved only on this device. It was not submitted.")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Local correction-draft storage is unavailable."))
      setNotice("Draft was not saved or submitted.")
    } finally {
      setBusy(false)
    }
  }

  const submit = async (): Promise<void> => {
    if (acceptedRemotely !== null) return
    setBusy(true)
    setProblem(null)
    let report
    const errors = validateCorrectionDraft(draft)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setProblem("Correct the labeled fields below before submitting this report.")
      setNotice("Nothing was sent.")
      setBusy(false)
      return
    }
    try {
      report = correctionReportFromDraft(draft)
    } catch {
      setProblem("Correct the labeled fields below before submitting this report.")
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
        setNotice("Online intake is not activated. Your report remains a local draft and was not submitted.")
        return
      }
      if (result.tag === "rate-limited") {
        setProblem(`The intake pressure limit was reached. Retry explicitly in about ${result.retryAfterSeconds} seconds.`)
        setNotice("Your local draft was retained. It will not retry automatically.")
        return
      }
      if (result.tag === "failed") {
        setProblem(result.detail)
        setNotice("Your local draft was retained. It will not retry automatically.")
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
        setNotice("The service accepted the report and its receipt was retained locally. No publication decision is implied.")
      } catch (cause) {
        setReceiptStorageProblem(true)
        setProblem(null)
        setNotice(
          `The service accepted receipt ${result.clientReceiptId}, but this device could not retain the local receipt: ` +
          `${localFailureDetail(cause, "local storage failed")}. Do not submit this report again; retry only the local receipt save.`
        )
      }
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Local correction-draft storage is unavailable."))
      setNotice("Nothing will retry automatically. Review or save the fields again.")
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
      setNotice("The already accepted report receipt is now retained on this device. No network submission occurred.")
    } catch (cause) {
      setReceiptStorageProblem(true)
      setNotice(
        `The report remains accepted remotely, but its receipt still could not be retained locally: ` +
        localFailureDetail(cause, "local storage failed")
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
    if (!window.confirm("Delete this local correction draft and receipt from this device?")) return
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
      setNotice("The local draft was deleted. Nothing was submitted.")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Local correction-draft storage is unavailable."))
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
            ? "Report accepted; local receipt not yet retained"
            : "Report receipt retained on this device"}
        </h2>
        <p>{notice}</p>
        <p><strong>Client receipt:</strong> <code>{draft.id}</code></p>
        <div className="question-controls">
          {receiptStorageProblem ? (
            <button className="button button-primary" disabled={busy} onClick={() => void retryReceiptSave()} type="button">
              Retry local receipt save
            </button>
          ) : null}
          <button className="button button-primary" disabled={busy} onClick={startAnotherReport} type="button">
            Start another report
          </button>
          <button className="button button-secondary" onClick={() => void deleteDraft()} type="button">
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
          <p>{problem}</p>
        </section>
      )}
      <fieldset className="form-field-group">
        <legend>Correction report details</legend>
      <div className="form-field">
        <label htmlFor="correction-category">Concern category</label>
        <select
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
      <p className="source-note">Client receipt: <code>{draft.id}</code></p>
      <div className="question-controls">
        <button className="button button-secondary" disabled={busy} onClick={() => void saveLocally()} type="button">
          {busy ? "Working…" : "Save local draft"}
        </button>
        <button className="button button-primary" disabled={busy} type="submit">
          {busy ? "Checking intake…" : "Submit explicitly"}
        </button>
        <button className="button button-secondary" disabled={busy} onClick={() => void deleteDraft()} type="button">
          Delete local draft
        </button>
      </div>
    </form>
  )
}
