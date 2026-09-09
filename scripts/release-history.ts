import type { ReleaseManifest } from "../packages/content/src/model.ts"
import historicalV3 from "../content/authoring/compatibility/launch-v1-v3-review.json"
import historicalV4 from "../content/authoring/compatibility/launch-v1-v4-review.json"

/** Current release entries already have canonical routes and registry keys. */
export const previousReleaseInventories = (current: { readonly releaseId: string; readonly packVersion: number }) =>
  [historicalV3, historicalV4].filter(archive =>
    archive.releaseId === current.releaseId && archive.packVersion < current.packVersion)


type Manifest = typeof ReleaseManifest.Type
export type RetainedQuestionArtifact = {
  readonly artifact: Manifest["artifacts"][number]
  readonly sourceUrl: URL
}

/** Never publish different bytes at a URL already bound by a saved receipt. */
export const retainedQuestionArtifacts = (manifest: Pick<Manifest, "releaseId" | "packVersion" | "artifacts">): readonly RetainedQuestionArtifact[] => {
  const known = new Map(manifest.artifacts.map(artifact => [artifact.path, artifact]))
  const retained: RetainedQuestionArtifact[] = []
  for (const archive of previousReleaseInventories(manifest)) {
    for (const question of archive.reviewQueue.questions) {
      const stimulus = archive.precommitReceipts.find(entry =>
        entry.path.endsWith(`/${question.id}.precommit.json`))
      if (stimulus === undefined) throw new Error(`Historical stimulus receipt missing: ${question.id}`)
      const receipt = question.receipt
      const records = [
        { kind: "question-precommit" as const, itemId: question.id,
          path: stimulus.path.replace("/content/vertical-slice/", ""), bytes: stimulus.bytes, sha256: stimulus.sha256 },
        { kind: "question-postcommit" as const, itemId: question.id,
          path: receipt.postcommitPath.replace("/content/vertical-slice/", ""), bytes: receipt.postcommitBytes, sha256: receipt.postcommitSha256 }
      ]
      for (const artifact of records) {
        const existing = known.get(artifact.path)
        if (existing !== undefined) {
          if (existing.bytes !== artifact.bytes || existing.sha256 !== artifact.sha256 ||
            existing.kind !== artifact.kind || existing.itemId !== artifact.itemId) {
            throw new Error(`Historical artifact URL collision: ${artifact.path}`)
          }
          continue
        }
        known.set(artifact.path, artifact)
        retained.push({ artifact, sourceUrl: new URL(
          `../content/authoring/compatibility/${archive.releaseId}-v${archive.packVersion}-artifacts/${artifact.path}`,
          import.meta.url
        ) })
      }
    }
  }
  return retained
}
