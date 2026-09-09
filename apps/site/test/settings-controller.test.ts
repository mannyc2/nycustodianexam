import { describe, expect, it } from "vitest"
import { createSettingsController, type SettingsEffectRunner } from "../src/settings/controller.ts"
import { SettingsBootstrap, defaultSitePreferences, type ResetPreview } from "../src/settings/model.ts"
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import { TrustedReleaseContentRegistry } from "../src/trusted-release-content.ts"

const bootstrap = new SettingsBootstrap({
  schemaVersion: 1, questionIds: ["q1"], sceneIds: [],
  reviewQueue: new ReviewQueueBootstrap({ schemaVersion: 1, questions: [], scenes: [] }),
  trustedReleaseContentRegistry: new TrustedReleaseContentRegistry({ schemaVersion: 1, scope: "trusted-release-content-registry", entries: [{
    releaseId: "release-1", packVersion: 1, variant: "question", itemId: "q1", optionIds: ["a", "b"],
    postcommitReceipt: { postcommitPath: "/content/vertical-slice/questions/q1.postcommit.json", postcommitBytes: 1, postcommitSha256: "a".repeat(64) }
  }] })
})
const fixture = () => {
  const pending: Array<{ resolve: (value: unknown) => void; reject: (cause: unknown) => void }> = []
  const runPromise: SettingsEffectRunner["runPromise"] = <A>() => new Promise<A>((resolve, reject) => {
    pending.push({ resolve: (value) => resolve(value as A), reject })
  })
  const applied: boolean[] = []
  let downloads = 0
  const controller = createSettingsController(bootstrap, { runPromise }, {
    applyPreferences: (record) => { applied.push(record.largeText); return null },
    download: () => { downloads += 1 }
  })
  return { controller, pending, applied, downloads: () => downloads }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve() }
const ready = async (f: ReturnType<typeof fixture>) => {
  f.controller.start()
  f.pending[0]!.resolve("0 question answers")
  f.pending[1]!.resolve(defaultSitePreferences())
  await flush()
}
const preview: ResetPreview = { scope: "study-events", records: 2, stores: [{ name: "attempts", records: 2 }], excludesOfflinePacks: true }

describe("Settings controller lifecycle and confirmation", () => {
  it("locks competing commands while a preference save is pending and applies only saved preferences", async () => {
    const f = fixture()
    await ready(f)
    const saving = f.controller.actions.savePreference("largeText", true)
    expect(f.controller.getSnapshot().state.preferences.largeText).toBe(true)
    expect(f.applied).toEqual([false])
    await f.controller.actions.exportData()
    await f.controller.actions.savePreference("reduceMotion", true)
    f.controller.actions.setDataAction("delete")
    expect(f.pending).toHaveLength(3)
    expect(f.controller.getSnapshot().state.dataAction).toBeNull()
    f.pending[2]!.resolve({ ...defaultSitePreferences(), largeText: true, updatedAt: 1 })
    await saving
    expect(f.applied).toEqual([false, true])
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("largeText")
    f.pending[3]!.resolve("0 question answers")
    await flush()
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("largeText")
  })
  it("requires confirmation of the current delete preview and invalidates it when scope changes", async () => {
    const f = fixture()
    await ready(f)
    await f.controller.actions.applyReset()
    expect(f.pending).toHaveLength(2)
    const checking = f.controller.actions.previewResetOperation()
    f.pending[2]!.resolve(preview)
    await checking
    await f.controller.actions.applyReset()
    expect(f.pending).toHaveLength(4) // Includes the background saved-work refresh.
    f.controller.actions.setResetConfirmed(true)
    f.controller.actions.setResetScope("preferences")
    await f.controller.actions.applyReset()
    expect(f.pending).toHaveLength(4)
    expect(f.controller.getSnapshot().state.resetPreview).toBeNull()
    expect(f.controller.getSnapshot().state.resetConfirmed).toBe(false)
  })
  it("keeps the newest selected file when reads finish out of order", async () => {
    const f = fixture()
    await ready(f)
    let resolveFirst!: (text: string) => void
    const first = f.controller.actions.chooseImportFile({ size: 1, text: () => new Promise((resolve) => { resolveFirst = resolve }) })
    await f.controller.actions.chooseImportFile({ size: 1, text: async () => "newest" })
    resolveFirst("stale")
    await first
    expect(f.controller.getSnapshot().state.importText).toBe("newest")
    await f.controller.actions.chooseImportFile(undefined)
    expect(f.controller.getSnapshot().state.importText).toBeNull()
  })
  it("does not apply preferences or start commands after disposal", async () => {
    const f = fixture()
    f.controller.start()
    f.controller.dispose()
    f.pending[0]!.resolve("0 question answers")
    f.pending[1]!.resolve(defaultSitePreferences())
    await flush()
    await f.controller.actions.exportData()
    await f.controller.actions.previewResetOperation()
    f.controller.refreshSavedWork()
    f.controller.start()
    expect(f.pending).toHaveLength(2)
    expect(f.applied).toEqual([])
    expect(f.downloads()).toBe(0)
  })
})
