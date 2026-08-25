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
  offlinePackImmutableFingerprintSource,
  offlinePackRootManifestCacheKey
} from "../src/offline-packs/model.ts"
import {
  OfflinePackPersistence,
  OfflinePackPersistenceError,
  OfflinePackRemovalClaimBlocked
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

  async match(input: RequestInfo | URL): Promise<Response | undefined> {
    return this.entries.get(keyFor(input))?.clone()
  }

  async put(input: RequestInfo | URL, response: Response): Promise<void> {
    this.entries.set(keyFor(input), response.clone())
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

const fixture = (version: number) => {
  const releaseId = `release-v${version}`
  const packId = `${releaseId}-en`
  const contentPath = `/content/questions/release-v${version}.postcommit.json`
  const navigationPath = `/atlas/v${version}/`
  const content = encoded(JSON.stringify({ version }))
  const navigation = encoded(`<main><h1>Version ${version}</h1></main>`)
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
    label: `Release ${version}`,
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

const fingerprint = (descriptor: OfflinePackDescriptor, generation: string): string =>
  sha256(encoded(offlinePackImmutableFingerprintSource(descriptor, generation)))

const completeRecord = (
  descriptor: OfflinePackDescriptor,
  generation: string,
  status: "staged" | "active" | "retained" = "staged"
): OfflinePackRecord => decodeOfflinePackRecord(new OfflinePackRecord({
  id: descriptor.id,
  generation,
  immutableFingerprint: fingerprint(descriptor, generation),
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

const memoryPersistence = (
  packs: Map<string, OfflinePackRecord>,
  hooks: {
    activate?: () => void
    removalImpact?: () => { readonly activeSessionPins: number; readonly historicalAttempts: number }
  } = {}
): OfflinePackPersistence["Service"] => OfflinePackPersistence.of({
  beginActivation: (packId, generation, immutableFingerprint) => Effect.gen(function*() {
    const current = packs.get(packId)
    if (
      current === undefined ||
      (current.status !== "staged" && current.status !== "retained") ||
      current.generation !== generation ||
      current.immutableFingerprint !== immutableFingerprint
    ) return yield* persistenceFailure("begin-activation", "activation claim conflict")
    const claimed = decodeOfflinePackRecord(new OfflinePackRecord({
      ...current,
      status: "activating"
    }))
    packs.set(packId, claimed)
    return claimed
  }),
  beginRemoval: (packId, generation, immutableFingerprint, confirmedHistoricalImpact) => Effect.gen(function*() {
    const current = packs.get(packId)
    if (
      current === undefined ||
      !["staged", "retained", "quarantined"].includes(current.status) ||
      current.generation !== generation ||
      current.immutableFingerprint !== immutableFingerprint
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
    packs.set(packId, claimed)
    return claimed
  }),
  beginStage: (pack) => Effect.gen(function*() {
    const current = packs.get(pack.id)
    if (current !== undefined && current.status !== "quarantined") {
      return yield* persistenceFailure("begin-stage", "stage claim conflict")
    }
    packs.set(pack.id, pack)
  }),
  completeStage: (pack) => Effect.gen(function*() {
    const current = packs.get(pack.id)
    if (
      current?.status !== "verifying" ||
      current.generation !== pack.generation ||
      current.immutableFingerprint !== pack.immutableFingerprint
    ) return yield* persistenceFailure("complete-stage", "stage completion conflict")
    packs.set(pack.id, pack)
    return pack
  }),
  activate: (packId, generation, immutableFingerprint) => Effect.gen(function*() {
    hooks.activate?.()
    const current = packs.get(packId)
    if (
      current?.status !== "activating" ||
      current.generation !== generation ||
      current.immutableFingerprint !== immutableFingerprint
    ) return yield* persistenceFailure("activate", "activation CAS conflict")
    for (const [id, pack] of packs) {
      packs.set(id, decodeOfflinePackRecord(new OfflinePackRecord({
        ...pack,
        status: id === packId ? "active" : pack.status === "active" ? "retained" : pack.status,
        ...(id === packId ? { activatedAt: 20 } : {})
      })))
    }
    return [...packs.values()]
  }),
  failActivation: (packId, generation, immutableFingerprint, operation) => Effect.gen(function*() {
    const current = packs.get(packId)
    if (
      current?.status !== "activating" ||
      current.generation !== generation ||
      current.immutableFingerprint !== immutableFingerprint ||
      operation.detail === null
    ) return yield* persistenceFailure("fail-activation", "activation quarantine conflict")
    packs.set(packId, decodeOfflinePackRecord(new OfflinePackRecord({
      ...current,
      status: "quarantined",
      detail: operation.detail
    })))
  }),
  find: (packId) => Effect.sync(() => packs.get(packId)),
  list: () => Effect.sync(() => [...packs.values()]),
  previewRemoval: () => Effect.sync(() =>
    hooks.removalImpact?.() ?? { activeSessionPins: 0, historicalAttempts: 0 }),
  putOperation: () => Effect.succeed(undefined),
  putPack: (pack) => Effect.gen(function*() {
    const current = packs.get(pack.id)
    if (
      current === undefined ||
      current.generation !== pack.generation ||
      current.immutableFingerprint !== pack.immutableFingerprint
    ) return yield* persistenceFailure("put-pack", "pack update conflict")
    packs.set(pack.id, pack)
  }),
  reconcile: () => Effect.sync(() => [...packs.values()]),
  removePack: (packId, generation, immutableFingerprint) => Effect.gen(function*() {
    const current = packs.get(packId)
    if (
      current?.status !== "removing" ||
      current.generation !== generation ||
      current.immutableFingerprint !== immutableFingerprint
    ) return yield* persistenceFailure("remove", "removal CAS conflict")
    packs.delete(packId)
  })
})

const harness = (
  network: Map<string, { readonly bytes: Uint8Array; readonly type: string }>,
  generations: string[],
  packs = new Map<string, OfflinePackRecord>(),
  hooks: {
    activate?: () => void
    removalImpact?: () => { readonly activeSessionPins: number; readonly historicalAttempts: number }
  } = {}
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
      const cache = cacheStorage.get(name) ?? new MemoryCache()
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
    const packs = new Map([[old.descriptor.id, completeRecord(old.descriptor, "old-generation", "active")]])
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
    await expect(Effect.runPromise(manager.activate(next.descriptor.id))).rejects.toMatchObject({
      reason: "integrity-failure"
    })
    expect(packs.get(old.descriptor.id)?.status).toBe("active")
    expect(packs.get(next.descriptor.id)?.status).toBe("quarantined")
    expect(cacheStorage.has(staged.cacheName)).toBe(false)

    const restaged = await Effect.runPromise(manager.stage(next.descriptor))
    expect(restaged.generation).toBe("next-generation-b")
    const activated = await Effect.runPromise(manager.activate(next.descriptor.id))
    expect(activated.find((pack) => pack.id === old.descriptor.id)?.status).toBe("retained")
    expect(activated.find((pack) => pack.id === next.descriptor.id)?.status).toBe("active")
    const pointer = cacheStorage.get(offlinePackPointerCacheName)
    expect(await (await pointer?.match(new URL(offlinePackPointerPath, origin)))?.text())
      .toBe(restaged.cacheName)
  })

  it("deletes a failed generation cache and leaves no partially promoted runtime object", async () => {
    const next = fixture(2)
    const network = networkFor(next)
    network.delete(next.navigationPath)
    const { cacheStorage, manager, packs } = harness(network, ["failed-generation"])

    await expect(Effect.runPromise(manager.stage(next.descriptor))).rejects.toMatchObject({
      reason: "network-failure"
    })
    const quarantined = packs.get(next.descriptor.id)
    expect(quarantined?.status).toBe("quarantined")
    expect(cacheStorage.has(offlinePackCacheName(next.descriptor, "failed-generation"))).toBe(false)
    const runtime = cacheStorage.get(verifiedContentCacheName)
    expect(await runtime?.match(verifiedContentCacheKey(origin, next.descriptor.receipts[0]!)))
      .toBeUndefined()
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
          packs.set(next.descriptor.id, replacement)
          replacementCache = new MemoryCache()
          replacementCache.entries.set(new URL("/replacement-marker", origin).href, new Response("intact"))
          cacheStorage.set(replacement.cacheName, replacementCache)
        }
      }
    )
    const staged = await Effect.runPromise(manager.stage(next.descriptor))

    await expect(Effect.runPromise(manager.activate(next.descriptor.id))).rejects.toMatchObject({
      reason: "state-conflict"
    })
    expect(packs.get(next.descriptor.id)?.generation).toBe("replacement-generation")
    expect(packs.get(next.descriptor.id)?.status).toBe("staged")
    expect(cacheStorage.has(staged.cacheName)).toBe(false)
    expect(await (await replacementCache?.match("/replacement-marker"))?.text()).toBe("intact")
  })

  it("rejects an IDB-edited immutable descriptor even when its child bytes remain intact", async () => {
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
    const packs = new Map([[current.descriptor.id, completeRecord(
      current.descriptor,
      "historical-race-generation",
      "retained"
    )]])
    let reads = 0
    const { manager } = harness(new Map(), [], packs, {
      removalImpact: () => ({
        activeSessionPins: 0,
        historicalAttempts: reads++ === 0 ? 0 : 1
      })
    })

    await expect(Effect.runPromise(manager.remove(current.descriptor.id, false)))
      .rejects.toMatchObject({ reason: "confirmation-required" })
    expect(packs.get(current.descriptor.id)?.status).toBe("retained")
  })

  it("allows a confirmed removal when the historical-attempt count grows after preview", async () => {
    const current = fixture(1)
    const packs = new Map([[current.descriptor.id, completeRecord(
      current.descriptor,
      "confirmed-historical-race-generation",
      "retained"
    )]])
    let reads = 0
    const { manager } = harness(new Map(), [], packs, {
      removalImpact: () => ({
        activeSessionPins: 0,
        historicalAttempts: reads++ === 0 ? 0 : 1
      })
    })

    await expect(Effect.runPromise(manager.remove(current.descriptor.id, true))).resolves.toBeUndefined()
    expect(packs.has(current.descriptor.id)).toBe(false)
  })
})
