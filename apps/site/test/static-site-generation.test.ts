import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import type { ReleaseManifest } from "@nycustodian/content/model"
import { describe, expect, it } from "vitest"
import {
  escapeHtml,
  escapeJsonForHtml,
  isPublicReleaseArtifact,
  printProfileBootstrap,
  renderProfileFact,
  renderSeriesScopeDisclaimer,
  slugify
} from "../scripts/generate-pages.tsx"
import {
  canonicalizeGeneratedDocuments,
  normalizeCanonicalOrigin,
  renderSitemap
} from "../scripts/finalize-service-worker.ts"
import { derivePracticeSessions } from "../scripts/practice-sessions.ts"
import { assertCanonicalRouteId } from "../src/route-registry.ts"
import { discoverHtmlInputs, scopedLocalSessionShell } from "../vite.config.ts"
import {
  decodeAndAssertHazardAssetReceipt,
  decodeAndAssertHazardReceipt,
  decodeAndAssertQuestionReceipt,
  assertNoQuestionSemanticLeak,
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

  it("renders all six profile fact states with sources and distinct profile/fact-sheet versions", () => {
    const sources = new Map([
      ["source-a", {
        id: "source-a",
        title: "Official source A",
        publisher: "Agency A",
        evidenceTier: "official-primary",
        version: "version A",
        locator: "section A",
        scope: "scope A",
        rightsNotes: "rights A"
      }],
      ["source-b", {
        id: "source-b",
        title: "Official source B",
        publisher: "Agency B",
        evidenceTier: "official-primary",
        version: "version B",
        locator: "section B",
        scope: "scope B",
        rightsNotes: "rights B",
        url: "https://agency-b.example/source"
      }]
    ]) as unknown as Parameters<typeof renderProfileFact>[4]
    const lines = new Map([
      ["line-a", {
        id: "line-a",
        sourceId: "source-a",
        locator: "page 1",
        excerpt: "First published value.",
        language: "en",
        verifiedOn: "2026-08-25",
        supportedClaimIds: ["claim-a"]
      }],
      ["line-b", {
        id: "line-b",
        sourceId: "source-b",
        locator: "page 2",
        excerpt: "Second published value.",
        language: "en",
        verifiedOn: "2026-08-25",
        supportedClaimIds: ["claim-b"]
      }]
    ]) as unknown as Parameters<typeof renderProfileFact>[3]
    const baseFact = {
      category: "counts",
      label: "Published count",
      appliesToExamNumbers: ["123"],
      reviewedOn: "2026-08-25",
      supersededByFactId: null
    }
    const facts = [
      ["verified", "Verified", {
        ...baseFact,
        id: "verified-count",
        state: "verified",
        value: "80",
        detail: null,
        effectiveFrom: "2026-06-18",
        effectiveThrough: null,
        sourceLineIds: ["line-a"],
        conflictingValues: []
      }],
      ["not_published", "Not published", {
        ...baseFact,
        id: "not-published-count",
        state: "not_published",
        value: null,
        detail: "No controlling value was published.",
        effectiveFrom: null,
        effectiveThrough: null,
        sourceLineIds: ["line-a"],
        conflictingValues: []
      }],
      ["unverified", "Unverified", {
        ...baseFact,
        id: "unverified-count",
        state: "unverified",
        value: null,
        detail: "The available record does not verify a value.",
        effectiveFrom: null,
        effectiveThrough: null,
        sourceLineIds: ["line-a"],
        conflictingValues: []
      }],
      ["conflicting", "Conflicting", {
        ...baseFact,
        id: "conflicting-count",
        state: "conflicting",
        value: null,
        detail: "The two controlling sources disagree.",
        effectiveFrom: null,
        effectiveThrough: null,
        sourceLineIds: [],
        conflictingValues: [
          { value: "80", sourceLineIds: ["line-a"] },
          { value: "90", sourceLineIds: ["line-b"] }
        ]
      }],
      ["superseded", "Superseded", {
        ...baseFact,
        id: "superseded-count",
        state: "superseded",
        value: "80",
        detail: "Replaced by the amended announcement.",
        effectiveFrom: "2026-06-11",
        effectiveThrough: "2026-06-17",
        sourceLineIds: ["line-a"],
        conflictingValues: [],
        supersededByFactId: "current-count"
      }],
      ["not_applicable", "Not applicable", {
        ...baseFact,
        id: "not-applicable-count",
        state: "not_applicable",
        value: null,
        detail: "This fact does not apply at the statewide layer.",
        effectiveFrom: null,
        effectiveThrough: null,
        sourceLineIds: ["line-a"],
        conflictingValues: []
      }]
    ] as const

    for (const [state, label, fact] of facts) {
      const html = renderProfileFact(
        fact as Parameters<typeof renderProfileFact>[0],
        7,
        4,
        lines,
        sources
      )
      expect(html).toContain(`data-fact-state="${state}"`)
      expect(html).toContain(`Status: ${label}`)
      expect(html).toContain("Official source A")
      expect(html).toContain("Exam 123 · reviewed 2026-08-25")
      expect(html).toContain("<summary>Technical details</summary>")
      expect(html).toContain("Profile version 7 · fact-sheet version 4")
      expect(html.indexOf("Profile version 7")).toBeGreaterThan(html.indexOf("Technical details"))
    }

    const conflictingHtml = renderProfileFact(
      facts[3][2] as Parameters<typeof renderProfileFact>[0],
      7,
      4,
      lines,
      sources
    )
    expect(conflictingHtml).toContain("Official source B")
    expect(conflictingHtml).toContain("No effective interval asserted")

    const supersededHtml = renderProfileFact(
      facts[4][2] as Parameters<typeof renderProfileFact>[0],
      7,
      4,
      lines,
      sources
    )
    expect(supersededHtml).toContain("Effective 2026-06-11 through 2026-06-17")
    expect(supersededHtml).toContain("current-count")
    expect(supersededHtml.indexOf("current-count")).toBeGreaterThan(
      supersededHtml.indexOf("Technical details")
    )

    const disclaimerHtml = renderSeriesScopeDisclaimer({
      version: 4,
      lastReviewedOn: "2026-08-25",
      seriesScopeDisclaimer: "This is not an official exam plan."
    })
    expect(disclaimerHtml).toContain("This is not an official exam plan.")
    expect(disclaimerHtml).toContain("Reviewed 2026-08-25.")
    expect(disclaimerHtml.indexOf("Fact-sheet version 4")).toBeGreaterThan(
      disclaimerHtml.indexOf("Technical details")
    )

    const printProfile = printProfileBootstrap(
      {
        id: "nassau",
        label: "Nassau Custodian",
        version: 7,
        jurisdiction: "Nassau County",
        compatibilityKey: "nassau-v7",
        disclaimer: "Original site-designed practice only.",
        announcementFactSheet: {
          schemaVersion: 2,
          version: 4,
          lastReviewedOn: "2026-08-25",
          controllingDocumentNotice: "The controlling announcement governs.",
          seriesScopeDisclaimer: "This is not an official exam plan.",
          facts: facts.map(([, , fact]) => fact),
          changeHistory: [{
            version: 4,
            changedOn: "2026-08-25",
            summary: "Preserved all six fact states.",
            sourceLineIds: ["line-a"]
          }]
        }
      } as unknown as Parameters<typeof printProfileBootstrap>[0],
      lines,
      sources
    )
    const printFactSheet = printProfile.announcementFactSheet
    if (printFactSheet === null) throw new Error("Expected a printable fact sheet")

    expect(printProfile.schemaVersion).toBe(2)
    expect(printProfile.version).toBe(7)
    expect(printFactSheet.schemaVersion).toBe(2)
    expect(printFactSheet.facts.map((fact) => fact.state)).toEqual(
      facts.map(([, , fact]) => fact.state)
    )
    expect(printFactSheet).not.toHaveProperty("verifiedFacts")
    expect(printFactSheet).not.toHaveProperty("explicitUnknowns")
    expect(printFactSheet.sourceLines).toEqual([
      {
        id: "line-a",
        sourceId: "source-a",
        title: "Official source A",
        publisher: "Agency A",
        evidenceTier: "official-primary",
        version: "version A",
        rightsNotes: "rights A",
        locator: "page 1",
        excerpt: "First published value.",
        language: "en",
        verifiedOn: "2026-08-25",
        supportedClaimIds: ["claim-a"]
      },
      {
        id: "line-b",
        sourceId: "source-b",
        title: "Official source B",
        publisher: "Agency B",
        evidenceTier: "official-primary",
        version: "version B",
        rightsNotes: "rights B",
        locator: "page 2",
        excerpt: "Second published value.",
        language: "en",
        verifiedOn: "2026-08-25",
        supportedClaimIds: ["claim-b"],
        url: "https://agency-b.example/source"
      }
    ])
    expect(printFactSheet.changeHistory).toEqual([{
      version: 4,
      changedOn: "2026-08-25",
      summary: "Preserved all six fact states.",
      sourceLineIds: ["line-a"]
    }])
    expect(() => printProfileBootstrap(
      {
        id: "nassau",
        label: "Nassau Custodian",
        version: 7,
        jurisdiction: "Nassau County",
        compatibilityKey: "nassau-v7",
        disclaimer: "Original site-designed practice only.",
        announcementFactSheet: {
          schemaVersion: 2,
          version: 4,
          lastReviewedOn: "2026-08-25",
          controllingDocumentNotice: "The controlling announcement governs.",
          seriesScopeDisclaimer: "This is not an official exam plan.",
          facts: facts.map(([, , fact]) => fact),
          changeHistory: [{
            version: 4,
            changedOn: "2026-08-25",
            summary: "Preserved all six fact states.",
            sourceLineIds: ["line-a"]
          }]
        }
      } as unknown as Parameters<typeof printProfileBootstrap>[0],
      new Map(),
      sources
    )).toThrow(/missing source line line-a/)

    expect(printProfileBootstrap(
      {
        id: "statewide",
        label: "Statewide series",
        version: 3,
        jurisdiction: "New York State",
        compatibilityKey: "statewide-v3",
        disclaimer: "Series layer only.",
        announcementFactSheet: null
      } as unknown as Parameters<typeof printProfileBootstrap>[0],
      new Map(),
      new Map()
    )).toEqual({
      schemaVersion: 2,
      id: "statewide",
      label: "Statewide series",
      version: 3,
      jurisdiction: "New York State",
      compatibilityKey: "statewide-v3",
      disclaimer: "Series layer only.",
      announcementFactSheet: null
    })
  })
})

