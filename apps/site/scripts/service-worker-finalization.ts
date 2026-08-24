import { createHash } from "node:crypto"

export interface CacheVersionInput {
  readonly path: string
  readonly bytes: Uint8Array
}

const cacheVersionMarker = "__NYCUSTODIAN_CACHE_VERSION__"
const precacheAssetsMarker = "/*__PRECACHE_ASSETS__*/"

const occurrenceCount = (value: string, search: string): number =>
  value.split(search).length - 1

export const cacheVersionFor = (inputs: readonly CacheVersionInput[]): string => {
  const hash = createHash("sha256")
  const normalized = inputs
    .map((input) => ({
      path: input.path.replaceAll("\\", "/"),
      bytes: input.bytes
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0
    )
  const seenPaths = new Set<string>()

  for (const input of normalized) {
    if (seenPaths.has(input.path)) {
      throw new Error("Cache-version inputs must have unique paths")
    }
    seenPaths.add(input.path)

    const pathBytes = new TextEncoder().encode(input.path)
    hash.update(String(pathBytes.byteLength))
    hash.update(":")
    hash.update(pathBytes)
    hash.update(":")
    hash.update(String(input.bytes.byteLength))
    hash.update(":")
    hash.update(input.bytes)
    hash.update("\n")
  }

  return hash.digest("hex").slice(0, 16)
}

export const finalizeServiceWorker = ({
  assetNames,
  cacheVersion,
  template
}: {
  readonly assetNames: readonly string[]
  readonly cacheVersion: string
  readonly template: string
}): string => {
  if (!/^[a-f0-9]{16}$/.test(cacheVersion)) {
    throw new Error("Service-worker cache version must be a 16-character lowercase hex digest")
  }
  if (occurrenceCount(template, cacheVersionMarker) !== 2) {
    throw new Error("Service-worker cache-version markers are missing or duplicated")
  }
  if (occurrenceCount(template, precacheAssetsMarker) !== 1) {
    throw new Error("Service-worker precache marker is missing or duplicated")
  }

  const serializedAssets = [...new Set(assetNames)]
    .sort()
    .map((asset) => JSON.stringify(asset))
    .join(",\n  ")

  return template
    .replace(precacheAssetsMarker, serializedAssets)
    .replaceAll(cacheVersionMarker, cacheVersion)
}
