import { createHash } from "node:crypto"
import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import {
  makeOfflinePackManager,
  offlinePackPointerCacheName,
  offlinePackPointerPath,
  type OfflinePackPlatform
} from "../src/offline-packs/manager.ts"
import {
  OfflinePackDescriptor,
  OfflinePackRecord,
  OfflineShellManifest,
  decodeOfflinePackRecord,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackRootManifestCacheKey,
  offlinePackShellBuildFingerprintSource
} from "../src/offline-packs/model.ts"
import {
  OfflinePackPersistence,
  OfflinePackPersistenceError,
  OfflinePackRemovalClaimBlocked,
  OfflinePackRetiredClaimConflict,
  OfflinePackStageClaimConflict
} from "../src/offline-packs/persistence.ts"
import {
  verifiedContentCacheKey,
  verifiedContentCacheName
} from "../src/verified-content.ts"

const origin = "https://study.example"
const encoded = (value: string): Uint8Array => new TextEncoder().encode(value)
const sha256 = (value: Uint8Array): string =>
  createHash("sha256").update(value).digest("hex")
const keyFor = (input: RequestInfo | URL): string =>
  input instanceof Request ? input.url : new URL(input.toString(), origin).href

class MemoryCache {
  readonly entries = new Map<string, Response>()

  constructor(readonly putFailure?: (key: string) => unknown) {}

  async match(input: RequestInfo | URL): Promise<Response | undefined> {
    return this.entries.get(keyFor(input))?.clone()
  }

  async put(input: RequestInfo | URL, response: Response): Promise<void> {
    const key = keyFor(input)
    const failure = this.putFailure?.(key)
    if (failure !== undefined) throw failure
    this.entries.set(key, response.clone())
  }

  async delete(input: RequestInfo | URL): Promise<boolean> {
    return this.entries.delete(keyFor(input))
  }
}

const response = (value: Uint8Array, contentType: string): Response => {
  const copy = new Uint8Array(value.byteLength)
  copy.set(value)
  return new Response(copy.buffer, {
    status: 200,
    headers: { "content-type": contentType }
  })
}

const fixture = (version: number, shellBuild = "default") => {
  const releaseId = `release-v${version}`
  const packId = `${releaseId}-en`
  const contentPath = `/content/questions/release-v${version}.postcommit.json`
  const navigationPath = shellBuild === "default"
    ? `/atlas/v${version}/`
    : `/atlas/v${version}-${shellBuild}/`
  const content = encoded(JSON.stringify({ version }))
  const navigation = encoded(`<main><h1>Version ${version}, shell ${shellBuild}</h1></main>`)
  const shellManifest = new OfflineShellManifest({
    schemaVersion: 1,
    scope: "offline-application-shell",
    packId,
    releaseId,
    packVersion: version,
    receipts: [{
      kind: "navigation",
      path: navigationPath,
      bytes: navigation.byteLength,
      sha256: sha256(navigation)
    }]
  })
  const shellManifestBytes = encoded(JSON.stringify(shellManifest))
  const applicationShellBytes = shellManifestBytes.byteLength + navigation.byteLength
  const descriptor = new OfflinePackDescriptor({
    schemaVersion: 1,
    id: packId,
    releaseId,
    packVersion: version,
    locale: "en",
    label: shellBuild === "default" ? `Release ${version}` : `Release ${version}, ${shellBuild}`,
    lifecycle: "published",
    publicationTime: "2026-08-25T00:00:00.000Z",
    compatibility: [{ profileId: "profile", label: "Profile", compatibilityKey: "profile-v1" }],
    counts: { profiles: 1, sources: 0, tools: 0, questions: 1, hazardScenes: 0 },
    totalBytes: content.byteLength,
    receipts: [{
      kind: "artifact",
      path: contentPath,
      bytes: content.byteLength,
      sha256: sha256(content)
    }],
    applicationShellManifestPath: "/offline-pack-shell-manifest.json",
    applicationShellManifestReceipt: {
      path: "/offline-pack-shell-manifest.json",
      bytes: shellManifestBytes.byteLength,
      sha256: sha256(shellManifestBytes)
    },
    applicationShellBytes,
    estimatedDownloadBytes: content.byteLength + applicationShellBytes,
    requiredNavigation: [navigationPath]
  })
  return {
    content,
    contentPath,
    descriptor,
    navigation,
    navigationPath,
    shellManifestBytes
  }
}

