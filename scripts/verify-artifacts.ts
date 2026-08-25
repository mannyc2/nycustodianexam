import { createHash } from "node:crypto"
import { readdir } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { isDeepStrictEqual } from "node:util"
import { brotliCompressSync, gzipSync } from "node:zlib"
import {
  CatalogArtifact,
  PostcommitQuestion,
  PostcommitScene,
  PrecommitPackArtifact,
  PrecommitQuestion,
  PrecommitScene,
  ReleaseManifest
} from "../packages/content/src/model.ts"
import {
  decodePublicDeliveryManifest,
  derivePublicDeliveryManifest
} from "../apps/site/src/delivery-manifest.ts"
import {
  HazardAttemptReceipt,
  QuestionAttemptReceipt
} from "../apps/site/src/attempt-receipt.ts"
import { ReviewQueueBootstrap } from "../apps/site/src/review/model.ts"
import { SimulationBootstrap } from "../apps/site/src/simulation/model.ts"
import { PrintBuilderBootstrap } from "../apps/site/src/print/model.ts"
import { AssetContentReceipt } from "../apps/site/src/verified-content.ts"
import {
  assertSafeBuildPaths,
  collectReferencedBuildAssets,
  normalizeCanonicalOrigin,
  renderSitemap
} from "../apps/site/scripts/finalize-service-worker.ts"
import { Schema } from "effect"

const repositoryRoot = new URL("../", import.meta.url)
const distRoot = new URL("apps/site/dist/", repositoryRoot)
const releaseRoot = new URL("content/releases/vertical-slice/", repositoryRoot)

type Manifest = typeof ReleaseManifest.Type
type ManifestArtifact = Manifest["artifacts"][number]

const safePrecacheArtifactKinds = new Set<ManifestArtifact["kind"]>([
  "catalog",
  "pack-precommit",
  "question-precommit",
  "scene-precommit",
  "legacy-question-precommit"
])

const slugify = (value: string): string => {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (slug.length === 0) throw new Error(`Cannot derive a URL slug from ${JSON.stringify(value)}`)
  return slug
}

const collectFiles = async (directory: string): Promise<readonly string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : Promise.resolve([path])
    })
  )
  return nested.flat().sort()
}

const bytes = async (url: URL): Promise<Uint8Array> =>
  new Uint8Array(await Bun.file(url).arrayBuffer())
const text = (url: URL): Promise<string> => Bun.file(url).text()
const digest = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex")

const assertFileRecord = async (
  record: Pick<ManifestArtifact, "bytes" | "path" | "sha256">,
  url: URL,
  label: string
): Promise<void> => {
  if (!(await Bun.file(url).exists())) throw new Error(`${label} is missing: ${record.path}`)
  const value = await bytes(url)
  if (value.byteLength !== record.bytes || digest(value) !== record.sha256) {
    throw new Error(`${label} is not byte-identical to its release record: ${record.path}`)
  }
}

const assertEqualSets = (
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
  label: string
): void => {
  const missing = [...expected].filter((item) => !actual.has(item))
  const extra = [...actual].filter((item) => !expected.has(item))
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `${label} closure mismatch; missing [${missing.join(", ")}], extra [${extra.join(", ")}]`
    )
  }
}

const routeDocument = (canonicalPath: string): URL =>
  canonicalPath === "/"
    ? new URL("index.html", distRoot)
    : new URL(`${canonicalPath.slice(1)}index.html`, distRoot)

const extractAttribute = (html: string, expression: RegExp, label: string): string => {
  const matches = [...html.matchAll(expression)]
  if (matches.length !== 1 || matches[0]?.[1] === undefined) {
    throw new Error(`Expected exactly one ${label}`)
  }
  return matches[0][1]
}

export const extractEmbeddedJson = (html: string, id: string): unknown => {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = html.match(
    new RegExp(`<script id="${escapedId}" type="application/json">([\\s\\S]*?)<\\/script>`)
  )
  if (match?.[1] === undefined) throw new Error(`Missing embedded JSON contract ${id}`)
  return JSON.parse(match[1])
}

interface ExpectedRoute {
  readonly canonicalPath: string
  readonly hazardMode?: "nonvisual" | "visual"
  readonly position?: number
  readonly postcommitArtifact?: ManifestArtifact
  readonly postcommitPath?: string
  readonly precommit?: typeof PrecommitQuestion.Type | typeof PrecommitScene.Type
  readonly robots: "index,follow" | "noindex,follow"
  readonly routeId: string
}

export type PublicItemArtifactBinding = Readonly<
  Pick<ManifestArtifact, "bytes" | "itemId" | "kind" | "path" | "sha256">
>

export interface QuestionReceiptBinding {
  readonly artifact: PublicItemArtifactBinding
  readonly packVersion: number
  readonly position: number
  readonly questionId: string
  readonly releaseId: string
  readonly sessionId: string
}

export interface HazardReceiptBinding {
  readonly artifact: PublicItemArtifactBinding
  readonly assetMasterSha256: string
  readonly assetRevision: number
  readonly mode: "nonvisual" | "visual"
  readonly packVersion: number
  readonly position: number
  readonly releaseId: string
  readonly sceneId: string
  readonly sessionId: string
}

export interface HazardAssetReceiptBinding {
  readonly deliveryAsset: Readonly<Pick<Manifest["assets"][number], "bytes" | "path" | "sha256">>
  readonly webDerivative: Readonly<Pick<Manifest["assets"][number], "bytes" | "path" | "sha256">>
}

const collectJavaScriptClosure = async (
  html: string,
  allJavaScript: ReadonlySet<string>
): Promise<readonly string[]> => {
  const queue = [...html.matchAll(/<script\b[^>]*\bsrc="(\/assets\/[^"]+\.js)"[^>]*>/g)]
    .flatMap((match) => match[1] === undefined ? [] : [resolve(distRoot.pathname, match[1].slice(1))])
  const closure = new Set<string>()

  while (queue.length > 0) {
    const path = queue.shift()
    if (path === undefined || closure.has(path)) continue
    if (!allJavaScript.has(path)) throw new Error(`HTML references missing JavaScript: ${path}`)
    closure.add(path)
    const source = await Bun.file(path).text()
    for (const match of source.matchAll(/["'](\.\.?\/[^"']+\.js)["']/g)) {
      if (match[1] !== undefined) queue.push(resolve(dirname(path), match[1]))
    }
  }
  return [...closure].sort()
}

