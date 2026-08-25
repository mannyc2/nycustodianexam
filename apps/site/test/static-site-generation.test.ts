import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import type { ReleaseManifest } from "@nycustodian/content/model"
import { describe, expect, it } from "vitest"
import {
  escapeHtml,
  escapeJsonForHtml,
  isPublicReleaseArtifact,
  slugify
} from "../scripts/generate-pages.tsx"
import { canonicalizeGeneratedDocuments } from "../scripts/finalize-service-worker.ts"
import { discoverHtmlInputs } from "../vite.config.ts"
import {
  decodeAndAssertHazardAssetReceipt,
  decodeAndAssertHazardReceipt,
  decodeAndAssertQuestionReceipt,
  extractEmbeddedJson
} from "../../../scripts/verify-artifacts.ts"

type Artifact = typeof ReleaseManifest.Type["artifacts"][number]

const artifact = (kind: Artifact["kind"]): Artifact => {
  const record = {
    path: `${kind}.json`,
    sha256: "0".repeat(64),
    bytes: 1
  }
  if (kind === "catalog" || kind === "pack-precommit" || kind === "pack-postcommit") {
    return { kind, ...record }
  }
  return { kind, itemId: "item-1", ...record }
}

describe("static-site generator boundaries", () => {
  it("escapes text and embedded JSON in their distinct HTML contexts", () => {
    expect(escapeHtml(`<a title="x">Tom & 'Ada'</a>`)).toBe(
      "&lt;a title=&quot;x&quot;&gt;Tom &amp; &#39;Ada&#39;&lt;/a&gt;"
    )
    expect(escapeJsonForHtml({ value: "</script>\u2028next" })).toBe(
      '{"value":"\\u003c/script>\\u2028next"}'
    )
  })

  it("preserves exact item and asset receipts in generated runtime JSON inputs", () => {
    const questionArtifact = {
      kind: "question-postcommit" as const,
      itemId: "question-1",
      path: "questions/question-1.postcommit.json",
      bytes: 101,
      sha256: "a".repeat(64)
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
    const sceneArtifact = {
      kind: "scene-postcommit" as const,
      itemId: "scene-1",
      path: "scenes/scene-1.postcommit.json",
      bytes: 202,
      sha256: "b".repeat(64)
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
    const asset = {
      path: "content/assets/derivatives/scenes/scene-1-web.png",
      bytes: 303,
      sha256: "d".repeat(64)
    }
    const assetReceipt = { ...asset, path: `/${asset.path}` }
    const html = [
      `<script id="question-receipt-data" type="application/json">${escapeJsonForHtml(questionReceipt)}</script>`,
      `<script id="hazard-receipt-data" type="application/json">${escapeJsonForHtml(hazardReceipt)}</script>`,
      `<script id="hazard-asset-receipt-data" type="application/json">${escapeJsonForHtml(assetReceipt)}</script>`
    ].join("\n")

    expect(
      decodeAndAssertQuestionReceipt(
        extractEmbeddedJson(html, "question-receipt-data"),
        {
          artifact: questionArtifact,
          releaseId: "release-1",
          packVersion: 1,
          sessionId: "release-1",
          position: 1,
          questionId: "question-1"
        },
        "generated question receipt"
      )
    ).toEqual(questionReceipt)
    expect(
      decodeAndAssertHazardReceipt(
        extractEmbeddedJson(html, "hazard-receipt-data"),
        {
          artifact: sceneArtifact,
          releaseId: "release-1",
          packVersion: 1,
          sessionId: "release-1",
          position: 1,
          sceneId: "scene-1",
          mode: "visual",
          assetRevision: 1,
          assetMasterSha256: "c".repeat(64)
        },
        "generated hazard receipt"
      )
    ).toEqual(hazardReceipt)
    expect(
      decodeAndAssertHazardAssetReceipt(
        extractEmbeddedJson(html, "hazard-asset-receipt-data"),
        { deliveryAsset: asset, webDerivative: asset },
        "generated hazard asset receipt"
      )
    ).toEqual(assetReceipt)
  })

  it("derives stable public slugs", () => {
    expect(slugify("Combination/open-end/box wrench")).toBe(
      "combination-open-end-box-wrench"
    )
    expect(slugify("scope.entry-level")).toBe("scope-entry-level")
  })

  it("never selects the consolidated postcommit pack for publication", () => {
    expect(isPublicReleaseArtifact(artifact("pack-postcommit"))).toBe(false)
    expect(isPublicReleaseArtifact(artifact("pack-precommit"))).toBe(true)
    expect(isPublicReleaseArtifact(artifact("question-postcommit"))).toBe(true)
    expect(isPublicReleaseArtifact(artifact("scene-postcommit"))).toBe(true)
  })
})

describe("dynamic document discovery", () => {
  it("finds nested generated documents while excluding public and dist copies", async () => {
    const root = await mkdtemp(join(tmpdir(), "nycustodian-html-"))
    try {
      await mkdir(join(root, "atlas", "tool"), { recursive: true })
      await mkdir(join(root, "public"), { recursive: true })
      await mkdir(join(root, "dist"), { recursive: true })
      await writeFile(join(root, "index.html"), "home")
      await writeFile(join(root, "atlas", "tool", "index.html"), "tool")
      await writeFile(join(root, "public", "offline.html"), "offline")
      await writeFile(join(root, "dist", "stale.html"), "stale")

      const inputs = discoverHtmlInputs(root)
      expect(Object.keys(inputs).sort()).toEqual(["atlas__tool", "home"])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("canonicalizes every marked built document and leaves utility HTML alone", async () => {
    const root = await mkdtemp(join(tmpdir(), "nycustodian-canonical-"))
    try {
      await mkdir(join(root, "atlas"), { recursive: true })
      await writeFile(
        join(root, "atlas", "index.html"),
        '<body data-route-id="atlas-index"><!--__CANONICAL__/atlas/--></body>'
      )
      await writeFile(
        join(root, "404.html"),
        '<meta name="robots" content="noindex,follow"><body data-route-id="status"></body>'
      )
      await writeFile(join(root, "offline.html"), "<main>Offline</main>")

      await expect(canonicalizeGeneratedDocuments(root)).resolves.toEqual(["/atlas/"])
      expect(await readFile(join(root, "atlas", "index.html"), "utf8")).toContain(
        '<link rel="canonical" href="/atlas/">'
      )
      expect(await readFile(join(root, "offline.html"), "utf8")).toBe("<main>Offline</main>")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("rejects any routed non-canonical document except the root status page", async () => {
    const root = await mkdtemp(join(tmpdir(), "nycustodian-canonical-reject-"))
    try {
      await mkdir(join(root, "nested"), { recursive: true })
      await writeFile(join(root, "404.html"), '<body data-route-id="status"></body>')
      await writeFile(join(root, "nested", "index.html"), '<body data-route-id="status"></body>')

      await expect(canonicalizeGeneratedDocuments(root)).rejects.toThrow(/no canonical marker/)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
