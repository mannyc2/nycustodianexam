import { previousReleaseInventories, retainedQuestionArtifacts } from "../../../scripts/release-history.ts"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import archive from "../../../content/authoring/compatibility/launch-v1-v4-review.json"
import { Schema } from "effect"
import { ReviewQueueBootstrap } from "../src/review/model.ts"

const root = new URL("../../../content/authoring/compatibility/", import.meta.url)
const retained = (path: string) => readFileSync(new URL(
  `launch-v1-v4-artifacts/${path.replace("/content/vertical-slice/", "")}`, root
))
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex")

describe("retained version-4 question history", () => {
  it("activates all older inventories without duplicating the current release", () => {
    expect(previousReleaseInventories({ releaseId: "launch-v1", packVersion: 4 }).map(item => item.packVersion)).toEqual([3])
    expect(previousReleaseInventories({ releaseId: "launch-v1", packVersion: 5 }).map(item => item.packVersion)).toEqual([3, 4])
    expect(previousReleaseInventories({ releaseId: "another-release", packVersion: 5 })).toEqual([])
  })

  it("keeps the complete receipt inventory without recursively copying older releases", () => {
    const queue = Schema.decodeUnknownSync(ReviewQueueBootstrap)(archive.reviewQueue)
    expect(queue.questions).toHaveLength(91)
    expect(queue.practiceQuestions).toHaveLength(195)
    expect(queue.scenes).toHaveLength(18)
    expect(queue.previousInventories).toBeUndefined()
    for (const item of [...queue.questions, ...queue.practiceQuestions!]) {
      expect(item.receipt.releaseId).toBe(archive.releaseId)
      expect(item.receipt.packVersion).toBe(4)
    }
  })

  it("retains the exact original q091 stimulus and receipt-bound feedback", () => {
    const stimulus = archive.precommitReceipts.find(item => item.path.endsWith("/q091.precommit.json"))!
    const bytes = retained(stimulus.path)
    expect(bytes.byteLength).toBe(stimulus.bytes)
    expect(digest(bytes)).toBe(stimulus.sha256)
    const value = JSON.parse(bytes.toString())
    expect(value.id).toBe("q091")
    expect(value.version).toBe(1)
    const receipt = archive.reviewQueue.questions.find(item => item.id === "q091")!.receipt
    const feedback = retained(receipt.postcommitPath)
    expect(feedback.byteLength).toBe(receipt.postcommitBytes)
    expect(digest(feedback)).toBe(receipt.postcommitSha256)
    expect(JSON.parse(feedback.toString()).id).toBe("q091")
  })
})


describe("historical artifact publication", () => {
  const originalRecords = archive.reviewQueue.questions.flatMap(question => {
    const stimulus = archive.precommitReceipts.find(entry => entry.path.endsWith(`/${question.id}.precommit.json`))!
    return [
      { kind: "question-precommit" as const, itemId: question.id,
        path: stimulus.path.replace("/content/vertical-slice/", ""), bytes: stimulus.bytes, sha256: stimulus.sha256 },
      { kind: "question-postcommit" as const, itemId: question.id,
        path: question.receipt.postcommitPath.replace("/content/vertical-slice/", ""),
        bytes: question.receipt.postcommitBytes, sha256: question.receipt.postcommitSha256 }
    ]
  })
  const manifest = (records = originalRecords) => ({
    releaseId: "launch-v1", packVersion: 5,
    artifacts: [records[0]!, ...records.slice(1)] as const
  })

  it("reuses byte-identical history and retains both original files when q091 is revised", () => {
    expect(retainedQuestionArtifacts(manifest())).toEqual([])
    const revised = originalRecords.map(record => record.itemId === "q091"
      ? { ...record, path: record.path.replace("questions/", "questions/v2/"), sha256: "f".repeat(64) }
      : record)
    const result = retainedQuestionArtifacts(manifest(revised))
    expect(result.map(entry => entry.artifact.path)).toEqual([
      "questions/q091.precommit.json", "questions/q091.postcommit.json"
    ])
    for (const entry of result) {
      const bytes = readFileSync(entry.sourceUrl)
      expect(bytes.byteLength).toBe(entry.artifact.bytes)
      expect(digest(bytes)).toBe(entry.artifact.sha256)
      expect(entry.sourceUrl.pathname).toContain("launch-v1-v4-artifacts/")
    }
  })

  it("refuses to overwrite historical URLs even if the item ID is unchanged", () => {
    for (const change of [{ sha256: "f".repeat(64) }, { bytes: 1 }]) {
      const corrupted = originalRecords.map(record => record.itemId === "q091" ? { ...record, ...change } : record)
      expect(() => retainedQuestionArtifacts(manifest(corrupted))).toThrow("Historical artifact URL collision")
    }
  })
})