describe("advertised practice-session derivation", () => {
  const questions = Array.from({ length: 90 }, (_, index) => ({
    value: {
      id: `question-${String(index + 1).padStart(3, "0")}`,
      profileIds: ["nassau"],
      memberships: [{
        filterKind: "domain" as const,
        filterValue: index < 47 ? "minor-maintenance-and-repair" : "cleaning-tools-and-uses"
      }]
    }
  }))

  it("builds stable 45/60/90 sets without hidden repeats", () => {
    const input = {
      releaseId: "launch-v1",
      packVersion: 2,
      profile: { id: "nassau", version: 1, compatibilityKey: "nassau-v1" },
      questions,
      records: [
        {
          profileId: "nassau",
          filterKind: "all" as const,
          filterValue: "all",
          questionCount: 90,
          availableSetLengths: [45, 60, 90] as const
        }
      ]
    }
    const first = derivePracticeSessions(input)
    const second = derivePracticeSessions(input)
    const nextPack = derivePracticeSessions({ ...input, packVersion: 3 })
    const nextProfile = derivePracticeSessions({
      ...input,
      profile: { ...input.profile, version: 2 }
    })

    expect(first.map((session) => session.length)).toEqual([45, 60, 90])
    expect(first).toEqual(second)
    expect(first.map((session) => session.id)).not.toEqual(
      nextPack.map((session) => session.id)
    )
    expect(first.map((session) => session.id)).not.toEqual(
      nextProfile.map((session) => session.id)
    )
    for (const session of first) {
      const ids = session.questions.map(({ value }) => value.id)
      expect(ids).toHaveLength(session.length)
      expect(new Set(ids).size).toBe(session.length)
    }
  })

  it("omits unsupported filtered lengths and rejects capacity drift", () => {
    expect(
      derivePracticeSessions({
        releaseId: "launch-v1",
        packVersion: 2,
        profile: { id: "nassau", version: 1, compatibilityKey: "nassau-v1" },
        questions,
        records: [
          {
            profileId: "nassau",
            filterKind: "domain",
            filterValue: "cleaning-tools-and-uses",
            questionCount: 43,
            availableSetLengths: []
          }
        ]
      })
    ).toEqual([])

    expect(() =>
      derivePracticeSessions({
        releaseId: "launch-v1",
        packVersion: 2,
        profile: { id: "nassau", version: 1, compatibilityKey: "nassau-v1" },
        questions,
        records: [
          {
            profileId: "nassau",
            filterKind: "domain",
            filterValue: "minor-maintenance-and-repair",
            questionCount: 46,
            availableSetLengths: [45]
          }
        ]
      })
    ).toThrow(/Practice capacity drift/)
  })
})

