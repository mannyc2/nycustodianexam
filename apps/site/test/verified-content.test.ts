import { createHash } from "node:crypto"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import {
  makeVerifiedContent,
  type AssetContentReceipt,
  type PostcommitContentReceipt,
  type VerifiedContentCache,
  type VerifiedContentPlatform,
  verifiedContentCacheKey,
  verifiedContentCacheName
} from "../src/verified-content.ts"

const encoder = new TextEncoder()

const sha256 = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex")

const jsonReceipt = (
  text: string,
  overrides: Partial<PostcommitContentReceipt> = {}
): PostcommitContentReceipt => {
  const bytes = encoder.encode(text)
  return {
    postcommitPath: "/content/vertical-slice/questions/q-1.postcommit.json",
    postcommitBytes: bytes.byteLength,
    postcommitSha256: sha256(bytes),
    ...overrides
  }
}

class MemoryCache implements VerifiedContentCache {
  readonly deleted: Array<string> = []
  readonly entries = new Map<string, Response>()
  bodyReads = 0

  async delete(key: string): Promise<boolean> {
    this.deleted.push(key)
    return this.entries.delete(key)
  }

  async match(key: string): Promise<Response | undefined> {
    const stored = this.entries.get(key)
    if (stored === undefined) return undefined
    const response = stored.clone()
    const read = response.arrayBuffer.bind(response)
    Object.defineProperty(response, "arrayBuffer", {
      configurable: true,
      value: () => {
        this.bodyReads += 1
        return read()
      }
    })
    return response
  }

  async put(key: string, response: Response): Promise<void> {
    this.entries.set(key, response.clone())
  }

  replaceBody(key: string, body: string): void {
    const stored = this.entries.get(key)
    if (stored === undefined) throw new Error(`No cache entry exists for ${key}`)
    this.entries.set(key, new Response(body, { headers: new Headers(stored.headers), status: 200 }))
  }
}

const harness = (input?: {
  readonly online?: boolean
  readonly responses?: ReadonlyArray<Response>
}) => {
  const cache = new MemoryCache()
  const responses = [...(input?.responses ?? [])]
  const fetchedPaths: Array<string> = []
  const openedCaches: Array<string> = []
  let online = input?.online ?? true

  const platform: VerifiedContentPlatform = {
    fetch: async (path) => {
      fetchedPaths.push(path)
      const response = responses.shift()
      if (response === undefined) throw new Error(`No network response was queued for ${path}`)
      return response
    },
    isOnline: () => online,
    openCache: async (name) => {
      openedCaches.push(name)
      return cache
    },
    origin: () => "https://study.example",
    sha256: async (bytes) => sha256(bytes)
  }

  return {
    cache,
    fetchedPaths,
    openedCaches,
    responses,
    service: makeVerifiedContent(platform),
    setOnline: (value: boolean) => {
      online = value
    }
  }
}

