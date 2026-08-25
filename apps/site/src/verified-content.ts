import { Context, Effect, Layer, Schema } from "effect"

const safePathSegment = /^[a-z0-9][a-z0-9._-]*$/

const isSafeRootRelativePath = (value: string, prefix: string): boolean => {
  if (!value.startsWith(prefix) || value.includes("\\") || value.includes("%")) return false
  const segments = value.slice(1).split("/")
  return segments.length > 1 && segments.every((segment) => safePathSegment.test(segment))
}

const PostcommitPath = Schema.String.check(
  Schema.makeFilter((value) =>
    isSafeRootRelativePath(value, "/content/") && value.endsWith(".postcommit.json")
      ? undefined
      : "an exact safe root-relative postcommit artifact path"
  )
)

const AssetPath = Schema.String.check(
  Schema.makeFilter((value) =>
    isSafeRootRelativePath(value, "/content/assets/")
      ? undefined
      : "an exact safe root-relative delivery asset path"
  )
)

const PositiveBytes = Schema.Int.check(
  Schema.makeFilter((value) => value > 0 ? undefined : "a positive byte length")
)

const Sha256 = Schema.String.check(
  Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
)

export const PostcommitContentReceipt = Schema.Struct({
  postcommitPath: PostcommitPath,
  postcommitBytes: PositiveBytes,
  postcommitSha256: Sha256
})

export type PostcommitContentReceipt = typeof PostcommitContentReceipt.Type

export const AssetContentReceipt = Schema.Struct({
  path: AssetPath,
  bytes: PositiveBytes,
  sha256: Sha256
})

export type AssetContentReceipt = typeof AssetContentReceipt.Type

export class InvalidContentReceipt extends Schema.TaggedError<InvalidContentReceipt>()(
  "InvalidContentReceipt",
  {
    detail: Schema.NonEmptyString,
    path: Schema.String,
    cause: Schema.Unknown
  }
) {}

export class VerifiedContentUnavailable extends Schema.TaggedError<VerifiedContentUnavailable>()(
  "VerifiedContentUnavailable",
  {
    reason: Schema.Literals([
      "cache-failure",
      "known-offline-miss",
      "network-failure",
      "verification-failure"
    ]),
    detail: Schema.NonEmptyString,
    path: Schema.String,
    cause: Schema.Unknown
  }
) {}

export class VerifiedContentIntegrityError extends Schema.TaggedError<VerifiedContentIntegrityError>()(
  "VerifiedContentIntegrityError",
  {
    source: Schema.Literals(["cache", "network"]),
    path: Schema.NonEmptyString,
    expectedBytes: Schema.Int,
    receivedBytes: Schema.Int,
    expectedSha256: Sha256,
    receivedSha256: Sha256
  }
) {}

