import {
  ArtifactPathSegment,
  ArtifactManifestRecord,
  AssetManifestRecord,
  ContentLocale,
  ReleaseManifest
} from "@nycustodian/content/model"
import { Schema } from "effect"

type InternalManifest = typeof ReleaseManifest.Type
type Artifact = InternalManifest["artifacts"][number]

export const publicArtifactKinds = new Set<Artifact["kind"]>([
  "catalog",
  "pack-precommit",
  "question-precommit",
  "question-postcommit",
  "scene-precommit",
  "scene-postcommit",
  "legacy-question-precommit",
  "legacy-question-postcommit"
])

export const isPublicReleaseArtifact = (artifact: Artifact): boolean =>
  publicArtifactKinds.has(artifact.kind)

export class PublicDeliveryManifest extends Schema.Class<PublicDeliveryManifest>(
  "@nycustodian/site/PublicDeliveryManifest"
)({
  schemaVersion: Schema.Literal(1),
  scope: Schema.Literal("public-delivery"),
  releaseId: ArtifactPathSegment,
  packVersion: Schema.Int,
  locale: ContentLocale,
  artifacts: Schema.NonEmptyArray(ArtifactManifestRecord),
  assets: Schema.Array(AssetManifestRecord)
}) {}

const assertUniquePaths = (paths: readonly string[], label: string): void => {
  if (new Set(paths).size !== paths.length) {
    throw new Error(`Public delivery manifest contains duplicate ${label} paths`)
  }
}

export const assertClosedPublicDeliveryManifest = (
  manifest: PublicDeliveryManifest
): PublicDeliveryManifest => {
  if (manifest.artifacts.some((artifact) => !isPublicReleaseArtifact(artifact))) {
    throw new Error("Public delivery manifest contains a non-deployable release artifact")
  }
  assertUniquePaths(manifest.artifacts.map((artifact) => artifact.path), "artifact")
  assertUniquePaths(manifest.assets.map((asset) => asset.path), "asset")
  return manifest
}

export const decodePublicDeliveryManifest = (value: unknown): PublicDeliveryManifest =>
  assertClosedPublicDeliveryManifest(Schema.decodeUnknownSync(PublicDeliveryManifest)(value))

export const derivePublicDeliveryManifest = (
  manifest: InternalManifest
): PublicDeliveryManifest => {
  const artifacts = manifest.artifacts.filter(isPublicReleaseArtifact)
  const firstArtifact = artifacts[0]
  if (firstArtifact === undefined) {
    throw new Error("Internal release has no deployable public artifacts")
  }
  return assertClosedPublicDeliveryManifest(
    new PublicDeliveryManifest({
      schemaVersion: 1,
      scope: "public-delivery",
      releaseId: manifest.releaseId,
      packVersion: manifest.packVersion,
      locale: manifest.locale,
      artifacts: [firstArtifact, ...artifacts.slice(1)],
      assets: manifest.assets
    })
  )
}