const fingerprints = (descriptor: OfflinePackDescriptor) => ({
  contentFingerprint: sha256(encoded(offlinePackContentFingerprintSource(descriptor))),
  shellBuildFingerprint: sha256(encoded(offlinePackShellBuildFingerprintSource(descriptor)))
})

const completeRecord = (
  descriptor: OfflinePackDescriptor,
  generation: string,
  status: "staged" | "active" | "retained" = "staged"
): OfflinePackRecord => decodeOfflinePackRecord(new OfflinePackRecord({
  id: offlinePackClaimId(descriptor.id, generation),
  packId: descriptor.id,
  generation,
  ...fingerprints(descriptor),
  descriptor,
  status,
  cacheName: offlinePackCacheName(descriptor, generation),
  downloadedBytes: descriptor.estimatedDownloadBytes ?? 0,
  stagedAt: 1,
  verifiedAt: 2,
  activatedAt: status === "staged" ? null : 3,
  detail: null
}))

const persistenceFailure = (operation: string, detail: string) =>
  new OfflinePackPersistenceError({ operation, detail, cause: new Error(detail) })

const stageClaimFailure = (detail: string) => new OfflinePackPersistenceError({
  operation: "begin-stage",
  detail,
  cause: new OfflinePackStageClaimConflict(detail)
})

const hasExactClaim = (
  pack: OfflinePackRecord | undefined,
  generation: string,
  contentFingerprint: string,
  shellBuildFingerprint: string
): pack is OfflinePackRecord =>
  pack !== undefined &&
  pack.generation === generation &&
  pack.contentFingerprint === contentFingerprint &&
  pack.shellBuildFingerprint === shellBuildFingerprint

