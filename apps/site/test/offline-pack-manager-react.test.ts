import { createHash } from "node:crypto"
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { OfflinePackManager } from "../src/offline-packs/manager.ts"
import {
  OfflinePackDescriptor,
  OfflinePackRecord,
  decodeOfflinePackRecord,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackShellBuildFingerprintSource
} from "../src/offline-packs/model.ts"
import {
  activateOfflinePackClaim,
  createOfflineController,
  type OfflinePackEffectRunner,
  type OfflineBrowserCapabilities,
  groupOfflinePackRecords,
  offlinePackAvailabilityState,
  previewOfflinePackRemoval,
  removeOfflinePackClaim
} from "../src/offline-packs/controller.ts"

const digest = (value: string): string => createHash("sha256").update(value).digest("hex")

const descriptor = (
  packId: string,
  shellBuild: string
): OfflinePackDescriptor => new OfflinePackDescriptor({
  schemaVersion: 1,
  id: packId,
  releaseId: "release-v1",
  packVersion: 1,
  locale: "en",
  label: `Test pack, ${shellBuild}`,
  lifecycle: "published",
  publicationTime: "2026-08-25T00:00:00.000Z",
  compatibility: [{ profileId: "profile", label: "Profile", compatibilityKey: "profile-v1" }],
  counts: { profiles: 1, sources: 0, tools: 0, questions: 0, hazardScenes: 0 },
  totalBytes: 1,
  receipts: [{
    kind: "artifact",
    path: "/content/a.json",
    bytes: 1,
    sha256: "a".repeat(64)
  }],
  applicationShellManifestPath: "/offline-pack-shell-manifest.json",
  applicationShellManifestReceipt: {
    path: "/offline-pack-shell-manifest.json",
    bytes: 1,
    sha256: digest(shellBuild)
  },
  applicationShellBytes: 2,
  estimatedDownloadBytes: 3,
  requiredNavigation: [`/atlas/${shellBuild}/`]
})

const record = (
  value: OfflinePackDescriptor,
  generation: string,
  status: "staged" | "retained" | "quarantined"
): OfflinePackRecord => decodeOfflinePackRecord(new OfflinePackRecord({
  id: offlinePackClaimId(value.id, generation),
  packId: value.id,
  generation,
  contentFingerprint: digest(offlinePackContentFingerprintSource(value)),
  shellBuildFingerprint: digest(offlinePackShellBuildFingerprintSource(value)),
  descriptor: value,
  status,
  cacheName: offlinePackCacheName(value, generation),
  downloadedBytes: status === "quarantined" ? 0 : value.estimatedDownloadBytes ?? 0,
  stagedAt: 1,
  verifiedAt: status === "quarantined" ? null : 2,
  activatedAt: status === "retained" ? 3 : null,
  detail: status === "quarantined" ? "The staged bytes failed verification." : null
}))

describe("offline pack-manager claim projection", () => {
  it("groups by stable packId while preserving every device generation and shell build", () => {
    const currentDescriptor = descriptor("release-v1-en", "shell-b")
    const priorDescriptor = descriptor("release-v1-en", "shell-a")
    const current = record(currentDescriptor, "generation-current", "staged")
    const failedCurrent = record(currentDescriptor, "generation-failed", "quarantined")
    const prior = record(priorDescriptor, "generation-prior", "retained")
    const unrelated = record(
      descriptor("another-release-v1-en", "shell-c"),
      "generation-unrelated",
      "staged"
    )

    const grouped = groupOfflinePackRecords(
      [prior, unrelated, current, failedCurrent],
      currentDescriptor
    )

    expect(grouped.packRecords.map((pack) => pack.id)).toEqual([
      prior.id,
      current.id,
      failedCurrent.id
    ])
    expect(grouped.currentShellBuildRecords.map((pack) => pack.id)).toEqual([
      current.id,
      failedCurrent.id
    ])
    expect(offlinePackAvailabilityState(grouped)).toBe("current")
    expect(offlinePackAvailabilityState(groupOfflinePackRecords(
      [prior],
      currentDescriptor
    ))).toBe("update-available")
    expect(offlinePackAvailabilityState(groupOfflinePackRecords(
      [failedCurrent],
      currentDescriptor
    ))).toBe("retry")
    expect(offlinePackAvailabilityState(groupOfflinePackRecords(
      [],
      currentDescriptor
    ))).toBe("absent")
  })

  it("forwards the selected record claimId to activate, preview, and remove", async () => {
    const selected = record(
      descriptor("release-v1-en", "shell-b"),
      "generation-selected",
      "staged"
    )
    const calls: Array<readonly [string, string, boolean?]> = []
    const manager = OfflinePackManager.of({
      activate: (claimId) => Effect.sync(() => {
        calls.push(["activate", claimId])
        return [selected]
      }),
      list: () => Effect.succeed([selected]),
      previewRemoval: (claimId) => Effect.sync(() => {
        calls.push(["preview", claimId])
        return { activeSessionPins: 0, historicalAttempts: 1 }
      }),
      reconcileDescriptor: () => Effect.succeed([selected]),
      remove: (claimId, confirmedHistoricalImpact) => Effect.sync(() => {
        calls.push(["remove", claimId, confirmedHistoricalImpact])
      }),
      stage: () => Effect.succeed(selected)
    })
    const run = <A, E>(effect: Effect.Effect<A, E, OfflinePackManager>): Promise<A> =>
      Effect.runPromise(effect.pipe(Effect.provideService(OfflinePackManager, manager)))

    await run(activateOfflinePackClaim(selected.id))
    await run(previewOfflinePackRemoval(selected.id))
    await run(removeOfflinePackClaim(selected.id, true))

    expect(calls).toEqual([
      ["activate", selected.id],
      ["preview", selected.id],
      ["remove", selected.id, true]
    ])
  })
})


