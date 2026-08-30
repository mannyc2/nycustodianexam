import { createHash } from "node:crypto"
import { cp, mkdir, rm } from "node:fs/promises"
import {
  CatalogArtifact,
  PrecommitPackArtifact,
  PrecommitQuestion,
  PrecommitScene,
  ReleaseManifest
} from "@nycustodian/content/model"
import { Schema } from "effect"
import {
  hazardAttemptId,
  questionAttemptId,
  type HazardAttemptReceipt,
  type QuestionAttemptReceipt
} from "../src/attempt-receipt.ts"
import {
  derivePublicDeliveryManifest,
  isPublicReleaseArtifact
} from "../src/delivery-manifest.ts"
import type { AssetContentReceipt } from "../src/verified-content.ts"
import {
  OfflinePackDescriptor,
  assertClosedOfflinePackDescriptor
} from "../src/offline-packs/model.ts"
import { SimulationBootstrap } from "../src/simulation/model.ts"
import { PrintBuilderBootstrap } from "../src/print/model.ts"
import {
  catalogToolEvidenceTierLabel,
  toolScopeStatusLabel
} from "../src/public-content-labels.ts"
import { decodeSettingsBootstrap } from "../src/settings/model.ts"
import { decodeTrustedReleaseContentRegistry } from "../src/trusted-release-content.ts"
import { trustedCurrentShellNavigation } from "../src/shell-route-policy.ts"
import {
  assertCanonicalRouteId,
  type RouteId
} from "../src/route-registry.ts"
import { derivePracticeSessions } from "./practice-sessions.ts"

export { isPublicReleaseArtifact } from "../src/delivery-manifest.ts"

const repositoryRoot = new URL("../../../", import.meta.url)
const siteRoot = new URL("../", import.meta.url)
const releaseRoot = new URL("content/releases/vertical-slice/", repositoryRoot)

type Catalog = typeof CatalogArtifact.Type
type CatalogTool = Catalog["tools"][number]
type CatalogComparison = Catalog["comparisons"][number]
type ContentSource = Catalog["sources"][number]
type Manifest = typeof ReleaseManifest.Type
type ManifestArtifact = Manifest["artifacts"][number]
type Question = typeof PrecommitQuestion.Type
type Scene = typeof PrecommitScene.Type

// M4 accepts the current compiler's singular compatibility field while keeping
// the bootstrap boundary ready for the authored multi-profile question model.
const questionProfileIds = (question: Question): ReadonlyArray<string> => {
  const compatibility = question as unknown as {
    readonly profileId?: unknown
    readonly profileIds?: unknown
  }
  if (
    Array.isArray(compatibility.profileIds) &&
    compatibility.profileIds.length > 0 &&
    compatibility.profileIds.every((value): value is string =>
      typeof value === "string" && value.length > 0
    )
  ) {
    return [...new Set(compatibility.profileIds)]
  }
  if (typeof compatibility.profileId === "string" && compatibility.profileId.length > 0) {
    return [compatibility.profileId]
  }
  throw new Error(`Question ${question.id} has no profile compatibility coordinate`)
}

type NavSection = "atlas" | "exams" | "hazards" | "home" | "practice" | "transparency" | "utility"

interface PageDefinition {
  readonly body: string
  readonly canonicalPath: string
  readonly description: string
  readonly relativePath: string
  readonly robots: "index,follow" | "noindex,follow"
  readonly routeId: RouteId
  readonly section: NavSection
  readonly title: string
}

export const escapeJsonForHtml = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")

export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

export const slugify = (value: string): string => {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (slug.length === 0) throw new Error(`Cannot derive a URL slug from ${JSON.stringify(value)}`)
  return slug
}

const assertUniqueSlugs = (entries: readonly { readonly id: string; readonly slug: string }[]): void => {
  const seen = new Map<string, string>()
  for (const entry of entries) {
    const previous = seen.get(entry.slug)
    if (previous !== undefined) {
      throw new Error(`URL slug collision for ${previous} and ${entry.id}: ${entry.slug}`)
    }
    seen.set(entry.slug, entry.id)
  }
}

const assertSafeRelativePath = (path: string): void => {
  if (
    path.startsWith("/") ||
    path.includes("\\") ||
    path.split("/").some((segment) => segment === "" || segment === "." || segment === "..") ||
    !/^[a-zA-Z0-9._/-]+$/.test(path)
  ) {
    throw new Error(`Release manifest contains an unsafe path: ${path}`)
  }
}

const bytesFor = async (url: URL): Promise<Uint8Array> =>
  new Uint8Array(await Bun.file(url).arrayBuffer())

const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex")

const assertManifestRecord = async (
  record: Pick<ManifestArtifact, "bytes" | "path" | "sha256">,
  source: URL
): Promise<void> => {
  assertSafeRelativePath(record.path)
  const bytes = await bytesFor(source)
  if (bytes.byteLength !== record.bytes || sha256(bytes) !== record.sha256) {
    throw new Error(`Release file does not match its manifest record: ${record.path}`)
  }
}

const readJson = async (url: URL): Promise<unknown> => JSON.parse(await Bun.file(url).text())

const currentPage = (current: NavSection, candidate: NavSection): string =>
  current === candidate ? ' aria-current="page"' : ""

const header = (section: NavSection): string => `
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="/">NY Custodian Exam</a>
      <nav class="site-nav" aria-label="Primary">
        <a${currentPage(section, "exams")} href="/exams/">Exam profile</a>
        <a${currentPage(section, "atlas")} href="/atlas/">Study tools</a>
        <a${currentPage(section, "practice")} href="/practice/">Practice</a>
        <a${currentPage(section, "hazards")} href="/hazards/">Hazards</a>
        <a${currentPage(section, "transparency")} href="/transparency/">Sources and methods</a>
        <a href="/offline/">Use offline</a>
        <a href="/settings/">Settings</a>
      </nav>
    </div>
  </header>`

const footer = `
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p>Independent study project. Not affiliated with or endorsed by New York City or New York State.</p>
      <nav aria-label="Site policies"><a href="/report/">Report a correction</a> · <a href="/transparency/privacy/">Privacy</a> · <a href="/transparency/security/">Security</a></nav>
    </div>
  </footer>`

const connectivityNotice = `
  <p class="connectivity-notice" data-connectivity-notice role="status" aria-live="polite">
    <span data-connectivity-message="offline">You are offline. You can keep studying with the copy saved on this device; it may be out of date, and outside links will not open.</span>
    <span data-connectivity-message="stale-online">You are back online, but this saved copy may be out of date. Reload the page to get the current version before relying on outside sources.</span>
  </p>`

const document = ({
  body,
  canonicalPath,
  description,
  robots,
  routeId,
  section,
  title
}: Omit<PageDefinition, "relativePath">): string => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <!--__CANONICAL__${canonicalPath}-->
  <link rel="manifest" href="/manifest.webmanifest">
  <script type="module" src="/src/settings/preferences-boot.ts"></script>
  <link rel="stylesheet" href="/styles.css">
  <title>${escapeHtml(title)}</title>
</head>
<body data-route-id="${routeId}">
<a class="skip-link" href="#main-content">Skip to main content</a>
${connectivityNotice}
${header(section)}
${body}
${footer}
</body>
</html>
`

const statusRecovery = (heading: string, detail: string): string => `
  <main class="page-shell" id="main-content" tabindex="-1">
    <section class="hero">
      <p class="eyebrow">Study-site status</p>
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(detail)}</p>
    </section>
    <section class="card-grid" aria-label="Recovery options">
      <article class="card"><h2>Return home</h2><p>Use the published navigation rather than guessing another address.</p><a href="/">Open the study home</a></article>
      <article class="card"><h2>Continue studying</h2><p>Open the current practice and reference entry points.</p><a href="/practice/">Open practice</a></article>
      <article class="card"><h2>Check sources</h2><p>Review what the current release supports and where it came from.</p><a href="/transparency/">Open sources and methods</a></article>
      <article class="card"><h2>Offline and settings</h2><p>Manage offline downloads or export your local study data.</p><a href="/offline/">Use offline</a> · <a href="/settings/">Open settings</a></article>
    </section>
  </main>`

const notFoundDocument = (): string => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="The requested NY Custodian Exam Study page was not found.">
  <meta name="robots" content="noindex,follow">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="stylesheet" href="/styles.css">
  <title>Page not found — NY Custodian Exam Study</title>
</head>
<body data-route-id="status">
<a class="skip-link" href="#main-content">Skip to main content</a>
${header("home")}
${statusRecovery(
  "That study page was not found.",
  "The requested address does not match a published page in this release. No substitute content was selected."
)}
${footer}
</body>
</html>
`

