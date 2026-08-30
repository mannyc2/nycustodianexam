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
  decodeOfflinePackDescriptor,
  decodeOfflineShellManifest
} from "../apps/site/src/offline-packs/model.ts"
import {
  assertSafeBuildPaths,
  collectReferencedBuildAssets,
  normalizeCanonicalOrigin,
  renderSitemap
} from "../apps/site/scripts/finalize-service-worker.ts"
import { trustedCurrentShellNavigation } from "../apps/site/src/shell-route-policy.ts"
import { assertGeneratedPublicCopyBoundary } from "../apps/site/src/public-copy-boundary.ts"
import { derivePracticeSessions } from "../apps/site/scripts/practice-sessions.ts"
import {
  assertCanonicalRouteId,
  type RouteId
} from "../apps/site/src/route-registry.ts"
import { Schema } from "effect"

const repositoryRoot = new URL("../", import.meta.url)
const distRoot = new URL("apps/site/dist/", repositoryRoot)
const releaseRoot = new URL("content/releases/vertical-slice/", repositoryRoot)

type Manifest = typeof ReleaseManifest.Type
type ManifestArtifact = Manifest["artifacts"][number]

const safePrecacheArtifactKinds = new Set<ManifestArtifact["kind"]>([
  "catalog"
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

const publicPathDocument = (path: string): URL => {
  if (path === "/") return new URL("index.html", distRoot)
  if (path.endsWith("/")) return new URL(`${path.slice(1)}index.html`, distRoot)
  return new URL(path.slice(1), distRoot)
}

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
  readonly routeId: RouteId
  readonly sessionId?: string
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
  "claimIds",
  "claims",
  "conceptId",
  "correctOptionId",
  "decoys",
  "equivalenceGroupId",
  "factKind",
  "fullPostAnswer",
  "hazardFamily",
  "nonvisualZonedEquivalent",
  "objectiveId",
  "optionConceptIds",
  "rationales",
  "sources",
  "tags",
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

const normalizeSemanticCoordinate = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")

const semanticNeedlesForQuestion = (
  postcommit: typeof PostcommitQuestion.Type,
  catalog: typeof CatalogArtifact.Type
): ReadonlySet<string> => {
  const toolByConceptId = new Map(
    catalog.tools.map((tool) => [tool.conceptId, tool] as const)
  )
  const needles = new Set<string>()
  for (const mapping of postcommit.optionConceptIds ?? []) {
    const tool = toolByConceptId.get(mapping.conceptId)
    for (const value of [
      mapping.conceptId,
      mapping.conceptId.replace(/^[^.]+\./, ""),
      tool?.canonicalTerm
    ]) {
      if (value === undefined) continue
      const normalized = normalizeSemanticCoordinate(value)
      if (normalized.length >= 6) needles.add(normalized)
    }
  }
  return needles
}

/**
 * Verifies the standalone pre-answer question boundary. Public coordinates are
 * deliberately supplied by the caller because paths, receipt ids, and session
 * ids live outside the precommit document itself.
 */
export const assertNoQuestionSemanticLeak = (
  rawPrecommit: unknown,
  postcommit: typeof PostcommitQuestion.Type,
  catalog: typeof CatalogArtifact.Type,
  publicCoordinates: readonly string[] = []
): typeof PrecommitQuestion.Type => {
  assertNoAnswerBearingStructuredFields(rawPrecommit, `Question ${postcommit.id} precommit`)
  const precommit = Schema.decodeUnknownSync(PrecommitQuestion)(rawPrecommit)
  if (!/^q\d{3}$/.test(precommit.id) || precommit.id !== postcommit.id) {
    throw new Error(`Question ${postcommit.id} does not use its opaque public question id`)
  }
  const expectedOptionIds = precommit.options.map((_, index) =>
    String.fromCharCode("a".charCodeAt(0) + index)
  )
  const optionIds = precommit.options.map((option) => option.id)
  if (!isDeepStrictEqual(optionIds, expectedOptionIds)) {
    throw new Error(`Question ${precommit.id} does not use opaque ordinal option ids`)
  }
  const mappings = postcommit.optionConceptIds
  if (
    mappings === undefined ||
    !isDeepStrictEqual(mappings.map((mapping) => mapping.optionId), optionIds)
  ) {
    throw new Error(`Question ${precommit.id} has no exact postcommit option mapping`)
  }

  const normalizedCoordinates = [precommit.id, ...optionIds, ...publicCoordinates]
    .map(normalizeSemanticCoordinate)
  for (const needle of semanticNeedlesForQuestion(postcommit, catalog)) {
    if (normalizedCoordinates.some((coordinate) => coordinate.includes(needle))) {
      throw new Error(`Question ${precommit.id} exposes semantic concept ${needle} in a public coordinate`)
    }
  }

  const mappingConceptIds = mappings.map((mapping) => mapping.conceptId)
  const toolByConceptId = new Map(
    catalog.tools.map((tool) => [tool.conceptId, tool] as const)
  )
  const comparisonById = new Map(
    catalog.comparisons.map((comparison) => [comparison.id, comparison] as const)
  )
  const memberships = precommit.memberships ?? []
  if (
    new Set(memberships.map(({ filterKind, filterValue }) => `${filterKind}:${filterValue}`)).size !==
    memberships.length
  ) {
    throw new Error(`Question ${precommit.id} repeats a pre-answer filter membership`)
  }
  for (const membership of memberships) {
    const sharedByEveryOption = (() => {
      if (membership.filterKind === "domain") {
        return mappingConceptIds.every(
          (conceptId) => toolByConceptId.get(conceptId)?.domain === membership.filterValue
        )
      }
      if (membership.filterKind === "family") {
        return mappingConceptIds.every(
          (conceptId) => toolByConceptId.get(conceptId)?.family === membership.filterValue
        )
      }
      const comparison = comparisonById.get(membership.filterValue)
      return comparison !== undefined && mappingConceptIds.every(
        (conceptId) => comparison.memberIds.includes(conceptId)
      )
    })()
    if (!sharedByEveryOption) {
      throw new Error(
        `Question ${precommit.id} exposes ${membership.filterKind}:${membership.filterValue}, ` +
        "which is not shared by every displayed option"
      )
    }
  }
  return precommit
}

const assertNoAnswerPositionConvention = (
  questions: readonly (typeof PostcommitQuestion.Type)[]
): void => {
  const fourOptionQuestions = questions.filter(
    (question) => question.optionConceptIds?.length === 4
  )
  const correctPositionCounts = ["a", "b", "c", "d"].map(
    (optionId) => fourOptionQuestions.filter((question) => question.correctOptionId === optionId).length
  )
  if (
    fourOptionQuestions.length < 40 ||
    correctPositionCounts.some((count) => count < 10)
  ) {
    throw new Error("Four-option answer positions are not independently distributed")
  }
  const rotationMatches = [0, 1, 2, 3].map((offset) =>
    fourOptionQuestions.filter((question) => {
      const ordinal = Number.parseInt(question.id.slice(1), 10) - 1
      return question.correctOptionId === ["a", "b", "c", "d"][(ordinal + offset) % 4]
    }).length
  )
  if (Math.max(...rotationMatches) / fourOptionQuestions.length >= 0.7) {
    throw new Error("Correct-option placement follows a public question-id rotation")
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
  label: string,
  publicAnswerFreeStrings: ReadonlySet<string> = new Set()
): void => {
  for (const secret of new Set(
    secrets.filter(
      (candidate) => candidate.length >= 20 && !publicAnswerFreeStrings.has(candidate)
    )
  )) {
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

const collectStringLeaves = (value: unknown, output: Set<string> = new Set()): Set<string> => {
  if (typeof value === "string") {
    output.add(value)
    return output
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringLeaves(item, output)
    return output
  }
  if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value)) collectStringLeaves(nested, output)
  }
  return output
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
    /const isPackManagedContent = \(request\) => \{[\s\S]*?url\.pathname\.startsWith\("\/content\/vertical-slice\/"\)[\s\S]*?url\.pathname\.startsWith\("\/content\/assets\/"\)[\s\S]*?\n\}/
  const protectedMatches = [...source.matchAll(new RegExp(protectedMatcher.source, "g"))]
  if (
    protectedMatches.length !== 1 ||
    occurrenceCount(source, ".postcommit.json") !== 0 ||
    !/if \(isPackManagedContent\(event\.request\)\) \{\s*event\.respondWith\(matchActivePack\(event\.request\)\.then\(\s*\(cached\) => cached \?\? fetch\(event\.request\)\s*\)\)\s*return\s*\}/.test(source)
  ) {
    throw new Error(
      "Service worker must keep the entire verified release/content namespace out of generic caches"
    )
  }
}

export const assertProductionPackPublication = (
  descriptor: Readonly<{ readonly lifecycle: string; readonly publicationTime: string | null }>,
  required: boolean
): void => {
  if (!required) return
  if (descriptor.lifecycle !== "published" || descriptor.publicationTime === null) {
    throw new Error("Production deployment requires an explicitly published offline release")
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
    catalog.comparisons.length !== manifest.comparisonCount ||
    pack.questions.length !== manifest.questionCount ||
    pack.scenes.length !== manifest.hazardSceneCount
  ) {
    throw new Error("Published catalog/precommit pack does not close over the release manifest")
  }
  if (
    manifest.releaseId !== "launch-v1" ||
    manifest.packVersion !== 2 ||
    catalog.locale !== "en" ||
    catalog.tools.length !== 65 ||
    catalog.comparisons.length !== 14 ||
    pack.questions.length !== 90 ||
    pack.scenes.length !== 18
  ) {
    throw new Error("English launch-v1 minimum content contract is not satisfied")
  }
  const expectedProfilePaths = new Set(["/ny/", "/ny/nassau-county/custodian/"])
  assertEqualSets(
    new Set(catalog.profiles.map((profile) => profile.canonicalPath)),
    expectedProfilePaths,
    "English launch profile paths"
  )
  if (!isDeepStrictEqual(pack.profiles, catalog.profiles)) {
    throw new Error("Precommit pack and catalog profile versions disagree")
  }
  const expectedProfiles = new Map([
    ["nys-entry-level-custodians-janitors", {
      version: 2,
      compatibilityKey: "nys-entry-level-custodians-janitors-v2"
    }],
    ["nassau-county-custodian-entry-level", {
      version: 2,
      compatibilityKey: "nassau-county-custodian-entry-level-v2"
    }]
  ])
  for (const profile of catalog.profiles) {
    const expected = expectedProfiles.get(profile.id)
    if (
      expected === undefined ||
      profile.version !== expected.version ||
      profile.compatibilityKey !== expected.compatibilityKey
    ) {
      throw new Error(`Launch profile ${profile.id} has an unreviewed version boundary`)
    }
  }
  const nassauProfile = catalog.profiles.find(
    (profile) => profile.id === "nassau-county-custodian-entry-level"
  )
  if (
    nassauProfile?.layer !== "jurisdiction" ||
    nassauProfile.announcementFactSheet === null ||
    nassauProfile.examIdentityState !== "verified" ||
    nassauProfile.examIdentities.length !== 2 ||
    nassauProfile.competitionTypeState !== "verified" ||
    nassauProfile.testPlanCompatibility.status !== "compatible" ||
    nassauProfile.contentAvailability.status !== "available" ||
    !["verified", "not_published", "unverified", "superseded"].every(
      (state) => nassauProfile.announcementFactSheet!.facts.some((fact) => fact.state === state)
    ) ||
    nassauProfile.announcementFactSheet.changeHistory.at(-1)?.version !==
      nassauProfile.announcementFactSheet.version
  ) {
    throw new Error("Nassau launch profile is missing its versioned announcement fact sheet")
  }
  const catalogSourceIds = new Set(catalog.sources.map((source) => source.id))
  const catalogSourceById = new Map(catalog.sources.map((source) => [source.id, source] as const))
  for (const profile of catalog.profiles) {
    const missingSource = profile.sourceIds.find((sourceId) => !catalogSourceIds.has(sourceId))
    if (missingSource !== undefined) {
      throw new Error(`Profile ${profile.id} has missing source receipt ${missingSource}`)
    }
  }
  const nassauFactSheet = nassauProfile.announcementFactSheet
  assertEqualSets(
    new Set(nassauFactSheet.facts.map((fact) => fact.id)),
    new Set([
      "oc-filing-period",
      "oc-exam-date",
      "oc-fee",
      "oc-jurisdictions",
      "oc-qualifications",
      "promo-filing-period",
      "promo-exam-date",
      "promo-fee",
      "promo-jurisdictions-original",
      "promo-jurisdictions-lynbrook",
      "promo-jurisdictions-current",
      "promo-qualifications",
      "subject-plan",
      "written-medium",
      "official-item-count",
      "official-subject-weights",
      "official-score-conversion",
      "current-review-procedure",
      "current-form-identity",
      "promo-seniority-credit",
      "administration-status",
      "preparer-identity"
    ]),
    "Nassau announcement fact-state wrappers"
  )
  const factSheetLineIds = new Set(catalog.profiles.flatMap((profile) => {
    const factSheet = profile.announcementFactSheet
    return [
      ...profile.examIdentities.flatMap((identity) => identity.sourceLineIds),
      ...profile.testPlanCompatibility.sourceLineIds,
      ...(factSheet === null ? [] : [
        ...factSheet.facts.flatMap((fact) => [
          ...fact.sourceLineIds,
          ...fact.conflictingValues.flatMap((value) => value.sourceLineIds)
        ]),
        ...factSheet.changeHistory.flatMap((change) => change.sourceLineIds)
      ])
    ]
  }))
  const catalogSourceLineById = new Map(
    catalog.sourceLines.map((line) => [line.id, line] as const)
  )
  if (catalogSourceLineById.size !== catalog.sourceLines.length) {
    throw new Error("Catalog profile source-line ids are not unique")
  }
  assertEqualSets(
    new Set(catalog.sourceLines.map((line) => line.id)),
    factSheetLineIds,
    "Profile fact-state source lines"
  )
  for (const lineId of factSheetLineIds) {
    if (catalogSourceLineById.get(lineId) === undefined) {
      throw new Error(`Nassau fact sheet cites missing source line ${lineId}`)
    }
  }
  assertEqualSets(
    new Set(catalog.sourceLines.map((line) => line.sourceId)),
    new Set(catalog.profiles.flatMap((profile) => profile.sourceIds)),
    "Profile fact-state source receipts"
  )
  const atlasOnlyConceptIds = new Set(
    catalog.tools
      .filter((tool) => tool.practiceEligibility === "atlas-only")
      .map((tool) => tool.conceptId)
  )
  if (
    atlasOnlyConceptIds.size !== 12 ||
    catalog.tools.some(
      (tool) =>
        (tool.publicationGate !== null || tool.evidenceTier === "C") &&
        tool.practiceEligibility !== "atlas-only"
    )
  ) {
    throw new Error("Gated/watchlist tools are not closed to atlas-only use")
  }
  const comparisonsById = new Map(
    catalog.comparisons.map((comparison) => [comparison.id, comparison] as const)
  )

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
        raw,
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
  if (
    new Set(questions.map(({ value }) => value.id)).size !== questions.length ||
    new Set(
      questions.map(({ value }) => value.prompt.trim().toLocaleLowerCase("en-US"))
    ).size !== questions.length
  ) {
    throw new Error("Launch question IDs and normalized prompts must be unique")
  }
  const launchProfileIds = new Set(catalog.profiles.map((profile) => profile.id))
  for (const { value } of questions) {
    if (
      value.profileIds === undefined ||
      !value.profileIds.includes(value.profileId)
    ) {
      throw new Error(`Question ${value.id} lost its full profile compatibility metadata`)
    }
    assertEqualSets(
      new Set(value.profileIds),
      launchProfileIds,
      `Question ${value.id} launch profiles`
    )
    const packed = pack.questions.find((question) => question.id === value.id)
    if (
      packed === undefined ||
      !isDeepStrictEqual(packed, {
        id: value.id,
        version: value.version,
        profileIds: value.profileIds,
        prompt: value.prompt,
        options: value.options,
        memberships: value.memberships ?? []
      })
    ) {
      throw new Error(`Question ${value.id} differs between item and pack precommit artifacts`)
    }
  }
  const postcommitQuestions = await Promise.all(
    questions.map(async ({ raw, record: precommitRecord, value }) => {
      const record = questionPostcommitById.get(value.id)
      if (record === undefined) throw new Error(`Question ${value.id} has no postcommit record`)
      const postcommit = Schema.decodeUnknownSync(PostcommitQuestion)(
        JSON.parse(await text(new URL(record.path, publishedReleaseRoot)))
      )
      if (
        postcommit.id !== value.id ||
        postcommit.version !== value.version ||
        postcommit.objectiveId === undefined ||
        postcommit.equivalenceGroupId === undefined ||
        postcommit.factKind === undefined ||
        postcommit.tags === undefined ||
        postcommit.optionConceptIds === undefined
      ) {
        throw new Error(`Question ${value.id} is missing launch metadata after commitment`)
      }
      assertNoQuestionSemanticLeak(raw, postcommit, catalog, [
        precommitRecord.itemId ?? "",
        precommitRecord.path,
        record.itemId ?? "",
        record.path
      ])
      const receiptLineIds = postcommit.sources.map((source) => source.id)
      const claimIds = postcommit.claims.map((claim) => claim.id)
      if (
        new Set(receiptLineIds).size !== receiptLineIds.length ||
        new Set(claimIds).size !== claimIds.length
      ) {
        throw new Error(`Question ${value.id} repeats a claim or source-line receipt`)
      }
      for (const receipt of postcommit.sources) {
        const catalogSource = catalogSourceById.get(receipt.sourceId)
        if (
          catalogSource === undefined ||
          receipt.title !== catalogSource.title ||
          receipt.publisher !== catalogSource.publisher ||
          receipt.evidenceTier !== catalogSource.evidenceTier ||
          receipt.version !== catalogSource.version ||
          receipt.rightsNotes !== catalogSource.rightsNotes ||
          receipt.url !== catalogSource.url
        ) {
          throw new Error(`Question ${value.id} has a source receipt outside the catalog`)
        }
        const expectedSupportedClaims = postcommit.claims
          .filter((claim) => claim.sourceLineIds.includes(receipt.id))
          .map((claim) => claim.id)
        assertEqualSets(
          new Set(receipt.supportedClaimIds),
          new Set(expectedSupportedClaims),
          `Question ${value.id} receipt ${receipt.id} claim closure`
        )
      }
      for (const claim of postcommit.claims) {
        if (claim.sourceLineIds.some((lineId) => !receiptLineIds.includes(lineId))) {
          throw new Error(`Question ${value.id} claim ${claim.id} cites a missing source line`)
        }
      }
      for (const rationale of postcommit.rationales) {
        if (rationale.claimIds.some((claimId) => !claimIds.includes(claimId))) {
          throw new Error(`Question ${value.id} rationale cites a missing claim`)
        }
      }
      assertEqualSets(
        new Set(postcommit.rationales.flatMap((rationale) => rationale.claimIds)),
        new Set(claimIds),
        `Question ${value.id} rationale-claim closure`
      )
      const atlasOnlyOption = postcommit.optionConceptIds.find((mapping) =>
        atlasOnlyConceptIds.has(mapping.conceptId)
      )
      if (atlasOnlyOption !== undefined) {
        throw new Error(
          `Question ${value.id} scores atlas-only concept ${atlasOnlyOption.conceptId}`
        )
      }
      const gatedComparison = postcommit.tags.confusionSetIds.find((comparisonId) => {
        const comparison = comparisonsById.get(comparisonId)
        return comparison === undefined || comparison.scoredUseGate.length > 0
      })
      if (gatedComparison !== undefined) {
        throw new Error(
          `Question ${value.id} scores unpublished or gated comparison ${gatedComparison}`
        )
      }
      return postcommit
    })
  )
  if (
    new Set(postcommitQuestions.map((question) => question.objectiveId)).size !==
      postcommitQuestions.length ||
    new Set(postcommitQuestions.map((question) => question.equivalenceGroupId)).size !==
      postcommitQuestions.length
  ) {
    throw new Error("Launch question objectives and equivalence groups must be unique")
  }
  assertNoAnswerPositionConvention(postcommitQuestions)
  const factKindCounts = Object.fromEntries(
    ["use", "recognition-feature", "comparison-distinction", "safety-application"].map((factKind) => [
      factKind,
      postcommitQuestions.filter((question) => question.factKind === factKind).length
    ])
  )
  if (!isDeepStrictEqual(factKindCounts, {
    use: 41,
    "recognition-feature": 26,
    "comparison-distinction": 11,
    "safety-application": 12
  })) {
    throw new Error("Launch question fact-kind composition has drifted")
  }

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
  for (const tool of catalog.tools) {
    const family = toolsByFamily.get(tool.family) ?? []
    family.push(tool)
    toolsByFamily.set(tool.family, family)
  }

  const expectedRoutes: ExpectedRoute[] = [
    { canonicalPath: "/", robots: "index,follow", routeId: "home" },
    { canonicalPath: "/exams/", robots: "index,follow", routeId: "exam-selector" },
    ...catalog.profiles.map((profile) => ({
      canonicalPath: profile.canonicalPath,
      robots: "index,follow" as const,
      routeId: "profile" as const
    })),
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
    { canonicalPath: "/offline/", robots: "noindex,follow", routeId: "offline-packs" },
    { canonicalPath: "/settings/", robots: "noindex,follow", routeId: "settings" },
    { canonicalPath: "/report/", robots: "noindex,follow", routeId: "correction-submit" },
    {
      canonicalPath: "/transparency/",
      robots: "index,follow",
      routeId: "transparency-index"
    },
    {
      canonicalPath: "/transparency/corrections/",
      robots: "index,follow",
      routeId: "corrections"
    },
    {
      canonicalPath: "/transparency/foil/",
      robots: "index,follow",
      routeId: "foil"
    },
    {
      canonicalPath: "/transparency/privacy/",
      robots: "index,follow",
      routeId: "privacy"
    },
    {
      canonicalPath: "/transparency/security/",
      robots: "index,follow",
      routeId: "security"
    },
    {
      canonicalPath: "/transparency/sources/",
      robots: "index,follow",
      routeId: "source"
    },
    ...catalog.tools.map((tool) => ({
        canonicalPath: `/atlas/tool/${slugify(tool.canonicalTerm)}/`,
        robots: "index,follow" as const,
        routeId: "atlas-tool" as const
      })),
    ...[...toolsByFamily]
      .filter(([, tools]) => tools.length >= 2)
      .map(([family]) => ({
        canonicalPath: `/atlas/family/${slugify(family)}/`,
        robots: "index,follow" as const,
        routeId: "atlas-family" as const
      })),
    ...catalog.sources.map((source) => ({
      canonicalPath: `/transparency/sources/${slugify(source.id)}/`,
      robots: "index,follow" as const,
      routeId: "source" as const
    }))
  ]
  for (const route of expectedRoutes) assertCanonicalRouteId(route.routeId)

  // Must match the neutral profile selection in apps/site/scripts/generate-pages.tsx.
  // CONTENT_DESIGN.md (SHARED-EXPLICIT-PROFILE-CONTEXT) forbids the statically
  // generated practice page from defaulting to a jurisdiction layer or to an
  // arbitrary first profile.
  const capacityProfile = catalog.profiles.find((profile) => profile.layer === "statewide-series")
  if (capacityProfile === undefined) {
    throw new Error("Published release has no statewide-series profile for neutral practice context")
  }
  const practiceSessions = derivePracticeSessions({
    releaseId: manifest.releaseId,
    packVersion: manifest.packVersion,
    profile: {
      id: capacityProfile.id,
      version: capacityProfile.version,
      compatibilityKey: capacityProfile.compatibilityKey
    },
    questions,
    records: catalog.practiceCapacity.records
  })
  const wholeBankSessions = practiceSessions.filter(
    (session) => session.record.filterKind === "all" && session.record.filterValue === "all"
  )
  if (
    !isDeepStrictEqual(
      wholeBankSessions.map((session) => session.length),
      [45, 60, 90]
    ) ||
    practiceSessions.some(
      (session) =>
        new Set(session.questions.map(({ value }) => value.id)).size !== session.length
    ) ||
    catalog.practiceCapacity.records.some((record) =>
      record.availableSetLengths.some((length) => length > record.questionCount)
    )
  ) {
    throw new Error("Advertised practice sessions are incomplete, repeated, or over capacity")
  }
  const postcommitQuestionById = new Map(
    postcommitQuestions.map((question) => [question.id, question] as const)
  )
  for (const session of practiceSessions) {
    if (
      session.profile.id !== capacityProfile.id ||
      session.profile.version !== capacityProfile.version ||
      session.profile.compatibilityKey !== capacityProfile.compatibilityKey ||
      !/^ps-[a-f0-9]{24}$/.test(session.id)
    ) {
      throw new Error(`Practice session ${session.id} lost its opaque profile-version binding`)
    }
    session.questions.forEach(({ raw, value }, index) => {
      const postcommit = questionPostcommitById.get(value.id)
      const postcommitValue = postcommitQuestionById.get(value.id)
      if (postcommit === undefined || postcommitValue === undefined) {
        throw new Error(`Practice-set question ${value.id} has no postcommit artifact`)
      }
      const canonicalPath = `/practice/session/${session.id}/question/${index + 1}/`
      assertNoQuestionSemanticLeak(raw, postcommitValue, catalog, [session.id, canonicalPath])
      expectedRoutes.push({
        canonicalPath,
        position: index + 1,
        postcommitArtifact: postcommit,
        postcommitPath: `/content/vertical-slice/${postcommit.path}`,
        precommit: value,
        robots: "noindex,follow",
        routeId: "question-player",
        sessionId: session.id
      })
    })
  }

  questions.forEach(({ raw, value }, index) => {
    const postcommit = questionPostcommitById.get(value.id)
    const postcommitValue = postcommitQuestionById.get(value.id)
    if (postcommit === undefined || postcommitValue === undefined) {
      throw new Error(`Question ${value.id} has no postcommit artifact`)
    }
    assertNoQuestionSemanticLeak(raw, postcommitValue, catalog, [
      manifest.releaseId,
      `/practice/session/${manifest.releaseId}/question/${index + 1}/`,
      `/review/session/${manifest.releaseId}/item/${index + 1}/`
    ])
    expectedRoutes.push({
      canonicalPath: `/practice/session/${manifest.releaseId}/question/${index + 1}/`,
      position: index + 1,
      postcommitArtifact: postcommit,
      postcommitPath: `/content/vertical-slice/${postcommit.path}`,
      precommit: value,
      robots: "noindex,follow",
      routeId: "question-player",
      sessionId: manifest.releaseId
    })
    expectedRoutes.push({
      canonicalPath: `/review/session/${manifest.releaseId}/item/${index + 1}/`,
      position: index + 1,
      postcommitArtifact: postcommit,
      postcommitPath: `/content/vertical-slice/${postcommit.path}`,
      precommit: value,
      robots: "noindex,follow",
      routeId: "review-player",
      sessionId: manifest.releaseId
    })
  })
  expectedRoutes.push({
    canonicalPath: "/practice/session/vertical-slice/question/1/",
    position: 1,
    postcommitArtifact: firstPostcommitRecord,
    postcommitPath: `/content/vertical-slice/${firstPostcommitRecord.path}`,
    precommit: firstQuestion.value,
    robots: "noindex,follow",
    routeId: "question-player",
    sessionId: manifest.releaseId
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

  for (const route of expectedRoutes) assertCanonicalRouteId(route.routeId)

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
  const routeHtml = await Promise.all(routeFiles.map((path) => Bun.file(path).text()))
  assertGeneratedPublicCopyBoundary(await Promise.all(htmlFiles.map(async (path) => ({
    path: relative(new URL(".", distRoot).pathname, path),
    html: await Bun.file(path).text()
  }))))
  if (routeHtml.some((html) => html.includes("/atlas/comparison/"))) {
    throw new Error("Generated HTML still links to a non-canonical comparison route")
  }
  const toolByConceptId = new Map(
    catalog.tools.map((tool) => [tool.conceptId, tool] as const)
  )
  for (const comparison of catalog.comparisons) {
    const owner = toolByConceptId.get(comparison.memberIds[0] ?? "")
    if (owner === undefined) {
      throw new Error(`Comparison ${comparison.id} has no canonical family owner`)
    }
    const familyPath = `/atlas/family/${slugify(owner.family)}/`
    const familyHtml = await text(routeDocument(familyPath))
    const anchor = `id="comparison-${slugify(comparison.id.replace(/^comparison\./, ""))}"`
    if (occurrenceCount(familyHtml, anchor) !== 1) {
      throw new Error(`Comparison ${comparison.id} does not have exactly one canonical anchor`)
    }
  }
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
  const offlinePackHtml = await text(routeDocument("/offline/"))
  const offlinePackDescriptor = decodeOfflinePackDescriptor(
    extractEmbeddedJson(offlinePackHtml, "offline-pack-descriptor")
  )
  const publicationGate = process.env.NYCUSTODIAN_REQUIRE_PUBLISHED_RELEASE
  if (publicationGate !== undefined && publicationGate !== "0" && publicationGate !== "1") {
    throw new Error("NYCUSTODIAN_REQUIRE_PUBLISHED_RELEASE must be 0, 1, or unset")
  }
  assertProductionPackPublication(offlinePackDescriptor, publicationGate === "1")
  const shellManifestReceipt = offlinePackDescriptor.applicationShellManifestReceipt
  if (shellManifestReceipt === null) {
    throw new Error("Finalized offline pack descriptor has no application-shell root receipt")
  }
  const shellManifestBytes = await bytes(
    publicPathDocument(offlinePackDescriptor.applicationShellManifestPath)
  )
  if (
    shellManifestBytes.byteLength !== shellManifestReceipt.bytes ||
    digest(shellManifestBytes) !== shellManifestReceipt.sha256
  ) {
    throw new Error("Offline application-shell manifest does not match its embedded root receipt")
  }
  // The external manifest is untrusted until its exact receipt above has been verified.
  const shellManifest = decodeOfflineShellManifest(
    JSON.parse(new TextDecoder().decode(shellManifestBytes)) as unknown,
    offlinePackDescriptor
  )
  const expectedApplicationShellBytes = shellManifestBytes.byteLength +
    shellManifest.receipts.reduce((sum, receipt) => sum + receipt.bytes, 0)
  if (
    offlinePackDescriptor.applicationShellBytes !== expectedApplicationShellBytes ||
    offlinePackDescriptor.estimatedDownloadBytes !==
      offlinePackDescriptor.totalBytes + expectedApplicationShellBytes
  ) {
    throw new Error("Offline pack pre-download byte estimate is not closed over every request")
  }
  const expectedShellReceiptPaths = new Set([
    ...offlinePackDescriptor.requiredNavigation,
    "/offline.html",
    "/manifest.webmanifest",
    "/styles.css",
    ...referencedBuildAssets
  ])
  assertEqualSets(
    new Set(shellManifest.receipts.map((receipt) => receipt.path)),
    expectedShellReceiptPaths,
    "Offline application-shell manifest receipts"
  )
  if (
    shellManifest.receipts.some((receipt) => receipt.path === "/offline/") ||
    !trustedCurrentShellNavigation.has("/offline/")
  ) {
    throw new Error(
      "The trusted-current-app offline loader must be baseline shell, not pack-managed closure"
    )
  }
  for (const receipt of shellManifest.receipts) {
    const value = await bytes(publicPathDocument(receipt.path))
    if (value.byteLength !== receipt.bytes || digest(value) !== receipt.sha256) {
      throw new Error(`Offline application-shell receipt mismatch: ${receipt.path}`)
    }
  }
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
    "print-preview",
    "offline-packs",
    "settings",
    "correction-submit"
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
    if (!interactive) {
      const inertJsonScripts = [...html.matchAll(
        /<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/gi
      )]
      const expectedInertJsonScripts = route.routeId === "profile" ? 1 : 0
      if (inertJsonScripts.length !== expectedInertJsonScripts) {
        throw new Error(
          `Static route has an unexpected inert JSON contract: ${route.canonicalPath}`
        )
      }
      const withoutInertJson = html.replace(
        /<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/gi,
        ""
      )
      const bootScripts = [...html.matchAll(
        /<script type="module"[^>]+src="(\/assets\/preferences-boot-[^"]+\.js)"[^>]*>/g
      )]
      if (bootScripts.length !== 1 || occurrenceCount(withoutInertJson, "<script") !== 1) {
        throw new Error(
          `Static route must include only the minimal preference boot module: ${route.canonicalPath}`
        )
      }
      const bootClosure = await collectJavaScriptClosure(html, allJavaScriptPaths)
      if (bootClosure.length !== 1) {
        throw new Error(
          `Static preference boot module imports an interactive runtime: ${route.canonicalPath}`
        )
      }
    }
    if (!interactive && !/<main\b[\s\S]*<h1\b/i.test(html)) {
      throw new Error(`Static route is not a substantive document: ${route.canonicalPath}`)
    }
    if (!interactive) {
      if (route.routeId === "profile") {
        const expectedProfile = catalog.profiles.find(
          (profile) => profile.canonicalPath === route.canonicalPath
        )
        const encodedProfile = expectedProfile === undefined
          ? undefined
          : JSON.parse(JSON.stringify(expectedProfile)) as unknown
        if (
          expectedProfile === undefined ||
          !isDeepStrictEqual(
            extractEmbeddedJson(html, "announcement-profile-data"),
            encodedProfile
          )
        ) {
          throw new Error(`Profile bootstrap does not match the catalog: ${route.canonicalPath}`)
        }
      }
      continue
    }

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
      const publishedTools = catalog.tools
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
            profile.version !== expected.version ||
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
        bootstrap.tools.length !== publishedTools.length ||
        bootstrap.tools.some((item, index) => {
          const expected = publishedTools[index]
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
        const expectedQuestion = questions[index]
        const expected = expectedQuestion?.value
        const postcommitValue = expected === undefined
          ? undefined
          : postcommitQuestionById.get(expected.id)
        const postcommit = expected === undefined
          ? undefined
          : questionPostcommitById.get(expected.id)
        const expectedPostcommitPath = postcommit === undefined
          ? undefined
          : `/content/vertical-slice/${postcommit.path}`
        if (
          expected === undefined ||
          expectedQuestion === undefined ||
          postcommit === undefined ||
          postcommitValue === undefined ||
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
        assertNoQuestionSemanticLeak(expectedQuestion.raw, postcommitValue, catalog, [
          source.id,
          ...source.optionIds,
          source.itemUrl,
          source.receipt.sessionId,
          source.receipt.postcommitPath
        ])
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
        "claimIds",
        "claims",
        "conceptId",
        "correctOptionId",
        "equivalenceGroupId",
        "factKind",
        "objectiveId",
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
      route.routeId === "offline-packs" ||
      route.routeId === "settings" ||
      route.routeId === "correction-submit"
    ) {
      const marker = route.routeId === "offline-packs"
        ? "data-offline-pack-manager"
        : route.routeId === "settings"
        ? "data-settings"
        : "data-correction-form"
      if (
        !html.includes(marker) ||
        !/<script type="module"[^>]+src="\/assets\/[^"]+\.js"/.test(html) ||
        !/<main\b[\s\S]*<h1\b/i.test(html)
      ) {
        throw new Error(`Local-data route bootstrap mismatch: ${route.canonicalPath}`)
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
      const postcommitValue = postcommitQuestionById.get(decoded.id)
      if (
        postcommitValue === undefined ||
        !isDeepStrictEqual(decoded, route.precommit) ||
        !html.includes("data-question-player") ||
        !/<script type="module"[^>]+src="\/assets\/[^\"]+\.js"/.test(html)
      ) {
        throw new Error(`Question bootstrap contract mismatch: ${route.canonicalPath}`)
      }
      const rawReceipt = extractEmbeddedJson(html, "question-receipt-data")
      const receipt = decodeAndAssertQuestionReceipt(
        rawReceipt,
        {
          artifact: route.postcommitArtifact,
          packVersion: deliveryManifest.packVersion,
          position: route.position,
          questionId: decoded.id,
          releaseId: deliveryManifest.releaseId,
          sessionId: route.sessionId ?? deliveryManifest.releaseId
        },
        `Question receipt ${route.canonicalPath}`
      )
      assertNoQuestionSemanticLeak(rawQuestion, postcommitValue, catalog, [
        route.canonicalPath,
        receipt.sessionId,
        receipt.postcommitPath,
        receipt.questionId
      ])
      for (const field of [
        "claimIds",
        "claims",
        "conceptId",
        "correctOptionId",
        "equivalenceGroupId",
        "factKind",
        "objectiveId",
        "optionConceptIds",
        "rationales",
        "sources",
        "tags"
      ]) {
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
    "offline-pack-shell-manifest.json",
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
        ...payload.claims.flatMap((claim) => [claim.text, claim.caveat ?? ""]),
        ...payload.sources.flatMap((source) => [
          source.locator,
          source.excerpt,
          source.title
        ])
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
  assertNoAnswerBearingText(
    initialInteractiveClosure,
    secretMaterial,
    "Initial interactive closure",
    collectStringLeaves([catalog, pack])
  )
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
      ...expectedRoutes
        .map((route) => route.canonicalPath)
        .filter((path) => trustedCurrentShellNavigation.has(path)),
      "/404.html",
      "/offline.html",
      "/offline-pack-shell-manifest.json",
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

  // The interactive entries share the framework/runtime and verified-content chunks. M4 and M5
  // share durable-session, print, pack, settings, correction, and canonical review-projection
  // services. The largest integrated closure is Settings at 468975 raw / 140191 gzip / 118523
  // brotli; these ceilings retain a deliberately narrow deterministic margin.
  const bundleBudgets = { raw: 470_000, gzip: 141_000, brotli: 120_000 } as const
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
