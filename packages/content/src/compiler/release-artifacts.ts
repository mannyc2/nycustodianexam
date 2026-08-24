import type { ArtifactManifestRecord } from "../model/release-manifest.ts"
import type { CompiledContentPack } from "./compiled-content.ts"

export interface RenderedReleaseArtifact {
  readonly kind: typeof ArtifactManifestRecord.Type["kind"]
  readonly itemId?: string
  readonly path: string
  readonly text: string
}

export const stableJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

export const renderReleaseArtifacts = (
  compiled: CompiledContentPack
): ReadonlyArray<RenderedReleaseArtifact> => {
  const firstQuestion = compiled.questions[0]
  const firstQuestionPrecommitText = stableJson(firstQuestion.precommit)
  const firstQuestionPostcommitText = stableJson(firstQuestion.postcommit)
  const artifacts: Array<RenderedReleaseArtifact> = [
    { kind: "catalog", path: "catalog.json", text: stableJson(compiled.catalog) },
    {
      kind: "pack-precommit",
      path: "pack.precommit.json",
      text: stableJson(compiled.precommit)
    },
    {
      kind: "pack-postcommit",
      path: "pack.postcommit.json",
      text: stableJson(compiled.postcommit)
    }
  ]
  for (const question of compiled.questions) {
    const precommitText = question === firstQuestion
      ? firstQuestionPrecommitText
      : stableJson(question.precommit)
    const postcommitText = question === firstQuestion
      ? firstQuestionPostcommitText
      : stableJson(question.postcommit)
    artifacts.push(
      {
        kind: "question-precommit",
        itemId: question.id,
        path: `questions/${question.id}.precommit.json`,
        text: precommitText
      },
      {
        kind: "question-postcommit",
        itemId: question.id,
        path: `questions/${question.id}.postcommit.json`,
        text: postcommitText
      }
    )
  }
  for (const scene of compiled.scenes) {
    artifacts.push(
      {
        kind: "scene-precommit",
        itemId: scene.opaqueAssetId,
        path: `scenes/${scene.opaqueAssetId}.precommit.json`,
        text: stableJson(scene.precommit)
      },
      {
        kind: "scene-postcommit",
        itemId: scene.opaqueAssetId,
        path: `scenes/${scene.opaqueAssetId}.postcommit.json`,
        text: stableJson(scene.postcommit)
      }
    )
  }
  artifacts.push(
    {
      kind: "legacy-question-precommit",
      itemId: firstQuestion.id,
      path: "question.precommit.json",
      text: firstQuestionPrecommitText
    },
    {
      kind: "legacy-question-postcommit",
      itemId: firstQuestion.id,
      path: "question.postcommit.json",
      text: firstQuestionPostcommitText
    }
  )
  return artifacts
}
