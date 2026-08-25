import type { Effect } from "effect"
import type {
  CatalogArtifact,
  PostcommitPackArtifact,
  PostcommitScene,
  PrecommitPackArtifact,
  PrecommitScene
} from "../model/compiled-pack-artifacts.ts"
import type {
  PostcommitQuestion,
  PrecommitQuestion
} from "../model/question-artifacts.ts"
import type {
  ArtifactManifestRecord,
  AssetManifestRecord
} from "../model/release-manifest.ts"

export interface CompiledQuestion {
  readonly precommit: PrecommitQuestion
  readonly postcommit: PostcommitQuestion
}

export interface CompiledQuestionArtifacts extends CompiledQuestion {
  readonly id: string
}

export interface CompiledSceneArtifacts {
  readonly opaqueAssetId: string
  readonly precommit: typeof PrecommitScene.Type
  readonly postcommit: typeof PostcommitScene.Type
}

export interface CompileContentPackInput {
  readonly authoredPack: unknown
  readonly acceptedTools: unknown
  readonly acceptedComparisons: unknown
  readonly acceptedScenes: unknown
  readonly acceptedSceneRegions: unknown
  readonly acceptedSceneAccessibility: unknown
}

export interface CompiledContentPack {
  readonly catalog: CatalogArtifact
  readonly precommit: PrecommitPackArtifact
  readonly postcommit: PostcommitPackArtifact
  readonly questions: readonly [CompiledQuestionArtifacts, ...Array<CompiledQuestionArtifacts>]
  readonly scenes: ReadonlyArray<CompiledSceneArtifacts>
  readonly compatibilityQuestion: CompiledQuestion
  readonly assets: ReadonlyArray<typeof AssetManifestRecord.Type>
}

export type CompiledArtifactDigest = typeof ArtifactManifestRecord.Type

export interface Utf8Digest {
  readonly sha256: string
  readonly bytes: number
}

export type DigestUtf8<E> = (text: string) => Effect.Effect<Utf8Digest, E>