const memoryPersistence = (
  packs: Map<string, OfflinePackRecord>,
  hooks: {
    activate?: () => void
    removalImpact?: () => { readonly activeSessionPins: number; readonly historicalAttempts: number }
  } = {}
): OfflinePackPersistence["Service"] => {
  const retiredPackIds = new Set<string>()
  return OfflinePackPersistence.of({
  beginActivation: (
    claimId,
    generation,
    contentFingerprint,
    shellBuildFingerprint
  ) => Effect.gen(function*() {
    const current = packs.get(claimId)
    if (current !== undefined && retiredPackIds.has(current.packId)) {
      const conflict = new OfflinePackRetiredClaimConflict("retired pack")
      return yield* new OfflinePackPersistenceError({
        operation: "begin-activation",
        detail: conflict.message,
        cause: conflict
      })
    }
    if (
      !hasExactClaim(current, generation, contentFingerprint, shellBuildFingerprint) ||
      (current.status !== "staged" && current.status !== "retained") ||
      current.id !== claimId
    ) return yield* persistenceFailure("begin-activation", "activation claim conflict")
    const claimed = decodeOfflinePackRecord(new OfflinePackRecord({
      ...current,
      status: "activating"
    }))
    packs.set(claimId, claimed)
    return claimed
  }),
  beginRemoval: (
    claimId,
    generation,
    contentFingerprint,
    shellBuildFingerprint,
    confirmedHistoricalImpact
  ) => Effect.gen(function*() {
    const current = packs.get(claimId)
    if (
      !hasExactClaim(current, generation, contentFingerprint, shellBuildFingerprint) ||
      !["staged", "active", "retained", "quarantined"].includes(current.status) ||
      current.id !== claimId
    ) return yield* persistenceFailure("begin-removal", "removal claim conflict")
    const impact = hooks.removalImpact?.() ?? { activeSessionPins: 0, historicalAttempts: 0 }
    if (impact.activeSessionPins > 0 || (!confirmedHistoricalImpact && impact.historicalAttempts > 0)) {
      const blocked = new OfflinePackRemovalClaimBlocked(
        impact.activeSessionPins > 0 ? "active-session-pin" : "confirmation-required",
        impact
      )
      return yield* new OfflinePackPersistenceError({
        operation: "begin-removal",
        detail: blocked.message,
        cause: blocked
      })
    }
    const claimed = decodeOfflinePackRecord(new OfflinePackRecord({ ...current, status: "removing" }))
    packs.set(claimId, claimed)
    return claimed
  }),
  beginStage: (pack) => Effect.gen(function*() {
    const current = [...packs.values()]
    if (retiredPackIds.has(pack.packId)) {
      const conflict = new OfflinePackRetiredClaimConflict("retired pack")
      return yield* new OfflinePackPersistenceError({
        operation: "begin-stage",
        detail: conflict.message,
        cause: conflict
      })
    }
    if (
      packs.has(pack.id) ||
      current.some((candidate) =>
        candidate.packId === pack.packId &&
        candidate.contentFingerprint !== pack.contentFingerprint
      ) ||
      current.some((candidate) =>
        candidate.packId === pack.packId &&
        candidate.status !== "quarantined" &&
        candidate.shellBuildFingerprint === pack.shellBuildFingerprint
      )
    ) {
      return yield* stageClaimFailure("stage claim conflict")
    }
    packs.set(pack.id, pack)
  }),
  completeStage: (pack) => Effect.gen(function*() {
    const current = packs.get(pack.id)
    if (
      current?.status !== "verifying" ||
      !hasExactClaim(
        current,
        pack.generation,
        pack.contentFingerprint,
        pack.shellBuildFingerprint
      )
    ) return yield* persistenceFailure("complete-stage", "stage completion conflict")
    packs.set(pack.id, pack)
    return pack
  }),
  activate: (
    claimId,
    generation,
    contentFingerprint,
    shellBuildFingerprint
  ) => Effect.gen(function*() {
    hooks.activate?.()
    const current = packs.get(claimId)
    if (
      current?.status !== "activating" ||
      !hasExactClaim(current, generation, contentFingerprint, shellBuildFingerprint)
    ) return yield* persistenceFailure("activate", "activation CAS conflict")
    for (const [id, pack] of packs) {
      packs.set(id, decodeOfflinePackRecord(new OfflinePackRecord({
        ...pack,
        status: id === claimId ? "active" : pack.status === "active" ? "retained" : pack.status,
        ...(id === claimId ? { activatedAt: 20 } : {})
      })))
    }
    return [...packs.values()]
  }),
  failActivation: (
    claimId,
    generation,
    contentFingerprint,
    shellBuildFingerprint,
    operation
  ) => Effect.gen(function*() {
    const current = packs.get(claimId)
    if (
      current?.status !== "activating" ||
      !hasExactClaim(current, generation, contentFingerprint, shellBuildFingerprint) ||
      operation.detail === null
    ) return yield* persistenceFailure("fail-activation", "activation quarantine conflict")
    packs.set(claimId, decodeOfflinePackRecord(new OfflinePackRecord({
      ...current,
      status: "quarantined",
      detail: operation.detail
    })))
  }),
  find: (claimId) => Effect.sync(() => packs.get(claimId)),
  list: () => Effect.sync(() => [...packs.values()]),
  listOrphanCaches: () => Effect.succeed([]),
  previewRemoval: () => Effect.sync(() =>
    hooks.removalImpact?.() ?? { activeSessionPins: 0, historicalAttempts: 0 }),
  putOperation: () => Effect.succeed(undefined),
  putPack: (pack) => Effect.gen(function*() {
    const current = packs.get(pack.id)
    if (
      !hasExactClaim(
        current,
        pack.generation,
        pack.contentFingerprint,
        pack.shellBuildFingerprint
      )
    ) return yield* persistenceFailure("put-pack", "pack update conflict")
    packs.set(pack.id, pack)
  }),
  forgetOrphanCache: () => Effect.succeed(undefined),
  reconcile: () => Effect.sync(() => [...packs.values()]),
  retire: (descriptor) => Effect.sync(() => {
    retiredPackIds.add(descriptor.id)
    for (const [id, pack] of packs) {
      if (pack.packId !== descriptor.id) continue
      packs.set(id, decodeOfflinePackRecord(new OfflinePackRecord({
        ...pack,
        status: pack.status === "active" ? "retained" :
          ["staging", "verifying", "staged", "activating"].includes(pack.status)
            ? "quarantined"
            : pack.status,
        detail: ["staging", "verifying", "staged", "activating"].includes(pack.status)
          ? "This release was retired before the local operation could remain usable."
          : pack.detail
      })))
    }
    return [...packs.values()]
  }),
  removePack: (
    claimId,
    generation,
    contentFingerprint,
    shellBuildFingerprint
  ) => Effect.gen(function*() {
    const current = packs.get(claimId)
    if (
      current?.status !== "removing" ||
      !hasExactClaim(current, generation, contentFingerprint, shellBuildFingerprint)
    ) return yield* persistenceFailure("remove", "removal CAS conflict")
    packs.delete(claimId)
  })
})
}

