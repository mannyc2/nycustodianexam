import { describe, expect, it } from "vitest"
import { Schema } from "effect"
import {
  OfflinePackDescriptor,
  OfflinePackOperationRecord,
  OfflinePackOrphanCacheRecord,
  OfflinePackRecord,
  OfflinePackRetirementRecord,
  OfflinePackReceipt,
  decodeAvailableOfflinePackDescriptor,
  decodeHistoricalOfflinePackDescriptor,
  decodeOfflinePackDescriptor,
  decodeOfflinePackGenerationClaim,
  decodeOfflinePackOperationRecord,
  decodeOfflinePackOrphanCacheRecord,
  decodeOfflinePackRecord,
  decodeOfflinePackRetirementRecord,
  decodeOfflineShellManifest,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackOperationId,
  offlinePackOrphanCacheId,
  offlinePackRetirementId,
  offlinePackShellBuildFingerprintSource
} from "../src/offline-packs/model.ts"
import { createHash } from "node:crypto"

const sha = "0".repeat(64)

const descriptor = new OfflinePackDescriptor({
  schemaVersion: 1,
  id: "release-v1-en",
  releaseId: "release",
  packVersion: 1,
  locale: "en",
  label: "Test pack",
  lifecycle: "published",
  publicationTime: "2026-08-25T00:00:00.000Z",
  compatibility: [{ profileId: "profile", label: "Profile", compatibilityKey: "profile-v1" }],
  counts: { profiles: 1, sources: 0, tools: 0, questions: 0, hazardScenes: 0 },
  totalBytes: 1,
  receipts: [{ kind: "artifact", path: "/content/a.json", bytes: 1, sha256: sha }],
  applicationShellManifestPath: "/offline-pack-shell-manifest.json",
  applicationShellManifestReceipt: {
    path: "/offline-pack-shell-manifest.json",
    bytes: 1,
    sha256: sha
  },
  applicationShellBytes: 2,
  estimatedDownloadBytes: 3,
  requiredNavigation: ["/atlas/"]
})

