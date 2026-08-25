import { describe, expect, it } from "vitest"
import { Schema } from "effect"
import {
  OfflinePackDescriptor,
  OfflinePackRecord,
  OfflinePackReceipt,
  decodeOfflinePackDescriptor,
  decodeOfflinePackRecord,
  decodeOfflineShellManifest,
  offlinePackCacheName,
  offlinePackImmutableFingerprintSource
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
    const immutableFingerprint = createHash("sha256")
      .update(offlinePackImmutableFingerprintSource(descriptor, generation))
      .digest("hex")
    const record = new OfflinePackRecord({
      id: descriptor.id,
      generation,
      immutableFingerprint,
      descriptor,
      status: "staged",
      cacheName: offlinePackCacheName(descriptor, generation),
      downloadedBytes: descriptor.estimatedDownloadBytes ?? 0,
      stagedAt: 1,
      verifiedAt: 2,
      activatedAt: null,
      detail: null
    })
    expect(decodeOfflinePackRecord(record)).toMatchObject({ id: descriptor.id, generation })
    expect(() => decodeOfflinePackRecord({ ...record, id: "another-pack" }))
      .toThrow(/durable identity/)
    expect(() => decodeOfflinePackRecord({ ...record, cacheName: "nycustodian-pack-forged" }))
      .toThrow(/cache namespace/)
    expect(() => decodeOfflinePackRecord({ ...record, downloadedBytes: 0 }))
      .toThrow(/byte closure/)
    expect(() => decodeOfflinePackRecord({ ...record, verifiedAt: null }))
      .toThrow(/verification time/)
    expect(() => decodeOfflinePackRecord({ ...record, unexpected: true }))
      .toThrow()
  })
})
