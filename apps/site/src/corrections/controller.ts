import type { CorrectionReportValue } from "@nycustodian/correction-intake"
import { makeScreenStore } from "../screen/store.ts"
import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import {
  localFailureReport,
  type LocalFailureReport
} from "../local-failure-detail.ts"
import {
  CorrectionDraftPersistence,
  type CorrectionDraftPersistenceError
} from "./persistence.ts"
import {
  CorrectionDraftRecord,
  correctionReportFromDraft,
  emptyCorrectionDraft
} from "./model.ts"
import {
  type CorrectionSubmissionResult,
  type CorrectionIntakeStatus
} from "./client.ts"

export interface CorrectionEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, CorrectionDraftPersistence>
  ) => Promise<A>
}

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

export interface CorrectionState {
  readonly draft: CorrectionDraftRecord
  readonly loading: boolean
  readonly busy: boolean
  readonly notice: string
  readonly problem: LocalFailureReport | null
  readonly intakeStatus: CorrectionIntakeStatus | "unchecked" | "checking"
  readonly validationErrors: CorrectionValidationErrors
  readonly acceptedRemotely: string | null
  readonly receiptStatus: "none" | "saving" | "saved" | "unsaved"
}
export interface CorrectionCapabilities {
  readonly createId: () => string
  readonly now: () => number
  readonly checkIntake: () => Promise<CorrectionIntakeStatus>
  readonly submit: (report: CorrectionReportValue) => Promise<CorrectionSubmissionResult>
  readonly confirmDelete: (message: string) => boolean
}
export type EditableCorrectionField = "category" | "pagePath" | "summary" | "details" | "publicSourceUrl" | "affirmsNoSecureExamMaterial"
export const createCorrectionController = (runtime: CorrectionEffectRunner, capabilities: CorrectionCapabilities) => {
  const freshDraft = (): CorrectionDraftRecord => emptyCorrectionDraft(capabilities.createId())
  const screen = makeScreenStore<CorrectionState, "problem" | "receipt" | "form">({ requestIdPrefix: "correction-", initialState: {
    draft: freshDraft(), loading: true, busy: false,
    notice: "Checking this device for a saved draft…", problem: null,
    intakeStatus: "unchecked", validationErrors: {}, acceptedRemotely: null, receiptStatus: "none"
  } })
  let active = true
  let started = false
  const set = <K extends keyof CorrectionState>(key: K, value: CorrectionState[K] | ((current: CorrectionState[K]) => CorrectionState[K])): void => {
    if (!active) return
    const snapshot = screen.getSnapshot()
    const state = snapshot.state
    const pendingFocus = key === "intakeStatus" ? snapshot.focusRequest?.target : undefined
    screen.publish({ ...state, [key]: typeof value === "function" ? value(state[key]) : value },
      pendingFocus === undefined ? undefined : { focus: pendingFocus })
  }
  const focus = (target: "problem" | "receipt" | "form"): void => screen.publish(screen.getSnapshot().state, { focus: target })
  const canOperate = (): boolean => active && !screen.getSnapshot().state.loading && !screen.getSnapshot().state.busy
  const finish = (): void => {
    if (!active) return
    set("busy", false)
    const state = screen.getSnapshot().state
    if (state.problem !== null) focus("problem")
    else if (state.draft.submissionState === "accepted") focus("receipt")
  }
  // Status checks, like submissions, require an explicit command.
  const checkIntake = async (): Promise<void> => {
    if (!canOperate() || screen.getSnapshot().state.intakeStatus === "checking") return
    set("intakeStatus", "checking")
    try { set("intakeStatus", await capabilities.checkIntake()) }
    catch { set("intakeStatus", "unknown") }
  }
  const update = <K extends EditableCorrectionField>(
    key: K,
    value: CorrectionDraftRecord[K]
  ): void => {
    const { draft } = screen.getSnapshot().state
    if (!canOperate() || draft.submissionState === "accepted") return
    set("problem", null)
    const validationKey: CorrectionField | undefined = key === "affirmsNoSecureExamMaterial"
      ? "affirmation"
      : key === "pagePath" || key === "summary" || key === "details" || key === "publicSourceUrl"
      ? key
      : undefined
    if (validationKey !== undefined) {
      set("validationErrors", (current) => ({ ...current, [validationKey]: undefined }))
    }
    set("draft", new CorrectionDraftRecord({ ...draft, [key]: value }))
  }

  const persist = async (candidate: CorrectionDraftRecord): Promise<CorrectionDraftRecord> =>
    runtime.runPromise(
      Effect.gen(function*() {
        const persistence = yield* CorrectionDraftPersistence
        return yield* persistence.save(candidate)
      })
    )

  const saveLocally = async (): Promise<void> => {
    const { draft } = screen.getSnapshot().state
    if (!canOperate() || draft.submissionState === "accepted") return
    set("busy", true)
    set("problem", null)
    try {
      const saved = await persist(new CorrectionDraftRecord({
        ...draft,
        submissionState: "draft",
        acceptedAt: null
      }))
      set("draft", saved)
      set("notice", "Draft saved in this browser. It was not submitted. Browser data can be cleared; export a backup from Settings if you want to keep it.")
    } catch (cause) {
      set("problem", localFailureReport(cause, "The draft could not be saved to this device\u2019s storage. What you typed is still shown."))
      set("notice", "The draft was not saved, and nothing was sent.")
    } finally {
      finish()
    }
  }

  const submit = async (): Promise<void> => {
    const { draft, acceptedRemotely, intakeStatus } = screen.getSnapshot().state
    if (!canOperate()) return
    if (acceptedRemotely !== null || draft.submissionState === "accepted") return
    if (intakeStatus !== "active") {
      set("notice", "Reports cannot be sent right now. Nothing was sent. Use Save draft on this device if you want to keep what is shown.")
      return
    }
    set("busy", true)
    set("problem", null)
    let report
    const errors = validateCorrectionDraft(draft)
    if (Object.keys(errors).length > 0) {
      set("validationErrors", errors)
      set("problem", { message: "Correct the labeled fields below before submitting this report.", diagnostic: null })
      set("notice", "Nothing was sent.")
      finish()
      return
    }
    try {
      report = correctionReportFromDraft(draft)
    } catch {
      set("problem", { message: "Correct the labeled fields below before submitting this report.", diagnostic: null })
      set("notice", "Nothing was sent.")
      finish()
      return
    }

    try {
      const saved = await persist(new CorrectionDraftRecord({
        ...draft,
        submissionState: "draft",
        acceptedAt: null
      }))
      set("draft", saved)
      if (!active) return
      const result = await capabilities.submit(report)
      if (result.tag === "inactive") {
        set("intakeStatus", "inactive")
        set("notice", "Online intake is off, so nothing was sent. Your draft remains saved in this browser.")
        return
      }
      if (result.tag === "rate-limited") {
        set("problem", {
          message: `Too many reports are arriving right now. Wait about ${result.retryAfterSeconds} seconds, then choose Submit again.`,
          diagnostic: null
        })
        set("notice", "Your draft remains saved in this browser. It will not retry on its own.")
        return
      }
      if (result.tag === "failed") {
        set("problem", { message: result.detail, diagnostic: null })
        set("notice", "Your draft remains saved in this browser. It will not retry on its own.")
        return
      }

      const acceptedCandidate = new CorrectionDraftRecord({
        ...saved,
        submissionState: "accepted",
        acceptedAt: capabilities.now()
      })
      set("acceptedRemotely", result.clientReceiptId)
      set("receiptStatus", "saving")
      set("notice", "The report was accepted. Saving its receipt on this device…")
      set("draft", acceptedCandidate)
      focus("receipt")
      try {
        const accepted = await persist(acceptedCandidate)
        set("draft", accepted)
        set("receiptStatus", "saved")
        set("notice", "The report was accepted, and its receipt is saved on this device. Acceptance does not mean it will be published.")
      } catch (cause) {
        console.error("Unable to save the accepted-report receipt", cause)
        set("receiptStatus", "unsaved")
        set("problem", null)
        set("notice",
          "The service accepted the report, but its receipt could not be saved on this device. " +
          "Do not submit this report again — retry only the receipt save."
        )
      }
    } catch (cause) {
      set("problem", localFailureReport(cause, "The draft could not be written to this device\u2019s storage before sending, so nothing was sent."))
      set("notice", "Nothing will retry on its own. Review or save the fields again.")
    } finally {
      finish()
    }
  }

  const retryReceiptSave = async (): Promise<void> => {
    const { draft, acceptedRemotely, receiptStatus } = screen.getSnapshot().state
    if (!canOperate()) return
    if (acceptedRemotely === null || draft.submissionState !== "accepted" || receiptStatus !== "unsaved") return
    set("receiptStatus", "saving")
    set("busy", true)
    set("problem", null)
    focus("receipt")
    try {
      const accepted = await persist(draft)
      set("draft", accepted)
      set("receiptStatus", "saved")
      set("notice", "The accepted report\u2019s receipt is now saved on this device. Nothing new was sent.")
    } catch (cause) {
      console.error("Unable to save the accepted-report receipt", cause)
      set("receiptStatus", "unsaved")
      set("notice",
        "The report remains accepted, but its receipt still could not be saved on this device. You can retry the receipt save."
      )
    } finally {
      finish()
    }
  }

  const startAnotherReport = (): void => {
    if (!canOperate() || screen.getSnapshot().state.draft.submissionState !== "accepted") return
    set("validationErrors", {})
    set("acceptedRemotely", null)
    set("receiptStatus", "none")
    set("problem", null)
    set("draft", freshDraft())
    set("notice", "A new unsaved report is ready. Nothing new has been submitted.")
    focus("form")
  }

  const deleteDraft = async (): Promise<void> => {
    const { draft } = screen.getSnapshot().state
    if (!canOperate()) return
    const deletingAcceptedReceipt = draft.submissionState === "accepted"
    if (!capabilities.confirmDelete(deletingAcceptedReceipt
      ? "Delete this accepted report\u2019s local receipt from this device? This will not withdraw the submitted report."
      : "Delete this local correction draft from this device?")) return
    set("busy", true)
    set("problem", null)
    try {
      await runtime.runPromise(
        Effect.gen(function*() {
          const persistence = yield* CorrectionDraftPersistence
          yield* persistence.remove(draft.id)
        })
      )
      set("draft", freshDraft())
      set("acceptedRemotely", null)
      set("receiptStatus", "none")
      set("validationErrors", {})
      set("notice", deletingAcceptedReceipt
        ? "The local receipt was deleted. The report remains submitted; deleting its local receipt did not withdraw it."
        : "The local draft was deleted. Nothing was submitted.")
    } catch (cause) {
      set("problem", localFailureReport(
        cause,
        deletingAcceptedReceipt
          ? "The accepted report\u2019s local receipt could not be deleted from this device\u2019s storage. The report remains submitted and was not withdrawn."
          : "The draft could not be deleted from this device\u2019s storage. Nothing was sent."
      ))
    } finally {
      finish()
      if (active && screen.getSnapshot().state.problem === null) focus("form")
    }
  }

  return {
    getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe, acknowledgeRequest: screen.acknowledgeRequest,
    actions: { update, saveLocally, submit, checkIntake, retryReceiptSave, startAnotherReport, deleteDraft },
    start: () => {
      if (started || !active) return
      started = true
      void runtime.runPromise(Effect.flatMap(CorrectionDraftPersistence, (persistence) => persistence.findLatest())).then((stored) => {
        if (!active) return
        if (stored !== undefined) {
          set("draft", stored)
          set("receiptStatus", stored.submissionState === "accepted" ? "saved" : "none")
        }
        set("notice", stored === undefined
          ? "No saved draft was found on this device. Nothing has been sent."
          : stored.submissionState === "accepted"
          ? "Your accepted report receipt is saved on this device."
          : "Your saved draft was restored. Nothing was sent.")
        set("loading", false)
        if (stored?.submissionState === "accepted") focus("receipt")
      }, (cause: CorrectionDraftPersistenceError) => {
        set("problem", localFailureReport(cause, "Saved drafts could not be read from this device’s storage."))
        set("notice", "Nothing was sent.")
        set("loading", false)
        if (active) focus("problem")
      })
    },
    dispose: () => { active = false; screen.dispose() }
  }
}
export type CorrectionController = ReturnType<typeof createCorrectionController>
