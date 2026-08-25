import { describe, expect, it } from "vitest"
import { assertSafeBuildPaths } from "../scripts/finalize-service-worker.ts"
import {
  assertNoAnswerBearingFileNames,
  assertNoAnswerBearingStructuredFields,
  assertNoAnswerBearingText,
  assertProtectedServiceWorkerPolicy,
  decodeAndAssertHazardAssetReceipt,
  decodeAndAssertHazardReceipt,
  decodeAndAssertQuestionReceipt,
  extractServiceWorkerShellUrls
} from "../../../scripts/verify-artifacts.ts"

const serviceWorker = `
const shellUrls = ["/", "/styles.css"]
const isAppVerifiedContent = (request) => {
  const url = new URL(request.url)
  return url.origin === self.location.origin &&
    (url.pathname.endsWith(".postcommit.json") || url.pathname.startsWith("/content/assets/"))
}
self.addEventListener("fetch", (event) => {
  if (isAppVerifiedContent(event.request)) {
    event.respondWith(fetch(event.request))
    return
  }
})
`

const questionArtifact = {
  kind: "question-postcommit" as const,
  itemId: "question-1",
  path: "questions/question-1.postcommit.json",
  bytes: 101,
  sha256: "a".repeat(64)
}
const questionBinding = {
  artifact: questionArtifact,
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "release-1",
  position: 1,
  questionId: "question-1"
}
const questionReceipt = {
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "release-1",
  position: 1,
  postcommitPath: "/content/vertical-slice/questions/question-1.postcommit.json",
  postcommitBytes: 101,
  postcommitSha256: "a".repeat(64),
  questionId: "question-1"
}

const hazardArtifact = {
  kind: "scene-postcommit" as const,
  itemId: "scene-1",
  path: "scenes/scene-1.postcommit.json",
  bytes: 202,
  sha256: "b".repeat(64)
}
const hazardBinding = {
  artifact: hazardArtifact,
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "release-1",
  position: 1,
  sceneId: "scene-1",
  mode: "visual" as const,
  assetRevision: 1,
  assetMasterSha256: "c".repeat(64)
}
const hazardReceipt = {
  releaseId: "release-1",
  packVersion: 1,
  sessionId: "release-1",
  position: 1,
  postcommitPath: "/content/vertical-slice/scenes/scene-1.postcommit.json",
  postcommitBytes: 202,
  postcommitSha256: "b".repeat(64),
  sceneId: "scene-1",
  mode: "visual" as const,
  assetRevision: 1,
  assetMasterSha256: "c".repeat(64)
}

const webAsset = {
  path: "content/assets/derivatives/scenes/scene-1-web.png",
  bytes: 303,
  sha256: "d".repeat(64)
}
const assetReceipt = {
  path: "/content/assets/derivatives/scenes/scene-1-web.png",
  bytes: 303,
  sha256: "d".repeat(64)
}

describe("artifact leak guards", () => {
  it("rejects source maps and answer-bearing filenames", () => {
    expect(() => assertSafeBuildPaths(["assets/player.js.map"])).toThrow(/Source maps/)
    expect(() => assertSafeBuildPaths(["content/answer-key.json"])).toThrow(
      /Answer-bearing filename/
    )
    expect(() =>
      assertSafeBuildPaths([
        "content/vertical-slice/questions/q001.postcommit.json",
        "assets/player.js"
      ])
    ).not.toThrow()
  })

  it("rejects answer-bearing keys anywhere in initial structured data", () => {
    expect(() =>
      assertNoAnswerBearingStructuredFields(
        { scene: { neutralPreAnswer: {}, nested: [{ correctOptionId: "answer-a" }] } },
        "bootstrap"
      )
    ).toThrow(/bootstrap\.scene\.nested\[0\].*correctOptionId/)
    expect(() =>
      assertNoAnswerBearingStructuredFields(
        { questionId: "q001", postcommitPath: "/questions/q001.postcommit.json" },
        "receipt"
      )
    ).not.toThrow()
  })

  it("detects escaped answer material in text and filenames", () => {
    const secret = "Use the worker's guarded correction after commitment."
    expect(() =>
      assertNoAnswerBearingText(
        "<p>Use the worker&#39;s guarded correction after commitment.</p>",
        [secret],
        "initial HTML"
      )
    ).toThrow(/initial HTML embeds postcommit material/)
    expect(() =>
      assertNoAnswerBearingFileNames(
        ["assets/use-the-worker-s-guarded-correction-after-commitment.png"],
        [secret]
      )
    ).toThrow(/filename embeds postcommit material/)
  })
})

