import { resolveAnnouncementTimeline } from "./announcement-timeline.ts"
import historicalV3 from "../../../content/authoring/compatibility/launch-v1-v3-review.json"
import { resolveFilingStatusReviews } from "./filing-status.ts"
import { setupDestinations } from "../src/practice/setup-navigation.ts"
import { questionCategoryFromSafeMetadata } from "../src/question-category.ts"
import { ReviewQueueBootstrap, ReviewQuestionBootstrap, type ReviewQuestionSource, type ReviewSceneSource } from "../src/review/model.ts"
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
type AnnouncementFact = NonNullable<Catalog["profiles"][number]["announcementFactSheet"]>["facts"][number]
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

const publicDate = (value: string): string =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
  })

const navIcon = (name: "study" | "library" | "exams" | "offline" | "settings" | "sources" | "menu" | "search"): string => {
  const paths = {
    study: '<path d="m2 9 10-5 10 5-10 5-10-5Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M22 9v7"/>',
    library: '<path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3V4Zm9 2v15"/>',
    exams: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3"/>',
    offline: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m10 2-.5 3-3 1-2.5-1-2 4 2.5 2v3L2 16l2 4 3-1 2 1 1 2h4l1-2 2-1 3 1 2-4-2.5-2v-3L22 9l-2-4-2.5 1-3-1L14 2h-4Z"/>',
    sources: '<path d="m12 2 8 3v6c0 5-5 9-8 11-3-2-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'
  }
  return `<svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}

const header = (section: NavSection, routeId?: RouteId): string => `
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand"${currentPage(section, "home")} href="/">NY Custodian Exam</a>
      <nav class="site-nav nav-primary" aria-label="Primary">
        <a${currentPage(section, "practice")} href="/practice/">${navIcon("study")}<span>Practice</span></a>
        <details class="site-nav-menu" data-library-menu>
          <summary${section === "atlas" || section === "hazards" ? ' class="nav-active"' : ""}>${navIcon("library")}<span>Library</span><svg class="nav-chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary>
          <div class="nav-popover">
            <a${currentPage(section, "atlas")} href="/atlas/"><strong>Tool atlas</strong><span>All 65 tools, what each is for, and the tools it gets mistaken for.</span></a>
            <a href="/atlas/#comparisons"><strong>Tool comparisons</strong><span>The 14 released comparisons, set side by side.</span></a>
            <a${currentPage(section, "hazards")} href="/hazards/"><strong>Hazard scenes</strong><span>All 18 workplace scenes, each with a written version.</span></a>
            <a href="/practice/#covers"><strong>What practice covers</strong><span>Which material questions come from, and what is left out.</span></a>
          </div>
        </details>
        <a${currentPage(section, "exams")} href="/exams/">${navIcon("exams")}<span>Exams</span></a>
      </nav>
      <nav class="site-nav nav-utility" aria-label="Settings">
        <a${routeId === "settings" ? ' aria-current="page"' : ""} href="/settings/" aria-label="Settings">${navIcon("settings")}<span>Settings</span></a>
      </nav>
    </div>
  </header>`

const footer = `
  <footer class="site-footer site-footer-prominent">
    <div class="site-footer-inner">
      <div class="footer-columns site-footer-columns"><div><strong>Independent and unofficial</strong><p>Free study for New York’s entry-level custodian exams. Not affiliated with or endorsed by New York City, New York State, or any civil service agency. Your official announcement and admission notice govern your exam.</p></div>
      <nav aria-label="Where this comes from"><strong>Where this comes from</strong><a href="/transparency/">Sources and methods</a><a href="/report/">Report a correction</a><a href="/transparency/security/">Exam security</a></nav>
      <nav aria-label="Site policies"><strong>Your study space</strong><a href="/offline/">Use offline</a><a href="/settings/">Settings and accessibility</a><a href="/transparency/privacy/">Privacy</a></nav></div>
      <div class="footer-bottom site-footer-meta"><p>Original practice. No secure or recalled exam material.</p><p>Progress stays in this browser. <a href="/settings/#export-local-data">Export a backup</a> before browser data is cleared.</p></div>
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
${["question-player", "hazard-player", "review-player", "simulation-player"].includes(routeId) ? '<header class="site-header focused-session-header"><div class="site-header-inner"><span class="brand">NY Custodian Exam</span><nav aria-label="Session"><a class="button button-secondary" href="/practice/">Exit to Practice</a></nav></div></header>' : header(section, routeId)}
${body}
${["question-player", "hazard-player", "review-player", "simulation-player"].includes(routeId) ? '<footer class="site-footer focused-session-footer"><div class="site-footer-inner"><p>Original practice. Independent and unofficial.</p></div></footer>' : footer}
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

const sourceProofLine = (
  sourceLineIds: readonly string[],
  checkedDates: readonly string[],
  sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>,
  sourceById: ReadonlyMap<string, ContentSource>
): string => {
  const sourceIds = [...new Set(sourceLineIds.map((id) => {
    const line = sourceLineById.get(id)
    if (line === undefined) throw new Error(`Missing source line for public proof: ${id}`)
    return line.sourceId
  }))]
  const sources = sourceIds.map((id) => {
    const source = sourceById.get(id)
    if (source === undefined) throw new Error(`Missing source for public proof: ${id}`)
    const publicTitle = source.title.replace(/\b(Exam(?:ination)?)\s+\d+\b/gi, "$1")
    return `${escapeHtml(source.publisher)}, <a href="/transparency/sources/${slugify(id)}/">${escapeHtml(publicTitle)}</a>`
  })
  const dates = [...new Set(checkedDates)].sort().map(publicDate).map(escapeHtml)
  return `<p class="proof-line"><strong>Where this comes from:</strong> ${sources.join("; ")}.${dates.length === 0 ? "" : ` Checked ${dates.join("; ")}.`}</p>`
}

export const renderAnnouncementMilestones = (
  facts: readonly AnnouncementFact[],
  sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>,
  sourceById: ReadonlyMap<string, ContentSource>,
  sectionId: string
): string => {
  const milestones = facts.filter((fact) =>
    fact.state === "verified" && fact.value !== null &&
    (fact.category === "filing_period" || fact.category === "exam_date")
  )
  const administration = facts.filter((fact) =>
    fact.category === "administration_status" && fact.state !== "superseded"
  )
  if (milestones.length === 0 && administration.length === 0) return ""
  const evidence = [...milestones, ...administration]
  const lineIds = [...new Set(evidence.flatMap((fact) => [
    ...fact.sourceLineIds,
    ...fact.conflictingValues.flatMap((value) => value.sourceLineIds)
  ]))]
  if (sectionId === "home-cycle") return `<section class="home-section home-cycle-summary" aria-labelledby="home-cycle-heading">
    <div class="section-header"><h2 id="home-cycle-heading">Where the cycle stands</h2><p>What the reviewed announcements say. Later announcements or filing periods may exist outside this record.</p></div>
    <div class="home-cycle-grid"><div class="notice notice-warning">
      ${administration.map((fact) => `<h3>${fact.state === "unverified" ? "Administration: Not confirmed" : escapeHtml(fact.label)}</h3><p>${escapeHtml(fact.value ?? fact.detail ?? "No administration value is asserted in this record.")}</p>`).join("")}
      <p>Next-cycle dates are not specified here.</p><a class="button button-secondary" href="/exams/">Read both announcements</a>
    </div><dl class="home-cycle-dates">${milestones.map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value as string)}</dd></div>`).join("")}</dl></div>
    <details class="home-cycle-evidence"><summary>Sources and review dates</summary>${sourceProofLine(lineIds, evidence.map((fact) => fact.reviewedOn), sourceLineById, sourceById)}${sourceLineLinks(lineIds, sourceLineById, sourceById)}</details>
  </section>`
  if (sectionId === "exams-cycle") {
    const timeline = resolveAnnouncementTimeline(facts)
    const caveat = "Later announcements or filing periods may exist outside this reviewed record. Next-cycle dates are not specified here."
    const notices = (includeCaveat: boolean) => administration.map((fact) => `<aside class="notice ${fact.state === "unverified" || fact.state === "conflicting" ? "notice-warning" : "notice-neutral"}" data-administration-state="${fact.state}"><h3>${fact.state === "unverified" ? "Administration: Not confirmed" : escapeHtml(fact.label)}</h3><p>${escapeHtml(fact.value ?? fact.detail ?? "No administration value is asserted in this record.")}</p>${fact.conflictingValues.length === 0 ? "" : `<ul>${fact.conflictingValues.map((value) => `<li>${escapeHtml(value.value)}</li>`).join("")}</ul>`}${includeCaveat ? `<p>${caveat}</p>` : ""}</aside>`).join("")
    return `<section class="home-section announcement-cycle exams-cycle-summary" id="exams-cycle" aria-labelledby="exams-cycle-heading">
      <div class="section-header"><h2 id="exams-cycle-heading">Where the cycle stands</h2><p>Dates from the reviewed announcements. Each announcement keeps its own filing terms.</p></div>
      <div class="exams-cycle-compact">${notices(true)}</div>
      <ol class="timeline">${timeline.map(entry => `<li class="timeline-item-${entry.kind}${entry.tone === "warning" ? ' timeline-item-warning' : ""}"><time class="timeline-date" datetime="${entry.date}"><span class="timeline-ample">${escapeHtml(publicDate(entry.date))}</span><span class="timeline-compact">${escapeHtml(publicDate(entry.date).replace(/, \d{4}$/, ""))}</span></time><strong><span class="timeline-ample">${escapeHtml(entry.label)}</span><span class="timeline-compact">${escapeHtml(entry.compactLabel)}</span></strong><p class="timeline-note">${escapeHtml(entry.note)}</p></li>`).join("")}</ol>
      <div class="exams-cycle-ample">${notices(false)}</div>
      <p class="source-note${administration.length === 0 ? "" : " exams-cycle-caveat"}">${caveat}</p>
      <details class="home-cycle-evidence"><summary>Sources and review dates</summary>${sourceProofLine(lineIds, evidence.map((fact) => fact.reviewedOn), sourceLineById, sourceById)}${sourceLineLinks(lineIds, sourceLineById, sourceById)}</details>
    </section>`
  }
  return `<section class="home-section announcement-cycle" id="${escapeHtml(sectionId)}" aria-labelledby="${escapeHtml(sectionId)}-heading"><div class="section-header"><h2 id="${escapeHtml(sectionId)}-heading">Where the cycle stands</h2><p>Dates from the reviewed announcements. Each announcement keeps its own filing terms.</p></div>
    ${milestones.length === 0 ? "" : `<ol class="timeline">${milestones.map((fact) => `<li><strong>${escapeHtml(fact.label)}</strong><p class="timeline-note">${escapeHtml(fact.value as string)}</p></li>`).join("")}</ol>`}
    ${administration.map((fact) => `<aside class="notice ${fact.state === "unverified" || fact.state === "conflicting" ? "notice-warning" : "notice-neutral"}" data-administration-state="${fact.state}"><h3>${fact.state === "unverified" ? "Administration: Not confirmed" : escapeHtml(fact.label)}</h3><p>${escapeHtml(fact.value ?? fact.detail ?? "No administration value is asserted in this record.")}</p>${fact.conflictingValues.length === 0 ? "" : `<ul>${fact.conflictingValues.map((value) => `<li>${escapeHtml(value.value)}</li>`).join("")}</ul>`}</aside>`).join("")}
    <p class="source-note">Later announcements or filing periods may exist outside this reviewed record. Next-cycle dates are not specified here.</p>
    ${sourceProofLine(lineIds, evidence.map((fact) => fact.reviewedOn), sourceLineById, sourceById)}
    <details class="technical-details"><summary>Technical details</summary>${sourceLineLinks(lineIds, sourceLineById, sourceById)}</details>
  </section>`
}

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

const renderQuestionIllustrationFallback = (question: Question): string => {
  const illustration = question.illustration
  if (illustration === undefined) return ""
  const web = illustration.derivatives.find(asset => asset.kind === "web")
  const phone = illustration.derivatives.find(asset => asset.kind === "phone")
  if (web === undefined) return '<p role="alert">The question illustration is unavailable. Skip this question for now.</p>'
  return `<figure class="question-illustration"><picture>
    ${phone === undefined ? "" : `<source media="(max-width: 30rem)" srcset="/${escapeHtml(phone.path)}">`}
    <img src="/${escapeHtml(web.path)}" alt="${escapeHtml(illustration.neutralDescription)}">
  </picture></figure>`
}

const renderQuestionFallback = (question: Question, position: number, count: number): string => `
      <article class="question-card" aria-labelledby="question-heading">
        <header class="question-prompt">
          <p class="eyebrow">Question ${position} of ${count}</p>
          <h1 id="question-heading">${escapeHtml(question.prompt)}</h1>
          <p>Select one answer — you can change it until you submit. Submitting locks your answer, and the explanation opens only after it is saved on this device.</p>
        </header>
        ${renderQuestionIllustrationFallback(question)}
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
  practiceInventory,
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
  readonly practiceInventory?: ReadonlyArray<ReviewQuestionSource>
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
    <div data-question-player data-island="question-player-bootstrap" data-position-label="${context === "review" ? "Review" : "Question"} ${position} of ${count}" data-question-attempt-id="${escapeHtml(questionAttemptId(receipt))}" data-postcommit-url="${escapeHtml(receipt.postcommitPath)}">${renderQuestionFallback(question, position, count)}</div>
    <nav class="directional-nav" aria-label="Question navigation">
      ${previousPath === undefined ? "<span></span>" : `<a data-session-history="replace" href="${previousPath}">← Previous question</a>`}
      ${nextPath === undefined ? "<span>End of session</span>" : `<a data-session-history="replace" href="${nextPath}">Next question →</a>`}
    </nav>
  </main>
  ${practiceInventory === undefined ? "" : `<script id="practice-inventory-data" type="application/json">${escapeJsonForHtml(practiceInventory)}</script>`}
  <script id="question-data" type="application/json">${escapeJsonForHtml(question)}</script>
  <script id="question-receipt-data" type="application/json">${escapeJsonForHtml(receipt)}</script>
  <script type="module" src="/src/question-player/react/bootstrap.tsx"></script>`
})

const hazardPage = ({
  canonicalPath,
  drillInventory,
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
  readonly drillInventory?: ReadonlyArray<ReviewSceneSource>
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
      data-position-label="Scene ${position} of ${count}"
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
  ${drillInventory === undefined ? "" : `<script id="hazard-drill-inventory" type="application/json">${escapeJsonForHtml(drillInventory)}</script>`}
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
  const filingReviews = resolveFilingStatusReviews(catalog)
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
      }),
      ...historicalV3.reviewQueue.questions.map(source => ({
        releaseId: source.receipt.releaseId, packVersion: source.receipt.packVersion,
        variant: "question", itemId: source.id, optionIds: source.optionIds,
        postcommitReceipt: { postcommitPath: source.receipt.postcommitPath, postcommitBytes: source.receipt.postcommitBytes, postcommitSha256: source.receipt.postcommitSha256 }
      })),
      ...historicalV3.reviewQueue.scenes.flatMap(source => {
        const shared = { releaseId: source.visualReceipt.releaseId, packVersion: source.visualReceipt.packVersion,
          itemId: source.scene.id, allowedZoneOrders: source.scene.neutralPreAnswer.zones.map(zone => zone.order),
          assetRevision: source.visualReceipt.assetRevision, assetMasterSha256: source.visualReceipt.assetMasterSha256,
          postcommitReceipt: { postcommitPath: source.visualReceipt.postcommitPath, postcommitBytes: source.visualReceipt.postcommitBytes, postcommitSha256: source.visualReceipt.postcommitSha256 } }
        const image = source.scene.asset.derivatives.find(asset => asset.kind === "web")
        if (image === undefined) throw new Error(`Historical scene image missing: ${source.scene.id}`)
        return [
          { ...shared, variant: "hazard-visual", mode: "visual", visualAssetReceipt: { path: `/${image.path}`, bytes: image.bytes, sha256: image.sha256 } },
          { ...shared, variant: "hazard-nonvisual", mode: "nonvisual", visualAssetReceipt: null }
        ]
      })
    ]
  })
  const canonicalReviewBootstrap = {
    schemaVersion: 1,
    questions: questions.map(({ value: question }, index) => {
      const artifact = questionPostcommitById.get(question.id)
      if (artifact === undefined) {
        throw new Error(`Question ${question.id} has no review projection feedback record`)
      }
      return {
        id: question.id,
        prompt: question.prompt,
        optionIds: question.options.map((option) => option.id),
        receipt: questionReceipt(artifact, question.id, index + 1),
        category: questionCategoryFromSafeMetadata(question),
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
        ...(question.illustration === undefined ? {} : { illustration: {
          neutralDescription: question.illustration.neutralDescription,
          asset: (() => {
            const image = question.illustration.derivatives.find(asset => asset.kind === "print")
            if (image === undefined) throw new Error(`Question ${question.id} has no print illustration`)
            return { path: `/${image.path}`, bytes: image.bytes, sha256: image.sha256 }
          })()
        } }),
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
  const leadPracticeSession = sessionByCapacity.get("all:all:45")
  const leadPracticeHref = leadPracticeSession === undefined
    ? "/practice/#practice-sets"
    : `/practice/session/${leadPracticeSession.id}/question/1/`
  const announcementFacts = catalog.profiles.flatMap((profile) =>
    profile.announcementFactSheet?.facts ?? []
  )
  const subjectPlanFact = announcementFacts.find((fact) => fact.category === "subjects" && fact.state === "verified")
  const subjectAreas = subjectPlanFact?.value?.replace(/\.$/, "").split("; ") ?? []
  const subjectDescriptions: Readonly<Record<string, string>> = {
    "Cleaning Tools and Their Uses": "Recognizing cleaning tools from a drawing or a description, and matching each one to the job it is meant for.",
    "Tools Used for Minor Maintenance and Repair": "Hand tools for small repairs, choosing the right one for the task, and knowing when a tool has become unsafe to use.",
    "Health and Safety Issues in Custodial Work": "Safe work practices, chemicals and protective equipment, and spotting what is wrong in a workplace scene."
  }
  const studyTasks = [
    { title: "Practice questions", detail: leadPracticeSession === undefined ? `${questions.length} original questions, with reasoning and sources after you submit each answer.` : `Start with ${leadPracticeSession.length} questions, untimed. Read the reasoning and sources after each saved answer.`, compactDetail: leadPracticeSession === undefined ? "Untimed practice sets" : `${leadPracticeSession.length} questions, untimed`, href: "/practice/", action: "Open practice", icon: "study" as const },
    { title: "Tool atlas", detail: `${releasedTools.length} illustrated tool references, with the features that tell look-alikes apart.`, compactDetail: `${releasedTools.length} illustrated tools`, href: "/atlas/", action: "Browse tools", icon: "library" as const },
    { title: "Hazard scenes", detail: `${scenes.length} workplace scenes. Mark the picture or use the text and keyboard version.`, compactDetail: `${scenes.length} scenes, with text versions`, href: "/hazards/", action: "Run a drill", icon: "sources" as const },
    { title: "Practice simulation", detail: "Build a set and hold feedback until the end. Choose the length and timing that suit your study.", compactDetail: "Choose length and timing", href: "/simulations/", action: "Set one up", icon: "exams" as const },
    { title: "Review saved attempts", detail: "Return to questions and scenes identified by your saved practice on this device.", compactDetail: "Return to saved practice", href: "/review/", action: "Open Review", icon: "study" as const },
    { title: "Print center", detail: "Make a worksheet from the released study content, with an optional separate answer key.", compactDetail: "Worksheets and answers", href: "/print/", action: "Build a worksheet", icon: "offline" as const }
  ]
  const renderTaskCards = (tasks: readonly typeof studyTasks[number][], columnsClass: string): string =>
    `<ul class="task-cards ${columnsClass}">${tasks.map((task, index) => `<li class="task-card${index === 0 ? " task-card-primary" : ""}"><a class="task-card-link" href="${task.href}" aria-labelledby="task-${slugify(task.title)}-title">${navIcon(task.icon)}<h3 class="task-card-title" id="task-${slugify(task.title)}-title">${task.title}</h3><p class="task-card-description">${escapeHtml(task.detail)}</p><p class="task-card-compact-summary">${escapeHtml(task.compactDetail)}</p><span class="task-card-cta button button-${index === 0 ? "primary" : "secondary"}">${task.action}</span></a></li>`).join("")}</ul>`
  const studyTaskCards = renderTaskCards(studyTasks, "home-ways-grid")
  const examTaskCards = renderTaskCards(
    ["/practice/", "/simulations/", "/hazards/", "/atlas/"].flatMap((href) =>
      studyTasks.filter((task) => task.href === href)
    ),
    "exam-ways-grid"
  )
  const scopeList = `<ol class="home-scope-list home-scope-list-framed">${subjectAreas.map((area, index) => `<li class="home-scope-row"><span aria-hidden="true">${index + 1}</span><div><h3>${escapeHtml(area)}</h3>${subjectDescriptions[area] === undefined ? "" : `<p>${escapeHtml(subjectDescriptions[area])}</p>`}</div><a class="button button-secondary" href="${index === 2 ? "/hazards/" : "/atlas/"}">${index === 2 ? "Hazard scenes" : "Tool atlas"}</a></li>`).join("")}</ol>`
  const reviewedDates = [...new Set(catalog.profiles.map((profile) => profile.contentAvailability.lastVerifiedOn))]
  const historicalPrefix = `/history/${historicalV3.releaseId}-v${historicalV3.packVersion}`
  const historicalQuestions = historicalV3.reviewQueue.questions.map(source => ({ ...source, itemUrl: historicalPrefix + source.itemUrl }))
  const historicalPractice = historicalV3.reviewQueue.practiceQuestions.map(source => ({ ...source, itemUrl: historicalPrefix + source.itemUrl }))
  for (const old of historicalV3.precommitReceipts) {
    const current = manifest.artifacts.find(artifact => `/content/vertical-slice/${artifact.path}` === old.path)
    if (current === undefined || current.sha256 !== old.sha256 || current.bytes !== old.bytes) throw new Error(`Historical question stimulus unavailable: ${old.path}`)
  }
  for (const old of historicalQuestions) {
    const current = questionPostcommitById.get(old.id)
    if (current === undefined || current.sha256 !== old.receipt.postcommitSha256 || current.bytes !== old.receipt.postcommitBytes) throw new Error(`Historical question feedback unavailable: ${old.id}`)
  }
  const historicalScenes = historicalV3.reviewQueue.scenes.map(source => ({ ...source,
    visualItemUrl: historicalPrefix + source.visualItemUrl, nonvisualItemUrl: historicalPrefix + source.nonvisualItemUrl }))
  for (const old of historicalV3.scenePrecommitReceipts) {
    const current = manifest.artifacts.find(artifact => `/content/vertical-slice/${artifact.path}` === old.path)
    if (current === undefined || current.sha256 !== old.sha256 || current.bytes !== old.bytes) throw new Error(`Historical scene stimulus unavailable: ${old.path}`)
  }
  for (const old of historicalScenes) {
    const current = scenePostcommitById.get(old.scene.id)
    if (current === undefined || current.sha256 !== old.visualReceipt.postcommitSha256 || current.bytes !== old.visualReceipt.postcommitBytes) throw new Error(`Historical scene feedback unavailable: ${old.scene.id}`)
  }
  const previousInventories = [{ questions: historicalQuestions, practiceQuestions: historicalPractice, scenes: historicalScenes }]
  const reviewBootstrap = {
    ...canonicalReviewBootstrap,
    previousInventories,
    practiceQuestions: questionSessions.flatMap((session) => session.questions.map(({ value: question }, index) => {
      const artifact = questionPostcommitById.get(question.id)
      if (artifact === undefined) throw new Error(`Question ${question.id} has no study history receipt`)
      return {
        id: question.id,
        prompt: question.prompt,
        receipt: questionReceipt(artifact, question.id, index + 1, session.id),
        optionIds: question.options.map((option) => option.id),
        itemUrl: `/practice/session/${session.id}/question/${index + 1}/`
      }
    }))
  }
  const studyBootstrap = {
    schemaVersion: 1,
    toolCount: releasedTools.length,
    questionCount: questions.length,
    sceneCount: scenes.length,
    profileLabel: capacityProfile.label,
    firstPractice: (() => {
      const session = leadPracticeSession ?? questionSessions.filter((candidate) => candidate.record.filterKind === "all")
        .sort((left, right) => left.length - right.length)[0]
      return session === undefined ? null : {
        href: `/practice/session/${session.id}/question/1/`,
        label: `Start a ${session.length}-question set`,
        length: session.length
      }
    })(),
    reviewQueue: reviewBootstrap
  }
  const examRecords = catalog.profiles.flatMap((profile) => {
    const identities = profile.examIdentities.length === 0 ? [null] : profile.examIdentities
    return identities.map((identity) => ({
      id: identity === null ? slugify(profile.id) : `exam-${slugify(identity.examNumber)}`,
      title: identity === null ? profile.label : identity.title,
      kind: identity === null ? "Statewide study plan" : capitalize(identity.competitionType.replaceAll("-", " ")),
      profile,
      identity,
      filingReview: identity === null ? undefined : filingReviews.get(`${profile.id}:${identity.examNumber}`),
      facts: profile.announcementFactSheet?.facts.filter((fact) =>
        identity !== null && fact.appliesToExamNumbers.includes(identity.examNumber) && fact.state !== "superseded"
      ) ?? []
    }))
  }).sort((left, right) => Number(left.identity === null) - Number(right.identity === null))

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
  <main class="page-shell home-page" id="main-content" tabindex="-1">
    <section class="page-header-prominent home-hero">
      <div class="page-header-copy"><h1>Free practice for the New York Entry-Level Custodians and Janitors series.</h1><p><span class="home-intro-ample">One question bank for that series, covering the three subject areas the state test guide names for it. Every answer carries its reasoning and its source, and announcements are quoted rather than guessed at. Your own announcement is what says which areas your test uses.</span><span class="home-intro-compact">The three subject areas the state test guide names for this series, each answer with its reasoning and source. Your own announcement says which areas your test uses.</span></p></div>
      <div class="question-controls"><a class="button button-primary" href="/practice/">Start practicing</a><a class="button button-secondary" href="/practice/#covers">What practice covers</a></div>
      <dl class="figure-strip"><div><dt>Subject areas</dt><dd>${subjectAreas.length}, named for this series</dd></div><div><dt>Tool records</dt><dd>${releasedTools.length}<span class="ample-detail">, with what tells look-alikes apart</span></dd></div><div><dt>Hazard scenes</dt><dd>${scenes.length}<span class="ample-detail">, each with a text version</span></dd></div><div><dt>Facts checked</dt><dd>${reviewedDates.map(publicDate).map(escapeHtml).join(", ")}</dd></div></dl>
    </section>
    <div class="home-content">
      <section class="home-section home-areas-section" aria-labelledby="home-areas"><div class="section-header"><h2 id="home-areas">What the test covers</h2><p>Three areas, named by the state test guide for this series. Your own announcement controls which subjects apply; practice-set sizes are designed for this site.</p></div>${scopeList}<p class="home-scope-caveat">Your own announcement controls which subjects apply; practice-set sizes are designed for this site.</p>${subjectPlanFact === undefined ? "" : `${sourceProofLine(subjectPlanFact.sourceLineIds, [subjectPlanFact.reviewedOn], sourceLineById, sourceById)}<details class="technical-details"><summary>Technical details</summary>${sourceLineLinks(subjectPlanFact.sourceLineIds, sourceLineById, sourceById)}</details>`}</section>
      <section class="home-section" aria-labelledby="home-ways"><div class="section-header"><h2 id="home-ways">Ways to study</h2><p>Save an <a href="/offline/">offline pack</a> to use its study content without a connection.</p></div>${studyTaskCards}</section>
      ${renderAnnouncementMilestones(announcementFacts, sourceLineById, sourceById, "home-cycle")}
      <section class="home-section" aria-labelledby="home-trust"><div class="section-header"><h2 id="home-trust">How this site works</h2><p>The short version, with links to the full details.</p></div><dl class="fact-table home-trust-list"><div><dt>Who runs it</dt><dd>An independent study project, unaffiliated with any civil service agency. <a href="/transparency/">Sources and methods</a></dd></div><div class="home-trust-ample"><dt>What it costs</dt><dd>Nothing, and there is no account to create. You choose when to download a study copy. <a href="/offline/">Use offline</a></dd></div><div><dt>Where your data lives</dt><dd>Saved in this browser. Browser data can be cleared; <a href="/settings/#export-local-data">export a backup</a> to keep your records.</dd></div><div><dt>Where the facts come from</dt><dd>Public source records with review dates and visible uncertainty. <a href="/transparency/">Read the sources</a></dd></div><div class="home-trust-ample"><dt>What it is not</dt><dd>The real test. These questions are original practice; no secure or recalled material is used, and practice accuracy does not predict your exam score. <a href="/transparency/security/">Content and exam security</a></dd></div></dl></section>
    </div>
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
    <div data-review-queue data-island="review-queue-bootstrap">
      <section class="page-header"><h1>Your review queue</h1><p>Revisit questions and scenes identified by practice saved on this device.</p></section>
      <section class="review-state" aria-labelledby="review-queue-heading">
        <h2 id="review-queue-heading">Loading your local review queue</h2>
        <p>JavaScript and available browser storage are required to read your saved study attempts. No answers or feedback are embedded in this page.</p>
      </section>
    </div>
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
    <section class="hero"><h1>Create a practice simulation.</h1><p>Build a multiple-choice or hazard-scene set — including a keyboard, no-image version — from the current release. It does not claim official exam length, question mix, score conversion, or a passing-score prediction.</p></section>
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
    title: "Exams — NY Custodian Exam Study",
    description: "Compare published exam announcements and the statewide entry-level custodian study plan, with sources and visible uncertainty.",
    robots: "index,follow",
    routeId: "exam-selector",
    section: "exams",
    body: `
  <main class="page-shell home-page exams-page" id="main-content" tabindex="-1">
    <section class="page-header-prominent"><div class="page-header-copy"><h1>Exam announcements, and what each one says</h1><p class="lead">What each announcement states, when we read it, and how it relates to the subjects this site practices. Reading an announcement does not change your practice or saved work.</p></div><div class="question-controls"><a class="button button-primary" href="#exams-board">Check your announcement</a><a class="button button-secondary" href="/practice/">Explore entry-level practice</a></div><dl class="figure-strip"><div><dt>Announcements</dt><dd>${examRecords.filter((record) => record.identity !== null).length}</dd></div><div><dt>Study profiles</dt><dd>${catalog.profiles.length}</dd></div><div><dt>Subject areas</dt><dd>${subjectAreas.length}</dd></div><div><dt>Content reviewed</dt><dd>${reviewedDates.map(publicDate).map(escapeHtml).join(", ")}</dd></div></dl></section>
    <div class="home-content">
      ${renderAnnouncementMilestones(announcementFacts, sourceLineById, sourceById, "exams-cycle")}
      <section class="home-section" id="exams-board" data-exam-browser aria-labelledby="exam-board-heading"><div class="section-header"><h2 id="exam-board-heading">Find your exam</h2><p>Open an entry to compare its facts. Your official announcement and admission notice govern your exam.</p></div>
        <div class="exam-search-controls"><div class="search-field" data-exam-search-field hidden><label class="sr-only" for="exam-search">Search announcements and study plans</label>${navIcon("search")}<input id="exam-search" type="search" data-exam-search placeholder="Title, jurisdiction, or exam number" autocomplete="off"></div>
        <div class="filter-group" role="group" aria-label="Filing status at source review" data-exam-status-filters hidden>${[["all", "All"], ["open", "Open for filing"], ["closed", "Filing closed"], ["plan", "Plan only"]].map(([value, label]) => `<button type="button" data-exam-status-filter="${value}" aria-pressed="${value === "all"}">${label}</button>`).join("")}</div></div>
        <p class="source-note">Filing labels describe the announcement at its source review date. Later notices or filing periods may exist.</p>
        <p class="source-note" data-exam-count role="status">${examRecords.length} entries in the published registry.</p>
        <div class="record-board"><ul class="record-list" aria-label="Available profiles">${examRecords.map((record) => `<li data-exam-row data-exam-status="${record.identity === null ? "plan" : record.filingReview?.state ?? "unknown"}" data-exam-search-text="${escapeHtml(`${record.title} ${record.kind} ${record.profile.jurisdiction} ${record.identity?.examNumber ?? ""}`.toLowerCase())}"><a class="record-item" data-exam-choice="${record.id}" href="#${record.id}"><strong>${escapeHtml(record.title)}</strong><span class="record-kind">${escapeHtml(record.kind)}</span><span class="record-when">${escapeHtml(record.profile.jurisdiction)}</span><span class="status-chip ${record.filingReview?.state === "closed" ? "status-chip-warning" : "status-chip-neutral"}">${record.identity === null ? "Plan only" : record.filingReview?.state === "closed" ? "Filing closed" : record.filingReview?.state === "open" ? "Open for filing" : "Status unverified"}</span>${record.filingReview === undefined ? "" : `<span class="record-when">Reviewed ${escapeHtml(publicDate(record.filingReview.reviewedOn))}</span>`}</a><div class="exam-card-coverage"><p>${record.identity === null ? "The statewide guide names three subject areas. Your own announcement controls which apply." : escapeHtml(record.profile.testPlanCompatibility.detail)}</p><a class="button button-primary" href="/practice/#covers">See what practice covers</a></div></li>`).join("")}</ul>
          <div class="record-detail-stack"><section class="record-detail" data-exam-prompt hidden><h3>Start with the title on your announcement</h3><p>Choose an entry to read its facts and source support. Reading an entry does not change your study settings.</p></section>${examRecords.map((record) => `<article class="record-detail" id="${record.id}" data-exam-panel tabindex="-1" aria-labelledby="${record.id}-heading"><div class="record-detail-header"><div><p class="record-kind">${escapeHtml(record.kind)}</p><h3 id="${record.id}-heading">${escapeHtml(record.title)}</h3><p>${escapeHtml(record.profile.audience)}</p></div><div class="record-detail-actions"><a class="button button-primary" href="/practice/#covers">See what practice covers</a><a class="button button-secondary" href="${record.profile.canonicalPath}">Read the full profile</a></div></div>

            <div class="tabs" role="tablist" aria-label="${escapeHtml(record.title)} details" data-exam-tabs hidden><button type="button" id="${record.id}-facts-tab" role="tab" aria-selected="true" aria-controls="${record.id}-facts" data-record-tab="facts">Announcement facts</button><button type="button" id="${record.id}-subjects-tab" role="tab" aria-selected="false" aria-controls="${record.id}-subjects" data-record-tab="subjects" tabindex="-1">What it tests</button></div>
            <section id="${record.id}-facts" data-record-tab-panel="facts"><h4>Announcement facts</h4>${record.identity === null ? `<p>${escapeHtml(record.profile.testPlanCompatibility.detail)}</p><p>This statewide study plan has no exam number or filing period. Use your jurisdiction’s announcement for those details.</p>` : `<dl class="fact-table">${record.facts.filter((fact) => ["filing_period", "exam_date", "fee", "qualifications", "jurisdictions", "administration_status"].includes(fact.category)).map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${fact.state === "verified" ? "" : `<span class="fact-state fact-state-${fact.state}">${fact.category === "administration_status" && fact.state === "unverified" ? "Not confirmed" : factStateLabel(fact.state)}</span> `}${escapeHtml(fact.value ?? fact.detail ?? "No value asserted.")}</dd></div>`).join("")}</dl>`}</section>
            <section id="${record.id}-subjects" data-record-tab-panel="subjects"><h4>What it tests</h4><p>${escapeHtml(record.profile.testPlanCompatibility.detail)}</p>${scopeList}<p>Practice-set lengths and distributions are designed for this site. They do not establish the official question count or subject weights.</p></section>
            <details class="source-note record-source-trail"><summary>Sources for this record</summary>${sourceProofLine([...new Set(record.identity === null ? record.profile.testPlanCompatibility.sourceLineIds : record.facts.flatMap((fact) => [...fact.sourceLineIds, ...fact.conflictingValues.flatMap((value) => value.sourceLineIds)]))], record.identity === null ? [record.profile.contentAvailability.lastVerifiedOn] : record.facts.map((fact) => fact.reviewedOn), sourceLineById, sourceById)}${record.identity === null ? sourceLineLinks(record.profile.testPlanCompatibility.sourceLineIds, sourceLineById, sourceById) : `<dl class="record-fact-sources">${record.facts.map(fact => `<div data-source-fact="${escapeHtml(fact.id)}"><dt>${escapeHtml(fact.label)}</dt><dd><p>Checked ${escapeHtml(publicDate(fact.reviewedOn))}.</p>${sourceLineLinks([...new Set([...fact.sourceLineIds, ...fact.conflictingValues.flatMap(value => value.sourceLineIds)])], sourceLineById, sourceById)}</dd></div>`).join("")}</dl>`}<p>${record.identity === null ? "No exam number at the statewide study-plan level." : `Exam number ${escapeHtml(record.identity.examNumber)}.`} Profile version ${record.profile.version}. Content reviewed ${escapeHtml(publicDate(record.profile.contentAvailability.lastVerifiedOn))}.</p></details>
          </article>`).join("")}</div>
        </div><div class="empty-state" data-exam-empty hidden><h3 tabindex="-1">No entries match these filters</h3><p>Clear the filters to see every announcement and study plan in this published registry.</p><button class="button button-secondary" type="button" data-exam-clear>Clear filters</button></div>
      </section>
      <section class="home-section"><div class="section-header"><h2>Start studying</h2><p>Explore the original practice and reference content without an account.</p></div>${examTaskCards}</section>
    </div>
  </main>
  <script type="module" src="/src/static-browser.ts"></script>`
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
    title: "Practice and activity — NY Custodian Exam Study",
    description: "Original practice questions. Answers and explanations open only after you submit each answer.",
    robots: "index,follow",
    routeId: "study-hub",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    <div data-study-hub><section class="page-header"><h1>Practice and activity</h1><p>Practice for the New York entry-level Custodians and Janitors series. Choose a question set or revisit your saved attempts.</p><div class="question-controls"><a class="button button-primary" href="#practice-sets">Choose a practice set</a><a class="button button-secondary" href="/review/">Open Review</a></div></section><section class="section-gap" id="covers" aria-labelledby="study-fallback-ways"><h2 id="study-fallback-ways">What practice covers</h2><p>One original question bank for the New York Entry-Level Custodians and Janitors series: cleaning tools, minor maintenance tools, and health and safety. Reading an exam page does not select an exam or change this bank.</p>${studyTaskCards}</section><p class="source-note">JavaScript and available browser storage are required to show progress saved on this device.</p></div>
    <details class="section-gap study-quick-presets" id="practice-sets"><summary>Quick preset sets</summary><div class="section-header"><h2>Choose a practice set</h2><p>Each set draws distinct questions with no repeats. These sizes and distributions are designed for this site.</p></div>
    <ul class="study-set-options" aria-label="Available whole-bank practice lengths">${catalog.practiceCapacity.advertisedSetLengths.map((length) => {
      const session = sessionByCapacity.get(`all:all:${length}`)
      return session === undefined
        ? `<li><div><h3>${length} questions</h3><p>Not available: this release cannot fill ${length} questions without repeats.</p></div></li>`
        : `<li><div><h3>${length} questions</h3><p>Untimed, with no repeated questions.</p></div><a class="button button-secondary" href="/practice/session/${session.id}/question/1/">Start ${length}</a></li>`
    }).join("")}</ul>
    <details class="section-gap"><summary>Why some set sizes are unavailable</summary><p>Every set is drawn without repeats, so a size is offered only when this release has enough distinct questions for that filter. The table shows the current counts.</p><div class="comparison-table-wrap"><table class="comparison-table"><caption>Available set sizes by filter</caption><thead><tr><th scope="col">Filter</th><th scope="col">Questions</th>${catalog.practiceCapacity.advertisedSetLengths.map((length) => `<th scope="col">${length}</th>`).join("")}</tr></thead><tbody>${capacityRecords.map((record) => `<tr><th scope="row">${escapeHtml(capacityLabel(record))}</th><td>${record.questionCount}</td>${catalog.practiceCapacity.advertisedSetLengths.map((length) => {
      const session = sessionByCapacity.get(`${record.filterKind}:${record.filterValue}:${length}`)
      return session === undefined
        ? `<td>Not available</td>`
        : `<td><a href="/practice/session/${session.id}/question/1/">Start ${length}</a></td>`
    }).join("")}</tr>`).join("")}</tbody></table></div></details>
    <p class="source-note"><strong>Scoring boundary:</strong> practice accuracy is not an official converted score or a pass prediction. Answers and their sourced explanations load only after each answer is submitted and saved on this device.</p>
    </details>
  </main>
  <script id="study-bootstrap-data" type="application/json">${escapeJsonForHtml(studyBootstrap)}</script>
  <script type="module" src="/src/study/react/bootstrap.tsx"></script>`
  })

  pages.push({
    relativePath: "atlas/index.html",
    canonicalPath: "/atlas/",
    title: "Tool atlas — NY Custodian Exam Study",
    description: `Illustrated, cited reference pages for ${releasedTools.length} tools and ${catalog.comparisons.length} comparison panels.`,
    robots: "index,follow",
    routeId: "atlas-index",
    section: "atlas",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    <section class="page-header"><h1>Tool atlas</h1><p>Recognize a tool by its shape, use, and the features that tell look-alikes apart. Every published illustration has a written description and source support.</p><p class="atlas-eligibility-note">${scoredTools.length} tools can appear in scored practice. ${releasedTools.length - scoredTools.length} remain reference-only while a source caution or specialist review is open; each is marked below.</p></section>
    <section class="atlas-browser" data-atlas-browser aria-label="Browse illustrated tools"><div class="tabs atlas-filters" role="tablist" aria-label="Visual family" data-atlas-filters hidden><button class="atlas-filter" id="atlas-family-all" type="button" role="tab" aria-selected="true" aria-controls="atlas-tools" data-atlas-family="all">All families <span class="filter-count">${releasedTools.length}</span></button>${[...families].map(([family, tools]) => `<button class="atlas-filter" id="atlas-family-${slugify(family)}" type="button" role="tab" aria-selected="false" aria-controls="atlas-tools" tabindex="-1" data-atlas-family="${escapeHtml(family)}">${escapeHtml(capitalize(family))} <span class="filter-count">${tools.length}</span></button>`).join("")}</div><p class="atlas-count" data-atlas-count role="status">Showing all ${releasedTools.length} illustrated tools.</p>
    <div class="atlas-family-select" data-atlas-select-field hidden><label for="atlas-family-select">Family</label><select id="atlas-family-select" data-atlas-select><option value="all">All families — ${releasedTools.length} records</option>${[...families].map(([family, tools]) => `<option value="${escapeHtml(family)}">${escapeHtml(capitalize(family))} — ${tools.length} records</option>`).join("")}</select></div>
    <div class="tool-grid" id="atlas-tools">${toolEntries.map(({ slug, tool }, index) => `<article class="tool-card" data-tool-family="${escapeHtml(tool.family)}"><img src="${derivativePath(tool, "phone")}" width="320" height="320" ${index >= 4 ? 'loading="lazy" ' : ""}alt="${escapeHtml(tool.neutralDescription)}"><div><h2><a href="/atlas/tool/${slug}/">${escapeHtml(tool.canonicalTerm)}</a></h2><p class="tool-family">${escapeHtml(capitalize(tool.family))}</p><div data-atlas-image-notice hidden><p><strong>Illustration unavailable on this device.</strong></p><p>${escapeHtml(tool.neutralDescription)}</p><p>Open the record for supported uses and source evidence.</p></div>${tool.practiceEligibility === "atlas-only" ? '<p class="tool-eligibility"><strong>Reference-only:</strong> excluded from scored practice.</p>' : '<p class="tool-eligibility">In scored practice</p>'}</div></article>`).join("")}</div></section>
    <section class="section-gap" id="comparisons"><h2>Comparison panels</h2><p>Each panel lives on its tool-family page, together with any restriction that keeps it out of scored practice.</p><ul class="link-list">${comparisonEntries.map(({ canonicalPath, comparison }) => {
      const names = comparison.memberIds.map((id) => toolById.get(id)?.canonicalTerm ?? id)
      return `<li><a href="${canonicalPath}">${escapeHtml(names.join(" vs. "))}</a><span>${comparison.scoredUseGate.length === 0 ? "Can appear in scored practice" : "Reference-only"}</span></li>`
    }).join("")}</ul></section>
    ${comparableFamilies.length === 0 ? "" : `<section class="section-gap"><h2>Compare a tool family</h2><ul class="link-list">${comparableFamilies.map(([family, tools]) => `<li><a href="/atlas/family/${slugify(family)}/">${escapeHtml(family)} (${tools.length} tools)</a></li>`).join("")}</ul></section>`}
  </main>
  <script type="module" src="/src/static-browser.ts"></script>`
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
        <p class="eyebrow">${escapeHtml(capitalize(tool.family))}</p>
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
  <main class="page-shell hazard-setup-page" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Hazards" }])}
    <nav class="setup-navigation" aria-label="Practice setup">${setupDestinations.map(({ id, label, href }) => `<a class="button ${id === "hazards" ? "button-primary" : "button-secondary"}" href="${href}"${id === "hazards" ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
    <header class="hazard-setup-heading"><h1>Hazard drill</h1><p>Choose a scene count and how to respond. Feedback opens after each saved response.</p></header>
    <div data-hazard-builder><section class="reference-card"><h2>Start with the released scenes</h2><p>The custom builder needs JavaScript. You can still open the first scene in either response mode.</p><div class="question-controls"><a class="button button-primary" href="/hazards/session/${manifest.releaseId}/scene/1/">Start visual scene 1</a><a class="button button-secondary" href="/hazards/session/${manifest.releaseId}-nonvisual/scene/1/">Start keyboard scene 1 (no image)</a></div></section></div>
    <details class="hazard-environments section-gap"><summary>Environments in this release</summary><ul class="tag-list">${[...new Set(scenes.map(({ value }) => value.environment))].map((environment) => `<li>${escapeHtml(environment)}</li>`).join("")}</ul></details>
  </main>
  <script id="hazard-builder-data" type="application/json">${escapeJsonForHtml(canonicalReviewBootstrap.scenes)}</script>
  <script type="module" src="/src/practice/hazard-builder-bootstrap.tsx"></script>`
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
      practiceInventory: Schema.decodeUnknownSync(Schema.Array(ReviewQuestionBootstrap))(canonicalReviewBootstrap.questions),
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

  const historicalInventory = Schema.decodeUnknownSync(ReviewQueueBootstrap)({ ...canonicalReviewBootstrap, previousInventories }).previousInventories![0]!
  for (const source of [...historicalInventory.questions, ...historicalInventory.practiceQuestions]) {
    const question = questions.find(entry => entry.value.id === source.id)?.value
    if (question === undefined) throw new Error(`Missing historical question ${source.id}`)
    pages.push(questionPage({
      canonicalPath: source.itemUrl,
      context: "review",
      count: source.receipt.sessionId === historicalV3.releaseId ? historicalInventory.questions.length : historicalInventory.practiceQuestions.filter(entry => entry.receipt.sessionId === source.receipt.sessionId).length,
      position: source.receipt.position,
      receipt: source.receipt,
      question,
      routeId: "review-player"
    }))
  }
  for (const source of historicalInventory.questions) {
    const question = questions.find(entry => entry.value.id === source.id)!.value
    pages.push(questionPage({
      canonicalPath: source.itemUrl.replace("/review/session/", "/practice/session/").replace("/item/", "/question/"),
      practiceInventory: historicalInventory.questions,
      context: "review",
      count: historicalInventory.questions.length,
      position: source.receipt.position,
      receipt: source.receipt,
      question,
      routeId: "review-player"
    }))
  }
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
      drillInventory: canonicalReviewBootstrap.scenes,
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
      drillInventory: canonicalReviewBootstrap.scenes,
      mode: "nonvisual",
      position,
      receipt: hazardReceipt(artifact, scene, "nonvisual", position),
      ...(position < scenes.length ? { nextPath: `${nonvisualBase}${position + 1}/` } : {}),
      ...(position > 1 ? { previousPath: `${nonvisualBase}${position - 1}/` } : {}),
      scene
    }))
  })

  for (const source of historicalInventory.scenes) {
    for (const mode of ["visual", "nonvisual"] as const) {
      const receipt = mode === "visual" ? source.visualReceipt : source.nonvisualReceipt
      pages.push(hazardPage({
        canonicalPath: mode === "visual" ? source.visualItemUrl : source.nonvisualItemUrl,
        count: historicalInventory.scenes.length, drillInventory: historicalInventory.scenes,
        mode, position: receipt.position, receipt, scene: source.scene
      }))
    }
  }

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
  <main class="page-shell home-page utility-page" id="main-content" tabindex="-1">
    <section class="page-header-prominent" data-offline-header><div class="page-header-copy"><h1>Study with no connection at all.</h1><p class="lead">Download a study copy and let it finish its check, then turn it on yourself. Nothing downloads on page load, and a failed update leaves your previous working copy available.</p></div></section>
    <div class="home-content utility-content">
      <div data-offline-pack-manager data-island="offline-pack-manager"><p>JavaScript and available browser storage are required to manage offline downloads. No download has started.</p></div>
      <noscript><p class="source-note">Offline downloads require JavaScript. The reference pages remain available online.</p></noscript>
    </div>
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
  <main class="page-shell home-page utility-page" id="main-content" tabindex="-1">
    <section class="page-header-prominent"><div class="page-header-copy"><h1>Settings</h1><p class="lead">Adjust reading preferences, manage offline downloads, and back up your progress. Your saved work stays in this browser.</p></div><div class="question-controls"><a class="button button-primary" href="#export-local-data">Export my progress</a></div></section>
    <div class="home-content utility-content">
      <svg aria-hidden="true" width="0" height="0" style="position:absolute"><defs>
        <symbol id="settings-icon-export" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></symbol>
        <symbol id="settings-icon-import" viewBox="0 0 24 24"><path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/></symbol>
        <symbol id="settings-icon-rebuild" viewBox="0 0 24 24"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></symbol>
        <symbol id="settings-icon-delete" viewBox="0 0 24 24"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></symbol>
      </defs></svg>
      <noscript><p><a href="/offline/">Manage offline downloads</a></p></noscript>
      <div data-settings data-island="settings"><p>JavaScript and browser storage are required to open local settings. Nothing changes while this view loads.</p></div>
      <section class="settings-unavailable" aria-labelledby="settings-unavailable-heading">
        <div class="section-header"><h2 id="settings-unavailable-heading">Not available yet</h2><p>There is no setting to turn these on.</p></div>
        <dl class="fact-table">
          <div><dt>Spanish content</dt><dd>A Spanish version has not been written and reviewed. Questions and explanations remain in English.</dd></div>
          <div><dt>Low-data mode</dt><dd>A low-data preference is not supported. <a href="/offline/">Download a copy</a> to study with no connection.</dd></div>
        </dl>
      </section>
    </div>
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
  <main class="page-shell utility-page" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/transparency/", label: "Sources and methods" }, { label: "Report a correction" }])}
    <section class="hero"><h1>Report a content, access, rights, or security concern.</h1><p>Do not include secure questions, answer options, reconstructed drawings, photographs, or review-session notes. Local drafting works offline. Going online never submits or retries a draft automatically.</p></section>
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
    "history",
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
  const stylesheets = await Promise.all(
    ["styles.css", "design-system.css", "player-design.css", "study-design.css"]
      .map((file) => Bun.file(new URL(`src/${file}`, siteRoot)).text())
  )
  await Bun.write(new URL("public/styles.css", siteRoot), stylesheets.join("\n"))

  console.log(
    `generated ${pages.length} documents, ${release.catalog.tools.length} tool pages, ` +
      `${release.questions.length} questions, and ${release.scenes.length} hazard scenes`
  )
}

if (import.meta.main) await generateSite()