const bundleMeasurement = async (paths: readonly string[]) => {
  const chunks = await Promise.all(paths.map((path) => bytes(new URL(`file://${path}`))))
  const totalLength = chunks.reduce((total, chunk) => total + chunk.byteLength + 1, 0)
  const combined = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength + 1
  }
  return {
    raw: chunks.reduce((total, chunk) => total + chunk.byteLength, 0),
    gzip: gzipSync(combined).byteLength,
    brotli: brotliCompressSync(combined).byteLength
  }
}

const formatBytes = (value: number): string => `${value} B`

const forbiddenStructuredFields = new Set([
  "claim",
  "correctOptionId",
  "decoys",
  "fullPostAnswer",
  "hazardFamily",
  "nonvisualZonedEquivalent",
  "optionConceptIds",
  "rationales",
  "sources",
  "targetRegions",
  "targets"
])

export const assertNoAnswerBearingStructuredFields = (
  value: unknown,
  label: string
): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoAnswerBearingStructuredFields(item, `${label}[${index}]`)
    )
    return
  }
  if (value === null || typeof value !== "object") return
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenStructuredFields.has(key)) {
      throw new Error(`${label} exposes answer-bearing field ${key}`)
    }
    assertNoAnswerBearingStructuredFields(nested, `${label}.${key}`)
  }
}

const postcommitPath = (artifact: PublicItemArtifactBinding): string =>
  `/content/vertical-slice/${artifact.path}`

export const decodeAndAssertQuestionReceipt = (
  raw: unknown,
  binding: QuestionReceiptBinding,
  label: string
): typeof QuestionAttemptReceipt.Type => {
  assertNoAnswerBearingStructuredFields(raw, label)
  const receipt = Schema.decodeUnknownSync(QuestionAttemptReceipt)(raw)
  const expected = {
    releaseId: binding.releaseId,
    packVersion: binding.packVersion,
    sessionId: binding.sessionId,
    position: binding.position,
    postcommitPath: postcommitPath(binding.artifact),
    postcommitBytes: binding.artifact.bytes,
    postcommitSha256: binding.artifact.sha256,
    questionId: binding.questionId
  }
  if (
    binding.artifact.kind !== "question-postcommit" ||
    binding.artifact.itemId !== binding.questionId ||
    !isDeepStrictEqual(receipt, expected)
  ) {
    throw new Error(`${label} does not match its exact public question artifact`)
  }
  return receipt
}

export const decodeAndAssertHazardReceipt = (
  raw: unknown,
  binding: HazardReceiptBinding,
  label: string
): typeof HazardAttemptReceipt.Type => {
  assertNoAnswerBearingStructuredFields(raw, label)
  const receipt = Schema.decodeUnknownSync(HazardAttemptReceipt)(raw)
  const expected = {
    releaseId: binding.releaseId,
    packVersion: binding.packVersion,
    sessionId: binding.sessionId,
    position: binding.position,
    postcommitPath: postcommitPath(binding.artifact),
    postcommitBytes: binding.artifact.bytes,
    postcommitSha256: binding.artifact.sha256,
    sceneId: binding.sceneId,
    mode: binding.mode,
    assetRevision: binding.assetRevision,
    assetMasterSha256: binding.assetMasterSha256
  }
  if (
    binding.artifact.kind !== "scene-postcommit" ||
    binding.artifact.itemId !== binding.sceneId ||
    !isDeepStrictEqual(receipt, expected)
  ) {
    throw new Error(`${label} does not match its exact public scene artifact`)
  }
  return receipt
}

const assetCoordinates = (
  record: Readonly<{ readonly bytes: number; readonly path: string; readonly sha256: string }>
) => ({ path: record.path, bytes: record.bytes, sha256: record.sha256 })

export const decodeAndAssertHazardAssetReceipt = (
  raw: unknown,
  binding: HazardAssetReceiptBinding,
  label: string
): typeof AssetContentReceipt.Type => {
  assertNoAnswerBearingStructuredFields(raw, label)
  const receipt = Schema.decodeUnknownSync(AssetContentReceipt)(raw)
  const deliveryCoordinates = assetCoordinates(binding.deliveryAsset)
  const derivativeCoordinates = assetCoordinates(binding.webDerivative)
  const expected = {
    path: `/${binding.deliveryAsset.path}`,
    bytes: binding.deliveryAsset.bytes,
    sha256: binding.deliveryAsset.sha256
  }
  if (
    !isDeepStrictEqual(deliveryCoordinates, derivativeCoordinates) ||
    !isDeepStrictEqual(receipt, expected)
  ) {
    throw new Error(`${label} does not match its exact public delivery asset`)
  }
  return receipt
}

const htmlEscaped = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

export const assertNoAnswerBearingText = (
  value: string,
  secrets: readonly string[],
  label: string
): void => {
  for (const secret of new Set(secrets.filter((candidate) => candidate.length >= 20))) {
    const variants = new Set([
      secret,
      htmlEscaped(secret),
      JSON.stringify(secret).slice(1, -1)
    ])
    if ([...variants].some((variant) => value.includes(variant))) {
      throw new Error(`${label} embeds postcommit material: ${secret}`)
    }
  }
}

export const assertNoAnswerBearingFileNames = (
  paths: readonly string[],
  secrets: readonly string[]
): void => {
  const normalizedPaths = paths.map((path) => path.normalize("NFKD").toLowerCase())
  for (const secret of new Set(secrets.filter((candidate) => candidate.length >= 20))) {
    const encoded = secret
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    if (encoded.length >= 20 && normalizedPaths.some((path) => path.includes(encoded))) {
      throw new Error(`Public filename embeds postcommit material: ${encoded}`)
    }
  }
}

const occurrenceCount = (value: string, search: string): number =>
  value.split(search).length - 1

export const extractServiceWorkerShellUrls = (source: string): readonly string[] => {
  const match = source.match(/const shellUrls = \[([\s\S]*?)\]\s*(?:;|\n)/)
  if (match?.[1] === undefined) throw new Error("Service-worker shell URL list is missing")
  let decoded: unknown
  try {
    decoded = JSON.parse(`[${match[1]}]`)
  } catch (cause) {
    throw new Error("Service-worker shell URL list is not closed JSON", { cause })
  }
  if (!Array.isArray(decoded) || decoded.some((value) => typeof value !== "string")) {
    throw new Error("Service-worker shell URL list contains a non-string entry")
  }
  if (new Set(decoded).size !== decoded.length) {
    throw new Error("Service-worker shell URL list contains duplicate entries")
  }
  return decoded as readonly string[]
}