describe("embedded runtime receipt bindings", () => {
  it("accepts only receipts bound to the exact public item and asset records", () => {
    expect(
      decodeAndAssertQuestionReceipt(questionReceipt, questionBinding, "question receipt")
    ).toEqual(questionReceipt)
    expect(decodeAndAssertHazardReceipt(hazardReceipt, hazardBinding, "hazard receipt")).toEqual(
      hazardReceipt
    )
    expect(
      decodeAndAssertHazardAssetReceipt(
        assetReceipt,
        { deliveryAsset: webAsset, webDerivative: webAsset },
        "hazard asset receipt"
      )
    ).toEqual(assetReceipt)
  })

  it("rejects every altered question and hazard postcommit coordinate", () => {
    const alteredQuestions = [
      {
        ...questionReceipt,
        postcommitPath: "/content/vertical-slice/questions/question-2.postcommit.json"
      },
      { ...questionReceipt, postcommitBytes: questionReceipt.postcommitBytes + 1 },
      { ...questionReceipt, postcommitSha256: "e".repeat(64) }
    ]
    const alteredHazards = [
      {
        ...hazardReceipt,
        postcommitPath: "/content/vertical-slice/scenes/scene-2.postcommit.json"
      },
      { ...hazardReceipt, postcommitBytes: hazardReceipt.postcommitBytes + 1 },
      { ...hazardReceipt, postcommitSha256: "e".repeat(64) }
    ]

    for (const receipt of alteredQuestions) {
      expect(() =>
        decodeAndAssertQuestionReceipt(receipt, questionBinding, "question receipt")
      ).toThrow(/exact public question artifact/)
    }
    for (const receipt of alteredHazards) {
      expect(() =>
        decodeAndAssertHazardReceipt(receipt, hazardBinding, "hazard receipt")
      ).toThrow(/exact public scene artifact/)
    }
  })

  it("rejects altered visual asset coordinates and delivery-manifest drift", () => {
    const alteredAssets = [
      {
        ...assetReceipt,
        path: "/content/assets/derivatives/scenes/scene-2-web.png"
      },
      { ...assetReceipt, bytes: assetReceipt.bytes + 1 },
      { ...assetReceipt, sha256: "e".repeat(64) }
    ]
    for (const receipt of alteredAssets) {
      expect(() =>
        decodeAndAssertHazardAssetReceipt(
          receipt,
          { deliveryAsset: webAsset, webDerivative: webAsset },
          "hazard asset receipt"
        )
      ).toThrow(/exact public delivery asset/)
    }
    expect(() =>
      decodeAndAssertHazardAssetReceipt(
        assetReceipt,
        {
          deliveryAsset: webAsset,
          webDerivative: { ...webAsset, bytes: webAsset.bytes + 1 }
        },
        "hazard asset receipt"
      )
    ).toThrow(/exact public delivery asset/)
  })
})

describe("service-worker postcommit boundary", () => {
  it("allows the suffix only in the protected network bypass", () => {
    expect(extractServiceWorkerShellUrls(serviceWorker)).toEqual(["/", "/styles.css"])
    expect(() =>
      assertProtectedServiceWorkerPolicy(serviceWorker, new Set(["/", "/styles.css"]))
    ).not.toThrow()
  })

  it("rejects postcommit precaching and any second postcommit reference", () => {
    expect(() =>
      assertProtectedServiceWorkerPolicy(
        serviceWorker.replace(
          'const shellUrls = ["/", "/styles.css"]',
          'const shellUrls = ["/", "/content/vertical-slice/questions/q001.postcommit.json"]'
        ),
        new Set(["/", "/content/vertical-slice/questions/q001.postcommit.json"])
      )
    ).toThrow(/precache/)
    expect(() =>
      assertProtectedServiceWorkerPolicy(
        `${serviceWorker}\n// another .postcommit.json reference`,
        new Set(["/", "/styles.css"])
      )
    ).toThrow(/only in its verified-content network bypass/)
  })
})
