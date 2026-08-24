import { readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"
import { isDeepStrictEqual } from "node:util"
import { ReleaseManifest } from "@nycustodian/content/model"
import { Schema } from "effect"
import {
  decodePublicDeliveryManifest,
  derivePublicDeliveryManifest,
  type PublicDeliveryManifest
} from "../src/delivery-manifest.ts"
import {
  cacheVersionFor,
  finalizeServiceWorker
} from "./service-worker-finalization.ts"

const siteRoot = new URL("../", import.meta.url)
const repositoryRoot = new URL("../../", siteRoot)
const distRoot = new URL("dist/", siteRoot)
const serviceWorkerUrl = new URL("dist/sw.js", siteRoot)
const publicReleaseRoot = new URL("content/vertical-slice/", distRoot)
const publicAssetRoot = new URL("content/assets/", distRoot)
const internalManifestUrl = new URL(
  "content/releases/vertical-slice/manifest.json",
  repositoryRoot
)

const safePrecacheArtifactKinds = new Set([
  "catalog",
  "pack-precommit",
  "question-precommit",
  "scene-precommit",
  "legacy-question-precommit"
])

const answerBearingFileSegment =
  /(?:^|[/_.-])(?:answers?(?:[/_.-]?key)?|correct[/_.-]?option|rationales?|solutions?|target[/_.-]?regions?|full[/_.-]?post[/_.-]?answer)(?=$|[/_.-])/i

const normalizedRelativePath = (root: string, path: string): string =>
  relative(root, path).replaceAll("\\", "/")

export const assertEqualPathSets = (
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
  label: string
): void => {
  const missing = [...expected].filter((path) => !actual.has(path))
  const extra = [...actual].filter((path) => !expected.has(path))
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `${label} closure mismatch; missing [${missing.join(", ")}], extra [${extra.join(", ")}]`
    )
  }
}

export const assertSafeBuildPaths = (paths: readonly string[]): void => {
  for (const path of paths) {
    const normalized = path.replaceAll("\\", "/")
    if (normalized.toLowerCase().endsWith(".map")) {
      throw new Error(`Source maps must not be deployed: ${normalized}`)
    }
    if (answerBearingFileSegment.test(normalized)) {
      throw new Error(`Answer-bearing filename must not be deployed: ${normalized}`)
    }
  }
}

export const serializePublicDeliveryManifest = (
  manifest: typeof ReleaseManifest.Type
): string => `${JSON.stringify(derivePublicDeliveryManifest(manifest), null, 2)}\n`

export const assertPublicDeliveryClosure = (
  manifest: PublicDeliveryManifest,
  releaseFiles: readonly string[],
  assetFiles: readonly string[]
): void => {
  assertEqualPathSets(
    new Set(releaseFiles.filter((path) => path !== "manifest.json")),
    new Set(manifest.artifacts.map((artifact) => artifact.path)),
    "Public release artifacts"
  )
  assertEqualPathSets(
    new Set(assetFiles),
    new Set(manifest.assets.map((asset) => asset.path.replace(/^content\/assets\//, ""))),
    "Public delivery assets"
  )
}

export const collectFiles = async (directory: string): Promise<readonly string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : Promise.resolve([path])
    })
  )
  return nested.flat().sort()
}

