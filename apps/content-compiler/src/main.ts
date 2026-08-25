import { mkdir, rm } from "node:fs/promises"
import { dirname } from "node:path"
import {
  compileContentPack,
  createReleaseManifest,
  renderReleaseArtifacts,
  stableJson,
  verifyLegacyQuestionCompatibilityFixture
} from "@nycustodian/content/compiler"
import { Effect } from "effect"
import { ContentBuildError } from "./content-build-error.ts"
import { resolveFileUrlWithinRoot } from "./file-url.ts"
import { activateRelease } from "./release-activation.ts"

const repositoryRoot = new URL("../../../", import.meta.url)
const authoredPackUrl = new URL("content/authoring/packs/launch-v1.json", repositoryRoot)
const legacyQuestionCompatibilityFixtureUrl = new URL(
  "content/authoring/questions/vertical-slice.json",
  repositoryRoot
)
const acceptedToolsUrl = new URL(
  "content/authoring/visuals/releases/tools.json",
  repositoryRoot
)
const acceptedScenesUrl = new URL(
  "content/authoring/visuals/releases/scenes.json",
  repositoryRoot
)
const acceptedSceneRegionsUrl = new URL(
  "content/authoring/visuals/releases/regions.json",
  repositoryRoot
)
const acceptedSceneAccessibilityUrl = new URL(
  "content/authoring/visuals/releases/accessibility.json",
  repositoryRoot
)
const releaseUrl = new URL("content/releases/vertical-slice/", repositoryRoot)
const stagingUrl = new URL("content/releases/.vertical-slice-staging/", repositoryRoot)
const backupUrl = new URL("content/releases/.vertical-slice-backup/", repositoryRoot)
const textEncoder = new TextEncoder()

const sha256 = (value: string | Uint8Array): string =>
  new Bun.CryptoHasher("sha256").update(value).digest("hex")

const digestUtf8 = Effect.fn("ContentCompiler.digestUtf8")(function*(text: string) {
  return yield* Effect.try({
    try: () => ({
      sha256: sha256(text),
      bytes: textEncoder.encode(text).byteLength
    }),
    catch: (cause) => new ContentBuildError({
      detail: "Unable to hash deterministic release artifact",
      cause
    })
  })
})

const readJson = Effect.fn("ContentCompiler.readJson")(function*(url: URL, label: string) {
  const sourceText = yield* Effect.tryPromise({
    try: () => Bun.file(url).text(),
    catch: (cause) => new ContentBuildError({ detail: `Unable to read ${label}`, cause })
  })
  return yield* Effect.try({
    try: () => JSON.parse(sourceText) as unknown,
    catch: (cause) => new ContentBuildError({ detail: `${label} is not valid JSON`, cause })
  })
})

const writeArtifact = Effect.fn("ContentCompiler.writeArtifact")(
  function*(root: URL, path: string, text: string) {
    return yield* Effect.tryPromise({
      try: async () => {
        const url = resolveFileUrlWithinRoot(root, path)
        await mkdir(dirname(url.pathname), { recursive: true })
        await Bun.write(url, text)
      },
      catch: (cause) => new ContentBuildError({
        detail: `Unable to write compiled content ${path}`,
        cause
      })
    })
  }
)

const verifyAsset = Effect.fn("ContentCompiler.verifyAsset")(function*(asset: {
  readonly path: string
  readonly bytes: number
  readonly sha256: string
}) {
  const bytes = yield* Effect.tryPromise({
    try: async () => {
      const assetUrl = resolveFileUrlWithinRoot(repositoryRoot, asset.path)
      return new Uint8Array(await Bun.file(assetUrl).arrayBuffer())
    },
    catch: (cause) => new ContentBuildError({ detail: `Unable to read asset ${asset.path}`, cause })
  })
  if (bytes.byteLength !== asset.bytes) {
    return yield* new ContentBuildError({
      detail: `Asset ${asset.path} has ${bytes.byteLength} bytes; expected ${asset.bytes}`,
      cause: new Error("asset byte count mismatch")
    })
  }
  const digest = sha256(bytes)
  if (digest !== asset.sha256) {
    return yield* new ContentBuildError({
      detail: `Asset ${asset.path} does not match its accepted SHA-256 digest`,
      cause: new Error("asset digest mismatch")
    })
  }
})

const program = Effect.gen(function*() {
  const authoredPack = yield* readJson(authoredPackUrl, "authored content pack")
  const acceptedTools = yield* readJson(acceptedToolsUrl, "accepted tool ledger")
  const acceptedScenes = yield* readJson(acceptedScenesUrl, "accepted scene ledger")
  const acceptedSceneRegions = yield* readJson(
    acceptedSceneRegionsUrl,
    "accepted scene-region ledger"
  )
  const acceptedSceneAccessibility = yield* readJson(
    acceptedSceneAccessibilityUrl,
    "accepted scene-accessibility ledger"
  )

  const compiled = yield* compileContentPack({
    authoredPack,
    acceptedTools,
    acceptedScenes,
    acceptedSceneRegions,
    acceptedSceneAccessibility
  })
  const legacyQuestionCompatibilityFixture = yield* readJson(
    legacyQuestionCompatibilityFixtureUrl,
    "non-authoritative legacy question compatibility fixture"
  )
  yield* verifyLegacyQuestionCompatibilityFixture(
    compiled.compatibilityQuestion,
    legacyQuestionCompatibilityFixture
  )
  for (const asset of compiled.assets) {
    yield* verifyAsset(asset)
  }

  const renderedArtifacts = renderReleaseArtifacts(compiled)
  const manifest = yield* createReleaseManifest(compiled, digestUtf8)

  yield* Effect.tryPromise({
    try: async () => {
      await rm(stagingUrl, { recursive: true, force: true })
      await mkdir(stagingUrl, { recursive: true })
    },
    catch: (cause) => new ContentBuildError({ detail: "Unable to prepare staging directory", cause })
  })

  for (const artifact of renderedArtifacts) {
    yield* writeArtifact(stagingUrl, artifact.path, artifact.text)
  }
  yield* writeArtifact(stagingUrl, "manifest.json", stableJson(manifest))

  yield* activateRelease({
    active: releaseUrl,
    staging: stagingUrl,
    backup: backupUrl
  })

  yield* Effect.logInfo(
    `Compiled ${manifest.questionCount} questions and ${manifest.hazardSceneCount} hazard scenes into ${manifest.releaseId}`
  )
})

await Effect.runPromise(program)