export const assertProtectedServiceWorkerPolicy = (
  source: string,
  expectedShellUrls: ReadonlySet<string>
): void => {
  const shellUrls = extractServiceWorkerShellUrls(source)
  assertEqualSets(new Set(shellUrls), expectedShellUrls, "Service-worker shell URLs")
  if (shellUrls.some((url) => url.includes(".postcommit.json") || url.includes("pack.postcommit"))) {
    throw new Error("Service-worker shell precache contains postcommit material")
  }
  if (source.includes("pack.postcommit")) {
    throw new Error("Service worker references the consolidated postcommit pack")
  }
  const protectedMatcher =
    /const isAppVerifiedContent = \(request\) => \{[\s\S]*?url\.pathname\.endsWith\("\.postcommit\.json"\)[\s\S]*?\n\}/
  const protectedMatches = [...source.matchAll(new RegExp(protectedMatcher.source, "g"))]
  if (
    protectedMatches.length !== 1 ||
    occurrenceCount(source, ".postcommit.json") !== 1 ||
    !/if \(isAppVerifiedContent\(event\.request\)\) \{\s*event\.respondWith\(fetch\(event\.request\)\)\s*return\s*\}/.test(source)
  ) {
    throw new Error(
      "Service worker may mention .postcommit.json only in its verified-content network bypass"
    )
  }
}