const localAssetPath = (
  root: string,
  available: ReadonlySet<string>,
  reference: string,
  importer?: string
): string | undefined => {
  const withoutSuffix = reference.split(/[?#]/, 1)[0]
  if (withoutSuffix === undefined || withoutSuffix.length === 0) return undefined
  const path = withoutSuffix.startsWith("/assets/")
    ? withoutSuffix.slice(1)
    : withoutSuffix.startsWith("./") || withoutSuffix.startsWith("../")
    ? normalizedRelativePath(root, resolve(importer === undefined ? root : dirname(importer), withoutSuffix))
    : undefined
  return path !== undefined && available.has(path) ? path : undefined
}

export const collectReferencedBuildAssets = async (
  root: string,
  htmlPaths: readonly string[]
): Promise<readonly string[]> => {
  const buildFiles = await collectFiles(root)
  const available = new Set(
    buildFiles
      .map((path) => normalizedRelativePath(root, path))
      .filter((path) => path.startsWith("assets/"))
  )
  const queue: string[] = []
  for (const htmlPath of htmlPaths) {
    const html = await readFile(htmlPath, "utf8")
    for (const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
      const path = match[1] === undefined
        ? undefined
        : localAssetPath(root, available, match[1], htmlPath)
      if (path !== undefined) queue.push(path)
    }
  }

  const closure = new Set<string>()
  while (queue.length > 0) {
    const path = queue.shift()
    if (path === undefined || closure.has(path)) continue
    closure.add(path)
    const absolutePath = resolve(root, path)
    if (!path.endsWith(".js") && !path.endsWith(".css")) continue
    const source = await readFile(absolutePath, "utf8")
    for (const match of source.matchAll(/["'](\.?\.?\/[^"']+)["']/g)) {
      const dependency = match[1] === undefined
        ? undefined
        : localAssetPath(root, available, match[1], absolutePath)
      if (dependency !== undefined) queue.push(dependency)
    }
    if (path.endsWith(".css")) {
      for (const match of source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
        const dependency = match[1] === undefined
          ? undefined
          : localAssetPath(root, available, match[1], absolutePath)
        if (dependency !== undefined) queue.push(dependency)
      }
    }
  }

  assertEqualPathSets(closure, available, "Referenced build assets")
  return [...closure].sort().map((path) => `/${path}`)
}

const documentPath = (canonicalPath: string): string =>
  canonicalPath === "/" ? "index.html" : `${canonicalPath.slice(1)}index.html`

const assertClosedBuildTree = (
  buildFiles: readonly string[],
  canonicalPaths: readonly string[],
  manifest: PublicDeliveryManifest,
  builtAssets: readonly string[]
): void => {
  const actual = new Set(buildFiles.map((path) => normalizedRelativePath(distRoot.pathname, path)))
  const expected = new Set([
    ...canonicalPaths.map(documentPath),
    "404.html",
    "offline.html",
    "manifest.webmanifest",
    "styles.css",
    "sw.js",
    "content/vertical-slice/manifest.json",
    ...manifest.artifacts.map((artifact) => `content/vertical-slice/${artifact.path}`),
    ...manifest.assets.map((asset) => asset.path),
    ...builtAssets.map((path) => path.slice(1))
  ])
  assertEqualPathSets(actual, expected, "Public build tree")
}

export const canonicalizeGeneratedDocuments = async (
  root: string
): Promise<readonly string[]> => {
  const htmlPaths = (await collectFiles(root)).filter((path) => path.endsWith(".html"))
  const canonicalPaths: string[] = []
  const statusDocument = resolve(root, "404.html")

  for (const path of htmlPaths) {
    const html = await readFile(path, "utf8")
    const markers = [...html.matchAll(/<!--__CANONICAL__(\/[^<]*?)-->/g)]
    if (markers.length === 0) {
      if (path === statusDocument) {
        if (!html.includes('data-route-id="status"')) {
          throw new Error("The non-canonical 404 document must identify the status route")
        }
        continue
      }
      if (html.includes("data-route-id=")) {
        throw new Error(`Generated document has no canonical marker: ${path}`)
      }
      continue
    }
    if (markers.length !== 1 || markers[0]?.[1] === undefined) {
      throw new Error(`Generated document has duplicated or malformed canonical markers: ${path}`)
    }
    const canonicalPath = markers[0][1]
    if (!canonicalPath.startsWith("/") || !canonicalPath.endsWith("/") && canonicalPath !== "/") {
      throw new Error(`Generated document has a non-canonical route path: ${path}`)
    }
    if (canonicalPaths.includes(canonicalPath)) {
      throw new Error(`Duplicate canonical route in generated documents: ${canonicalPath}`)
    }
    canonicalPaths.push(canonicalPath)
    await writeFile(
      path,
      html.replace(markers[0][0], `<link rel="canonical" href="${canonicalPath}">`)
    )
  }

  return canonicalPaths.sort()
}

export const finalizeBuild = async (): Promise<void> => {
  const canonicalPaths = await canonicalizeGeneratedDocuments(distRoot.pathname)
  const builtManifestUrl = new URL("manifest.json", publicReleaseRoot)
  const rawBuiltManifest = JSON.parse(await Bun.file(builtManifestUrl).text()) as unknown
  const stagedManifest = decodePublicDeliveryManifest(rawBuiltManifest)
  const internalManifest = Schema.decodeUnknownSync(ReleaseManifest)(
    JSON.parse(await Bun.file(internalManifestUrl).text())
  )
  const manifest = derivePublicDeliveryManifest(internalManifest)
  if (
    !isDeepStrictEqual(rawBuiltManifest, JSON.parse(JSON.stringify(stagedManifest))) ||
    !isDeepStrictEqual(
      JSON.parse(JSON.stringify(stagedManifest)),
      JSON.parse(JSON.stringify(manifest))
    )
  ) {
    throw new Error("Staged delivery manifest is not the exact closed deployable subset")
  }
  await writeFile(builtManifestUrl, serializePublicDeliveryManifest(internalManifest))

  const buildFiles = await collectFiles(distRoot.pathname)
  const relativeBuildFiles = buildFiles.map((path) => normalizedRelativePath(distRoot.pathname, path))
  assertSafeBuildPaths(relativeBuildFiles)
  assertPublicDeliveryClosure(
    manifest,
    (await collectFiles(publicReleaseRoot.pathname)).map((path) =>
      normalizedRelativePath(publicReleaseRoot.pathname, path)
    ),
    (await collectFiles(publicAssetRoot.pathname)).map((path) =>
      normalizedRelativePath(publicAssetRoot.pathname, path)
    )
  )
  const htmlPaths = buildFiles.filter((path) => path.endsWith(".html"))
  const builtAssets = await collectReferencedBuildAssets(distRoot.pathname, htmlPaths)
  assertClosedBuildTree(buildFiles, canonicalPaths, manifest, builtAssets)
  const safeContent = manifest.artifacts
    .filter((artifact) => safePrecacheArtifactKinds.has(artifact.kind))
    .map((artifact) => `/content/vertical-slice/${artifact.path}`)

  const shellUrls = [
    ...canonicalPaths,
    "/404.html",
    "/offline.html",
    "/manifest.webmanifest",
    "/styles.css",
    "/content/vertical-slice/manifest.json",
    ...safeContent,
    ...builtAssets
  ]
  if (shellUrls.some((url) => url.includes("postcommit"))) {
    throw new Error("Service-worker shell closure must not contain postcommit payloads")
  }
  if (new Set(shellUrls).size !== shellUrls.length) {
    throw new Error("Service-worker shell closure contains duplicate URLs")
  }

  const cacheVersion = cacheVersionFor(
    await Promise.all(
      buildFiles.map(async (path) => ({
        path: relative(distRoot.pathname, path),
        bytes: await readFile(path)
      }))
    )
  )
  const serviceWorkerTemplate = await Bun.file(serviceWorkerUrl).text()
  await Bun.write(
    serviceWorkerUrl,
    finalizeServiceWorker({
      assetNames: shellUrls,
      cacheVersion,
      template: serviceWorkerTemplate
    })
  )

  console.log(
    `finalized ${canonicalPaths.length} canonical documents and ${new Set(shellUrls).size} ` +
      `safe shell URLs; cache ${cacheVersion}`
  )
}

if (import.meta.main) await finalizeBuild()