describe("standalone question leak boundary", () => {
  const catalog = {
    tools: [
      {
        conceptId: "tool.pipe-wrench",
        canonicalTerm: "Pipe wrench",
        domain: "minor-maintenance-and-repair",
        family: "pipe-wrenches"
      },
      {
        conceptId: "tool.adjustable-wrench",
        canonicalTerm: "Adjustable wrench",
        domain: "minor-maintenance-and-repair",
        family: "general-wrenches"
      }
    ],
    comparisons: [{
      id: "comparison.pipe-adjustable-wrench",
      memberIds: ["tool.pipe-wrench", "tool.adjustable-wrench"]
    }]
  } as unknown as Parameters<typeof assertNoQuestionSemanticLeak>[2]
  const postcommit = {
    id: "q001",
    optionConceptIds: [
      { optionId: "a", conceptId: "tool.pipe-wrench" },
      { optionId: "b", conceptId: "tool.adjustable-wrench" }
    ],
    correctOptionId: "a"
  } as unknown as Parameters<typeof assertNoQuestionSemanticLeak>[1]
  const precommit = {
    schemaVersion: 2,
    id: "q001",
    version: 1,
    profileId: "nassau",
    profileIds: ["nassau"],
    prompt: "Which tool best fits the stated task?",
    options: [
      { id: "a", label: "Pipe wrench" },
      { id: "b", label: "Adjustable wrench" }
    ],
    memberships: [{
      filterKind: "domain",
      filterValue: "minor-maintenance-and-repair"
    }]
  }

  it("accepts only metadata shared by every displayed option", () => {
    expect(() =>
      assertNoQuestionSemanticLeak(precommit, postcommit, catalog, [
        "questions/q001.precommit.json",
        "ps-0123456789abcdef01234567"
      ])
    ).not.toThrow()
  })

  it("rejects semantic public coordinates and singleton option joins", () => {
    expect(() =>
      assertNoQuestionSemanticLeak(precommit, postcommit, catalog, [
        "questions/pipe-wrench/q001"
      ])
    ).toThrow(/semantic concept/)
    expect(() =>
      assertNoQuestionSemanticLeak({
        ...precommit,
        memberships: [{ filterKind: "family", filterValue: "pipe-wrenches" }]
      }, postcommit, catalog)
    ).toThrow(/not shared by every displayed option/)
    expect(() =>
      assertNoQuestionSemanticLeak(
        { ...precommit, id: "q-pipe-wrench" },
        { ...postcommit, id: "q-pipe-wrench" },
        catalog
      )
    ).toThrow(/opaque public question id/)
  })
})