describe("verified content", () => {
  it.effect("rejects alternate schema-valid JSON bytes before decoding or caching them", () => {
    const expected = '{"answer":"a"}'
    const alternate = '{"answer":"b"}'
    const receipt = jsonReceipt(expected)
    const test = harness({
      responses: [new Response(alternate, { headers: { "content-type": "application/json" } })]
    })

    return Effect.gen(function*() {
      const error = yield* Effect.flip(test.service.loadJson(receipt))

      expect(error._tag).toBe("VerifiedContentIntegrityError")
      if (error._tag === "VerifiedContentIntegrityError") {
        expect(error.receivedBytes).toBe(receipt.postcommitBytes)
        expect(error.receivedSha256).not.toBe(receipt.postcommitSha256)
        expect(error.source).toBe("network")
      }
      expect(test.cache.entries.size).toBe(0)
      expect(test.fetchedPaths).toEqual([receipt.postcommitPath])
    })
  })

  it.effect("rejects an exact digest with the wrong declared byte length", () => {
    const body = '{"answer":"a"}'
    const exact = jsonReceipt(body)
    const receipt = { ...exact, postcommitBytes: exact.postcommitBytes + 1 }
    const test = harness({ responses: [new Response(body)] })

    return Effect.gen(function*() {
      const error = yield* Effect.flip(test.service.loadJson(receipt))

      expect(error._tag).toBe("VerifiedContentIntegrityError")
      if (error._tag === "VerifiedContentIntegrityError") {
        expect(error.expectedBytes).toBe(receipt.postcommitBytes)
        expect(error.receivedBytes).toBe(exact.postcommitBytes)
        expect(error.receivedSha256).toBe(exact.postcommitSha256)
      }
      expect(test.cache.entries.size).toBe(0)
    })
  })

  it.effect("rejects an exact byte length with the wrong declared digest", () => {
    const body = '{"answer":"a"}'
    const receipt = jsonReceipt(body, { postcommitSha256: "0".repeat(64) })
    const test = harness({ responses: [new Response(body)] })

    return Effect.gen(function*() {
      const error = yield* Effect.flip(test.service.loadJson(receipt))

      expect(error._tag).toBe("VerifiedContentIntegrityError")
      if (error._tag === "VerifiedContentIntegrityError") {
        expect(error.expectedBytes).toBe(error.receivedBytes)
        expect(error.receivedSha256).not.toBe(error.expectedSha256)
      }
      expect(test.cache.entries.size).toBe(0)
    })
  })

  it.effect("deletes a corrupt verified-cache body and retries only the exact network path", () => {
    const body = '{"answer":"a"}'
    const corrupt = '{"answer":"b"}'
    const receipt = jsonReceipt(body)
    const test = harness({
      responses: [
        new Response(body, { headers: { "content-type": "application/json" } }),
        new Response(body, { headers: { "content-type": "application/json" } })
      ]
    })
    const key = verifiedContentCacheKey("https://study.example", {
      path: receipt.postcommitPath,
      sha256: receipt.postcommitSha256
    })

    return Effect.gen(function*() {
      expect(yield* test.service.loadJson(receipt)).toEqual({ answer: "a" })
      test.cache.replaceBody(key, corrupt)

      expect(yield* test.service.loadJson(receipt)).toEqual({ answer: "a" })
      expect(test.cache.deleted).toEqual([key])
      expect(test.fetchedPaths).toEqual([
        receipt.postcommitPath,
        receipt.postcommitPath
      ])
      expect(test.openedCaches.every((name) => name === verifiedContentCacheName)).toBe(true)

      test.setOnline(false)
      expect(yield* test.service.loadJson(receipt)).toEqual({ answer: "a" })
      expect(test.fetchedPaths).toHaveLength(2)
    })
  })

  it.effect("blocks a known-offline cache miss without fetching or reading a body", () => {
    const receipt = jsonReceipt('{"answer":"a"}')
    const test = harness({ online: false })

    return Effect.gen(function*() {
      const error = yield* Effect.flip(test.service.ensureAvailable(receipt))

      expect(error._tag).toBe("VerifiedContentUnavailable")
      if (error._tag === "VerifiedContentUnavailable") {
        expect(error.reason).toBe("known-offline-miss")
      }
      expect(test.fetchedPaths).toEqual([])
      expect(test.cache.bodyReads).toBe(0)
    })
  })

  it.effect("uses verified cache metadata offline without reading the answer during availability", () => {
    const body = '{"answer":"a"}'
    const receipt = jsonReceipt(body)
    const test = harness({
      responses: [new Response(body, { headers: { "content-type": "application/json" } })]
    })

    return Effect.gen(function*() {
      expect(yield* test.service.loadJson(receipt)).toEqual({ answer: "a" })
      test.setOnline(false)
      const readsBeforeAvailability = test.cache.bodyReads

      expect(yield* test.service.ensureAvailable(receipt)).toEqual({
        path: receipt.postcommitPath,
        source: "verified-cache"
      })
      expect(test.cache.bodyReads).toBe(readsBeforeAvailability)
      expect(yield* test.service.loadJson(receipt)).toEqual({ answer: "a" })
      expect(test.cache.bodyReads).toBe(readsBeforeAvailability + 1)
      expect(test.fetchedPaths).toEqual([receipt.postcommitPath])
    })
  })

  it.effect("verifies a safe same-origin asset receipt and returns a typed Blob", () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
    const receipt: AssetContentReceipt = {
      path: "/content/assets/derivatives/scenes/s001-web.png",
      bytes: bytes.byteLength,
      sha256: sha256(bytes)
    }
    const test = harness({
      responses: [new Response(bytes, { headers: { "content-type": "image/png" } })]
    })

    return Effect.gen(function*() {
      const blob = yield* test.service.loadAssetBlob(receipt)

      expect(blob.size).toBe(bytes.byteLength)
      expect(blob.type).toBe("image/png")
      expect(test.fetchedPaths).toEqual([receipt.path])
    })
  })

  it.effect("rejects unsafe or cross-origin-looking asset paths before any fetch", () => {
    const test = harness()
    const receipt = {
      path: "//evil.example/scene.png",
      bytes: 8,
      sha256: "0".repeat(64)
    } as AssetContentReceipt

    return Effect.gen(function*() {
      const error = yield* Effect.flip(test.service.loadAssetBlob(receipt))

      expect(error._tag).toBe("InvalidContentReceipt")
      expect(test.fetchedPaths).toEqual([])
      expect(test.openedCaches).toEqual([])
    })
  })
})
