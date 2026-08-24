import { describe, expect, it } from "vitest"
import { Schema } from "effect"
import {
  ArtifactPathSegment,
  ArtifactManifestRecord,
  RepositoryContentPath,
  ReleaseArtifactPath
} from "../src/model.ts"

const decodeArtifactPathSegment = Schema.decodeUnknownSync(ArtifactPathSegment)
const decodeArtifactRecord = Schema.decodeUnknownSync(ArtifactManifestRecord)
const decodeContentPath = Schema.decodeUnknownSync(RepositoryContentPath)
const decodeReleasePath = Schema.decodeUnknownSync(ReleaseArtifactPath)

describe("artifact path contracts", () => {
  it.each(["launch-v1", "tool-selection-001", "scene.slip.hallway-wet-floor", "s001"])(
    "accepts an active artifact path segment: %s",
    (value) => expect(decodeArtifactPathSegment(value)).toBe(value)
  )

  it.each([
    "",
    ".",
    "..",
    "../outside",
    "/absolute",
    "questions/q-1",
    "q\\outside",
    "Q-1",
    "file:q-1",
    "https://example.test/q-1",
    "q%2foutside",
    "q%5coutside",
    "q?revision=other",
    "q#other"
  ])(
    "rejects an unsafe artifact path segment: %s",
    (value) => expect(() => decodeArtifactPathSegment(value)).toThrow()
  )

  it("accepts canonical content and release paths", () => {
    expect(decodeContentPath("content/assets/derivatives/scenes/s001-web.png")).toBe(
      "content/assets/derivatives/scenes/s001-web.png"
    )
    expect(
      decodeContentPath(
        "content/authoring/visuals/reviews/visual-pilot-v2/pipe-wrench-bakeoff/REVIEW.json"
      )
    ).toBe(
      "content/authoring/visuals/reviews/visual-pilot-v2/pipe-wrench-bakeoff/REVIEW.json"
    )
    expect(decodeReleasePath("questions/tool-selection-001.precommit.json")).toBe(
      "questions/tool-selection-001.precommit.json"
    )
  })

  it.each([
    "content/../outside.png",
    "content/assets/../../outside.png",
    "/content/assets/file.png",
    "content\\assets\\file.png",
    "content/assets//file.png",
    "content/assets/%2e%2e/outside.png",
    "content/assets/file%2fname.png",
    "content/assets/file%5cname.png",
    "content/assets/file.png?revision=other",
    "content/assets/file.png#other",
    "file:content/assets/file.png",
    "https://example.test/content/assets/file.png",
    "//server/content/assets/file.png"
  ])("rejects a traversal-bearing content path: %s", (value) => {
    expect(() => decodeContentPath(value)).toThrow()
  })

  it.each([
    "../manifest.json",
    "questions/../../manifest.json",
    "/questions/q-1.json",
    "questions\\q-1.json",
    "questions//q-1.json",
    "questions/%2e%2e/manifest.json",
    "questions/q-1%2foutside.json",
    "questions/q-1%5coutside.json",
    "questions/q-1.json?revision=other",
    "questions/q-1.json#other",
    "file:questions/q-1.json",
    "https://example.test/questions/q-1.json",
    "//server/questions/q-1.json"
  ])("rejects a traversal-bearing release path: %s", (value) => {
    expect(() => decodeReleasePath(value)).toThrow()
  })

  it("requires item IDs only for item-bound artifact kinds", () => {
    const digest = "0".repeat(64)
    expect(decodeArtifactRecord({
      kind: "catalog",
      path: "catalog.json",
      sha256: digest,
      bytes: 1
    })).toMatchObject({ kind: "catalog" })
    expect(decodeArtifactRecord({
      kind: "question-precommit",
      itemId: "q-1",
      path: "questions/q-1.precommit.json",
      sha256: digest,
      bytes: 1
    })).toMatchObject({ kind: "question-precommit", itemId: "q-1" })

    expect(() => decodeArtifactRecord({
      kind: "catalog",
      itemId: "q-1",
      path: "catalog.json",
      sha256: digest,
      bytes: 1
    })).toThrow()
    expect(() => decodeArtifactRecord({
      kind: "question-precommit",
      path: "questions/q-1.precommit.json",
      sha256: digest,
      bytes: 1
    })).toThrow()
  })
})
