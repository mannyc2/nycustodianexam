import { Schema } from "effect"
import {
  ArtifactPathSegment,
  ContentLocale,
  ReleaseArtifactPath,
  RepositoryContentPath,
  Sha256
} from "./content-primitives.ts"

export const AssetManifestRecord = Schema.Struct({
  opaqueAssetId: ArtifactPathSegment,
  usage: Schema.Literals(["tool-atlas", "hazard-scene"]),
  kind: Schema.Literals(["web", "phone", "print"]),
  path: RepositoryContentPath,
  sha256: Sha256,
  bytes: Schema.Natural
})

const PackArtifactManifestRecord = Schema.Struct({
  kind: Schema.Literals(["catalog", "pack-precommit", "pack-postcommit"]),
  itemId: Schema.optionalKey(Schema.Never),
  path: ReleaseArtifactPath,
  sha256: Sha256,
  bytes: Schema.Natural
})

const ItemArtifactManifestRecord = Schema.Struct({
  kind: Schema.Literals([
    "question-precommit",
    "question-postcommit",
    "scene-precommit",
    "scene-postcommit",
    "legacy-question-precommit",
    "legacy-question-postcommit"
  ]),
  itemId: ArtifactPathSegment,
  path: ReleaseArtifactPath,
  sha256: Sha256,
  bytes: Schema.Natural
})

export const ArtifactManifestRecord = Schema.Union([
  PackArtifactManifestRecord,
  ItemArtifactManifestRecord
])

export class ReleaseManifest extends Schema.Class<ReleaseManifest>(
  "@nycustodian/content/ReleaseManifest"
)({
  schemaVersion: Schema.Literal(1),
  releaseId: ArtifactPathSegment,
  packVersion: Schema.Int,
  locale: ContentLocale,
  profileCount: Schema.Natural,
  sourceCount: Schema.Natural,
  toolCount: Schema.Natural,
  questionCount: Schema.Natural,
  hazardSceneCount: Schema.Natural,
  artifacts: Schema.NonEmptyArray(ArtifactManifestRecord),
  assets: Schema.Array(AssetManifestRecord)
}) {}