const harness = (
  network: Map<string, { readonly bytes: Uint8Array; readonly type: string }>,
  generations: string[],
  packs = new Map<string, OfflinePackRecord>(),
  hooks: {
    activate?: () => void
    removalImpact?: () => { readonly activeSessionPins: number; readonly historicalAttempts: number }
  } = {},
  cachePutFailure?: (cacheName: string, key: string) => unknown
) => {
  const cacheStorage = new Map<string, MemoryCache>()
  let now = 10
  const platform: OfflinePackPlatform = {
    deleteCache: async (name) => cacheStorage.delete(name),
    fetch: async (path) => {
      const found = network.get(path)
      return found === undefined
        ? new Response(null, { status: 404 })
        : response(found.bytes, found.type)
    },
    now: () => now++,
    openCache: async (name) => {
      const cache = cacheStorage.get(name) ?? new MemoryCache((key) =>
        cachePutFailure?.(name, key)
      )
      cacheStorage.set(name, cache)
      return cache as unknown as Cache
    },
    origin: () => origin,
    randomUUID: () => generations.shift() ?? "unexpected-generation",
    sha256: async (bytes) => sha256(bytes)
  }
  return {
    cacheStorage,
    manager: makeOfflinePackManager(platform, memoryPersistence(packs, hooks)),
    packs,
    platform
  }
}

const networkFor = (
  ...fixtures: ReadonlyArray<ReturnType<typeof fixture>>
): Map<string, { readonly bytes: Uint8Array; readonly type: string }> => new Map<
  string,
  { readonly bytes: Uint8Array; readonly type: string }
>(
  fixtures.flatMap((entry) => [
    [entry.contentPath, { bytes: entry.content, type: "application/json" }] as const,
    [entry.navigationPath, { bytes: entry.navigation, type: "text/html" }] as const,
    [entry.descriptor.applicationShellManifestPath, {
      bytes: entry.shellManifestBytes,
      type: "application/json"
    }] as const
  ])
)