describe("canonical route registry", () => {
  it("rejects removed comparison document identities", () => {
    expect(() => assertCanonicalRouteId("atlas-comparison")).toThrow(
      /Unknown canonical route id/
    )
    expect(() => assertCanonicalRouteId("atlas-family")).not.toThrow()
  })
})

describe("dynamic document discovery", () => {
  it("keeps local Vite shell mapping at the Worker GET/HEAD-only boundary", () => {
    const path = "/simulations/session/sim-abcdefgh/question/2/?local=1"
    expect(scopedLocalSessionShell("GET", path)).toBe(
      "/simulations/session/sim-shell0000/question/1/"
    )
    expect(scopedLocalSessionShell("HEAD", path)).toBe(
      "/simulations/session/sim-shell0000/question/1/"
    )
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      expect(scopedLocalSessionShell(method, path), method).toBeUndefined()
    }
  })

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

  it("uses an approved HTTPS origin for production canonicals and sitemap entries", async () => {
    const root = await mkdtemp(join(tmpdir(), "nycustodian-canonical-origin-"))
    try {
      await mkdir(join(root, "atlas"), { recursive: true })
      await writeFile(
        join(root, "atlas", "index.html"),
        '<body data-route-id="atlas-index"><!--__CANONICAL__/atlas/--></body>'
      )

      await expect(
        canonicalizeGeneratedDocuments(root, "https://study.example")
      ).resolves.toEqual(["/atlas/"])
      expect(await readFile(join(root, "atlas", "index.html"), "utf8")).toContain(
        '<link rel="canonical" href="https://study.example/atlas/">'
      )
      expect(renderSitemap(["/", "/atlas/"], "https://study.example")).toContain(
        "<loc>https://study.example/atlas/</loc>"
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("rejects a canonical URL that is not an exact HTTPS origin", () => {
    expect(() => normalizeCanonicalOrigin("http://example.test")).toThrow(/HTTPS origin/)
    expect(() => normalizeCanonicalOrigin("https://example.test/path")).toThrow(/HTTPS origin/)
    expect(normalizeCanonicalOrigin("https://example.test/")).toBe("https://example.test")
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
