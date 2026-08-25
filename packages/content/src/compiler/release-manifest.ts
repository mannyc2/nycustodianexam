import { Effect, Schema } from "effect"
import {
  ArtifactManifestRecord,
  ReleaseManifest
} from "../model/release-manifest.ts"
import type {
  CompiledArtifactDigest,
  CompiledContentPack,
  DigestUtf8
} from "./compiled-content.ts"
import { closureError, schemaError } from "./content-validation.ts"
import { renderReleaseArtifacts } from "./release-artifacts.ts"

const decodeArtifactDigests = Schema.decodeUnknownEffect(
  Schema.NonEmptyArray(ArtifactManifestRecord)
)
const decodeReleaseManifest = Schema.decodeUnknownEffect(ReleaseManifest)

const validateManifestRelations = (
  manifest: ReleaseManifest,
  compiled: CompiledContentPack,
  expectedArtifacts: ReadonlyArray<CompiledArtifactDigest>
) => {
  if (
    manifest.releaseId !== compiled.precommit.packId ||
    manifest.packVersion !== compiled.precommit.version ||
    manifest.locale !== compiled.precommit.locale
  ) {
    return closureError(
      "manifest release identity does not match the compiled pack",
      "manifest.identity"
    )
  }
  if (
    manifest.profileCount !== compiled.precommit.profiles.length ||
    manifest.sourceCount !== compiled.postcommit.sources.length ||
    manifest.toolCount !== compiled.catalog.tools.length ||
    manifest.comparisonCount !== compiled.catalog.comparisons.length ||
    manifest.questionCount !== compiled.precommit.questions.length ||
    manifest.hazardSceneCount !== compiled.precommit.scenes.length
  ) {
    return closureError("manifest counts do not match compiled pack contents", "manifest.counts")
  }
  if (manifest.artifacts.length !== expectedArtifacts.length) {
    return closureError("manifest artifact count does not match the release", "manifest.artifacts")
  }
  for (const [index, expected] of expectedArtifacts.entries()) {
    const found = manifest.artifacts[index]
    if (
      found === undefined ||
      found.kind !== expected.kind ||
      found.itemId !== expected.itemId ||
      found.path !== expected.path
    ) {
      return closureError(
        `manifest artifact ${index} does not match deterministic release layout ${expected.path}`,
        `manifest.artifacts.${index}`
      )
    }
    if (found.bytes !== expected.bytes || found.sha256 !== expected.sha256) {
      return closureError(
        `manifest artifact ${expected.path} does not match deterministic release bytes`,
        `manifest.artifacts.${index}`
      )
    }
  }
  if (manifest.assets.length !== compiled.assets.length) {
    return closureError("manifest asset count does not match compiled asset closure", "manifest.assets")
  }
  for (const [index, expected] of compiled.assets.entries()) {
    const found = manifest.assets[index]
    if (
      found === undefined ||
      expected.path !== found.path ||
      expected.sha256 !== found.sha256 ||
      expected.bytes !== found.bytes ||
      expected.kind !== found.kind ||
      expected.opaqueAssetId !== found.opaqueAssetId ||
      expected.usage !== found.usage
    ) {
      return closureError(
        `manifest asset ${index} does not match the compiled asset closure ${expected.path}`,
        `manifest.assets.${index}`
      )
    }
  }
  return undefined
}

const createArtifactDigests = Effect.fn("Content.createArtifactDigests")(
  function*<E>(compiled: CompiledContentPack, digestUtf8: DigestUtf8<E>) {
    const unknownArtifacts: Array<unknown> = []
    for (const artifact of renderReleaseArtifacts(compiled)) {
      const digest = yield* digestUtf8(artifact.text)
      unknownArtifacts.push({
        kind: artifact.kind,
        ...(artifact.itemId === undefined ? {} : { itemId: artifact.itemId }),
        path: artifact.path,
        sha256: digest.sha256,
        bytes: digest.bytes
      })
    }
    return yield* decodeArtifactDigests(unknownArtifacts).pipe(
      Effect.mapError((cause) => schemaError("manifest.artifacts", cause))
    )
  }
)

const validateManifest = Effect.fn("Content.validateManifest")(
  function*(
    manifest: ReleaseManifest,
    compiled: CompiledContentPack,
    expectedArtifacts: ReadonlyArray<CompiledArtifactDigest>
  ) {
    const validationError = validateManifestRelations(manifest, compiled, expectedArtifacts)
    if (validationError !== undefined) return yield* validationError
    return manifest
  }
)

export const createReleaseManifest = Effect.fn("Content.createReleaseManifest")(
  function*<E>(compiled: CompiledContentPack, digestUtf8: DigestUtf8<E>) {
    const artifacts = yield* createArtifactDigests(compiled, digestUtf8)
    const manifest = new ReleaseManifest({
      schemaVersion: 1,
      releaseId: compiled.precommit.packId,
      packVersion: compiled.precommit.version,
      locale: compiled.precommit.locale,
      profileCount: compiled.precommit.profiles.length,
      sourceCount: compiled.postcommit.sources.length,
      toolCount: compiled.catalog.tools.length,
      comparisonCount: compiled.catalog.comparisons.length,
      questionCount: compiled.precommit.questions.length,
      hazardSceneCount: compiled.precommit.scenes.length,
      artifacts,
      assets: compiled.assets
    })
    return yield* validateManifest(manifest, compiled, artifacts)
  }
)

export const validateReleaseManifest = Effect.fn("Content.validateReleaseManifest")(
  function*<E>(
    compiled: CompiledContentPack,
    unknownManifest: unknown,
    digestUtf8: DigestUtf8<E>
  ) {
    const manifest = yield* decodeReleaseManifest(unknownManifest).pipe(
      Effect.mapError((cause) => schemaError("manifest", cause))
    )
    const expectedArtifacts = yield* createArtifactDigests(compiled, digestUtf8)
    return yield* validateManifest(manifest, compiled, expectedArtifacts)
  }
)