describe("offline pack staging and activation", () => {
  it("retains exact root bytes only under the non-servable key and revalidates them before activation", async () => {
    const old = fixture(1)
    const next = fixture(2)
    const oldRecord = completeRecord(old.descriptor, "old-generation", "active")
    const packs = new Map([[oldRecord.id, oldRecord]])
    const { cacheStorage, manager } = harness(
      networkFor(next),
      ["next-generation-a", "next-generation-b"],
      packs
    )

    const staged = await Effect.runPromise(manager.stage(next.descriptor))
    const stagedCache = cacheStorage.get(staged.cacheName)
    expect(await stagedCache?.match(next.descriptor.applicationShellManifestPath)).toBeUndefined()
    expect(new Uint8Array(await (await stagedCache?.match(offlinePackRootManifestCacheKey))!.arrayBuffer()))
      .toEqual(next.shellManifestBytes)

    await stagedCache?.put(offlinePackRootManifestCacheKey, new Response("tampered root"))
    await expect(Effect.runPromise(manager.activate(staged.id))).rejects.toMatchObject({
      reason: "integrity-failure"
    })
    expect(packs.get(oldRecord.id)?.status).toBe("active")
    expect(packs.get(staged.id)?.status).toBe("quarantined")
    expect(cacheStorage.has(staged.cacheName)).toBe(false)

    const restaged = await Effect.runPromise(manager.stage(next.descriptor))
    expect(restaged.generation).toBe("next-generation-b")
    const activated = await Effect.runPromise(manager.activate(restaged.id))
    expect(activated.find((pack) => pack.id === oldRecord.id)?.status).toBe("retained")
    expect(activated.find((pack) => pack.id === restaged.id)?.status).toBe("active")
    const pointer = cacheStorage.get(offlinePackPointerCacheName)
    expect(await (await pointer?.match(new URL(offlinePackPointerPath, origin)))?.text())
      .toBe(restaged.cacheName)
  })

  it("stages a content-equal shell build without displacing the old active claim", async () => {
    const original = fixture(1, "shell-a")
    const refreshed = fixture(1, "shell-b")
    const originalRecord = completeRecord(original.descriptor, "original-generation", "active")
    const packs = new Map([[originalRecord.id, originalRecord]])
    const { cacheStorage, manager } = harness(
      networkFor(refreshed),
      ["refreshed-generation"],
      packs
    )

    const staged = await Effect.runPromise(manager.stage(refreshed.descriptor))
    expect(staged.packId).toBe(originalRecord.packId)
    expect(staged.contentFingerprint).toBe(originalRecord.contentFingerprint)
    expect(staged.shellBuildFingerprint).not.toBe(originalRecord.shellBuildFingerprint)
    expect(packs.get(originalRecord.id)?.status).toBe("active")
    expect(packs.get(staged.id)?.status).toBe("staged")

    const activated = await Effect.runPromise(manager.activate(staged.id))
    expect(activated.find((pack) => pack.id === originalRecord.id)?.status).toBe("retained")
    expect(activated.find((pack) => pack.id === staged.id)?.status).toBe("active")
    const pointer = cacheStorage.get(offlinePackPointerCacheName)
    expect(await (await pointer?.match(new URL(offlinePackPointerPath, origin)))?.text())
      .toBe(staged.cacheName)
  })

  it("rejects portable content drift under an already claimed stable pack ID", async () => {
    const current = fixture(1)
    const currentRecord = completeRecord(current.descriptor, "current-generation", "active")
    const packs = new Map([[currentRecord.id, currentRecord]])
    const drifted = new OfflinePackDescriptor({
      ...current.descriptor,
      receipts: [{
        ...current.descriptor.receipts[0],
        sha256: "f".repeat(64)
      }, ...current.descriptor.receipts.slice(1)]
    })
    const { manager } = harness(new Map(), ["drifted-generation"], packs)

    await expect(Effect.runPromise(manager.stage(drifted))).rejects.toMatchObject({
      reason: "state-conflict"
    })
    expect(packs.get(currentRecord.id)?.status).toBe("active")
    expect(packs.size).toBe(1)
  })

  it("keeps retired descriptors historical instead of staging or reactivating them", async () => {
    const current = fixture(1)
    const retiredDescriptor = new OfflinePackDescriptor({
      ...current.descriptor,
      lifecycle: "retired",
      publicationTime: null
    })
    const retiredRecord = completeRecord(
      retiredDescriptor,
      "retired-generation",
      "retained"
    )
    const packs = new Map([[retiredRecord.id, retiredRecord]])
    const { manager } = harness(new Map(), ["must-not-be-used"], packs)

    await expect(Effect.runPromise(manager.stage(retiredDescriptor))).rejects.toMatchObject({
      reason: "state-conflict"
    })
    await expect(Effect.runPromise(manager.activate(retiredRecord.id))).rejects.toMatchObject({
      reason: "state-conflict"
    })
    expect(packs.get(retiredRecord.id)?.status).toBe("retained")
  })

  it("propagates a trusted retirement to an already-active published generation", async () => {
    const current = fixture(1)
    const active = completeRecord(current.descriptor, "published-before-retirement", "active")
    const packs = new Map([[active.id, active]])
    const { cacheStorage, manager } = harness(new Map(), ["stale-page-stage"], packs)
    await Effect.runPromise(manager.list())

    const retired = new OfflinePackDescriptor({
      ...current.descriptor,
      lifecycle: "retired"
    })
    const reconciled = await Effect.runPromise(manager.reconcileDescriptor(retired))

    expect(reconciled.find((pack) => pack.id === active.id)?.status).toBe("retained")
    expect(await cacheStorage.get(offlinePackPointerCacheName)?.match(
      new URL(offlinePackPointerPath, origin)
    )).toBeUndefined()
    await expect(Effect.runPromise(manager.stage(current.descriptor))).rejects.toMatchObject({
      reason: "state-conflict"
    })
    await expect(Effect.runPromise(manager.activate(active.id))).rejects.toMatchObject({
      reason: "state-conflict"
    })
  })

  it("deletes a failed generation cache and leaves no partially promoted runtime object", async () => {
    const next = fixture(2)
    const network = networkFor(next)
    network.delete(next.navigationPath)
    const { cacheStorage, manager, packs } = harness(network, ["failed-generation"])

    await expect(Effect.runPromise(manager.stage(next.descriptor))).rejects.toMatchObject({
      reason: "network-failure"
    })
    const quarantined = [...packs.values()].find((pack) => pack.generation === "failed-generation")
    expect(quarantined?.status).toBe("quarantined")
    expect(cacheStorage.has(offlinePackCacheName(next.descriptor, "failed-generation"))).toBe(false)
    const runtime = cacheStorage.get(verifiedContentCacheName)
    expect(await runtime?.match(verifiedContentCacheKey(origin, next.descriptor.receipts[0]!)))
      .toBeUndefined()
  })

  it("classifies Cache API quota failure as quota-limited and quarantines only that generation", async () => {
    const next = fixture(2)
    const { cacheStorage, manager, packs } = harness(
      networkFor(next),
      ["quota-generation"],
      new Map(),
      {},
      (cacheName, key) =>
        cacheName.includes("quota-generation") && key.endsWith(next.contentPath)
          ? new DOMException("quota exhausted", "QuotaExceededError")
          : undefined
    )

    await expect(Effect.runPromise(manager.stage(next.descriptor))).rejects.toMatchObject({
      reason: "quota-limited",
      cause: expect.objectContaining({ name: "QuotaExceededError" })
    })
    const quarantined = [...packs.values()].find((pack) => pack.generation === "quota-generation")
    expect(quarantined?.status).toBe("quarantined")
    expect(cacheStorage.has(offlinePackCacheName(next.descriptor, "quota-generation"))).toBe(false)
  })

  it("CAS-rejects a restaged generation without deleting or mutating its cache", async () => {
    const next = fixture(2)
    const packs = new Map<string, OfflinePackRecord>()
    const replacement = completeRecord(next.descriptor, "replacement-generation")
    let replacementCache: MemoryCache | undefined
    const { cacheStorage, manager } = harness(
      networkFor(next),
      ["claimed-generation"],
      packs,
      {
        activate: () => {
          const activating = [...packs.values()].find((pack) => pack.status === "activating")
          if (activating !== undefined) packs.delete(activating.id)
          packs.set(replacement.id, replacement)
          replacementCache = new MemoryCache()
          replacementCache.entries.set(new URL("/replacement-marker", origin).href, new Response("intact"))
          cacheStorage.set(replacement.cacheName, replacementCache)
        }
      }
    )
    const staged = await Effect.runPromise(manager.stage(next.descriptor))

    await expect(Effect.runPromise(manager.activate(staged.id))).rejects.toMatchObject({
      reason: "state-conflict"
    })
    expect(packs.get(replacement.id)?.generation).toBe("replacement-generation")
    expect(packs.get(replacement.id)?.status).toBe("staged")
    expect(cacheStorage.has(staged.cacheName)).toBe(false)
    expect(await (await replacementCache?.match("/replacement-marker"))?.text()).toBe("intact")
  })

  it("rejects IDB-edited shell metadata even when its child bytes remain intact", async () => {
    const next = fixture(2)
    const { manager, packs } = harness(networkFor(next), ["fingerprinted-generation"])
    const staged = await Effect.runPromise(manager.stage(next.descriptor))
    packs.set(staged.id, new OfflinePackRecord({
      ...staged,
      descriptor: new OfflinePackDescriptor({ ...staged.descriptor, label: "Edited after staging" })
    }))

    await expect(Effect.runPromise(manager.activate(staged.id))).rejects.toMatchObject({
      reason: "integrity-failure"
    })
    expect(packs.get(staged.id)?.status).toBe("quarantined")
  })

  it("requires confirmation when a historical attempt commits after removal preview", async () => {
    const current = fixture(1)
    const currentRecord = completeRecord(
      current.descriptor,
      "historical-race-generation",
      "retained"
    )
    const packs = new Map([[currentRecord.id, currentRecord]])
    let reads = 0
    const { manager } = harness(new Map(), [], packs, {
      removalImpact: () => ({
        activeSessionPins: 0,
        historicalAttempts: reads++ === 0 ? 0 : 1
      })
    })

    await expect(Effect.runPromise(manager.remove(currentRecord.id, false)))
      .rejects.toMatchObject({ reason: "confirmation-required" })
    expect(packs.get(currentRecord.id)?.status).toBe("retained")
  })

  it("allows a confirmed removal when the historical-attempt count grows after preview", async () => {
    const current = fixture(1)
    const currentRecord = completeRecord(
      current.descriptor,
      "confirmed-historical-race-generation",
      "retained"
    )
    const packs = new Map([[currentRecord.id, currentRecord]])
    let reads = 0
    const { manager } = harness(new Map(), [], packs, {
      removalImpact: () => ({
        activeSessionPins: 0,
        historicalAttempts: reads++ === 0 ? 0 : 1
      })
    })

    await expect(Effect.runPromise(manager.remove(currentRecord.id, true))).resolves.toBeUndefined()
    expect(packs.has(currentRecord.id)).toBe(false)
  })

  it("removes the sole active pack when no live session pin requires it", async () => {
    const current = fixture(1)
    const active = completeRecord(current.descriptor, "sole-active-generation", "active")
    const packs = new Map([[active.id, active]])
    const { cacheStorage, manager } = harness(new Map(), [], packs)
    await Effect.runPromise(manager.list())

    await expect(Effect.runPromise(manager.remove(active.id, false))).resolves.toBeUndefined()

    expect(packs.has(active.id)).toBe(false)
    expect(await cacheStorage.get(offlinePackPointerCacheName)?.match(
      new URL(offlinePackPointerPath, origin)
    )).toBeUndefined()
  })
})