const breadcrumb = (items: readonly { readonly href?: string; readonly label: string }[]): string => `
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>${items.map((item) => `<li>${item.href === undefined ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a>`}</li>`).join("")}</ol>
  </nav>`

const derivativePath = (
  item: CatalogTool | CatalogComparison | Scene,
  kind: "phone" | "print" | "web"
): string => {
  const derivative = item.asset.derivatives.find((candidate) => candidate.kind === kind)
  if (derivative === undefined) throw new Error(`${item.asset.opaqueAssetId} has no ${kind} derivative`)
  return `/${derivative.path}`
}

const visualAssetReceipt = (scene: Scene): AssetContentReceipt => {
  const derivative = scene.asset.derivatives.find((candidate) => candidate.kind === "web")
  if (derivative === undefined) {
    throw new Error(`${scene.asset.opaqueAssetId} has no exact web derivative receipt`)
  }
  return {
    path: `/${derivative.path}`,
    bytes: derivative.bytes,
    sha256: derivative.sha256
  }
}

const printAssetReceipt = (value: CatalogTool | Scene): AssetContentReceipt => {
  const derivative = value.asset.derivatives.find((candidate) => candidate.kind === "print")
  if (derivative === undefined) {
    throw new Error(`${value.asset.opaqueAssetId} has no exact print derivative receipt`)
  }
  return {
    path: `/${derivative.path}`,
    bytes: derivative.bytes,
    sha256: derivative.sha256
  }
}

const sourceLinks = (sourceIds: readonly string[], sourceById: ReadonlyMap<string, ContentSource>): string => `
  <ul class="link-list">${sourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId)
    if (source === undefined) throw new Error(`Catalog references missing source ${sourceId}`)
    return `<li><a href="/transparency/sources/${slugify(source.id)}/">${escapeHtml(source.title)}</a></li>`
  }).join("")}</ul>`

const sourceLineLinks = (
  sourceLineIds: readonly string[],
  sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>,
  sourceById: ReadonlyMap<string, ContentSource>
): string => `
  <ul class="link-list">${sourceLineIds.map((sourceLineId) => {
    const line = sourceLineById.get(sourceLineId)
    if (line === undefined) throw new Error(`Profile references missing source line ${sourceLineId}`)
    const source = sourceById.get(line.sourceId)
    if (source === undefined) throw new Error(`Source line ${sourceLineId} references missing source`)
    return `<li><a href="/transparency/sources/${slugify(source.id)}/">${escapeHtml(source.title)}</a><span><code>${escapeHtml(line.locator)}</code> — ${escapeHtml(line.excerpt)}</span></li>`
  }).join("")}</ul>`

const capitalize = (value: string): string =>
  value.length === 0 ? value : `${value[0]?.toUpperCase()}${value.slice(1)}`

const practiceDomainLabels: Readonly<Record<string, string>> = {
  "cleaning-tools-and-uses": "Cleaning tools and uses",
  "health-and-safety": "Health and safety",
  "minor-maintenance-and-repair": "Minor maintenance and repair"
}

const layerLabel = (layer: string): string =>
  layer === "statewide-series"
    ? "Statewide series"
    : layer === "jurisdiction"
      ? "Jurisdiction-specific profile"
      : layer

const factStateLabel = (
  state: "conflicting" | "not_applicable" | "not_published" | "superseded" | "unverified" | "verified"
): string => ({
  verified: "Verified",
  not_published: "Not published",
  unverified: "Unverified",
  conflicting: "Conflicting",
  superseded: "Superseded",
  not_applicable: "Not applicable"
})[state]

export const renderProfileFact = (
  fact: NonNullable<Catalog["profiles"][number]["announcementFactSheet"]>["facts"][number],
  profileVersion: number,
  factSheetVersion: number,
  sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>,
  sourceById: ReadonlyMap<string, ContentSource>
): string => {
  const directEvidence = fact.sourceLineIds.length === 0
    ? ""
    : sourceLineLinks(fact.sourceLineIds, sourceLineById, sourceById)
  const conflictingEvidence = fact.conflictingValues.length === 0
    ? ""
    : `<ol class="link-list">${fact.conflictingValues.map((candidate) => `<li><strong>${escapeHtml(candidate.value)}</strong>${sourceLineLinks(candidate.sourceLineIds, sourceLineById, sourceById)}</li>`).join("")}</ol>`
  const effectiveWindow = fact.effectiveFrom === null
    ? "No effective interval asserted."
    : fact.effectiveThrough === null
      ? `Effective from ${escapeHtml(fact.effectiveFrom)}.`
      : `Effective ${escapeHtml(fact.effectiveFrom)} through ${escapeHtml(fact.effectiveThrough)}.`
  const appliesTo = fact.appliesToExamNumbers.join(", ")
  return `<dt>${escapeHtml(fact.label)}</dt><dd data-fact-state="${fact.state}"><p><span class="fact-state fact-state-${fact.state}">Status: ${factStateLabel(fact.state)}</span></p><p>${escapeHtml(fact.value ?? fact.detail ?? "No value asserted.")}</p>${conflictingEvidence}${directEvidence}<p class="source-note">Exam ${escapeHtml(appliesTo)} · reviewed ${escapeHtml(fact.reviewedOn)} · ${effectiveWindow}</p><details class="source-note"><summary>Technical details</summary><p>Profile version ${profileVersion} · fact-sheet version ${factSheetVersion}.${fact.supersededByFactId === null ? "" : ` Replaced by fact <code>${escapeHtml(fact.supersededByFactId)}</code>.`}</p></details></dd>`
}

export const renderSeriesScopeDisclaimer = (
  factSheet: Pick<
    NonNullable<Catalog["profiles"][number]["announcementFactSheet"]>,
    "lastReviewedOn" | "seriesScopeDisclaimer" | "version"
  >
): string => `<section class="source-note section-gap"><h2>Series and scope disclaimer</h2><p>${escapeHtml(factSheet.seriesScopeDisclaimer)}</p><p>Reviewed ${escapeHtml(factSheet.lastReviewedOn)}.</p><details><summary>Technical details</summary><p>Fact-sheet version ${factSheet.version}.</p></details></section>`

const externalSourceLink = (source: ContentSource): string => {
  if (source.url === undefined) return ""
  try {
    const parsed = new URL(source.url)
    if (parsed.protocol !== "https:") return ""
    return `<p><a data-network-only-link href="${escapeHtml(parsed.href)}" rel="external noopener">Open the public source</a><span class="network-only-status" data-network-only-status> This external source is unavailable until a fresh online page loads.</span></p>`
  } catch {
    return ""
  }
}

export const printAnnouncementFactSheet = (
  profile: Catalog["profiles"][number],
  sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>,
  sourceById: ReadonlyMap<string, ContentSource>
) => {
  const factSheet = profile.announcementFactSheet
  if (factSheet === null) return null
  const referencedSourceLineIds = [
    ...factSheet.facts.flatMap((fact) => [
      ...fact.sourceLineIds,
      ...fact.conflictingValues.flatMap((candidate) => candidate.sourceLineIds)
    ]),
    ...factSheet.changeHistory.flatMap((change) => change.sourceLineIds)
  ].filter((sourceLineId, index, values) => values.indexOf(sourceLineId) === index)
  const sourceLines = referencedSourceLineIds.map((sourceLineId) => {
    const sourceLine = sourceLineById.get(sourceLineId)
    if (sourceLine === undefined) {
      throw new Error(`Announcement profile fact sheet references missing source line ${sourceLineId}`)
    }
    const source = sourceById.get(sourceLine.sourceId)
    if (source === undefined) {
      throw new Error(`Announcement profile fact sheet references missing source ${sourceLine.sourceId}`)
    }
    return {
      id: sourceLine.id,
      sourceId: source.id,
      title: source.title,
      publisher: source.publisher,
      evidenceTier: source.evidenceTier,
      version: source.version,
      rightsNotes: source.rightsNotes,
      locator: sourceLine.locator,
      excerpt: sourceLine.excerpt,
      language: sourceLine.language,
      verifiedOn: sourceLine.verifiedOn,
      supportedClaimIds: sourceLine.supportedClaimIds,
      ...(source.url === undefined ? {} : { url: source.url })
    }
  })
  return {
    schemaVersion: 2 as const,
    version: factSheet.version,
    lastReviewedOn: factSheet.lastReviewedOn,
    controllingDocumentNotice: factSheet.controllingDocumentNotice,
    seriesScopeDisclaimer: factSheet.seriesScopeDisclaimer,
    facts: factSheet.facts.map((fact) => ({
      id: fact.id,
      category: fact.category,
      label: fact.label,
      state: fact.state,
      appliesToExamNumbers: fact.appliesToExamNumbers,
      value: fact.value,
      detail: fact.detail,
      reviewedOn: fact.reviewedOn,
      effectiveFrom: fact.effectiveFrom,
      effectiveThrough: fact.effectiveThrough,
      sourceLineIds: fact.sourceLineIds,
      conflictingValues: fact.conflictingValues.map((candidate) => ({
        value: candidate.value,
        sourceLineIds: candidate.sourceLineIds
      })),
      supersededByFactId: fact.supersededByFactId
    })),
    sourceLines,
    changeHistory: factSheet.changeHistory.map((change) => ({
      version: change.version,
      changedOn: change.changedOn,
      summary: change.summary,
      sourceLineIds: change.sourceLineIds
    }))
  }
}

export const printProfileBootstrap = (
  profile: Catalog["profiles"][number],
  sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>,
  sourceById: ReadonlyMap<string, ContentSource>
) => ({
  schemaVersion: 2 as const,
  id: profile.id,
  label: profile.label,
  version: profile.version,
  jurisdiction: profile.jurisdiction,
  compatibilityKey: profile.compatibilityKey,
  disclaimer: profile.disclaimer,
  announcementFactSheet: printAnnouncementFactSheet(profile, sourceLineById, sourceById)
})

const renderQuestionFallback = (question: Question, position: number, count: number): string => `
      <article class="question-card" aria-labelledby="question-heading">
        <header class="question-prompt">
          <p class="eyebrow">Question ${position} of ${count}</p>
          <h1 id="question-heading">${escapeHtml(question.prompt)}</h1>
          <p>Select one answer — you can change it until you submit. Submitting locks your answer, and the explanation opens only after it is saved on this device.</p>
        </header>
        <fieldset disabled>
          <legend class="sr-only">Answer choices</legend>
          <div class="answer-list">
            ${question.options.map((option) => `<label class="answer-option"><input disabled name="answer-fallback" type="radio" value="${escapeHtml(option.id)}"><span>${escapeHtml(option.label)}</span></label>`).join("\n            ")}
          </div>
        </fieldset>
        <p class="source-note">Interactive practice needs JavaScript. The study references remain available without it.</p>
      </article>`

const questionPage = ({
  canonicalPath,
  context = "practice",
  count,
  nextPath,
  position,
  previousPath,
  question,
  receipt,
  routeId = "question-player"
}: {
  readonly canonicalPath: string
  readonly context?: "practice" | "review"
  readonly count: number
  readonly nextPath?: string
  readonly position: number
  readonly previousPath?: string
  readonly question: Question
  readonly receipt: QuestionAttemptReceipt
  readonly routeId?: "question-player" | "review-player"
}): PageDefinition => ({
  canonicalPath,
  relativePath: `${canonicalPath.slice(1)}index.html`,
  title: `Question ${position} of ${count} — NY Custodian Exam`,
  description: "An original practice question. Your answer is saved on this device before the explanation appears.",
  robots: "noindex,follow",
  routeId,
  section: "practice",
  body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: context === "review" ? "/review/" : "/practice/", label: context === "review" ? "Review queue" : "Practice" }, { label: `Question ${position}` }])}
    ${context === "review" ? '<p class="source-note review-notice"><strong>Saved feedback:</strong> opening this item does not finish it or remove it from your review queue. When you are done, return to Review and choose Finish review.</p>' : ""}
    <div data-question-player data-island="question-player-bootstrap" data-question-attempt-id="${escapeHtml(questionAttemptId(receipt))}" data-postcommit-url="${escapeHtml(receipt.postcommitPath)}">${renderQuestionFallback(question, position, count)}</div>
    <nav class="directional-nav" aria-label="Question navigation">
      ${previousPath === undefined ? "<span></span>" : `<a data-session-history="replace" href="${previousPath}">← Previous question</a>`}
      ${nextPath === undefined ? "<span>End of session</span>" : `<a data-session-history="replace" href="${nextPath}">Next question →</a>`}
    </nav>
  </main>
  <script id="question-data" type="application/json">${escapeJsonForHtml(question)}</script>
  <script id="question-receipt-data" type="application/json">${escapeJsonForHtml(receipt)}</script>
  <script type="module" src="/src/question-player/react/bootstrap.tsx"></script>`
})