describe("offline pack path and shell closure", () => {
  it.each([
    "content/a.json",
    "/content//a.json",
    "/content/./a.json",
    "/content/../a.json",
    "/content/%2e/a.json",
    "/content/a.json?next=1",
    "/content/a.json#fragment",
    "/content\\a.json"
  ])("rejects a noncanonical receipt path: %s", (path) => {
    expect(() => Schema.decodeUnknownSync(OfflinePackReceipt)({
      kind: "artifact",
      path,
      bytes: 1,
      sha256: sha
    })).toThrow()
  })

  it("requires the embedded manifest receipt before a descriptor is activatable", () => {
    expect(() => decodeOfflinePackDescriptor({
      ...descriptor,
      applicationShellManifestReceipt: null
    })).toThrow(/finalized application-shell/)
  })

  it("separates available release descriptors from retained historical descriptors", () => {
    expect(() => decodeHistoricalOfflinePackDescriptor({
      ...descriptor,
      lifecycle: "preview",
      publicationTime: descriptor.publicationTime
    })).toThrow(/lifecycle and publication time/)
    expect(() => decodeHistoricalOfflinePackDescriptor({
      ...descriptor,
      publicationTime: null
    })).toThrow(/lifecycle and publication time/)
    expect(() => decodeHistoricalOfflinePackDescriptor({
      ...descriptor,
      publicationTime: "2026-08-25"
    })).toThrow(/canonical UTC/)

    const retired = new OfflinePackDescriptor({
      ...descriptor,
      lifecycle: "retired",
      publicationTime: null
    })
    expect(decodeHistoricalOfflinePackDescriptor(retired).lifecycle).toBe("retired")
    expect(() => decodeAvailableOfflinePackDescriptor(retired)).toThrow(/historical/)

    const preview = new OfflinePackDescriptor({
      ...descriptor,
      lifecycle: "preview",
      publicationTime: null
    })
    expect(decodeAvailableOfflinePackDescriptor(preview).lifecycle).toBe("preview")
  })

  it("keeps trusted loader paths outside content and pack-managed shell closure", () => {
    expect(() => decodeOfflinePackDescriptor({
      ...descriptor,
      totalBytes: 1,
      receipts: [{
        kind: "artifact",
        path: "/offline-pack-shell-manifest.json",
        bytes: 1,
        sha256: sha
      }]
    })).toThrow(/trusted loader path/)

    const decoded = decodeOfflinePackDescriptor(descriptor)
    expect(() => decodeOfflineShellManifest({
      schemaVersion: 1,
      scope: "offline-application-shell",
      packId: decoded.id,
      releaseId: decoded.releaseId,
      packVersion: decoded.packVersion,
      receipts: [
        { kind: "navigation", path: "/atlas/", bytes: 1, sha256: sha },
        { kind: "application-asset", path: "/offline/", bytes: 1, sha256: sha }
      ]
    }, decoded)).toThrow(/trusted loader or content boundary/)
  })

  it("keeps distinct pack identities in distinct cache namespaces", () => {
    const alternate = new OfflinePackDescriptor({
      ...descriptor,
      id: "alternate-release-v1-en"
    })
    expect(offlinePackCacheName(alternate, "generation"))
      .not.toBe(offlinePackCacheName(descriptor, "generation"))
    expect(offlinePackCacheName(descriptor, "generation-a"))
      .not.toBe(offlinePackCacheName(descriptor, "generation-b"))
  })

  it("separates portable content, application-shell builds, and device-local claims", () => {
    const shellOnlyBuild = new OfflinePackDescriptor({
      ...descriptor,
      label: "Test pack, refreshed shell",
      applicationShellManifestReceipt: {
        path: "/offline-pack-shell-manifest.json",
        bytes: 1,
        sha256: "1".repeat(64)
      },
      requiredNavigation: ["/status/"]
    })
    const contentFingerprint = (value: OfflinePackDescriptor) => createHash("sha256")
      .update(offlinePackContentFingerprintSource(value))
      .digest("hex")
    const shellBuildFingerprint = (value: OfflinePackDescriptor) => createHash("sha256")
      .update(offlinePackShellBuildFingerprintSource(value))
      .digest("hex")

    expect(contentFingerprint(shellOnlyBuild)).toBe(contentFingerprint(descriptor))
    expect(shellBuildFingerprint(shellOnlyBuild)).not.toBe(shellBuildFingerprint(descriptor))
    const claimId = offlinePackClaimId(descriptor.id, "generation-a")
    expect(claimId).not.toBe(offlinePackClaimId(descriptor.id, "generation-b"))
    const claim = decodeOfflinePackGenerationClaim({
      claimId,
      packId: descriptor.id,
      generation: "generation-a",
      contentFingerprint: contentFingerprint(descriptor),
      shellBuildFingerprint: shellBuildFingerprint(descriptor),
      releaseId: descriptor.releaseId,
      packVersion: descriptor.packVersion
    })
    const operation = new OfflinePackOperationRecord({
      id: offlinePackOperationId("activate", claimId),
      claimId,
      packId: claim.packId,
      generation: claim.generation,
      contentFingerprint: claim.contentFingerprint,
      shellBuildFingerprint: claim.shellBuildFingerprint,
      kind: "activate",
      phase: "running",
      startedAt: 1,
      updatedAt: 1,
      detail: null
    })
    expect(decodeOfflinePackOperationRecord(operation).claimId).toBe(claimId)
    expect(() => decodeOfflinePackGenerationClaim({ ...claim, claimId: "forged" }))
      .toThrow(/device-local offline-pack generation claim/)
  })

  it("binds retirement and orphan-cache cleanup records to deterministic owned keys", () => {
    const retirement = new OfflinePackRetirementRecord({
      id: offlinePackRetirementId(descriptor.id),
      packId: descriptor.id,
      releaseId: descriptor.releaseId,
      packVersion: descriptor.packVersion,
      lifecycle: "retired",
      observedAt: 1
    })
    expect(decodeOfflinePackRetirementRecord(retirement).packId).toBe(descriptor.id)
    expect(() => decodeOfflinePackRetirementRecord({ ...retirement, id: "forged" }))
      .toThrow(/retirement record/)

    const cacheName = offlinePackCacheName(descriptor, "corrupt-generation")
    const orphan = new OfflinePackOrphanCacheRecord({
      id: offlinePackOrphanCacheId(cacheName),
      cacheName,
      sourceKey: "corrupt-record",
      recordedAt: 2
    })
    expect(decodeOfflinePackOrphanCacheRecord(orphan).cacheName).toBe(cacheName)
    expect(() => decodeOfflinePackOrphanCacheRecord({
      ...orphan,
      cacheName: "unowned-cache"
    })).toThrow(/owned namespace/)
  })

  it("rejects a shell manifest that is not bound to the pack or navigation closure", () => {
    const decoded = decodeOfflinePackDescriptor(descriptor)
    expect(() => decodeOfflineShellManifest({
      schemaVersion: 1,
      scope: "offline-application-shell",
      packId: "another-pack",
      releaseId: decoded.releaseId,
      packVersion: decoded.packVersion,
      receipts: [{ kind: "navigation", path: "/atlas/", bytes: 1, sha256: sha }]
    }, decoded)).toThrow(/does not match its content pack/)

    expect(() => decodeOfflineShellManifest({
      schemaVersion: 1,
      scope: "offline-application-shell",
      packId: decoded.id,
      releaseId: decoded.releaseId,
      packVersion: decoded.packVersion,
      receipts: [{ kind: "application-asset", path: "/styles.css", bytes: 1, sha256: sha }]
    }, decoded)).toThrow(/missing required navigation/)

    const inflated = decodeOfflinePackDescriptor(new OfflinePackDescriptor({
      ...descriptor,
      applicationShellBytes: 3,
      estimatedDownloadBytes: 4
    }))
    expect(() => decodeOfflineShellManifest({
      schemaVersion: 1,
      scope: "offline-application-shell",
      packId: inflated.id,
      releaseId: inflated.releaseId,
      packVersion: inflated.packVersion,
      receipts: [{ kind: "navigation", path: "/atlas/", bytes: 1, sha256: sha }]
    }, inflated)).toThrow(/not derived from its exact receipt closure/)
  })

  it("rejects persisted records whose key, cache namespace, or lifecycle closure drifted", () => {
    const generation = "test-generation"
    const contentFingerprint = createHash("sha256")
      .update(offlinePackContentFingerprintSource(descriptor))
      .digest("hex")
    const shellBuildFingerprint = createHash("sha256")
      .update(offlinePackShellBuildFingerprintSource(descriptor))
      .digest("hex")
    const record = new OfflinePackRecord({
      id: offlinePackClaimId(descriptor.id, generation),
      packId: descriptor.id,
      generation,
      contentFingerprint,
      shellBuildFingerprint,
      descriptor,
      status: "staged",
      cacheName: offlinePackCacheName(descriptor, generation),
      downloadedBytes: descriptor.estimatedDownloadBytes ?? 0,
      stagedAt: 1,
      verifiedAt: 2,
      activatedAt: null,
      detail: null
    })
    expect(decodeOfflinePackRecord(record)).toMatchObject({ packId: descriptor.id, generation })
    expect(() => decodeOfflinePackRecord({ ...record, id: "another-pack" }))
      .toThrow(/durable identity/)
    expect(() => decodeOfflinePackRecord({ ...record, packId: "another-pack" }))
      .toThrow(/durable identity/)
    expect(() => decodeOfflinePackRecord({ ...record, cacheName: "nycustodian-pack-forged" }))
      .toThrow(/cache namespace/)
    expect(() => decodeOfflinePackRecord({
      ...record,
      descriptor: { ...descriptor, lifecycle: "retired", publicationTime: null }
    })).toThrow(/remain historical/)
    expect(() => decodeOfflinePackRecord({ ...record, downloadedBytes: 0 }))
      .toThrow(/byte closure/)
    expect(() => decodeOfflinePackRecord({ ...record, verifiedAt: null }))
      .toThrow(/verification time/)
    expect(() => decodeOfflinePackRecord({ ...record, unexpected: true }))
      .toThrow()
  })
})
