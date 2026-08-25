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
  groupOfflinePackRecords,
  offlinePackAvailabilityState,
  previewOfflinePackRemoval,
  removeOfflinePackClaim
} from "../src/offline-packs/react/pack-manager.tsx"

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