const hazardPage = ({
  canonicalPath,
  count,
  mode,
  nextPath,
  position,
  previousPath,
  receipt,
  scene
}: {
  readonly canonicalPath: string
  readonly count: number
  readonly mode: "nonvisual" | "visual"
  readonly nextPath?: string
  readonly position: number
  readonly previousPath?: string
  readonly receipt: HazardAttemptReceipt
  readonly scene: Scene
}): PageDefinition => ({
  canonicalPath,
  relativePath: `${canonicalPath.slice(1)}index.html`,
  title: `${mode === "visual" ? "Hazard scene" : "Keyboard hazard scene"} ${position} of ${count} — NY Custodian Exam`,
  description: `${mode === "visual" ? "A visual" : "A keyboard, no-image"} workplace hazard exercise. Feedback appears only after you submit your response.`,
  robots: "noindex,follow",
  routeId: "hazard-player",
  section: "hazards",
  body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/hazards/", label: "Hazards" }, { label: `Scene ${position}` }])}
    <div
      data-hazard-player
      data-hazard-mode="${mode}"
      data-hazard-attempt-id="${escapeHtml(hazardAttemptId(receipt))}"
      data-postcommit-url="${escapeHtml(receipt.postcommitPath)}"
    >
      <article class="hazard-card">
        <header class="question-prompt">
          <p class="eyebrow">Scene ${position} of ${count} · ${escapeHtml(scene.environment)}</p>
          <h1>${mode === "visual" ? "Find the workplace hazards" : "Review the workplace zones"}</h1>
          <p>${escapeHtml(scene.neutralPreAnswer.overview)}</p>
        </header>
        ${mode === "visual" ? `<p class="source-note">JavaScript checks the image against this release before showing it or turning on markers.</p>` : ""}
        <section aria-labelledby="zone-heading">
          <h2 id="zone-heading">Scene zones</h2>
          <ol class="zone-list">${scene.neutralPreAnswer.zones.map((zone) => `<li><strong>${escapeHtml(zone.label)}</strong><span>${escapeHtml(zone.description)}</span></li>`).join("")}</ol>
        </section>
        <p class="source-note">Interactive ${mode === "visual" ? "hazard marking" : "keyboard zone selection"} needs JavaScript. Feedback is not included in this page.</p>
      </article>
    </div>
    <nav class="directional-nav" aria-label="Hazard scene navigation">
      ${previousPath === undefined ? "<span></span>" : `<a data-session-history="replace" href="${previousPath}">← Previous scene</a>`}
      ${nextPath === undefined ? "<span>End of session</span>" : `<a data-session-history="replace" href="${nextPath}">Next scene →</a>`}
    </nav>
  </main>
  <script id="hazard-scene-data" type="application/json">${escapeJsonForHtml(scene)}</script>
  <script id="hazard-receipt-data" type="application/json">${escapeJsonForHtml(receipt)}</script>
  ${mode === "visual" ? `<script id="hazard-asset-receipt-data" type="application/json">${escapeJsonForHtml(visualAssetReceipt(scene))}</script>` : ""}
  <script type="module" src="/src/hazard-player/react/bootstrap.tsx"></script>`
})

const loadRelease = async (): Promise<{
  readonly catalog: Catalog
  readonly manifest: Manifest
  readonly pack: typeof PrecommitPackArtifact.Type
  readonly questions: readonly { readonly artifact: ManifestArtifact; readonly value: Question }[]
  readonly scenes: readonly { readonly artifact: ManifestArtifact; readonly value: Scene }[]
}> => {
  const catalog = Schema.decodeUnknownSync(CatalogArtifact)(
    await readJson(new URL("catalog.json", releaseRoot))
  )
  const manifest = Schema.decodeUnknownSync(ReleaseManifest)(
    await readJson(new URL("manifest.json", releaseRoot))
  )
  const pack = Schema.decodeUnknownSync(PrecommitPackArtifact)(
    await readJson(new URL("pack.precommit.json", releaseRoot))
  )

  for (const artifact of manifest.artifacts) {
    await assertManifestRecord(artifact, new URL(artifact.path, releaseRoot))
  }
  for (const asset of manifest.assets) {
    await assertManifestRecord(asset, new URL(asset.path, repositoryRoot))
  }

  const questionArtifacts = manifest.artifacts.filter(
    (artifact) => artifact.kind === "question-precommit"
  )
  const sceneArtifacts = manifest.artifacts.filter((artifact) => artifact.kind === "scene-precommit")
  const questions = await Promise.all(
    questionArtifacts.map(async (artifact) => ({
      artifact,
      value: Schema.decodeUnknownSync(PrecommitQuestion)(
        await readJson(new URL(artifact.path, releaseRoot))
      )
    }))
  )
  const scenes = await Promise.all(
    sceneArtifacts.map(async (artifact) => ({
      artifact,
      value: Schema.decodeUnknownSync(PrecommitScene)(
        await readJson(new URL(artifact.path, releaseRoot))
      )
    }))
  )

  if (
    manifest.releaseId !== catalog.packId ||
    manifest.releaseId !== pack.packId ||
    manifest.packVersion !== catalog.version ||
    manifest.packVersion !== pack.version ||
    manifest.toolCount !== catalog.tools.length ||
    manifest.comparisonCount !== catalog.comparisons.length ||
    manifest.questionCount !== questions.length ||
    manifest.hazardSceneCount !== scenes.length
  ) {
    throw new Error("Release catalog, precommit pack, and manifest counts or identities disagree")
  }

  return { catalog, manifest, pack, questions, scenes }
}

const buildPages = ({
  catalog,
  manifest,
  questions,
  scenes
}: Awaited<ReturnType<typeof loadRelease>>): {
  readonly pages: ReadonlyArray<PageDefinition>
  readonly printBootstrap: PrintBuilderBootstrap
} => {
  const sourceById = new Map(catalog.sources.map((source) => [source.id, source]))
  const sourceLineById = new Map(catalog.sourceLines.map((line) => [line.id, line]))
  const toolById = new Map(catalog.tools.map((tool) => [tool.conceptId, tool]))
  const releasedTools = catalog.tools
  const scoredTools = catalog.tools.filter(
    (tool) => tool.practiceEligibility === "text-question" && tool.publicationGate === null
  )
  const toolEntries = releasedTools.map((tool) => ({ id: tool.conceptId, slug: slugify(tool.canonicalTerm), tool }))
  const comparisonEntries = catalog.comparisons.map((comparison) => {
    const owner = toolById.get(comparison.memberIds[0])
    if (owner === undefined) {
      throw new Error(`Comparison ${comparison.id} has no canonical family owner`)
    }
    const slug = slugify(comparison.id.replace(/^comparison\./, ""))
    return {
      id: comparison.id,
      slug,
      ownerFamily: owner.family,
      canonicalPath: `/atlas/family/${slugify(owner.family)}/#comparison-${slug}`,
      comparison
    }
  })
  const sourceEntries = catalog.sources.map((source) => ({ id: source.id, slug: slugify(source.id), source }))
  assertUniqueSlugs(toolEntries)
  assertUniqueSlugs(comparisonEntries)
  assertUniqueSlugs(sourceEntries)

  const families = new Map<string, CatalogTool[]>()
  for (const tool of releasedTools) {
    const family = families.get(tool.family) ?? []
    family.push(tool)
    families.set(tool.family, family)
  }
  const comparableFamilies = [...families.entries()].filter(([, tools]) => tools.length >= 2)
  assertUniqueSlugs(comparableFamilies.map(([family]) => ({ id: family, slug: slugify(family) })))

  const questionPostcommitById = new Map(
    manifest.artifacts
      .filter((artifact) => artifact.kind === "question-postcommit" && artifact.itemId !== undefined)
      .map((artifact) => [artifact.itemId as string, artifact])
  )
  const scenePostcommitById = new Map(
    manifest.artifacts
      .filter((artifact) => artifact.kind === "scene-postcommit" && artifact.itemId !== undefined)
      .map((artifact) => [artifact.itemId as string, artifact])
  )
  const questionReceipt = (
    artifact: ManifestArtifact,
    questionId: string,
    position: number,
    sessionId = manifest.releaseId
  ): QuestionAttemptReceipt => ({
    releaseId: manifest.releaseId,
    packVersion: manifest.packVersion,
    sessionId,
    position,
    postcommitPath: `/content/vertical-slice/${artifact.path}`,
    postcommitBytes: artifact.bytes,
    postcommitSha256: artifact.sha256,
    questionId
  })
  const hazardReceipt = (
    artifact: ManifestArtifact,
    scene: Scene,
    mode: "visual" | "nonvisual",
    position: number
  ): HazardAttemptReceipt => ({
    releaseId: manifest.releaseId,
    packVersion: manifest.packVersion,
    sessionId: mode === "visual" ? manifest.releaseId : `${manifest.releaseId}-nonvisual`,
    position,
    postcommitPath: `/content/vertical-slice/${artifact.path}`,
    postcommitBytes: artifact.bytes,
    postcommitSha256: artifact.sha256,
    sceneId: scene.id,
    mode,
    assetRevision: scene.asset.revision,
    assetMasterSha256: scene.asset.masterSha256
  })
  const trustedReleaseContentRegistry = decodeTrustedReleaseContentRegistry({
    schemaVersion: 1,
    scope: "trusted-release-content-registry",
    entries: [
      ...questions.map(({ value: question }) => {
        const artifact = questionPostcommitById.get(question.id)
        if (artifact === undefined) {
          throw new Error(`Question ${question.id} has no trusted postcommit receipt`)
        }
        return {
          releaseId: manifest.releaseId,
          packVersion: manifest.packVersion,
          variant: "question",
          itemId: question.id,
          postcommitReceipt: {
            postcommitPath: `/content/vertical-slice/${artifact.path}`,
            postcommitBytes: artifact.bytes,
            postcommitSha256: artifact.sha256
          },
          optionIds: question.options.map((option) => option.id)
        }
      }),
      ...scenes.flatMap(({ value: scene }) => {
        const artifact = scenePostcommitById.get(scene.id)
        if (artifact === undefined) {
          throw new Error(`Scene ${scene.id} has no trusted postcommit receipt`)
        }
        const shared = {
          releaseId: manifest.releaseId,
          packVersion: manifest.packVersion,
          itemId: scene.id,
          postcommitReceipt: {
            postcommitPath: `/content/vertical-slice/${artifact.path}`,
            postcommitBytes: artifact.bytes,
            postcommitSha256: artifact.sha256
          },
          allowedZoneOrders: scene.neutralPreAnswer.zones.map((zone) => zone.order),
          assetRevision: scene.asset.revision,
          assetMasterSha256: scene.asset.masterSha256
        }
        return [
          {
            ...shared,
            variant: "hazard-visual",
            mode: "visual",
            visualAssetReceipt: visualAssetReceipt(scene)
          },
          {
            ...shared,
            variant: "hazard-nonvisual",
            mode: "nonvisual",
            visualAssetReceipt: null
          }
        ]
      })
    ]
  })
  const reviewBootstrap = {
    schemaVersion: 1,
    questions: questions.map(({ value: question }, index) => {
      const artifact = questionPostcommitById.get(question.id)
      if (artifact === undefined) {
        throw new Error(`Question ${question.id} has no review projection feedback record`)
      }
      return {
        id: question.id,
        optionIds: question.options.map((option) => option.id),
        receipt: questionReceipt(artifact, question.id, index + 1),
        itemUrl: `/review/session/${manifest.releaseId}/item/${index + 1}/`
      }
    }),
    scenes: scenes.map(({ value: scene }, index) => {
      const artifact = scenePostcommitById.get(scene.id)
      if (artifact === undefined) {
        throw new Error(`Scene ${scene.id} has no review projection feedback record`)
      }
      return {
        scene,
        visualReceipt: hazardReceipt(artifact, scene, "visual", index + 1),
        nonvisualReceipt: hazardReceipt(artifact, scene, "nonvisual", index + 1),
        visualItemUrl: `/hazards/session/${manifest.releaseId}/scene/${index + 1}/`,
        nonvisualItemUrl: `/hazards/session/${manifest.releaseId}-nonvisual/scene/${index + 1}/`
      }
    })
  } as const
  const simulationBootstrap = Schema.decodeUnknownSync(SimulationBootstrap)({
    schemaVersion: 2,
    releaseId: manifest.releaseId,
    packVersion: manifest.packVersion,
    profiles: catalog.profiles.map((profile) => ({
      id: profile.id,
      label: profile.label,
      version: profile.version,
      jurisdiction: profile.jurisdiction,
      compatibilityKey: profile.compatibilityKey,
      disclaimer: profile.disclaimer
    })),
    advertisedLengths: catalog.practiceCapacity.advertisedSetLengths,
    inventory: questions.map(({ value: question }, index) => {
      const artifact = questionPostcommitById.get(question.id)
      if (artifact === undefined) throw new Error(`Question ${question.id} has no simulation receipt`)
      return {
        question,
        receipt: questionReceipt(artifact, question.id, index + 1),
        profileIds: questionProfileIds(question)
      }
    }),
    hazards: scenes.map(({ value: scene }, index) => {
      const artifact = scenePostcommitById.get(scene.id)
      if (artifact === undefined) throw new Error(`Scene ${scene.id} has no simulation receipt`)
      return {
        scene,
        visualReceipt: hazardReceipt(artifact, scene, "visual", index + 1),
        nonvisualReceipt: hazardReceipt(artifact, scene, "nonvisual", index + 1),
        visualAsset: visualAssetReceipt(scene),
        profileIds: catalog.profiles.map((profile) => profile.id),
        category: scene.environment
      }
    })
  })
  const printBootstrap = Schema.decodeUnknownSync(PrintBuilderBootstrap)({
    schemaVersion: 2,
    releaseId: manifest.releaseId,
    contentVersion: manifest.packVersion,
    profiles: catalog.profiles.map((profile) =>
      printProfileBootstrap(profile, sourceLineById, sourceById)
    ),
    questions: questions.map(({ value: question }) => {
      const artifact = questionPostcommitById.get(question.id)
      return {
        id: question.id,
        profileIds: questionProfileIds(question),
        memberships: question.memberships ?? [],
        prompt: question.prompt,
        options: question.options,
        answerReceipt: artifact === undefined
          ? null
          : {
              postcommitPath: `/content/vertical-slice/${artifact.path}`,
              postcommitBytes: artifact.bytes,
              postcommitSha256: artifact.sha256
            }
      }
    }),
    tools: releasedTools.map((tool) => ({
      id: tool.conceptId,
      profileIds: catalog.profiles.map((profile) => profile.id),
      canonicalTerm: tool.canonicalTerm,
      family: tool.family,
      useSummary: tool.useSummary,
      distinguishingFeatures: tool.distinguishingFeatures,
      neutralDescription: tool.neutralDescription,
      asset: printAssetReceipt(tool)
    })),
    scenes: scenes.map(({ value: scene }) => {
      const artifact = scenePostcommitById.get(scene.id)
      if (artifact === undefined) throw new Error(`Scene ${scene.id} has no print answer receipt`)
      return {
        id: scene.id,
        profileIds: catalog.profiles.map((profile) => profile.id),
        environment: scene.environment,
        neutralOverview: scene.neutralPreAnswer.overview,
        neutralZones: scene.neutralPreAnswer.zones,
        asset: printAssetReceipt(scene),
        answerReceipt: {
          postcommitPath: `/content/vertical-slice/${artifact.path}`,
          postcommitBytes: artifact.bytes,
          postcommitSha256: artifact.sha256
        }
      }
    }),
    corrections: []
  })

  // The statically generated practice page has no selected profile, so it must
  // present the neutral statewide series. CONTENT_DESIGN.md forbids silently
  // defaulting to Nassau or to the first available profile
  // (SHARED-EXPLICIT-PROFILE-CONTEXT); a jurisdiction layer may only scope a set
  // after the learner chooses it explicitly. Fail loudly rather than falling
  // back to an arbitrary profile.
  const capacityProfile = catalog.profiles.find((profile) => profile.layer === "statewide-series")
  if (capacityProfile === undefined) {
    throw new Error("Release requires a statewide-series profile for neutral practice context")
  }
  const capacityRecords = catalog.practiceCapacity.records.filter(
    (record) => record.profileId === capacityProfile.id
  )
  const capacityLabel = (
    record: Catalog["practiceCapacity"]["records"][number]
  ): string => {
    switch (record.filterKind) {
      case "all":
        return "All questions"
      case "domain": {
        const label = practiceDomainLabels[record.filterValue]
        if (label === undefined) {
          throw new Error(`Unsupported practice domain ${record.filterValue}`)
        }
        return `Topic: ${label}`
      }
      case "family":
        return `Tool family: ${capitalize(record.filterValue)}`
      case "confusion-set": {
        const comparison = catalog.comparisons.find(({ id }) => id === record.filterValue)
        if (comparison === undefined) {
          throw new Error(`Practice capacity references missing comparison ${record.filterValue}`)
        }
        const names = comparison.memberIds.map((id) => {
          const tool = toolById.get(id)
          if (tool === undefined) {
            throw new Error(`Comparison ${comparison.id} references missing tool ${id}`)
          }
          return tool.canonicalTerm
        })
        return `Tool comparison: ${names.join(" vs. ")}`
      }
    }
  }
  const questionSessions = derivePracticeSessions({
    releaseId: manifest.releaseId,
    packVersion: manifest.packVersion,
    profile: {
      id: capacityProfile.id,
      version: capacityProfile.version,
      compatibilityKey: capacityProfile.compatibilityKey
    },
    questions,
    records: catalog.practiceCapacity.records
  })
  const sessionByCapacity = new Map(
    questionSessions.map((session) => [
      `${session.record.filterKind}:${session.record.filterValue}:${session.length}`,
      session
    ])
  )

  const pages: PageDefinition[] = []
  pages.push({
    relativePath: "index.html",
    canonicalPath: "/",
    title: "NY Custodian Exam Study",
    description: "Free, independent, unofficial study for New York entry-level custodian and janitor exams. No account required.",
    robots: "index,follow",
    routeId: "home",
    section: "home",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    <section class="hero">
      <h1>Study the work, not a mystery answer key.</h1>
      <p>Free, independent study for the supported New York entry-level Custodians and Janitors series. It is unofficial — not affiliated with or endorsed by any government agency — and needs no account. Your submitted answers are saved in this browser. Browser data can be cleared, so <a href="/settings/#export-local-data">export a backup</a> if you want to keep them.</p>
      <p>This release contains an original ${releasedTools.length}-tool reference, ${questions.length} practice questions, and ${scenes.length} workplace hazard scenes. Answers and explanations appear only after you submit each answer.</p>
      <div class="question-controls">
        <a class="button button-primary" href="/practice/">Start practice</a>
        <a class="button button-secondary" href="/exams/">Check my exam</a>
      </div>
    </section>
    <section class="card-grid" aria-label="More ways to study">
      <article class="card"><h2>Learn the tools</h2><p>Compare ${releasedTools.length} illustrated, cited tool references by use and construction.</p><a href="/atlas/">Open study tools</a></article>
      <article class="card"><h2>Practice spotting hazards</h2><p>Scan workplace scenes; which conditions are hazards is revealed only after you submit.</p><a href="/hazards/">Open hazard practice</a></article>
      <article class="card"><h2>See where it comes from</h2><p>Every reference cites its public sources, and unknowns stay labeled as unknown.</p><a href="/transparency/">Open sources and methods</a></article>
    </section>
  </main>`
  })

  pages.push({
    relativePath: "review/index.html",
    canonicalPath: "/review/",
    title: "Local review queue — NY Custodian Exam Study",
    description: "Review missed questions and hazard scenes from the practice saved on this device.",
    robots: "noindex,follow",
    routeId: "review-queue",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Review" }])}
    <section class="hero"><p class="eyebrow">Saved on this device</p><h1>Review what your saved attempts identified.</h1><p>This queue is rebuilt on this device from your saved question and hazard attempts — no account involved. Opening feedback does not finish an item, and nothing here claims mastery or an official schedule.</p></section>
    <div data-review-queue data-island="review-queue-bootstrap">
      <section class="review-state" aria-labelledby="review-queue-heading">
        <h2 id="review-queue-heading">Loading your local review queue</h2>
        <p>JavaScript and available browser storage are required to read your saved study attempts. No answers or feedback are embedded in this page.</p>
      </section>
    </div>
    <section class="card-grid section-gap" aria-label="Continue studying"><article class="card"><h2>Question practice</h2><p>Items enter this queue only after an answer is saved.</p><a href="/practice/">Open question practice</a></article><article class="card"><h2>Hazard practice</h2><p>Missing a hazard, or marking a safe area as one, adds that scene here after you submit.</p><a href="/hazards/">Open hazard practice</a></article></section>
  </main>
  <script id="review-bootstrap-data" type="application/json">${escapeJsonForHtml(reviewBootstrap)}</script>
  <script type="module" src="/src/review/react/bootstrap.tsx"></script>`
  })

  pages.push({
    relativePath: "print/index.html",
    canonicalPath: "/print/",
    title: "Print center — NY Custodian Exam Study",
    description: "Build printable practice packets from the current release of original questions.",
    robots: "index,follow",
    routeId: "print-center",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/practice/", label: "Practice" }, { label: "Print center" }])}
    <section class="hero"><p class="eyebrow">Printable practice</p><h1>Build a printable practice packet.</h1><p>Every packet states that it is original practice — not an official or past exam — and identifies the exact release it came from. Inspect the preview, then use your browser's print dialog or Save as PDF.</p></section>
    <div data-print-builder data-island="print-builder-bootstrap">
      <section class="review-state"><h2>Loading printable content</h2><p>JavaScript and available browser storage are required to build and keep a preview. No answers are embedded in this page.</p></section>
    </div>
  </main>
  <script id="print-builder-data" type="application/json">${escapeJsonForHtml(printBootstrap)}</script>
  <script type="module" src="/src/print/react/builder-bootstrap.tsx"></script>`
  })

  pages.push({
    relativePath: "print/preview/print-shell0000/index.html",
    canonicalPath: "/print/preview/print-shell0000/",
    title: "Print preview — NY Custodian Exam Study",
    description: "Your saved print preview, restored from this device.",
    robots: "noindex,follow",
    routeId: "print-preview",
    section: "practice",
    body: `
  <main class="page-shell print-page-shell" id="main-content" tabindex="-1">
    <div class="screen-only">${breadcrumb([{ href: "/print/", label: "Print center" }, { label: "Preview" }])}</div>
    <div data-print-preview data-island="print-preview-bootstrap">
      <section class="review-state"><h1>Restoring the saved print preview</h1><p>This preview comes only from the print job saved on this device. Nothing else is substituted if it is unavailable.</p></section>
    </div>
  </main>
  <script type="module" src="/src/print/react/preview-bootstrap.tsx"></script>`
  })

  pages.push({
    relativePath: "simulations/index.html",
    canonicalPath: "/simulations/",
    title: "Practice simulation — NY Custodian Exam Study",
    description: "Create a practice simulation of questions or hazard scenes. Original practice, not an official exam.",
    robots: "index,follow",
    routeId: "simulation-setup",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/practice/", label: "Practice" }, { label: "Simulation" }])}
    <section class="hero"><p class="eyebrow">Original practice · not an official exam</p><h1>Create a practice simulation.</h1><p>Build a multiple-choice or hazard-scene set — including a keyboard, no-image version — from the current release. It does not claim official exam length, question mix, score conversion, or a passing-score prediction.</p></section>
    <div data-simulation-setup data-island="simulation-setup-bootstrap">
      <section class="review-state"><h2>Loading simulation options</h2><p>JavaScript and available browser storage are required. No answer key is embedded in this setup page.</p></section>
    </div>
  </main>
  <script id="simulation-bootstrap-data" type="application/json">${escapeJsonForHtml(simulationBootstrap)}</script>
  <script type="module" src="/src/simulation/react/bootstrap-setup.tsx"></script>`
  })

  pages.push({
    relativePath: "simulations/session/sim-shell0000/question/1/index.html",
    canonicalPath: "/simulations/session/sim-shell0000/question/1/",
    title: "Practice simulation — NY Custodian Exam Study",
    description: "Your saved practice simulation with editable responses, restored from this device.",
    robots: "noindex,follow",
    routeId: "simulation-player",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/simulations/", label: "Simulation setup" }, { label: "Item" }])}
    <div data-simulation-player data-island="simulation-player-bootstrap">
      <section class="review-state"><h1>Restoring your simulation</h1><p>JavaScript and the simulation saved on this device are required. No answers or explanations are embedded in this page.</p></section>
    </div>
  </main>
  <script type="module" src="/src/simulation/react/bootstrap-player.tsx"></script>`
  })

  pages.push({
    relativePath: "simulations/session/sim-shell0000/results/index.html",
    canonicalPath: "/simulations/session/sim-shell0000/results/",
    title: "Practice simulation results — NY Custodian Exam Study",
    description: "Practice-only results, calculated after your final simulation submission is saved on this device.",
    robots: "noindex,follow",
    routeId: "simulation-results",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/simulations/", label: "Simulation setup" }, { label: "Results" }])}
    <div data-simulation-results data-island="simulation-results-bootstrap">
      <section class="review-state"><h1>Checking your final submission</h1><p>Your saved final answers are read from this device before any answer content is requested.</p></section>
    </div>
  </main>
  <script type="module" src="/src/simulation/react/bootstrap-results.tsx"></script>`
  })

  pages.push({
    relativePath: "status/index.html",
    canonicalPath: "/status/",
    title: "Study-site status — NY Custodian Exam Study",
    description: "Truthful recovery options for unavailable NY Custodian Exam Study content.",
    robots: "noindex,follow",
    routeId: "status",
    section: "home",
    body: statusRecovery(
      "Recover from an unavailable study page.",
      "Use these published entry points when a page is missing, unavailable offline, or no longer part of the current release."
    )
  })

  pages.push({
    relativePath: "exams/index.html",
    canonicalPath: "/exams/",
    title: "Exam profiles — NY Custodian Exam Study",
    description: "The currently released New York entry-level custodian and janitor study profile.",
    robots: "index,follow",
    routeId: "exam-selector",
    section: "exams",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Exam profiles" }])}
    <section class="hero"><p class="eyebrow">${catalog.profiles.length} study profiles</p><h1>Does this match my exam?</h1><p>This release covers the New York statewide entry-level custodian and janitor series and a Nassau County announcement profile. Check the profile that matches your exam announcement before relying on a practice set. Neither profile is an official exam.</p></section>
    <section class="card-grid" aria-label="Available profiles">${catalog.profiles.map((profile) => `<article class="card"><p class="eyebrow">${escapeHtml(layerLabel(profile.layer))}</p><h2>${escapeHtml(profile.label)}</h2><p>${escapeHtml(profile.audience)}</p><p>${escapeHtml(profile.disclaimer)}</p><a href="${profile.canonicalPath}">View this profile</a></article>`).join("")}</section>
  </main>`
  })

  for (const profile of catalog.profiles) {
    const factSheet = profile.announcementFactSheet
    const parentProfile = profile.parentProfileId === null
      ? undefined
      : catalog.profiles.find((candidate) => candidate.id === profile.parentProfileId)
    const childProfiles = catalog.profiles.filter(
      (candidate) => candidate.parentProfileId === profile.id
    )
    const factSheetBody = factSheet === null ? "" : `
      <section class="section-gap" aria-labelledby="profile-fact-states">
        <h2 id="profile-fact-states">Announcement fact states</h2>
        <p>Every mutable fact remains labeled with its exact state. Unpublished or unresolved values are not replaced with guesses.</p>
        <dl class="fact-list">${factSheet.facts.map((fact) => renderProfileFact(fact, profile.version, factSheet.version, sourceLineById, sourceById)).join("")}</dl>
      </section>
      <details class="section-gap" id="profile-history">
        <summary>Fact-sheet change history</summary>
        <ol class="link-list">${factSheet.changeHistory.map((change) => `<li><strong>Version ${change.version} · ${escapeHtml(change.changedOn)}</strong><span>${escapeHtml(change.summary)}</span>${sourceLineLinks(change.sourceLineIds, sourceLineById, sourceById)}</li>`).join("")}</ol>
      </details>`
    pages.push({
      relativePath: `${profile.canonicalPath.slice(1)}index.html`,
      canonicalPath: profile.canonicalPath,
      title: `${profile.label} — Study profile`,
      description: `Scope, compatibility, and source-bound limits for ${profile.label}.`,
      robots: "index,follow",
      routeId: "profile",
      section: "exams",
      body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([
      { href: "/exams/", label: "Exam profiles" },
      ...(parentProfile === undefined ? [] : [{ href: parentProfile.canonicalPath, label: parentProfile.label }]),
      { label: profile.label }
    ])}
    <section class="hero"><p class="eyebrow">${escapeHtml(layerLabel(profile.layer))}</p><h1>${escapeHtml(profile.label)}</h1><p>${escapeHtml(profile.audience)}</p></section>
    <div class="reference-layout section-gap"><article><h2>Scope and released coverage</h2><ul>${profile.scopeNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul><dl class="fact-list"><dt>Series level</dt><dd>${escapeHtml(profile.seriesLevel)}</dd><dt>Exam identity state</dt><dd><span class="fact-state fact-state-${profile.examIdentityState}">${factStateLabel(profile.examIdentityState)}</span>${profile.examIdentities.length === 0 ? "<p>No exam number applies at the statewide series level.</p>" : `<ul>${profile.examIdentities.map((identity) => `<li><strong>${escapeHtml(identity.examNumber)}</strong> · ${escapeHtml(identity.title)} · ${escapeHtml(identity.competitionType)}${sourceLineLinks(identity.sourceLineIds, sourceLineById, sourceById)}</li>`).join("")}</ul>`}</dd><dt>Competition type state</dt><dd><span class="fact-state fact-state-${profile.competitionTypeState}">${factStateLabel(profile.competitionTypeState)}</span>${profile.competitionTypes.length === 0 ? "<p>Competition type belongs to a controlling announcement, not the statewide series profile.</p>" : `<p>${profile.competitionTypes.map(escapeHtml).join(", ")}</p>`}</dd><dt>Test-plan compatibility</dt><dd><strong>${escapeHtml(profile.testPlanCompatibility.status)}</strong><p>${escapeHtml(profile.testPlanCompatibility.detail)}</p>${sourceLineLinks(profile.testPlanCompatibility.sourceLineIds, sourceLineById, sourceById)}</dd><dt>Content availability</dt><dd><strong>${escapeHtml(profile.contentAvailability.status)}</strong><p>${escapeHtml(profile.contentAvailability.detail)}</p><p>Verified ${escapeHtml(profile.contentAvailability.lastVerifiedOn)}.</p></dd><dt>Tools in this release</dt><dd>${releasedTools.length}</dd><dt>Tools eligible for scored practice</dt><dd>${scoredTools.length}</dd><dt>Original questions</dt><dd>${questions.length}</dd><dt>Hazard scenes</dt><dd>${scenes.length}</dd></dl><p class="source-note"><strong>Important:</strong> ${escapeHtml(profile.disclaimer)}</p><details class="source-note"><summary>Technical details</summary><p>Profile version ${profile.version} · release version ${catalog.version} · compatibility key <code>${escapeHtml(profile.compatibilityKey)}</code></p></details></article><aside class="reference-card"><h2>Controlling boundary</h2><p>${escapeHtml(factSheet?.controllingDocumentNotice ?? profile.disclaimer)}</p><a class="button button-primary" href="/atlas/">Open study tools</a></aside></div>
    ${factSheet === null ? "" : renderSeriesScopeDisclaimer(factSheet)}
    ${factSheetBody}
    <section class="section-gap"><h2>Profile source registry</h2>${sourceLinks(profile.sourceIds, sourceById)}</section>
    ${childProfiles.length === 0 ? "" : `<section class="section-gap"><h2>Jurisdiction-specific profiles</h2><ul class="link-list">${childProfiles.map((child) => `<li><a href="${child.canonicalPath}">${escapeHtml(child.label)}</a><span>${escapeHtml(child.audience)}</span></li>`).join("")}</ul></section>`}
  </main>
  <script id="announcement-profile-data" type="application/json">${escapeJsonForHtml(profile)}</script>`
    })
  }

  pages.push({
    relativePath: "practice/index.html",
    canonicalPath: "/practice/",
    title: "Practice — NY Custodian Exam Study",
    description: "Original practice questions. Answers and explanations open only after you submit each answer.",
    robots: "index,follow",
    routeId: "study-hub",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Practice" }])}
    <section class="hero"><p class="eyebrow">${questions.length} original questions</p><h1>Choose a practice set.</h1><p>Each set draws distinct questions from this release with no repeats. The ${catalog.practiceCapacity.advertisedSetLengths.join(", ")} sizes and the displayed mix are a site-designed distribution — not official exam counts or weights.</p><div class="question-controls"><a class="button button-secondary" href="/simulations/">Build a simulation</a><a class="button button-secondary" href="/print/">Open print center</a></div></section>
    <section class="card-grid" aria-label="Available whole-bank practice lengths">${catalog.practiceCapacity.advertisedSetLengths.map((length) => {
      const session = sessionByCapacity.get(`all:all:${length}`)
      return session === undefined
        ? `<article class="card"><h2>${length} questions</h2><p>Not available: this release cannot fill ${length} questions without repeats.</p></article>`
        : `<article class="card"><h2>${length} questions</h2><p>${session.questions.length} distinct questions from the ${escapeHtml(capacityProfile.label)} series.</p><a class="button button-primary" href="/practice/session/${session.id}/question/1/">Start ${length}</a></article>`
    }).join("")}</section>
    <details class="section-gap"><summary>Why some set sizes are unavailable</summary><p>Every set is drawn without repeats, so a size is offered only when this release has enough distinct questions for that filter. The table shows the current counts.</p><div class="comparison-table-wrap"><table class="comparison-table"><caption>Available set sizes by filter</caption><thead><tr><th scope="col">Filter</th><th scope="col">Questions</th>${catalog.practiceCapacity.advertisedSetLengths.map((length) => `<th scope="col">${length}</th>`).join("")}</tr></thead><tbody>${capacityRecords.map((record) => `<tr><th scope="row">${escapeHtml(capacityLabel(record))}</th><td>${record.questionCount}</td>${catalog.practiceCapacity.advertisedSetLengths.map((length) => {
      const session = sessionByCapacity.get(`${record.filterKind}:${record.filterValue}:${length}`)
      return session === undefined
        ? `<td>Not available</td>`
        : `<td><a href="/practice/session/${session.id}/question/1/">Start ${length}</a></td>`
    }).join("")}</tr>`).join("")}</tbody></table></div></details>
    <p class="source-note"><strong>Scoring boundary:</strong> practice accuracy is not an official converted score or a pass prediction. Answers and their sourced explanations load only after each answer is submitted and saved on this device.</p>
  </main>`
  })

  pages.push({
    relativePath: "atlas/index.html",
    canonicalPath: "/atlas/",
    title: "Study tools — NY Custodian Exam Study",
    description: `Illustrated, cited reference pages for ${releasedTools.length} tools and ${catalog.comparisons.length} comparison panels.`,
    robots: "index,follow",
    routeId: "atlas-index",
    section: "atlas",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Study tools" }])}
    <section class="hero"><p class="eyebrow">${releasedTools.length} tools · ${catalog.comparisons.length} comparison panels</p><h1>Recognize a tool by use and construction.</h1><p>Every tool page is illustrated and cites its public sources. Some entries are reference-only and never appear as scored practice questions; each one says so on its page.</p></section>
    <section class="tool-grid" aria-label="Study tools">${toolEntries.map(({ slug, tool }) => `<article class="tool-card"><img src="${derivativePath(tool, "phone")}" width="320" height="320" alt="${escapeHtml(tool.neutralDescription)}"><div><p class="eyebrow">${escapeHtml(tool.family)} · ${escapeHtml(catalogToolEvidenceTierLabel(tool.evidenceTier))}</p><h2><a href="/atlas/tool/${slug}/">${escapeHtml(tool.canonicalTerm)}</a></h2><p>${escapeHtml(tool.useSummary)}</p>${tool.practiceEligibility === "atlas-only" ? '<p class="source-note"><strong>Reference-only:</strong> excluded from scored practice.</p>' : ""}</div></article>`).join("")}</section>
    <section class="section-gap"><h2>Comparison panels</h2><p>Each panel lives on its tool-family page, together with any restriction that keeps it out of scored practice.</p><ul class="link-list">${comparisonEntries.map(({ canonicalPath, comparison }) => {
      const names = comparison.memberIds.map((id) => toolById.get(id)?.canonicalTerm ?? id)
      return `<li><a href="${canonicalPath}">${escapeHtml(names.join(" vs. "))}</a><span>${comparison.scoredUseGate.length === 0 ? "Can appear in scored practice" : "Reference-only"}</span></li>`
    }).join("")}</ul></section>
    ${comparableFamilies.length === 0 ? "" : `<section class="section-gap"><h2>Compare a tool family</h2><ul class="link-list">${comparableFamilies.map(([family, tools]) => `<li><a href="/atlas/family/${slugify(family)}/">${escapeHtml(family)} (${tools.length} tools)</a></li>`).join("")}</ul></section>`}
  </main>`
  })

  for (const [family, tools] of comparableFamilies) {
    const familySlug = slugify(family)
    const familyComparisons = comparisonEntries.filter(({ comparison }) =>
      comparison.memberIds.length > 0
    ).filter(({ ownerFamily }) =>
      ownerFamily === family
    )
    pages.push({
      relativePath: `atlas/family/${familySlug}/index.html`,
      canonicalPath: `/atlas/family/${familySlug}/`,
      title: `${family} comparison — Study tools`,
      description: `Compare the released ${family} by use and distinguishing features.`,
      robots: "index,follow",
      routeId: "atlas-family",
      section: "atlas",
      body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/atlas/", label: "Study tools" }, { label: family }])}
    <section class="hero"><p class="eyebrow">Tool family</p><h1>Compare ${escapeHtml(family)}.</h1><p>Use the supported task and the released recognition cues together. Scope and scored-use restrictions remain attached to each entry.</p></section>
    <div class="comparison-table-wrap"><table class="comparison-table"><caption>${escapeHtml(family)} comparison</caption><thead><tr><th scope="col">Tool</th><th scope="col">Supported use</th><th scope="col">Recognition cues</th></tr></thead><tbody>${tools.map((tool) => `<tr><th scope="row"><a href="/atlas/tool/${slugify(tool.canonicalTerm)}/">${escapeHtml(tool.canonicalTerm)}</a></th><td>${escapeHtml(tool.useSummary)}</td><td>${tool.distinguishingFeatures.map(escapeHtml).join("; ")}</td></tr>`).join("")}</tbody></table></div>
    ${familyComparisons.length === 0 ? "" : `<section class="section-gap"><h2>Comparison panels</h2>${familyComparisons.map(({ slug, comparison }) => {
      const members = comparison.memberIds.map((memberId) => {
        const member = toolById.get(memberId)
        if (member === undefined) throw new Error(`Comparison ${comparison.id} has missing member ${memberId}`)
        return member
      })
      const memberNames = members.map((member) => member.canonicalTerm)
      return `<article class="reference-card section-gap" id="comparison-${slug}"><p class="eyebrow">Comparison panel</p><h3>${escapeHtml(memberNames.join(" vs. "))}</h3><p>${escapeHtml(comparison.decisiveDistinction)}</p><figure class="tool-figure comparison-figure"><picture><source media="print" srcset="${derivativePath(comparison, "print")}"><img src="${derivativePath(comparison, "phone")}" srcset="${derivativePath(comparison, "phone")} 640w, ${derivativePath(comparison, "web")} 960w" sizes="(max-width: 58rem) calc(100vw - 4rem), 58rem" width="960" height="480" alt="Original side-by-side line-art comparison of ${escapeHtml(memberNames.join(" and "))}."></picture><figcaption>Drawn from the same released illustrations as each tool's page.</figcaption></figure><section class="source-note" aria-labelledby="comparison-status-${slug}"><h4 id="comparison-status-${slug}">Scored-use status</h4>${comparison.scoredUseGate.length === 0 ? "<p>This comparison can appear in scored practice. Every question stays an original written for this site.</p>" : `<p><strong>Reference-only comparison:</strong> excluded from scored practice until each listed restriction is cleared.</p><ul>${comparison.scoredUseGate.map((gate) => `<li>${escapeHtml(gate)}</li>`).join("")}</ul>`}</section><div class="comparison-table-wrap"><table class="comparison-table"><caption>Member uses and recognition cues</caption><thead><tr><th scope="col">Member</th><th scope="col">Supported use</th><th scope="col">Recognition cues</th><th scope="col">Practice status</th></tr></thead><tbody>${members.map((member) => `<tr><th scope="row"><a href="/atlas/tool/${slugify(member.canonicalTerm)}/">${escapeHtml(member.canonicalTerm)}</a></th><td>${escapeHtml(member.useSummary)}</td><td>${member.distinguishingFeatures.map(escapeHtml).join("; ")}</td><td>${member.practiceEligibility === "text-question" ? "Eligible" : "Reference-only"}</td></tr>`).join("")}</tbody></table></div><h4>Source trail</h4>${sourceLinks(comparison.sourceIds, sourceById)}</article>`
    }).join("")}</section>`}
  </main>`
    })
  }

  for (const { slug, tool } of toolEntries) {
    const confusables = tool.confusableConceptIds.flatMap((conceptId) => {
      const candidate = toolById.get(conceptId)
      return candidate === undefined ? [] : [candidate]
    })
    const toolComparisons = comparisonEntries.filter(({ comparison }) =>
      comparison.memberIds.includes(tool.conceptId)
    )
    pages.push({
      relativePath: `atlas/tool/${slug}/index.html`,
      canonicalPath: `/atlas/tool/${slug}/`,
      title: `${tool.canonicalTerm} — Study tools`,
      description: `${tool.useSummary} Learn its distinguishing features and source trail.`,
      robots: "index,follow",
      routeId: "atlas-tool",
      section: "atlas",
      body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/atlas/", label: "Study tools" }, { label: tool.canonicalTerm }])}
    <div class="reference-layout">
      <article>
        <p class="eyebrow">Study tools · ${escapeHtml(tool.family)}</p>
        <h1>${escapeHtml(tool.canonicalTerm)}</h1>
        <p class="lead-copy">${escapeHtml(tool.fullDescription)}</p>
        <figure class="tool-figure"><picture><source media="print" srcset="${derivativePath(tool, "print")}"><img src="${derivativePath(tool, "phone")}" srcset="${derivativePath(tool, "phone")} 320w, ${derivativePath(tool, "web")} 960w" sizes="(max-width: 46rem) calc(100vw - 4rem), 38rem" width="960" height="960" alt="${escapeHtml(tool.neutralDescription)}"></picture><figcaption>${escapeHtml(tool.neutralDescription)}</figcaption></figure>
        <dl class="fact-list"><dt>Primary use</dt><dd>${escapeHtml(tool.useSummary)}</dd><dt>Recognition cues</dt><dd>${tool.distinguishingFeatures.map(escapeHtml).join("; ")}</dd><dt>Evidence</dt><dd>${escapeHtml(catalogToolEvidenceTierLabel(tool.evidenceTier))}</dd><dt>Scope</dt><dd>${escapeHtml(toolScopeStatusLabel(tool.scopeStatus))}</dd><dt>Practice status</dt><dd>${tool.practiceEligibility === "text-question" ? "Eligible for the released text-question format." : "Reference-only; excluded from scored practice."}</dd></dl>
        ${tool.publicationGate === null ? tool.practiceEligibility === "atlas-only" ? `<section class="source-note section-gap"><h2>Reference-only restriction</h2><p>This tool stays reference-only because its sources carry a caution about its scope or identification. It never appears as a scored answer option.</p></section>` : "" : `<section class="source-note section-gap"><h2>Publication restriction</h2><p><strong>Reference-only:</strong> ${escapeHtml(tool.publicationGate)}</p><p>This restriction comes from the release record; the tool never appears as a scored answer option while it remains.</p></section>`}
        <section class="section-gap"><h2>Source trail</h2>${sourceLinks(tool.sourceIds, sourceById)}</section>
      </article>
      <aside class="reference-card"><h2>${confusables.length === 0 ? "Related study" : "Commonly confused"}</h2>${confusables.length === 0 ? "<p>Return to the atlas to compare other tools and equipment.</p>" : `<ul class="link-list">${confusables.map((candidate) => `<li><a href="/atlas/tool/${slugify(candidate.canonicalTerm)}/">${escapeHtml(candidate.canonicalTerm)}</a><span>${escapeHtml(candidate.useSummary)}</span></li>`).join("")}</ul>`}${toolComparisons.length === 0 ? "" : `<h3>Comparison panels</h3><ul class="link-list">${toolComparisons.map(({ canonicalPath, comparison }) => `<li><a href="${canonicalPath}">${escapeHtml(comparison.memberIds.map((id) => toolById.get(id)?.canonicalTerm ?? id).join(" vs. "))}</a></li>`).join("")}</ul>`}${tool.practiceEligibility === "text-question" ? '<a class="button button-primary" href="/practice/">Start practice</a>' : '<p class="source-note">This reference-only entry has no scored-practice link.</p>'}</aside>
    </div>
  </main>`
    })
  }

  pages.push({
    relativePath: "hazards/index.html",
    canonicalPath: "/hazards/",
    title: "Hazard practice — NY Custodian Exam Study",
    description: `${scenes.length} workplace hazard scenes with neutral descriptions. Feedback opens only after you submit.`,
    robots: "index,follow",
    routeId: "hazards-index",
    section: "hazards",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Hazards" }])}
    <section class="hero"><p class="eyebrow">${scenes.length} hazard scenes</p><h1>Scan the whole workplace before you decide.</h1><p>Each scene starts with a neutral description only. Which conditions are hazards — and which are safe as shown — is revealed, with corrections and sources, only after you submit your response.</p><div class="question-controls"><a class="button button-primary" href="/hazards/session/${manifest.releaseId}/scene/1/">Start visual scene 1</a><a class="button button-secondary" href="/hazards/session/${manifest.releaseId}-nonvisual/scene/1/">Start keyboard scene 1 (no image)</a></div></section>
    <section class="section-gap"><h2>Environments in this release</h2><ul class="tag-list">${[...new Set(scenes.map(({ value }) => value.environment))].map((environment) => `<li>${escapeHtml(environment)}</li>`).join("")}</ul></section>
  </main>`
  })

  pages.push({
    relativePath: "transparency/index.html",
    canonicalPath: "/transparency/",
    title: "Sources and methods — NY Custodian Exam Study",
    description: "Where the study material comes from and how answers stay sealed until you submit.",
    robots: "index,follow",
    routeId: "transparency-index",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Sources and methods" }])}
    <section class="hero"><p class="eyebrow">Current sources and methods</p><h1>Know what supports the study material.</h1><p>The public reference pages cite ${catalog.sources.length} source records. Practice exercises embed only neutral prompts and request one item’s feedback only after your answer is saved on this device.</p><details class="source-note"><summary>Technical details</summary><p>Release <code>${escapeHtml(manifest.releaseId)}</code> · version ${manifest.packVersion}</p></details></section>
    <section class="card-grid"><article class="card"><h2>Source registry</h2><p>Review titles, exact locators, scope notes, and publishers where available.</p><a href="/transparency/sources/">Browse sources</a></article><article class="card"><h2>Corrections</h2><p>Review the correction boundary and save a draft on this device.</p><a href="/transparency/corrections/">Read the correction policy</a></article><article class="card"><h2>Security</h2><p>Do not submit secure or recalled exam material.</p><a href="/transparency/security/">Read the security policy</a></article><article class="card"><h2>Privacy</h2><p>Study progress is stored in this browser and can be cleared with browser data. <a href="/settings/#export-local-data">Export a backup</a> if you want to keep it. Launch analytics are disabled.</p><a href="/transparency/privacy/">Read the privacy policy</a></article><article class="card"><h2>FOIL research</h2><p>No outreach or FOIL request is implied by this site.</p><a href="/transparency/foil/">Review the research boundary</a></article><article class="card"><h2>Release boundary</h2><p>This release contains exactly ${manifest.toolCount} tools, ${manifest.questionCount} questions, and ${manifest.hazardSceneCount} scenes. A combined answer file is never published to the site.</p></article></section>
  </main>`
  })

  pages.push({
    relativePath: "transparency/sources/index.html",
    canonicalPath: "/transparency/sources/",
    title: "Source registry — NY Custodian Exam Study",
    description: "The public source records supporting the released exam profile and tool atlas.",
    robots: "index,follow",
    routeId: "source",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "Sources" }])}
    <section class="hero"><p class="eyebrow">${catalog.sources.length} catalog records</p><h1>Source registry</h1><p>These records support the public profile and study tools. Exercise-specific source information is shown with each item’s feedback.</p></section>
    <div class="card-grid">${sourceEntries.map(({ slug, source }) => `<article class="card"><h2><a href="/transparency/sources/${slug}/">${escapeHtml(source.title)}</a></h2><p>${escapeHtml(source.scope)}</p><p><code>${escapeHtml(source.locator)}</code></p></article>`).join("")}</div>
  </main>`
  })

  for (const { slug, source } of sourceEntries) {
    const citedTools = releasedTools.filter((tool) => tool.sourceIds.includes(source.id))
    const citedProfiles = catalog.profiles.filter((profile) => profile.sourceIds.includes(source.id))
    const citedComparisons = comparisonEntries.filter(({ comparison }) =>
      comparison.sourceIds.includes(source.id)
    )
    const publicUses = [
      ...citedProfiles.map((profile) =>
        `<li><a href="${profile.canonicalPath}">${escapeHtml(profile.label)}</a><span>Study profile</span></li>`
      ),
      ...citedTools.map((tool) =>
        `<li><a href="/atlas/tool/${slugify(tool.canonicalTerm)}/">${escapeHtml(tool.canonicalTerm)}</a><span>Study tools</span></li>`
      ),
      ...citedComparisons.map(({ canonicalPath, comparison }) =>
        `<li><a href="${canonicalPath}">${escapeHtml(comparison.memberIds.map((id) => toolById.get(id)?.canonicalTerm ?? id).join(" vs. "))}</a><span>Comparison panel</span></li>`
      )
    ]
    pages.push({
      relativePath: `transparency/sources/${slug}/index.html`,
      canonicalPath: `/transparency/sources/${slug}/`,
      title: `${source.title} — Source registry`,
      description: source.scope,
      robots: "index,follow",
      routeId: "source",
      section: "transparency",
      body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { href: "/transparency/sources/", label: "Sources" }, { label: source.title }])}
    <article class="reference-card source-record"><p class="eyebrow">Source record</p><h1>${escapeHtml(source.title)}</h1><dl class="fact-list">${source.publisher === undefined ? "" : `<dt>Publisher</dt><dd>${escapeHtml(source.publisher)}</dd>`}<dt>Locator</dt><dd><code>${escapeHtml(source.locator)}</code></dd><dt>Supported scope</dt><dd>${escapeHtml(source.scope)}</dd></dl>${externalSourceLink(source)}<section class="section-gap"><h2>Public pages using this record</h2>${publicUses.length === 0 ? "<p>No current indexable page cites this record directly.</p>" : `<ul class="link-list">${publicUses.join("")}</ul>`}</section></article>
  </main>`
    })
  }

  for (const session of questionSessions) {
    session.questions.forEach(({ value: question }, index) => {
      const position = index + 1
      const base = `/practice/session/${session.id}/question/`
      const artifact = questionPostcommitById.get(question.id)
      if (artifact === undefined) throw new Error(`Question ${question.id} has no postcommit record`)
      pages.push(questionPage({
        canonicalPath: `${base}${position}/`,
        count: session.questions.length,
        position,
        receipt: questionReceipt(artifact, question.id, position, session.id),
        ...(position < session.questions.length ? { nextPath: `${base}${position + 1}/` } : {}),
        ...(position > 1 ? { previousPath: `${base}${position - 1}/` } : {}),
        question
      }))
    })
  }

  questions.forEach(({ value: question }, index) => {
    const position = index + 1
    const base = `/practice/session/${manifest.releaseId}/question/`
    const artifact = questionPostcommitById.get(question.id)
    if (artifact === undefined) throw new Error(`Question ${question.id} has no postcommit record`)
    pages.push(questionPage({
      canonicalPath: `${base}${position}/`,
      count: questions.length,
      position,
      receipt: questionReceipt(artifact, question.id, position),
      ...(position < questions.length ? { nextPath: `${base}${position + 1}/` } : {}),
      ...(position > 1 ? { previousPath: `${base}${position - 1}/` } : {}),
      question
    }))
  })

  questions.forEach(({ value: question }, index) => {
    const position = index + 1
    const base = `/review/session/${manifest.releaseId}/item/`
    const artifact = questionPostcommitById.get(question.id)
    if (artifact === undefined) throw new Error(`Question ${question.id} has no postcommit record`)
    pages.push(questionPage({
      canonicalPath: `${base}${position}/`,
      context: "review",
      count: questions.length,
      position,
      receipt: questionReceipt(artifact, question.id, position),
      ...(position < questions.length ? { nextPath: `${base}${position + 1}/` } : {}),
      ...(position > 1 ? { previousPath: `${base}${position - 1}/` } : {}),
      question,
      routeId: "review-player"
    }))
  })

  const firstQuestion = questions[0]?.value
  const firstQuestionArtifact = firstQuestion === undefined
    ? undefined
    : questionPostcommitById.get(firstQuestion.id)
  if (firstQuestionArtifact === undefined || firstQuestion === undefined) {
    throw new Error("Release must provide the first question compatibility alias")
  }
  pages.push(questionPage({
    canonicalPath: "/practice/session/vertical-slice/question/1/",
    count: questions.length,
    nextPath: `/practice/session/${manifest.releaseId}/question/2/`,
    position: 1,
    receipt: questionReceipt(firstQuestionArtifact, firstQuestion.id, 1),
    question: firstQuestion
  }))

  scenes.forEach(({ value: scene }, index) => {
    const position = index + 1
    const base = `/hazards/session/${manifest.releaseId}/scene/`
    const artifact = scenePostcommitById.get(scene.id)
    if (artifact === undefined) throw new Error(`Scene ${scene.id} has no postcommit record`)
    pages.push(hazardPage({
      canonicalPath: `${base}${position}/`,
      count: scenes.length,
      mode: "visual",
      position,
      receipt: hazardReceipt(artifact, scene, "visual", position),
      ...(position < scenes.length ? { nextPath: `${base}${position + 1}/` } : {}),
      ...(position > 1 ? { previousPath: `${base}${position - 1}/` } : {}),
      scene
    }))
    const nonvisualBase = `/hazards/session/${manifest.releaseId}-nonvisual/scene/`
    pages.push(hazardPage({
      canonicalPath: `${nonvisualBase}${position}/`,
      count: scenes.length,
      mode: "nonvisual",
      position,
      receipt: hazardReceipt(artifact, scene, "nonvisual", position),
      ...(position < scenes.length ? { nextPath: `${nonvisualBase}${position + 1}/` } : {}),
      ...(position > 1 ? { previousPath: `${nonvisualBase}${position - 1}/` } : {}),
      scene
    }))
  })

  const packReceiptRecords = [
    ...manifest.artifacts.filter(isPublicReleaseArtifact).map((artifact) => ({
      kind: "artifact" as const,
      path: `/content/vertical-slice/${artifact.path}`,
      bytes: artifact.bytes,
      sha256: artifact.sha256
    })),
    ...manifest.assets.map((asset) => ({
      kind: "asset" as const,
      path: `/${asset.path}`,
      bytes: asset.bytes,
      sha256: asset.sha256
    }))
  ]
  const firstPackReceipt = packReceiptRecords[0]
  if (firstPackReceipt === undefined) throw new Error("Offline pack has no public byte receipts")
  const packReceipts = [firstPackReceipt, ...packReceiptRecords.slice(1)] as const
  const compatibilityRecords = catalog.profiles.map((profile) => ({
    profileId: profile.id,
    label: profile.label,
    compatibilityKey: profile.compatibilityKey
  }))
  const firstCompatibility = compatibilityRecords[0]
  if (firstCompatibility === undefined) throw new Error("Offline pack has no compatible profile")
  const packNavigationRecords = [
    ...new Set(
      pages
        .map((page) => page.canonicalPath)
        .filter((path) => !trustedCurrentShellNavigation.has(path))
    )
  ]
  const firstPackNavigation = packNavigationRecords[0]
  if (firstPackNavigation === undefined) throw new Error("Offline pack has no navigation closure")
  const offlinePackDescriptor = assertClosedOfflinePackDescriptor(
    new OfflinePackDescriptor({
      schemaVersion: 1,
      id: `${manifest.releaseId}-v${manifest.packVersion}-${manifest.locale}`,
      releaseId: manifest.releaseId,
      packVersion: manifest.packVersion,
      locale: manifest.locale,
      label: `${catalog.profiles[0]?.label ?? "New York entry-level study"} offline pack`,
      lifecycle: "preview",
      publicationTime: null,
      compatibility: [firstCompatibility, ...compatibilityRecords.slice(1)],
      counts: {
        profiles: manifest.profileCount,
        sources: manifest.sourceCount,
        tools: manifest.toolCount,
        questions: manifest.questionCount,
        hazardScenes: manifest.hazardSceneCount
      },
      totalBytes: packReceipts.reduce((sum, receipt) => sum + receipt.bytes, 0),
      receipts: packReceipts,
      applicationShellManifestPath: "/offline-pack-shell-manifest.json",
      applicationShellManifestReceipt: null,
      applicationShellBytes: null,
      estimatedDownloadBytes: null,
      requiredNavigation: [firstPackNavigation, ...packNavigationRecords.slice(1)]
    })
  )

  pages.push({
    relativePath: "offline/index.html",
    canonicalPath: "/offline/",
    title: "Use offline — NY Custodian Exam Study",
    description: "Download the study pack for offline use, check it, turn it on, and remove it — each step is your choice.",
    robots: "noindex,follow",
    routeId: "offline-packs",
    section: "utility",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Use offline" }])}
    <section class="hero"><p class="eyebrow">Offline study</p><h1>Use this site offline.</h1><p>Nothing downloads on page load. When you request the study pack, it downloads and is checked, then waits for you to turn it on. If an update fails, your old copy still works.</p></section>
    <div data-offline-pack-manager data-island="offline-pack-manager"><p>JavaScript and available browser storage are required to manage offline downloads. No download has started.</p></div>
    <noscript><p class="source-note">Offline downloads require JavaScript. The reference pages remain available online.</p></noscript>
  </main>
  <script id="offline-pack-descriptor" type="application/json">${escapeJsonForHtml(offlinePackDescriptor)}</script>
  <script type="module" src="/src/offline-packs/react/bootstrap.tsx"></script>`
  })

  const settingsBootstrap = decodeSettingsBootstrap({
    schemaVersion: 1,
    questionIds: questions.map(({ value }) => value.id),
    sceneIds: scenes.map(({ value }) => value.id),
    trustedReleaseContentRegistry,
    reviewQueue: reviewBootstrap
  })
  pages.push({
    relativePath: "settings/index.html",
    canonicalPath: "/settings/",
    title: "Local settings and data — NY Custodian Exam Study",
    description: "Manage preferences, export and import your study data, and reset — all on this device.",
    robots: "noindex,follow",
    routeId: "settings",
    section: "utility",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Settings" }])}
    <section class="hero"><p class="eyebrow">On this device</p><h1>Keep local data understandable and portable.</h1><p>Preferences, export, import, and reset work without an account. Removing an offline download stays on the Use offline page so an active study session cannot lose its content by accident.</p></section>
    <div data-settings data-island="settings"><p>JavaScript and browser storage are required to open local settings. Nothing changes while this view loads.</p></div>
  </main>
  <script id="settings-bootstrap-data" type="application/json">${escapeJsonForHtml(settingsBootstrap)}</script>
  <script type="module" src="/src/settings/react/bootstrap.tsx"></script>`
  })

  pages.push({
    relativePath: "report/index.html",
    canonicalPath: "/report/",
    title: "Report a correction — NY Custodian Exam Study",
    description: "Write a correction draft in this browser. Online submission stays off until intake is separately turned on.",
    robots: "noindex,follow",
    routeId: "correction-submit",
    section: "utility",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "Report a correction" }])}
    <section class="hero"><p class="eyebrow">Structured text only · no attachments</p><h1>Report a content, access, rights, or security concern.</h1><p>Do not include secure questions, answer options, reconstructed drawings, photographs, or review-session notes. Local drafting works offline. Going online never submits or retries a draft automatically.</p></section>
    <aside class="local-data-warning"><h2>Reports cannot be sent right now</h2><p>Online submission is turned off until the correction service is separately approved and turned on. You can still save a draft in this browser, but browser data can be cleared. <a href="/settings/#export-local-data">Export a backup</a> if you want to keep it. Nothing is sent unless intake is on and you submit it yourself.</p></aside>
    <div data-correction-form data-island="correction-form"><p>JavaScript and browser storage are required to save a draft on this device. Nothing has been submitted.</p></div>
  </main>
  <script type="module" src="/src/corrections/react/bootstrap.tsx"></script>`
  })

  pages.push({
    relativePath: "transparency/corrections/index.html",
    canonicalPath: "/transparency/corrections/",
    title: "Corrections policy — NY Custodian Exam Study",
    description: "How corrections preserve history and remain separate from secure exam material.",
    robots: "index,follow",
    routeId: "corrections",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "Corrections" }])}<article class="reference-card"><p class="eyebrow">Corrections</p><h1>Corrections do not silently rewrite history.</h1><p>Reports may cover facts, original questions, explanations, images, accessibility, translation, rights, or security. A report is not publication. Accepted changes retain stable identities and correction history where applicable.</p><p>No attachments are accepted in v1. Suspected secure material must not be reproduced and, after any future activation, would enter a nonpublic hold without confirming whether it is genuine.</p><a class="button button-primary" href="/report/">Open the report form</a></article></main>`
  })

  pages.push({
    relativePath: "transparency/privacy/index.html",
    canonicalPath: "/transparency/privacy/",
    title: "Privacy — NY Custodian Exam Study",
    description: "Study progress is stored in this browser and can be cleared. Correction intake stays off until separately approved.",
    robots: "index,follow",
    routeId: "privacy",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "Privacy" }])}<article class="reference-card"><p class="eyebrow">Launch privacy</p><h1>Your study data is stored in this browser.</h1><p>Browser data can be cleared by you or the browser. <a href="/settings/#export-local-data">Export a backup</a> if you want to keep your study records.</p><p>No account, name, email, employer, applicant ID, or admission number is required. There is no launch analytics, ad profiling, cross-site tracking, data sale, or advertising audience creation.</p><p>A correction draft is stored only in this browser unless you submit it yourself after online intake is separately approved and turned on. While intake is off, the site runs no correction service at all — nothing is collected or logged.</p><p>Exports exclude free-form correction drafts unless you explicitly include them.</p></article></main>`
  })

  pages.push({
    relativePath: "transparency/security/index.html",
    canonicalPath: "/transparency/security/",
    title: "Security policy — NY Custodian Exam Study",
    description: "A non-reproduction boundary for secure and recalled exam material.",
    robots: "index,follow",
    routeId: "security",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "Security" }])}<article class="reference-card"><p class="eyebrow">Test security</p><h1>Do not reproduce secure exam material.</h1><p>Do not submit remembered questions, answer choices, reconstructed diagrams, photographs, admission notices, or review-session notes. This project publishes original study tasks and public-source references only.</p><p>The report contract returns a generic receipt and never confirms whether suspected secure material is genuine. There is no attachment handling or automatic public posting.</p><a href="/report/">Report a security concern without reproducing material</a></article></main>`
  })

  pages.push({
    relativePath: "transparency/foil/index.html",
    canonicalPath: "/transparency/foil/",
    title: "FOIL research boundary — NY Custodian Exam Study",
    description: "The current public-record research boundary and unresolved external actions.",
    robots: "index,follow",
    routeId: "foil",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "FOIL research" }])}<article class="reference-card"><p class="eyebrow">Research operations</p><h1>No external outreach is implied.</h1><p>Read-only official-source research and factual refreshes may inform the site. No FOIL request, email, records purchase, or other outreach is sent without separate authorization. Open facts remain labeled unresolved rather than guessed.</p></article></main>`
  })

  const paths = new Set<string>()
  const canonicals = new Set<string>()
  for (const page of pages) {
    assertCanonicalRouteId(page.routeId)
    if (paths.has(page.relativePath) || canonicals.has(page.canonicalPath)) {
      throw new Error(`Duplicate generated route: ${page.canonicalPath}`)
    }
    paths.add(page.relativePath)
    canonicals.add(page.canonicalPath)
  }
  return { pages, printBootstrap }
}

