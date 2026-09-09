import { describe, expect, it, vi } from "vitest"
import { createCorrectionController, type CorrectionCapabilities, type CorrectionEffectRunner } from "../src/corrections/controller.ts"
import { CorrectionDraftRecord, emptyCorrectionDraft } from "../src/corrections/model.ts"

const id = "5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7"
const validDraft = () => new CorrectionDraftRecord({ ...emptyCorrectionDraft(id), summary: "Public text correction", details: "The published reference has a different description.", affirmsNoSecureExamMaterial: true })
const fixture = (overrides: Partial<CorrectionCapabilities> = {}) => {
  const pending: Array<{ resolve: (value: unknown) => void; reject: (cause: unknown) => void }> = []
  const runPromise: CorrectionEffectRunner["runPromise"] = <A>() => new Promise<A>((resolve, reject) => {
    pending.push({ resolve: (value) => resolve(value as A), reject })
  })
  let statusChecks = 0
  let submissions = 0
  const controller = createCorrectionController({ runPromise }, {
    createId: () => id, now: () => 2, confirmDelete: () => true,
    checkIntake: async () => { statusChecks += 1; return "active" },
    submit: async () => { submissions += 1; return { tag: "accepted", clientReceiptId: id } },
    ...overrides
  })
  return { controller, pending, statusChecks: () => statusChecks, submissions: () => submissions }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }
const ready = async (f: ReturnType<typeof fixture>, draft = validDraft()) => {
  f.controller.start()
  f.pending[0]!.resolve(draft)
  await flush()
}

describe("Correction controller durable submission", () => {
  it("performs no status check or submission on load or when intake is unchecked", async () => {
    const f = fixture()
    await ready(f)
    await f.controller.actions.submit()
    expect(f.statusChecks()).toBe(0)
    expect(f.submissions()).toBe(0)
    expect(f.pending).toHaveLength(1)
  })
  it("locks edits and duplicate submissions until the draft saves, then distinguishes a pending receipt save", async () => {
    const f = fixture()
    await ready(f)
    await f.controller.actions.checkIntake()
    const sending = f.controller.actions.submit()
    await f.controller.actions.submit()
    f.controller.actions.update("summary", "Changed while busy")
    expect(f.pending).toHaveLength(2)
    expect(f.submissions()).toBe(0)
    expect(f.controller.getSnapshot().state.draft.summary).toBe("Public text correction")
    f.pending[1]!.resolve(validDraft())
    await flush()
    expect(f.submissions()).toBe(1)
    expect(f.controller.getSnapshot().state.receiptStatus).toBe("saving")
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("receipt")
    f.pending[2]!.resolve(new CorrectionDraftRecord({ ...validDraft(), submissionState: "accepted", acceptedAt: 2, updatedAt: 2 }))
    await sending
    expect(f.controller.getSnapshot().state.receiptStatus).toBe("saved")
    await f.controller.actions.submit()
    expect(f.submissions()).toBe(1)
  })
  it("retries only local receipt persistence after remote acceptance", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      const f = fixture()
      await ready(f)
      await f.controller.actions.checkIntake()
      const sending = f.controller.actions.submit()
      f.pending[1]!.resolve(validDraft())
      await flush()
      f.pending[2]!.reject(new Error("Storage unavailable"))
      await sending
      expect(f.controller.getSnapshot().state.receiptStatus).toBe("unsaved")
      const retry = f.controller.actions.retryReceiptSave()
      await f.controller.actions.retryReceiptSave()
      await f.controller.actions.submit()
      expect(f.pending).toHaveLength(4)
      expect(f.submissions()).toBe(1)
      f.pending[3]!.resolve(new CorrectionDraftRecord({ ...validDraft(), submissionState: "accepted", acceptedAt: 2, updatedAt: 2 }))
      await retry
      expect(f.controller.getSnapshot().state.receiptStatus).toBe("saved")
      expect(f.controller.getSnapshot().focusRequest?.target).toBe("receipt")
    } finally { log.mockRestore() }
  })
  it("does not send if the controller is disposed during the required draft save", async () => {
    const f = fixture()
    await ready(f)
    await f.controller.actions.checkIntake()
    const sending = f.controller.actions.submit()
    f.controller.dispose()
    f.pending[1]!.resolve(validDraft())
    await sending
    await f.controller.actions.checkIntake()
    expect(f.submissions()).toBe(0)
    expect(f.statusChecks()).toBe(1)
    expect(f.pending).toHaveLength(2)
  })
  it("validates labeled fields before performing persistence or submission", async () => {
    const f = fixture()
    await ready(f, emptyCorrectionDraft(id))
    await f.controller.actions.checkIntake()
    await f.controller.actions.submit()
    expect(f.controller.getSnapshot().state.validationErrors).toMatchObject({ summary: "Enter a short summary.", details: "Enter the correction details." })
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("problem")
    expect(f.pending).toHaveLength(1)
    expect(f.submissions()).toBe(0)
  })
  it("keeps an accepted receipt and exposes a local-action error when deletion fails", async () => {
    const f = fixture()
    const accepted = new CorrectionDraftRecord({ ...validDraft(), submissionState: "accepted", acceptedAt: 2, updatedAt: 2 })
    await ready(f, accepted)
    const deleting = f.controller.actions.deleteDraft()
    f.pending[1]!.reject(new Error("Deletion failed"))
    await deleting
    expect(f.controller.getSnapshot().state.draft).toEqual(accepted)
    expect(f.controller.getSnapshot().state.problem?.message).toContain("was not withdrawn")
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("problem")
    expect(f.submissions()).toBe(0)
  })
})