const controllerFixture = (overrides: Partial<OfflineBrowserCapabilities> = {}) => {
  const pending: Array<{ resolve: (value: unknown) => void; reject: (cause: unknown) => void }> = []
  const runPromise: OfflinePackEffectRunner["runPromise"] = <A>() => new Promise<A>((resolve, reject) => {
    pending.push({ resolve: (value) => resolve(value as A), reject })
  })
  const current = descriptor("release-v1-en", "shell-b")
  let registrations = 0
  const controller = createOfflineController(current, { runPromise }, {
    online: () => true,
    ensureServiceWorker: async () => { registrations += 1 },
    estimateStorage: async () => ({ quota: 1000, usage: 0, persisted: false }),
    requestPersistence: async () => true,
    reload: () => {}, ...overrides
  })
  return { controller, pending, current, registrations: () => registrations }
}
const settleController = async () => { await Promise.resolve(); await Promise.resolve() }

describe("Offline controller commands and lifecycle", () => {
  it("only reconciles on start and performs no download work when already offline", async () => {
    const f = controllerFixture({ online: () => false })
    f.controller.start()
    f.controller.start()
    expect(f.pending).toHaveLength(1)
    expect(f.registrations()).toBe(0)
    f.pending[0]!.resolve([])
    await settleController()
    await f.controller.actions.stage(f.current)
    expect(f.pending).toHaveLength(1)
    expect(f.registrations()).toBe(0)
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("error")
    expect(f.controller.getSnapshot().state.problem?.message).toContain("Go online")
  })
  it("locks duplicate downloads and does not stage after disposal while registration is pending", async () => {
    let finishRegistration!: () => void
    const f = controllerFixture({ ensureServiceWorker: () => new Promise((resolve) => { finishRegistration = resolve }) })
    f.controller.start()
    f.pending[0]!.resolve([])
    await settleController()
    const downloading = f.controller.actions.stage(f.current)
    await f.controller.actions.stage(f.current)
    expect(f.controller.getSnapshot().state.busy).toBe(f.current.id)
    f.controller.dispose()
    finishRegistration()
    await downloading
    await f.controller.actions.stage(f.current)
    expect(f.pending).toHaveLength(1)
  })
  it("blocks pinned removal and clears an earlier confirmation when the next preview fails", async () => {
    const f = controllerFixture()
    const first = record(f.current, "generation-first", "staged")
    const second = record(f.current, "generation-second", "retained")
    f.controller.start()
    f.pending[0]!.resolve([first, second])
    await settleController()
    const preview = f.controller.actions.previewRemoval(first.id)
    f.pending[1]!.resolve({ activeSessionPins: 1, historicalAttempts: 2 })
    await preview
    await f.controller.actions.remove()
    expect(f.pending).toHaveLength(2)
    const replacement = f.controller.actions.previewRemoval(second.id)
    expect(f.controller.getSnapshot().state.removalPreview).toBeNull()
    f.pending[2]!.reject(new Error("Preview unavailable"))
    await replacement
    expect(f.controller.getSnapshot().state.removalPreview).toBeNull()
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("error")
    await f.controller.actions.remove()
    expect(f.pending).toHaveLength(3)
  })
  it("keeps a completed storage-persistence request when an older estimate arrives", async () => {
    let finishEstimate!: (value: { quota: number; usage: number; persisted: boolean }) => void
    const f = controllerFixture({ estimateStorage: () => new Promise((resolve) => { finishEstimate = resolve }) })
    f.controller.start()
    f.pending[0]!.resolve([])
    await settleController()
    await f.controller.actions.requestPersistence()
    expect(f.controller.getSnapshot().state.storage.persisted).toBe(true)
    finishEstimate({ quota: 1000, usage: 0, persisted: false })
    await settleController()
    expect(f.controller.getSnapshot().state.storage).toMatchObject({ persisted: true, quota: 1000, usage: 0 })
  })
  it("preserves a newer error-focus request when the initial saved-copy read finishes late", async () => {
    const f = controllerFixture({ requestPersistence: async () => { throw new Error("Persistence unavailable") } })
    f.controller.start()
    await f.controller.actions.requestPersistence()
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("error")
    f.pending[0]!.resolve([])
    await settleController()
    expect(f.controller.getSnapshot().focusRequest?.target).toBe("error")
    expect(f.controller.getSnapshot().state.problem).not.toBeNull()
  })

})