const writePage = async (page: PageDefinition): Promise<void> => {
  const target = new URL(page.relativePath, siteRoot)
  await mkdir(new URL("./", target), { recursive: true })
  await Bun.write(target, document(page))
}

const publishRelease = async (manifest: Manifest): Promise<void> => {
  const publicContentRoot = new URL("public/content/", siteRoot)
  await rm(publicContentRoot, { recursive: true, force: true })
  await mkdir(publicContentRoot, { recursive: true })

  const publicReleaseRoot = new URL("vertical-slice/", publicContentRoot)
  await mkdir(publicReleaseRoot, { recursive: true })
  await Bun.write(
    new URL("manifest.json", publicReleaseRoot),
    `${JSON.stringify(derivePublicDeliveryManifest(manifest), null, 2)}\n`
  )

  for (const artifact of manifest.artifacts.filter(isPublicReleaseArtifact)) {
    const destination = new URL(artifact.path, publicReleaseRoot)
    await mkdir(new URL("./", destination), { recursive: true })
    await cp(new URL(artifact.path, releaseRoot), destination)
  }
  for (const asset of manifest.assets) {
    const destination = new URL(asset.path.replace(/^content\//, ""), publicContentRoot)
    await mkdir(new URL("./", destination), { recursive: true })
    await cp(new URL(asset.path, repositoryRoot), destination)
  }

  if (await Bun.file(new URL("pack.postcommit.json", publicReleaseRoot)).exists()) {
    throw new Error("Consolidated postcommit pack must never be published")
  }
}

export const generateSite = async (): Promise<void> => {
  const release = await loadRelease()
  const managedDirectories = [
    "atlas",
    "exams",
    "hazards",
    "ny",
    "offline",
    "practice",
    "report",
    "review",
    "settings",
    "print",
    "simulations",
    "status",
    "transparency"
  ]
  await Promise.all(
    managedDirectories.map((directory) =>
      rm(new URL(`${directory}/`, siteRoot), { recursive: true, force: true })
    )
  )
  await Promise.all([
    rm(new URL("index.html", siteRoot), { force: true }),
    rm(new URL("404.html", siteRoot), { force: true })
  ])

  const { pages, printBootstrap } = buildPages(release)
  await Promise.all(pages.map(writePage))
  await Bun.write(new URL("404.html", siteRoot), notFoundDocument())
  await publishRelease(release.manifest)
  await Bun.write(
    new URL("public/print-bootstrap.json", siteRoot),
    `${JSON.stringify(printBootstrap)}\n`
  )
  await cp(new URL("src/styles.css", siteRoot), new URL("public/styles.css", siteRoot))

  console.log(
    `generated ${pages.length} documents, ${release.catalog.tools.length} tool pages, ` +
      `${release.questions.length} questions, and ${release.scenes.length} hazard scenes`
  )
}

if (import.meta.main) await generateSite()