export const verify = async (): Promise<void> => {
  const canonicalOrigin = normalizeCanonicalOrigin(process.env.NYCUSTODIAN_CANONICAL_ORIGIN)
  const sourceManifestText = await text(new URL("manifest.json", releaseRoot))
  const manifest = Schema.decodeUnknownSync(ReleaseManifest)(JSON.parse(sourceManifestText))
  const builtManifestUrl = new URL("content/vertical-slice/manifest.json", distRoot)
  const builtManifestText = await text(builtManifestUrl)
  if (builtManifestText === sourceManifestText) {
    throw new Error("Published manifest exposes the internal release manifest")
  }
  const rawBuiltManifest = JSON.parse(builtManifestText) as unknown
  const deliveryManifest = decodePublicDeliveryManifest(rawBuiltManifest)
  const expectedDeliveryManifest = derivePublicDeliveryManifest(manifest)
  const encodedDeliveryManifest = JSON.parse(JSON.stringify(deliveryManifest)) as unknown
  const encodedExpectedManifest = JSON.parse(JSON.stringify(expectedDeliveryManifest)) as unknown
  if (
    !isDeepStrictEqual(rawBuiltManifest, encodedDeliveryManifest) ||
    !isDeepStrictEqual(encodedDeliveryManifest, encodedExpectedManifest)
  ) {
    throw new Error("Published delivery manifest is not the exact closed deployable subset")
  }
  const buildFiles = await collectFiles(distRoot.pathname)
  const relativeBuildFiles = buildFiles.map((path) =>
    relative(distRoot.pathname, path).replaceAll("\\", "/")
  )
  assertSafeBuildPaths(relativeBuildFiles)

  for (const artifact of manifest.artifacts) {
    await assertFileRecord(artifact, new URL(artifact.path, releaseRoot), "Compiled artifact")
  }
  for (const asset of manifest.assets) {
    await assertFileRecord(asset, new URL(asset.path, repositoryRoot), "Compiled delivery asset")
  }

  const publishedReleaseRoot = new URL("content/vertical-slice/", distRoot)
  const expectedPublicArtifacts = new Set([
    "manifest.json",
    ...deliveryManifest.artifacts.map((artifact) => artifact.path)
  ])
  const actualPublicArtifacts = new Set(
    (await collectFiles(publishedReleaseRoot.pathname)).map((path) =>
      relative(publishedReleaseRoot.pathname, path).replaceAll("\\", "/")
    )
  )
  assertEqualSets(actualPublicArtifacts, expectedPublicArtifacts, "Published release")

  const consolidatedPostcommit = new URL("pack.postcommit.json", publishedReleaseRoot)
  if (await Bun.file(consolidatedPostcommit).exists()) {
    throw new Error("Consolidated postcommit pack is web-accessible")
  }
  for (const artifact of deliveryManifest.artifacts) {
    await assertFileRecord(
      artifact,
      new URL(artifact.path, publishedReleaseRoot),
      "Published artifact"
    )
  }

  const expectedAssets = new Set(deliveryManifest.assets.map((asset) => asset.path))
  const deliveryAssetByPath = new Map(
    deliveryManifest.assets.map((asset) => [asset.path, asset] as const)
  )
  const publishedAssetRoot = new URL("content/assets/", distRoot)
  const actualAssets = new Set(
    (await collectFiles(publishedAssetRoot.pathname)).map((path) =>
      relative(distRoot.pathname, path).replaceAll("\\", "/")
    )
  )
  assertEqualSets(actualAssets, expectedAssets, "Published delivery assets")
  for (const asset of deliveryManifest.assets) {
    await assertFileRecord(asset, new URL(asset.path, distRoot), "Published delivery asset")
  }

  const catalog = Schema.decodeUnknownSync(CatalogArtifact)(
    JSON.parse(await text(new URL("catalog.json", publishedReleaseRoot)))
  )
  const pack = Schema.decodeUnknownSync(PrecommitPackArtifact)(
    JSON.parse(await text(new URL("pack.precommit.json", publishedReleaseRoot)))
  )
  if (
    catalog.packId !== manifest.releaseId ||
    pack.packId !== manifest.releaseId ||
    catalog.version !== manifest.packVersion ||
    pack.version !== manifest.packVersion ||
    catalog.tools.length !== manifest.toolCount ||
    pack.questions.length !== manifest.questionCount ||
    pack.scenes.length !== manifest.hazardSceneCount
  ) {
    throw new Error("Published catalog/precommit pack does not close over the release manifest")
  }

  const questionRecords = manifest.artifacts.filter(
    (artifact) => artifact.kind === "question-precommit"
  )
  const sceneRecords = manifest.artifacts.filter((artifact) => artifact.kind === "scene-precommit")
  const questionPostcommitById = new Map(
    deliveryManifest.artifacts
      .filter((artifact) => artifact.kind === "question-postcommit" && artifact.itemId !== undefined)
      .map((artifact) => [artifact.itemId as string, artifact])
  )
  const scenePostcommitById = new Map(
    deliveryManifest.artifacts
      .filter((artifact) => artifact.kind === "scene-postcommit" && artifact.itemId !== undefined)
      .map((artifact) => [artifact.itemId as string, artifact])
  )
  const questions = await Promise.all(
    questionRecords.map(async (record) => {
      const raw = JSON.parse(await text(new URL(record.path, publishedReleaseRoot))) as unknown
      assertNoAnswerBearingStructuredFields(raw, `Question precommit ${record.path}`)
      return {
        record,
        value: Schema.decodeUnknownSync(PrecommitQuestion)(raw)
      }
    })
  )
  const scenes = await Promise.all(
    sceneRecords.map(async (record) => {
      const raw = JSON.parse(await text(new URL(record.path, publishedReleaseRoot))) as unknown
      assertNoAnswerBearingStructuredFields(raw, `Scene precommit ${record.path}`)
      return {
        record,
        value: Schema.decodeUnknownSync(PrecommitScene)(raw)
      }
    })
  )

  const firstQuestionRecord = questionRecords[0]
  const firstQuestion = questions[0]
  if (firstQuestionRecord === undefined || firstQuestion === undefined) {
    throw new Error("Release has no question records")
  }
  const legacyPrecommit = await bytes(new URL("question.precommit.json", publishedReleaseRoot))
  const firstPrecommit = await bytes(new URL(firstQuestionRecord.path, publishedReleaseRoot))
  if (digest(legacyPrecommit) !== digest(firstPrecommit)) {
    throw new Error("Legacy precommit alias is not byte-identical to the first question")
  }
  const firstPostcommitRecord = questionPostcommitById.get(firstQuestionRecord.itemId ?? "")
  if (firstPostcommitRecord === undefined) throw new Error("First question has no postcommit record")
  const legacyPostcommit = await bytes(new URL("question.postcommit.json", publishedReleaseRoot))
  const firstPostcommit = await bytes(new URL(firstPostcommitRecord.path, publishedReleaseRoot))
  if (digest(legacyPostcommit) !== digest(firstPostcommit)) {
    throw new Error("Legacy postcommit alias is not byte-identical to the first question")
  }

  const toolsByFamily = new Map<string, Array<(typeof catalog.tools)[number]>>()
  for (const tool of catalog.tools.filter((candidate) => candidate.publicationGate === null)) {
    const family = toolsByFamily.get(tool.family) ?? []
    family.push(tool)
    toolsByFamily.set(tool.family, family)
  }

  const expectedRoutes: ExpectedRoute[] = [
    { canonicalPath: "/", robots: "index,follow", routeId: "home" },
    { canonicalPath: "/exams/", robots: "index,follow", routeId: "exam-selector" },
    { canonicalPath: "/ny/", robots: "index,follow", routeId: "profile" },
    { canonicalPath: "/practice/", robots: "index,follow", routeId: "study-hub" },
    { canonicalPath: "/review/", robots: "noindex,follow", routeId: "review-queue" },
    { canonicalPath: "/simulations/", robots: "index,follow", routeId: "simulation-setup" },
    {
      canonicalPath: "/simulations/session/sim-shell0000/question/1/",
      robots: "noindex,follow",
      routeId: "simulation-player"
    },
    {
      canonicalPath: "/simulations/session/sim-shell0000/results/",
      robots: "noindex,follow",
      routeId: "simulation-results"
    },
    { canonicalPath: "/print/", robots: "index,follow", routeId: "print-center" },
    {
      canonicalPath: "/print/preview/print-shell0000/",
      robots: "noindex,follow",
      routeId: "print-preview"
    },
    { canonicalPath: "/atlas/", robots: "index,follow", routeId: "atlas-index" },
    { canonicalPath: "/hazards/", robots: "index,follow", routeId: "hazards-index" },
    { canonicalPath: "/status/", robots: "noindex,follow", routeId: "status" },
    {
      canonicalPath: "/transparency/",
      robots: "index,follow",
      routeId: "transparency-index"
    },
    {
      canonicalPath: "/transparency/sources/",
      robots: "index,follow",
      routeId: "source"
    },
    ...catalog.tools
      .filter((tool) => tool.publicationGate === null)
      .map((tool) => ({
        canonicalPath: `/atlas/tool/${slugify(tool.canonicalTerm)}/`,
        robots: "index,follow" as const,
        routeId: "atlas-tool"
      })),
    ...[...toolsByFamily]
      .filter(([, tools]) => tools.length >= 2)
      .map(([family]) => ({
        canonicalPath: `/atlas/family/${slugify(family)}/`,
        robots: "index,follow" as const,
        routeId: "atlas-family"
      })),
    ...catalog.sources.map((source) => ({
      canonicalPath: `/transparency/sources/${slugify(source.id)}/`,
      robots: "index,follow" as const,
      routeId: "source"
    }))
  ]

  questions.forEach(({ value }, index) => {
    const postcommit = questionPostcommitById.get(value.id)
    if (postcommit === undefined) throw new Error(`Question ${value.id} has no postcommit artifact`)
    expectedRoutes.push({
      canonicalPath: `/practice/session/${manifest.releaseId}/question/${index + 1}/`,
      position: index + 1,
      postcommitArtifact: postcommit,
      postcommitPath: `/content/vertical-slice/${postcommit.path}`,
      precommit: value,
      robots: "noindex,follow",
      routeId: "question-player"
    })
    expectedRoutes.push({
      canonicalPath: `/review/session/${manifest.releaseId}/item/${index + 1}/`,
      position: index + 1,
      postcommitArtifact: postcommit,
      postcommitPath: `/content/vertical-slice/${postcommit.path}`,
      precommit: value,
      robots: "noindex,follow",
      routeId: "review-player"
    })
  })
  expectedRoutes.push({
    canonicalPath: "/practice/session/vertical-slice/question/1/",
    position: 1,
    postcommitArtifact: firstPostcommitRecord,
    postcommitPath: `/content/vertical-slice/${firstPostcommitRecord.path}`,
    precommit: firstQuestion.value,
    robots: "noindex,follow",
    routeId: "question-player"
  })
  scenes.forEach(({ value }, index) => {
    const postcommit = scenePostcommitById.get(value.id)
    if (postcommit === undefined) throw new Error(`Scene ${value.id} has no postcommit artifact`)
    expectedRoutes.push({
      canonicalPath: `/hazards/session/${manifest.releaseId}/scene/${index + 1}/`,
      hazardMode: "visual",
      position: index + 1,
      postcommitArtifact: postcommit,
      postcommitPath: `/content/vertical-slice/${postcommit.path}`,
      precommit: value,
      robots: "noindex,follow",
      routeId: "hazard-player"
    })
    expectedRoutes.push({
      canonicalPath: `/hazards/session/${manifest.releaseId}-nonvisual/scene/${index + 1}/`,
      hazardMode: "nonvisual",
      position: index + 1,
      postcommitArtifact: postcommit,
      postcommitPath: `/content/vertical-slice/${postcommit.path}`,
      precommit: value,
      robots: "noindex,follow",
      routeId: "hazard-player"
    })
  })

  const htmlFiles = buildFiles.filter((path) => path.endsWith(".html"))
  const offlineDocumentPath = new URL("offline.html", distRoot).pathname
  const statusDocumentPath = new URL("404.html", distRoot).pathname
  const routeFiles = htmlFiles.filter(
    (path) => path !== offlineDocumentPath && path !== statusDocumentPath
  )
  const actualRoutePaths = new Set(
    await Promise.all(
      routeFiles.map(async (path) =>
        extractAttribute(
          await Bun.file(path).text(),
          /<link rel="canonical" href="([^"]+)">/g,
          `canonical link in ${path}`
        )
      )
    )
  )
  assertEqualSets(
    actualRoutePaths,
    new Set(
      expectedRoutes.map((route) =>
        canonicalOrigin === undefined
          ? route.canonicalPath
          : new URL(route.canonicalPath, `${canonicalOrigin}/`).href
      )
    ),
    "Generated HTML routes"
  )
  const sitemapUrl = new URL("sitemap.xml", distRoot)
  if (canonicalOrigin === undefined) {
    if (await Bun.file(sitemapUrl).exists()) {
      throw new Error("A host-specific sitemap was generated without an approved canonical origin")
    }
  } else {
    const expectedSitemap = renderSitemap(
      expectedRoutes
        .filter((route) => route.robots === "index,follow")
        .map((route) => route.canonicalPath)
        .sort(),
      canonicalOrigin
    )
    if (!(await Bun.file(sitemapUrl).exists()) || await text(sitemapUrl) !== expectedSitemap) {
      throw new Error("The production sitemap does not match the closed indexable route set")
    }
  }
  const statusHtml = await text(new URL("404.html", distRoot))
  if (
    extractAttribute(statusHtml, /<body data-route-id="([^"]+)">/g, "status route identity") !==
      "status" ||
    extractAttribute(
      statusHtml,
      /<meta name="robots" content="([^"]+)">/g,
      "status robots directive"
    ) !== "noindex,follow" ||
    /<link rel="canonical"/i.test(statusHtml) ||
    /<!--__CANONICAL__/i.test(statusHtml) ||
    /<script\b/i.test(statusHtml) ||
    !/<main\b[\s\S]*<h1\b/i.test(statusHtml)
  ) {
    throw new Error("The root 404 document is not a static non-canonical status route")
  }

  const referencedBuildAssets = await collectReferencedBuildAssets(distRoot.pathname, htmlFiles)
  const allJavaScriptPaths = new Set(
    referencedBuildAssets
      .filter((path) => path.endsWith(".js"))
      .map((path) => resolve(distRoot.pathname, path.slice(1)))
  )
  const allJavaScript = (
    await Promise.all([...allJavaScriptPaths].map((path) => Bun.file(path).text()))
  ).join("\n")
  const bundleReports = new Map<string, Awaited<ReturnType<typeof bundleMeasurement>>>()
  const referencedAssets = new Set<string>()
  const interactiveRouteIds = new Set([
    "question-player",
    "review-player",
    "review-queue",
    "hazard-player",
    "simulation-setup",
    "simulation-player",
    "simulation-results",
    "print-center",
    "print-preview"
  ])

  for (const route of expectedRoutes) {
    const html = await text(routeDocument(route.canonicalPath))
    const routeId = extractAttribute(html, /<body data-route-id="([^"]+)">/g, "route identity")
    const robots = extractAttribute(
      html,
      /<meta name="robots" content="([^"]+)">/g,
      "robots directive"
    )
    if (routeId !== route.routeId || robots !== route.robots) {
      throw new Error(`Route metadata mismatch at ${route.canonicalPath}`)
    }
    if (html.includes("<!--__CANONICAL__")) {
      throw new Error(`Canonical finalization marker remains at ${route.canonicalPath}`)
    }
    for (const match of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
      for (const token of (match[1] ?? "").split(/[ ,]+/)) {
        if (token.startsWith("/content/assets/")) referencedAssets.add(token.slice(1))
      }
    }

    const interactive = interactiveRouteIds.has(route.routeId)
    if (!interactive && (/<script\b/i.test(html) || /react|effect/i.test(html))) {
      throw new Error(`Runtime-free static route includes an interactive runtime: ${route.canonicalPath}`)
    }
    if (!interactive && !/<main\b[\s\S]*<h1\b/i.test(html)) {
      throw new Error(`Static route is not a substantive document: ${route.canonicalPath}`)
    }
    if (!interactive) continue

    const closure = await collectJavaScriptClosure(html, allJavaScriptPaths)
    const family = route.routeId
    if (!bundleReports.has(family)) bundleReports.set(family, await bundleMeasurement(closure))

    if (route.routeId === "simulation-setup") {
      const rawBootstrap = extractEmbeddedJson(html, "simulation-bootstrap-data")
      assertNoAnswerBearingStructuredFields(rawBootstrap, "Simulation setup bootstrap")
      const bootstrap = Schema.decodeUnknownSync(SimulationBootstrap)(rawBootstrap)
      if (
        !html.includes("data-simulation-setup") ||
        bootstrap.releaseId !== manifest.releaseId ||
        bootstrap.packVersion !== manifest.packVersion ||
        bootstrap.profiles.length !== catalog.profiles.length ||
        bootstrap.profiles.some((profile, index) => {
          const expected = catalog.profiles[index]
          return expected === undefined ||
            profile.id !== expected.id ||
            profile.label !== expected.label ||
            profile.version !== manifest.packVersion ||
            profile.jurisdiction !== expected.jurisdiction ||
            profile.compatibilityKey !== expected.compatibilityKey ||
            profile.disclaimer !== expected.disclaimer
        }) ||
        bootstrap.inventory.length !== questions.length ||
        bootstrap.inventory.some((item, index) => {
          const expected = questions[index]?.value
          const artifact = expected === undefined
            ? undefined
            : questionPostcommitById.get(expected.id)
          return expected === undefined || artifact === undefined ||
            item.question.id !== expected.id ||
            item.profileIds.length === 0 ||
            item.profileIds.some((profileId) =>
              !bootstrap.profiles.some((profile) => profile.id === profileId)
            ) ||
            item.receipt.questionId !== expected.id ||
            item.receipt.postcommitPath !== `/content/vertical-slice/${artifact.path}` ||
            item.receipt.postcommitBytes !== artifact.bytes ||
            item.receipt.postcommitSha256 !== artifact.sha256
        })
      ) {
        throw new Error("Simulation setup bootstrap or capacity closure is incomplete")
      }
      continue
    }

    if (route.routeId === "simulation-player" || route.routeId === "simulation-results") {
      const requiredMount = route.routeId === "simulation-player"
        ? "data-simulation-player"
        : "data-simulation-results"
      if (!html.includes(requiredMount)) {
        throw new Error(`Simulation route shell is incomplete: ${route.canonicalPath}`)
      }
      for (const field of ["correctOptionId", "rationales", "sources"]) {
        if (html.includes(`\"${field}\"`)) {
          throw new Error(`Simulation route shell exposes ${field}: ${route.canonicalPath}`)
        }
      }
      continue
    }

    if (route.routeId === "print-center") {
      const rawBootstrap = extractEmbeddedJson(html, "print-builder-data")
      assertNoAnswerBearingStructuredFields(rawBootstrap, "Print builder bootstrap")
      const bootstrap = Schema.decodeUnknownSync(PrintBuilderBootstrap)(rawBootstrap)
      const releasedTools = catalog.tools.filter((tool) => tool.publicationGate === null)
      if (
        !html.includes("data-print-builder") ||
        bootstrap.releaseId !== manifest.releaseId ||
        bootstrap.contentVersion !== manifest.packVersion ||
        bootstrap.profiles.length !== catalog.profiles.length ||
        bootstrap.profiles.some((profile, index) => {
          const expected = catalog.profiles[index]
          return expected === undefined ||
            profile.id !== expected.id ||
            profile.label !== expected.label ||
            profile.jurisdiction !== expected.jurisdiction ||
            profile.compatibilityKey !== expected.compatibilityKey ||
            profile.disclaimer !== expected.disclaimer
        }) ||
        bootstrap.questions.length !== questions.length ||
        bootstrap.questions.some((item, index) => {
          const expected = questions[index]?.value
          const artifact = expected === undefined
            ? undefined
            : questionPostcommitById.get(expected.id)
          return expected === undefined || artifact === undefined ||
            item.id !== expected.id ||
            item.answerReceipt?.postcommitPath !== `/content/vertical-slice/${artifact.path}` ||
            item.answerReceipt.postcommitBytes !== artifact.bytes ||
            item.answerReceipt.postcommitSha256 !== artifact.sha256
        }) ||
        bootstrap.tools.length !== releasedTools.length ||
        bootstrap.tools.some((item, index) => {
          const expected = releasedTools[index]
          const print = expected?.asset.derivatives.find((asset) => asset.kind === "print")
          return expected === undefined || print === undefined ||
            item.id !== expected.conceptId ||
            item.family !== expected.family ||
            item.asset.path !== `/${print.path}` ||
            item.asset.bytes !== print.bytes ||
            item.asset.sha256 !== print.sha256
        }) ||
        bootstrap.scenes.length !== scenes.length ||
        bootstrap.scenes.some((item, index) => {
          const expected = scenes[index]?.value
          const print = expected?.asset.derivatives.find((asset) => asset.kind === "print")
          const answer = expected === undefined ? undefined : scenePostcommitById.get(expected.id)
          return expected === undefined || print === undefined || answer === undefined ||
            item.id !== expected.id ||
            item.neutralOverview !== expected.neutralPreAnswer.overview ||
            item.asset.path !== `/${print.path}` ||
            item.asset.bytes !== print.bytes ||
            item.asset.sha256 !== print.sha256 ||
            item.answerReceipt.postcommitPath !== `/content/vertical-slice/${answer.path}` ||
            item.answerReceipt.postcommitBytes !== answer.bytes ||
            item.answerReceipt.postcommitSha256 !== answer.sha256
        })
      ) {
        throw new Error("Print builder bootstrap or receipt closure is incomplete")
      }
      continue
    }

    if (route.routeId === "print-preview") {
      if (!html.includes("data-print-preview") || html.includes('type="application/json"')) {
        throw new Error("Print preview shell must load only its opaque local job")
      }
      continue
    }

    if (route.routeId === "review-queue") {
      const rawBootstrap = extractEmbeddedJson(html, "review-bootstrap-data")
      assertNoAnswerBearingStructuredFields(rawBootstrap, "Review queue bootstrap")
      const bootstrap = Schema.decodeUnknownSync(ReviewQueueBootstrap)(
        rawBootstrap
      )
      if (
        !html.includes("data-review-queue") ||
        !/<script type="module"[^>]+src="\/assets\/[^"]+\.js"/.test(html) ||
        html.toLowerCase().includes("starter queue") ||
        bootstrap.questions.length !== questions.length ||
        bootstrap.scenes.length !== scenes.length
      ) {
        throw new Error("Review queue bootstrap or static fallback is incomplete")
      }
      bootstrap.questions.forEach((source, index) => {
        const expected = questions[index]?.value
        const postcommit = expected === undefined
          ? undefined
          : questionPostcommitById.get(expected.id)
        const expectedPostcommitPath = postcommit === undefined
          ? undefined
          : `/content/vertical-slice/${postcommit.path}`
        if (
          expected === undefined ||
          postcommit === undefined ||
          source.id !== expected.id ||
          JSON.stringify(source.optionIds) !==
            JSON.stringify(expected.options.map((option) => option.id)) ||
          source.receipt.releaseId !== manifest.releaseId ||
          source.receipt.packVersion !== manifest.packVersion ||
          source.receipt.sessionId !== manifest.releaseId ||
          source.receipt.position !== index + 1 ||
          source.receipt.questionId !== expected.id ||
          source.receipt.postcommitPath !== expectedPostcommitPath ||
          source.receipt.postcommitBytes !== postcommit.bytes ||
          source.receipt.postcommitSha256 !== postcommit.sha256 ||
          source.itemUrl !== `/review/session/${manifest.releaseId}/item/${index + 1}/`
        ) {
          throw new Error(`Review question bootstrap mismatch at position ${index + 1}`)
        }
      })
      bootstrap.scenes.forEach((source, index) => {
        const expected = scenes[index]?.value
        const postcommit = expected === undefined
          ? undefined
          : scenePostcommitById.get(expected.id)
        const expectedPostcommitPath = postcommit === undefined
          ? undefined
          : `/content/vertical-slice/${postcommit.path}`
        if (
          expected === undefined ||
          postcommit === undefined ||
          JSON.stringify(source.scene) !== JSON.stringify(expected) ||
          source.visualReceipt.releaseId !== manifest.releaseId ||
          source.visualReceipt.packVersion !== manifest.packVersion ||
          source.visualReceipt.sessionId !== manifest.releaseId ||
          source.visualReceipt.position !== index + 1 ||
          source.visualReceipt.sceneId !== expected.id ||
          source.visualReceipt.mode !== "visual" ||
          source.visualReceipt.postcommitPath !== expectedPostcommitPath ||
          source.visualReceipt.postcommitBytes !== postcommit.bytes ||
          source.visualReceipt.postcommitSha256 !== postcommit.sha256 ||
          source.visualReceipt.assetRevision !== expected.asset.revision ||
          source.visualReceipt.assetMasterSha256 !== expected.asset.masterSha256 ||
          source.nonvisualReceipt.releaseId !== manifest.releaseId ||
          source.nonvisualReceipt.packVersion !== manifest.packVersion ||
          source.nonvisualReceipt.sessionId !== `${manifest.releaseId}-nonvisual` ||
          source.nonvisualReceipt.position !== index + 1 ||
          source.nonvisualReceipt.sceneId !== expected.id ||
          source.nonvisualReceipt.mode !== "nonvisual" ||
          source.nonvisualReceipt.postcommitPath !== expectedPostcommitPath ||
          source.nonvisualReceipt.postcommitBytes !== postcommit.bytes ||
          source.nonvisualReceipt.postcommitSha256 !== postcommit.sha256 ||
          source.nonvisualReceipt.assetRevision !== expected.asset.revision ||
          source.nonvisualReceipt.assetMasterSha256 !== expected.asset.masterSha256 ||
          source.visualItemUrl !==
            `/hazards/session/${manifest.releaseId}/scene/${index + 1}/` ||
          source.nonvisualItemUrl !==
            `/hazards/session/${manifest.releaseId}-nonvisual/scene/${index + 1}/`
        ) {
          throw new Error(`Review scene bootstrap mismatch at position ${index + 1}`)
        }
      })
      for (const field of [
        "correctOptionId",
        "optionConceptIds",
        "rationales",
        "sources",
        "claim",
        "decoys",
        "fullPostAnswer",
        "hazardFamily",
        "nonvisualZonedEquivalent",
        "targetRegions",
        "targets"
      ]) {
        if (html.includes(`"${field}"`)) {
          throw new Error(`Review queue exposes ${field} before reading durable attempts`)
        }
      }
      continue
    }

    if (
      route.position === undefined ||
      route.postcommitArtifact === undefined ||
      route.postcommitPath === undefined ||
      route.precommit === undefined
    ) {
      throw new Error(`Interactive route has no item-scoped artifact binding: ${route.canonicalPath}`)
    }
    if (
      route.postcommitPath !== postcommitPath(route.postcommitArtifact) ||
      !html.includes(`data-postcommit-url="${route.postcommitPath}"`)
    ) {
      throw new Error(`Interactive route has the wrong postcommit URL: ${route.canonicalPath}`)
    }
    if (route.routeId === "question-player" || route.routeId === "review-player") {
      const rawQuestion = extractEmbeddedJson(html, "question-data")
      assertNoAnswerBearingStructuredFields(rawQuestion, `Question bootstrap ${route.canonicalPath}`)
      const decoded = Schema.decodeUnknownSync(PrecommitQuestion)(
        rawQuestion
      )
      if (
        decoded.id !== route.precommit.id ||
        !html.includes("data-question-player") ||
        !/<script type="module"[^>]+src="\/assets\/[^\"]+\.js"/.test(html)
      ) {
        throw new Error(`Question bootstrap contract mismatch: ${route.canonicalPath}`)
      }
      decodeAndAssertQuestionReceipt(
        extractEmbeddedJson(html, "question-receipt-data"),
        {
          artifact: route.postcommitArtifact,
          packVersion: deliveryManifest.packVersion,
          position: route.position,
          questionId: decoded.id,
          releaseId: deliveryManifest.releaseId,
          sessionId: deliveryManifest.releaseId
        },
        `Question receipt ${route.canonicalPath}`
      )
      for (const field of ["correctOptionId", "rationales", "sources"]) {
        if (html.includes(`"${field}"`)) {
          throw new Error(`Question page exposes ${field} before commitment: ${route.canonicalPath}`)
        }
      }
    } else {
      const rawScene = extractEmbeddedJson(html, "hazard-scene-data")
      assertNoAnswerBearingStructuredFields(rawScene, `Hazard bootstrap ${route.canonicalPath}`)
      const decoded = Schema.decodeUnknownSync(PrecommitScene)(
        rawScene
      )
      for (const derivative of decoded.asset.derivatives) {
        referencedAssets.add(derivative.path)
      }
      if (
        decoded.id !== route.precommit.id ||
        !html.includes("data-hazard-player") ||
        route.hazardMode === undefined ||
        !html.includes(`data-hazard-mode="${route.hazardMode}"`) ||
        !/<script type="module"[^>]+src="\/assets\/[^\"]+\.js"/.test(html)
      ) {
        throw new Error(`Hazard bootstrap contract mismatch: ${route.canonicalPath}`)
      }
      decodeAndAssertHazardReceipt(
        extractEmbeddedJson(html, "hazard-receipt-data"),
        {
          artifact: route.postcommitArtifact,
          assetMasterSha256: decoded.asset.masterSha256,
          assetRevision: decoded.asset.revision,
          mode: route.hazardMode,
          packVersion: deliveryManifest.packVersion,
          position: route.position,
          releaseId: deliveryManifest.releaseId,
          sceneId: decoded.id,
          sessionId: route.hazardMode === "visual"
            ? deliveryManifest.releaseId
            : `${deliveryManifest.releaseId}-nonvisual`
        },
        `Hazard receipt ${route.canonicalPath}`
      )
      if (route.hazardMode === "visual") {
        const webDerivative = decoded.asset.derivatives.find(
          (derivative) => derivative.kind === "web"
        )
        const deliveryAsset = webDerivative === undefined
          ? undefined
          : deliveryAssetByPath.get(webDerivative.path)
        if (webDerivative === undefined || deliveryAsset === undefined) {
          throw new Error(`Hazard asset receipt mismatch: ${route.canonicalPath}`)
        }
        decodeAndAssertHazardAssetReceipt(
          extractEmbeddedJson(html, "hazard-asset-receipt-data"),
          { deliveryAsset, webDerivative },
          `Hazard asset receipt ${route.canonicalPath}`
        )
      } else if (html.includes('id="hazard-asset-receipt-data"')) {
        throw new Error(`Nonvisual hazard embeds a visual asset receipt: ${route.canonicalPath}`)
      }
      for (const field of [
        "claim",
        "decoys",
        "fullPostAnswer",
        "hazardFamily",
        "nonvisualZonedEquivalent",
        "targetRegions",
        "targets"
      ]) {
        if (html.includes(`"${field}"`)) {
          throw new Error(`Hazard page exposes ${field} before commitment: ${route.canonicalPath}`)
        }
      }
    }
  }

  assertEqualSets(referencedAssets, expectedAssets, "HTML delivery-asset references")
  const expectedBuildFiles = new Set([
    ...expectedRoutes.map((route) =>
      relative(distRoot.pathname, routeDocument(route.canonicalPath).pathname).replaceAll("\\", "/")
    ),
    "404.html",
    "offline.html",
    "manifest.webmanifest",
    "print-bootstrap.json",
    ...(canonicalOrigin === undefined ? [] : ["sitemap.xml"]),
    "styles.css",
    "sw.js",
    "content/vertical-slice/manifest.json",
    ...deliveryManifest.artifacts.map((artifact) =>
      `content/vertical-slice/${artifact.path}`
    ),
    ...deliveryManifest.assets.map((asset) => asset.path),
    ...referencedBuildAssets.map((path) => path.slice(1))
  ])
  assertEqualSets(new Set(relativeBuildFiles), expectedBuildFiles, "Public build tree")

  const packPrecommitText = await text(new URL("pack.precommit.json", publishedReleaseRoot))
  assertNoAnswerBearingStructuredFields(
    JSON.parse(packPrecommitText) as unknown,
    "Consolidated precommit pack"
  )
  const printBootstrap = Schema.decodeUnknownSync(PrintBuilderBootstrap)(
    JSON.parse(await text(new URL("print-bootstrap.json", distRoot)))
  )
  assertNoAnswerBearingStructuredFields(printBootstrap, "Standalone print bootstrap")

  const secretMaterial: string[] = []
  for (const record of manifest.artifacts) {
    if (record.kind === "question-postcommit") {
      const payload = Schema.decodeUnknownSync(PostcommitQuestion)(
        JSON.parse(await text(new URL(record.path, releaseRoot)))
      )
      secretMaterial.push(
        ...payload.rationales.map((rationale) => rationale.message),
        ...payload.sources.map((source) => source.locator)
      )
    }
    if (record.kind === "scene-postcommit") {
      const payload = Schema.decodeUnknownSync(PostcommitScene)(
        JSON.parse(await text(new URL(record.path, releaseRoot)))
      )
      secretMaterial.push(
        payload.claim,
        ...payload.targets.flatMap((target) => [target.condition, target.correction]),
        ...payload.decoys.flatMap((decoy) => [decoy.condition, decoy.safeBecause]),
        ...payload.nonvisualZonedEquivalent.map((statement) => statement.statement),
        payload.fullPostAnswer.claim,
        ...payload.fullPostAnswer.targets.flatMap((target) => [target.condition, target.correction]),
        ...payload.fullPostAnswer.decoys.flatMap((decoy) => [decoy.condition, decoy.safeBecause]),
        ...payload.fullPostAnswer.safeBackground,
        JSON.stringify(payload.targetRegions),
        JSON.stringify(payload.decoyRegions),
        JSON.stringify(payload.nonvisualZonedEquivalent)
      )
    }
  }
  const playerHtml = (
    await Promise.all(
      expectedRoutes
        .filter((route) => interactiveRouteIds.has(route.routeId))
        .map((route) => text(routeDocument(route.canonicalPath)))
      )
  ).join("\n")
  const allCss = (
    await Promise.all([
      text(new URL("styles.css", distRoot)),
      ...referencedBuildAssets
        .filter((path) => path.endsWith(".css"))
        .map((path) => text(new URL(path.slice(1), distRoot)))
    ])
  ).join("\n")
  const serviceWorker = await text(new URL("sw.js", distRoot))
  const initialInteractiveClosure = `${playerHtml}\n${allJavaScript}\n${allCss}\n${serviceWorker}`
  assertNoAnswerBearingText(initialInteractiveClosure, secretMaterial, "Initial interactive closure")
  assertNoAnswerBearingFileNames(relativeBuildFiles, secretMaterial)

  const shellVersion = serviceWorker.match(/nycustodian-shell-([a-f0-9]{16})/)?.[1]
  const runtimeVersion = serviceWorker.match(/nycustodian-runtime-([a-f0-9]{16})/)?.[1]
  if (shellVersion === undefined || shellVersion !== runtimeVersion) {
    throw new Error("Service-worker cache namespaces are missing or disagree")
  }
  if (
    serviceWorker.includes("__NYCUSTODIAN_CACHE_VERSION__") ||
    serviceWorker.includes("/*__PRECACHE_ASSETS__*/")
  ) {
    throw new Error("Service-worker finalization markers remain")
  }
  assertProtectedServiceWorkerPolicy(
    serviceWorker,
    new Set([
      ...expectedRoutes.map((route) => route.canonicalPath),
      "/404.html",
      "/offline.html",
      "/manifest.webmanifest",
      "/print-bootstrap.json",
      "/styles.css",
      "/content/vertical-slice/manifest.json",
      ...deliveryManifest.artifacts
        .filter((artifact) => safePrecacheArtifactKinds.has(artifact.kind))
        .map((artifact) => `/content/vertical-slice/${artifact.path}`),
      ...referencedBuildAssets
    ])
  )

  // The interactive entries share the framework/runtime and verified-content chunks. These
  // M4 adds shared durable-session and print services to the single application runtime.
  // These ceilings retain a deterministic margin above the measured multi-product closure.
  const bundleBudgets = { raw: 420_000, gzip: 130_000, brotli: 115_000 } as const
  for (const [family, measurement] of bundleReports) {
    for (const format of ["raw", "gzip", "brotli"] as const) {
      if (measurement[format] > bundleBudgets[format]) {
        throw new Error(
          `${family} ${format} closure ${measurement[format]} exceeds ${bundleBudgets[format]} bytes`
        )
      }
    }
  }

  const measurements = [...bundleReports]
    .map(
      ([family, size]) =>
        `${family} ${formatBytes(size.raw)} raw / ${formatBytes(size.gzip)} gzip / ` +
        `${formatBytes(size.brotli)} brotli`
    )
    .join("; ")
  console.log(
    `artifact invariants ok: ${expectedRoutes.length} route documents, ${deliveryManifest.artifacts.length} ` +
      `published item-scoped artifacts, ${deliveryManifest.assets.length} byte-identical delivery assets; ` +
      `consolidated postcommit absent and shell answer-free; ${measurements}`
  )
}

if (import.meta.main) await verify()