export class VerifiedContentDecodeError extends Schema.TaggedError<VerifiedContentDecodeError>()(
  "VerifiedContentDecodeError",
  {
    detail: Schema.NonEmptyString,
    path: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export type VerifiedContentError =
  | InvalidContentReceipt
  | VerifiedContentUnavailable
  | VerifiedContentIntegrityError
  | VerifiedContentDecodeError

export type ContentAvailability = Readonly<{
  path: string
  source: "network-required" | "verified-cache"
}>

export interface VerifiedContentCache {
  readonly delete: (key: string) => Promise<boolean>
  readonly match: (key: string) => Promise<Response | undefined>
  readonly put: (key: string, response: Response) => Promise<void>
}

export interface VerifiedContentPlatform {
  readonly fetch: (path: string, init: RequestInit) => Promise<Response>
  readonly isOnline: () => boolean
  readonly openCache: (name: string) => Promise<VerifiedContentCache>
  readonly origin: () => string
  readonly sha256: (bytes: Uint8Array) => Promise<string>
}

interface NormalizedReceipt {
  readonly bytes: number
  readonly kind: "asset" | "postcommit"
  readonly path: string
  readonly sha256: string
}

interface VerifiedBytes {
  readonly buffer: ArrayBuffer
  readonly contentType: string
}

export const verifiedContentCacheName = "nycustodian-verified-content-v1"

const cacheProtocol = "1"
const cacheKeyParameter = "__nycustodian_verified_sha256"
const metadataHeaders = {
  bytes: "x-nycustodian-verified-bytes",
  kind: "x-nycustodian-verified-kind",
  path: "x-nycustodian-verified-path",
  protocol: "x-nycustodian-verified-protocol",
  sha256: "x-nycustodian-verified-sha256"
} as const

export const verifiedContentCacheKey = (
  origin: string,
  receipt: Pick<NormalizedReceipt, "path" | "sha256">
): string => {
  const url = new URL(receipt.path, origin)
  url.searchParams.set(cacheKeyParameter, receipt.sha256)
  return url.href
}

const postcommitReceipt = Effect.fn("VerifiedContent.decodePostcommitReceipt")(function*(
  input: PostcommitContentReceipt
) {
  const decoded = yield* Schema.decodeUnknownEffect(PostcommitContentReceipt)(input).pipe(
    Effect.mapError(
      (cause) =>
        new InvalidContentReceipt({
          detail: "The postcommit receipt was not an exact safe delivery coordinate.",
          path: typeof input?.postcommitPath === "string" ? input.postcommitPath : "",
          cause
        })
    )
  )
  return {
    bytes: decoded.postcommitBytes,
    kind: "postcommit",
    path: decoded.postcommitPath,
    sha256: decoded.postcommitSha256
  } satisfies NormalizedReceipt
})

const assetReceipt = Effect.fn("VerifiedContent.decodeAssetReceipt")(function*(
  input: AssetContentReceipt
) {
  const decoded = yield* Schema.decodeUnknownEffect(AssetContentReceipt)(input).pipe(
    Effect.mapError(
      (cause) =>
        new InvalidContentReceipt({
          detail: "The asset receipt was not an exact safe delivery coordinate.",
          path: typeof input?.path === "string" ? input.path : "",
          cause
        })
    )
  )
  return {
    bytes: decoded.bytes,
    kind: "asset",
    path: decoded.path,
    sha256: decoded.sha256
  } satisfies NormalizedReceipt
})

const responseMetadataMatches = (
  response: Response,
  receipt: NormalizedReceipt
): boolean =>
  response.status === 200 &&
  response.headers.get(metadataHeaders.protocol) === cacheProtocol &&
  response.headers.get(metadataHeaders.kind) === receipt.kind &&
  response.headers.get(metadataHeaders.path) === receipt.path &&
  response.headers.get(metadataHeaders.bytes) === String(receipt.bytes) &&
  response.headers.get(metadataHeaders.sha256) === receipt.sha256

const responseForCache = (
  verified: VerifiedBytes,
  receipt: NormalizedReceipt
): Response => {
  const headers = new Headers({
    "content-type": verified.contentType,
    [metadataHeaders.bytes]: String(receipt.bytes),
    [metadataHeaders.kind]: receipt.kind,
    [metadataHeaders.path]: receipt.path,
    [metadataHeaders.protocol]: cacheProtocol,
    [metadataHeaders.sha256]: receipt.sha256
  })
  return new Response(verified.buffer.slice(0), { headers, status: 200 })
}

export const verifiedContentResponseForCache = (
  receipt: {
    readonly bytes: number
    readonly kind: "asset" | "postcommit"
    readonly path: string
    readonly sha256: string
  },
  buffer: ArrayBuffer,
  contentType: string
): Response => responseForCache({ buffer, contentType }, receipt)

const unavailable = (
  reason: VerifiedContentUnavailable["reason"],
  path: string,
  detail: string,
  cause: unknown
): VerifiedContentUnavailable =>
  new VerifiedContentUnavailable({ reason, path, detail, cause })

export const makeVerifiedContent = (
  platform: VerifiedContentPlatform
): VerifiedContent["Service"] => {
  const cacheKey = Effect.fn("VerifiedContent.cacheKey")(function*(receipt: NormalizedReceipt) {
    return yield* Effect.try({
      try: () => {
        const origin = new URL(platform.origin()).origin
        const key = verifiedContentCacheKey(origin, receipt)
        if (new URL(key).origin !== origin) throw new Error("Cache key escaped the application origin")
        return key
      },
      catch: (cause) =>
        unavailable(
          "cache-failure",
          receipt.path,
          "The verified-content cache coordinate could not be created.",
          cause
        )
    })
  })

  const openCache = Effect.fn("VerifiedContent.openCache")(function*(path: string) {
    return yield* Effect.tryPromise({
      try: () => platform.openCache(verifiedContentCacheName),
      catch: (cause) =>
        unavailable(
          "cache-failure",
          path,
          "The verified-content cache could not be opened.",
          cause
        )
    })
  })

  const deleteCached = Effect.fn("VerifiedContent.deleteCached")(function*(
    cache: VerifiedContentCache,
    key: string,
    path: string
  ) {
    return yield* Effect.tryPromise({
      try: () => cache.delete(key),
      catch: (cause) =>
        unavailable(
          "cache-failure",
          path,
          "An invalid verified-content cache entry could not be removed.",
          cause
        )
    })
  })

  const verifyBytes = Effect.fn("VerifiedContent.verifyBytes")(function*(
    receipt: NormalizedReceipt,
    buffer: ArrayBuffer,
    source: VerifiedContentIntegrityError["source"]
  ) {
    const receivedSha256 = yield* Effect.tryPromise({
      try: () => platform.sha256(new Uint8Array(buffer)),
      catch: (cause) =>
        unavailable(
          "verification-failure",
          receipt.path,
          "SHA-256 verification was unavailable.",
          cause
        )
    })
    if (buffer.byteLength !== receipt.bytes || receivedSha256 !== receipt.sha256) {
      return yield* new VerifiedContentIntegrityError({
        source,
        path: receipt.path,
        expectedBytes: receipt.bytes,
        receivedBytes: buffer.byteLength,
        expectedSha256: receipt.sha256,
        receivedSha256
      })
    }
  })

  const readCached = Effect.fn("VerifiedContent.readCached")(function*(
    cache: VerifiedContentCache,
    key: string,
    receipt: NormalizedReceipt
  ) {
    const response = yield* Effect.tryPromise({
      try: () => cache.match(key),
      catch: (cause) =>
        unavailable(
          "cache-failure",
          receipt.path,
          "The verified-content cache could not be read.",
          cause
        )
    })
    if (response === undefined) return undefined

    if (!responseMetadataMatches(response, receipt)) {
      yield* deleteCached(cache, key, receipt.path)
      return undefined
    }

    const readResult = yield* Effect.tryPromise({
      try: () => response.arrayBuffer(),
      catch: (cause) =>
        unavailable(
          "cache-failure",
          receipt.path,
          "The cached verified-content bytes could not be read.",
          cause
        )
    }).pipe(
      Effect.match({
        onFailure: (error) => ({ tag: "failure", error }) as const,
        onSuccess: (buffer) => ({ tag: "success", buffer }) as const
      })
    )
    if (readResult.tag === "failure") {
      yield* deleteCached(cache, key, receipt.path)
      return undefined
    }

    const verification = yield* verifyBytes(receipt, readResult.buffer, "cache").pipe(
      Effect.match({
        onFailure: (error) => ({ tag: "failure", error }) as const,
        onSuccess: () => ({ tag: "success" }) as const
      })
    )
    if (verification.tag === "failure") {
      if (verification.error._tag !== "VerifiedContentIntegrityError") {
        return yield* verification.error
      }
      yield* deleteCached(cache, key, receipt.path)
      return undefined
    }

    return {
      buffer: readResult.buffer,
      contentType: response.headers.get("content-type") ?? "application/octet-stream"
    } satisfies VerifiedBytes
  })

  const readNetwork = Effect.fn("VerifiedContent.readNetwork")(function*(
    receipt: NormalizedReceipt
  ) {
    const response = yield* Effect.tryPromise({
      try: async () => {
        const response = await platform.fetch(receipt.path, {
          cache: "no-store",
          credentials: "same-origin",
          method: "GET"
        })
        if (!response.ok) throw new Error(`Verified content returned HTTP ${response.status}`)
        return response
      },
      catch: (cause) =>
        unavailable(
          "network-failure",
          receipt.path,
          "The exact verified content could not be loaded from the network.",
          cause
        )
    })
    const contentType = response.headers.get("content-type") ??
      (receipt.kind === "postcommit" ? "application/json" : "application/octet-stream")
    const buffer = yield* Effect.tryPromise({
      try: () => response.arrayBuffer(),
      catch: (cause) =>
        unavailable(
          "network-failure",
          receipt.path,
          "The exact verified-content response body could not be read.",
          cause
        )
    })
    yield* verifyBytes(receipt, buffer, "network")
    return { buffer, contentType } satisfies VerifiedBytes
  })

  const loadBytes = Effect.fn("VerifiedContent.loadBytes")(function*(
    receipt: NormalizedReceipt
  ) {
    const key = yield* cacheKey(receipt)
    const cache = yield* openCache(receipt.path)
    const cached = yield* readCached(cache, key, receipt)
    if (cached !== undefined) return cached

    if (!platform.isOnline()) {
      return yield* unavailable(
        "known-offline-miss",
        receipt.path,
        "This exact verified content is not available while the device is offline.",
        new Error("navigator.onLine is false")
      )
    }

    const network = yield* readNetwork(receipt)
    yield* Effect.tryPromise({
      try: () => cache.put(key, responseForCache(network, receipt)),
      catch: (cause) =>
        unavailable(
          "cache-failure",
          receipt.path,
          "Verified bytes could not be retained in the dedicated content cache.",
          cause
        )
    })
    return network
  })

  const availability = Effect.fn("VerifiedContent.ensureAvailableInternal")(function*(
    receipt: NormalizedReceipt
  ) {
    const key = yield* cacheKey(receipt)
    const cache = yield* openCache(receipt.path)
    const response = yield* Effect.tryPromise({
      try: () => cache.match(key),
      catch: (cause) =>
        unavailable(
          "cache-failure",
          receipt.path,
          "The verified-content availability metadata could not be read.",
          cause
        )
    })

    if (response !== undefined && responseMetadataMatches(response, receipt)) {
      return { path: receipt.path, source: "verified-cache" } satisfies ContentAvailability
    }
    if (response !== undefined) yield* deleteCached(cache, key, receipt.path)

    if (!platform.isOnline()) {
      return yield* unavailable(
        "known-offline-miss",
        receipt.path,
        "This exact verified content is not cached and the device is offline.",
        new Error("navigator.onLine is false")
      )
    }
    return { path: receipt.path, source: "network-required" } satisfies ContentAvailability
  })

  const ensureAvailable = Effect.fn("VerifiedContent.ensureAvailable")(function*(
    input: PostcommitContentReceipt
  ) {
    return yield* availability(yield* postcommitReceipt(input))
  })

  const ensureAssetAvailable = Effect.fn("VerifiedContent.ensureAssetAvailable")(function*(
    input: AssetContentReceipt
  ) {
    return yield* availability(yield* assetReceipt(input))
  })

  const loadJson = Effect.fn("VerifiedContent.loadJson")(function*(
    input: PostcommitContentReceipt
  ) {
    const receipt = yield* postcommitReceipt(input)
    const verified = yield* loadBytes(receipt)
    return yield* Effect.try({
      try: () => JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(verified.buffer)) as unknown,
      catch: (cause) =>
        new VerifiedContentDecodeError({
          detail: "Verified postcommit bytes were not valid UTF-8 JSON.",
          path: receipt.path,
          cause
        })
    })
  })

  const loadAssetBlob = Effect.fn("VerifiedContent.loadAssetBlob")(function*(
    input: AssetContentReceipt
  ) {
    const receipt = yield* assetReceipt(input)
    const verified = yield* loadBytes(receipt)
    return new Blob([verified.buffer.slice(0)], { type: verified.contentType })
  })

  return VerifiedContent.of({
    ensureAssetAvailable,
    ensureAvailable,
    loadAssetBlob,
    loadJson
  })
}

export class VerifiedContent extends Context.Service<
  VerifiedContent,
  {
    readonly ensureAssetAvailable: (
      receipt: AssetContentReceipt
    ) => Effect.Effect<ContentAvailability, VerifiedContentError>
    readonly ensureAvailable: (
      receipt: PostcommitContentReceipt
    ) => Effect.Effect<ContentAvailability, VerifiedContentError>
    readonly loadAssetBlob: (
      receipt: AssetContentReceipt
    ) => Effect.Effect<Blob, VerifiedContentError>
    readonly loadJson: (
      receipt: PostcommitContentReceipt
    ) => Effect.Effect<unknown, VerifiedContentError>
  }
>()("@nycustodian/site/VerifiedContent") {}

const bytesToHex = (bytes: Uint8Array): string => {
  let value = ""
  for (const byte of bytes) value += byte.toString(16).padStart(2, "0")
  return value
}

const browserPlatform: VerifiedContentPlatform = {
  fetch: (path, init) => globalThis.fetch(path, init),
  isOnline: () => globalThis.navigator.onLine !== false,
  openCache: async (name) => {
    const cache = await globalThis.caches.open(name)
    return {
      delete: (key) => cache.delete(key),
      match: (key) => cache.match(key),
      put: (key, response) => cache.put(key, response)
    }
  },
  origin: () => globalThis.location.origin,
  sha256: async (bytes) => {
    const digestInput = new Uint8Array(bytes.byteLength)
    digestInput.set(bytes)
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      digestInput.buffer
    )
    return bytesToHex(new Uint8Array(digest))
  }
}

export const liveVerifiedContent = Layer.succeed(
  VerifiedContent,
  makeVerifiedContent(browserPlatform)
)
