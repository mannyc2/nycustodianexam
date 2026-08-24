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

export { isPublicReleaseArtifact } from "../src/delivery-manifest.ts"

const repositoryRoot = new URL("../../../", import.meta.url)
const siteRoot = new URL("../", import.meta.url)
const releaseRoot = new URL("content/releases/vertical-slice/", repositoryRoot)

type Catalog = typeof CatalogArtifact.Type
type CatalogTool = Catalog["tools"][number]
type ContentSource = Catalog["sources"][number]
type Manifest = typeof ReleaseManifest.Type
type ManifestArtifact = Manifest["artifacts"][number]
type Question = typeof PrecommitQuestion.Type
type Scene = typeof PrecommitScene.Type

type RouteId =
  | "atlas-family"
  | "atlas-index"
  | "atlas-tool"
  | "exam-selector"
  | "hazards-index"
  | "hazard-player"
  | "home"
  | "profile"
  | "question-player"
  | "review-player"
  | "review-queue"
  | "source"
  | "status"
  | "study-hub"
  | "transparency-index"

type NavSection = "atlas" | "exams" | "hazards" | "home" | "practice" | "transparency"

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
        <a${currentPage(section, "atlas")} href="/atlas/">Tool atlas</a>
        <a${currentPage(section, "practice")} href="/practice/">Practice</a>
        <a${currentPage(section, "hazards")} href="/hazards/">Hazards</a>
        <a${currentPage(section, "transparency")} href="/transparency/">Sources</a>
      </nav>
    </div>
  </header>`

const footer = `
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p>Independent study project. Not affiliated with or endorsed by New York City or New York State.</p>
    </div>
  </footer>`

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
  <link rel="stylesheet" href="/styles.css">
  <title>${escapeHtml(title)}</title>
</head>
<body data-route-id="${routeId}">
<a class="skip-link" href="#main-content">Skip to main content</a>
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
      <article class="card"><h2>Check sources</h2><p>Review what the current release supports and where it came from.</p><a href="/transparency/">Open transparency</a></article>
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

const derivativePath = (tool: CatalogTool | Scene, kind: "phone" | "print" | "web"): string => {
  const derivative = tool.asset.derivatives.find((candidate) => candidate.kind === kind)
  if (derivative === undefined) throw new Error(`${tool.asset.opaqueAssetId} has no ${kind} derivative`)
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

const sourceLinks = (sourceIds: readonly string[], sourceById: ReadonlyMap<string, ContentSource>): string => `
  <ul class="link-list">${sourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId)
    if (source === undefined) throw new Error(`Catalog references missing source ${sourceId}`)
    return `<li><a href="/transparency/sources/${slugify(source.id)}/">${escapeHtml(source.title)}</a></li>`
  }).join("")}</ul>`

const externalSourceLink = (source: ContentSource): string => {
  if (source.url === undefined) return ""
  try {
    const parsed = new URL(source.url)
    if (parsed.protocol !== "https:") return ""
    return `<p><a href="${escapeHtml(parsed.href)}" rel="external noopener">Open the public source</a></p>`
  } catch {
    return ""
  }
}

const renderQuestionFallback = (question: Question, position: number, count: number): string => `
      <article class="question-card" aria-labelledby="question-heading">
        <header class="question-prompt">
          <p class="eyebrow">Question ${position} of ${count}</p>
          <h1 id="question-heading">${escapeHtml(question.prompt)}</h1>
          <p>Select one answer. Your choice is saved before the explanation is loaded.</p>
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
  description: "A local-first tool-recognition question with durable commit-before-reveal behavior.",
  robots: "noindex,follow",
  routeId,
  section: "practice",
  body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: context === "review" ? "/review/" : "/practice/", label: context === "review" ? "Review queue" : "Practice" }, { label: `Question ${position}` }])}
    ${context === "review" ? '<p class="source-note review-notice"><strong>Saved feedback:</strong> opening this item does not acknowledge it or remove it from the due queue. Return to Review and use the explicit acknowledgement action when finished.</p>' : ""}
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
  title: `${mode === "visual" ? "Hazard scene" : "Nonvisual hazard scene"} ${position} of ${count} — NY Custodian Exam`,
  description: `${mode === "visual" ? "A visual" : "A keyboard-native nonvisual"} workplace hazard observation exercise with feedback loaded only after commitment.`,
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
        ${mode === "visual" ? `<p class="source-note">JavaScript verifies the exact released scene bytes before displaying the image or enabling markers.</p>` : ""}
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
}: Awaited<ReturnType<typeof loadRelease>>): readonly PageDefinition[] => {
  const sourceById = new Map(catalog.sources.map((source) => [source.id, source]))
  const toolById = new Map(catalog.tools.map((tool) => [tool.conceptId, tool]))
  const releasedTools = catalog.tools.filter((tool) => tool.publicationGate === null)
  const toolEntries = releasedTools.map((tool) => ({ id: tool.conceptId, slug: slugify(tool.canonicalTerm), tool }))
  const sourceEntries = catalog.sources.map((source) => ({ id: source.id, slug: slugify(source.id), source }))
  assertUniqueSlugs(toolEntries)
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
    position: number
  ): QuestionAttemptReceipt => ({
    releaseId: manifest.releaseId,
    packVersion: manifest.packVersion,
    sessionId: manifest.releaseId,
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

  const pages: PageDefinition[] = []
  pages.push({
    relativePath: "index.html",
    canonicalPath: "/",
    title: "NY Custodian Exam Study",
    description: "Source-backed, local-first study tools for New York entry-level custodian and janitor exams.",
    robots: "index,follow",
    routeId: "home",
    section: "home",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    <section class="hero">
      <p class="eyebrow">Source-backed · local-first</p>
      <h1>Study the work, not a mystery answer key.</h1>
      <p>Use an original ${releasedTools.length}-tool reference, ${questions.length} retrieval questions, and ${scenes.length} reviewed workplace scenes. Answers and feedback load only after you commit.</p>
    </section>
    <section class="card-grid" aria-label="Start studying">
      <article class="card"><h2>Confirm the profile</h2><p>See exactly what this launch pack covers and what it does not claim to be.</p><a href="/exams/">Read the exam profile</a></article>
      <article class="card"><h2>Learn the tools</h2><p>Compare illustrated, cited references without loading an interactive runtime.</p><a href="/atlas/">Open the tool atlas</a></article>
      <article class="card"><h2>Practice retrieval</h2><p>Commit each answer locally before its explanation and source receipt are requested.</p><a href="/practice/">Start practice</a></article>
      <article class="card"><h2>Inspect hazards</h2><p>Study neutral workplace scenes and reveal reviewed feedback after commitment.</p><a href="/hazards/">Open hazard practice</a></article>
    </section>
  </main>`
  })

  pages.push({
    relativePath: "review/index.html",
    canonicalPath: "/review/",
    title: "Local review queue — NY Custodian Exam Study",
    description: "A local review queue rebuilt from validated durable study attempts and explicit acknowledgements.",
    robots: "noindex,follow",
    routeId: "review-queue",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Review" }])}
    <section class="hero"><p class="eyebrow">Local spaced review</p><h1>Review what your saved attempts identified.</h1><p>This no-account queue is rebuilt on this device from durable question and visual-hazard attempts. It never treats displayed feedback as reviewed and does not claim mastery or an official schedule.</p></section>
    <div data-review-queue data-island="review-queue-bootstrap">
      <section class="review-state" aria-labelledby="review-queue-heading">
        <h2 id="review-queue-heading">Loading your local review queue</h2>
        <p>JavaScript and available IndexedDB storage are required to read personal study attempts. No answers or feedback are embedded in this page.</p>
      </section>
    </div>
    <section class="card-grid section-gap" aria-label="Continue studying"><article class="card"><h2>Question practice</h2><p>Create review reasons only after an answer is saved.</p><a href="/practice/">Open question practice</a></article><article class="card"><h2>Hazard practice</h2><p>Visual misses and false positives can enter the local queue after a saved scene response.</p><a href="/hazards/">Open hazard practice</a></article></section>
  </main>
  <script id="review-bootstrap-data" type="application/json">${escapeJsonForHtml(reviewBootstrap)}</script>
  <script type="module" src="/src/review/react/bootstrap.tsx"></script>`
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
    <section class="hero"><p class="eyebrow">Released profiles</p><h1>Choose a truthful study profile.</h1><p>One reviewed launch profile is available. It identifies compatibility and scope without claiming official exam status.</p></section>
    <section class="card-grid" aria-label="Available profiles">${catalog.profiles.map((profile) => `<article class="card"><p class="eyebrow">${escapeHtml(profile.series)}</p><h2>${escapeHtml(profile.label)}</h2><p>${escapeHtml(profile.jurisdiction)}</p><p>${escapeHtml(profile.disclaimer)}</p><a href="/ny/">View this profile</a></article>`).join("")}</section>
  </main>`
  })

  pages.push({
    relativePath: "ny/index.html",
    canonicalPath: "/ny/",
    title: `${catalog.profiles[0]?.label ?? "New York profile"} — Study profile`,
    description: "Scope, compatibility, and released study materials for the current New York launch profile.",
    robots: "index,follow",
    routeId: "profile",
    section: "exams",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/exams/", label: "Exam profiles" }, { label: "New York" }])}
    <section class="hero"><p class="eyebrow">Launch profile · pack version ${catalog.version}</p><h1>${escapeHtml(catalog.profiles[0]?.label ?? "New York entry-level custodian study")}</h1><p>${escapeHtml(catalog.profiles[0]?.jurisdiction ?? "New York")}</p></section>
    <div class="reference-layout section-gap"><article><h2>What is released</h2><dl class="fact-list"><dt>Tool references</dt><dd>${releasedTools.length}</dd><dt>Practice questions</dt><dd>${questions.length}</dd><dt>Hazard scenes</dt><dd>${scenes.length}</dd><dt>Compatibility key</dt><dd><code>${escapeHtml(catalog.profiles[0]?.compatibilityKey ?? "not published")}</code></dd></dl><p class="source-note"><strong>Important:</strong> ${escapeHtml(catalog.profiles[0]?.disclaimer ?? "Original study content only.")}</p></article><aside class="reference-card"><h2>Start with references</h2><p>Learn the published terms before opening scored practice.</p><a class="button button-primary" href="/atlas/">Open the atlas</a></aside></div>
  </main>`
  })

  pages.push({
    relativePath: "practice/index.html",
    canonicalPath: "/practice/",
    title: "Practice — NY Custodian Exam Study",
    description: "Original tool-retrieval practice with durable commit-before-reveal behavior.",
    robots: "index,follow",
    routeId: "study-hub",
    section: "practice",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Practice" }])}
    <section class="hero"><p class="eyebrow">Original practice</p><h1>Retrieve what you learned.</h1><p>This ${questions.length}-question session stores each selection before requesting answer feedback. It does not reproduce recalled or official questions.</p><a class="button button-primary" href="/practice/session/${manifest.releaseId}/question/1/">Start question 1</a></section>
  </main>`
  })

  pages.push({
    relativePath: "atlas/index.html",
    canonicalPath: "/atlas/",
    title: "Tool atlas — NY Custodian Exam Study",
    description: `Illustrated, source-backed reference pages for ${releasedTools.length} released hand tools.`,
    robots: "index,follow",
    routeId: "atlas-index",
    section: "atlas",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Tool atlas" }])}
    <section class="hero"><p class="eyebrow">${releasedTools.length} released tools</p><h1>Recognize a tool by use and construction.</h1><p>Each page names the supported use, distinguishing features, nearby confusions, and source record.</p></section>
    <section class="tool-grid" aria-label="Released tools">${toolEntries.map(({ slug, tool }) => `<article class="tool-card"><img src="${derivativePath(tool, "phone")}" width="320" height="320" alt="${escapeHtml(tool.neutralDescription)}"><div><p class="eyebrow">${escapeHtml(tool.family)}</p><h2><a href="/atlas/tool/${slug}/">${escapeHtml(tool.canonicalTerm)}</a></h2><p>${escapeHtml(tool.useSummary)}</p></div></article>`).join("")}</section>
    ${comparableFamilies.length === 0 ? "" : `<section class="section-gap"><h2>Compare a tool family</h2><ul class="link-list">${comparableFamilies.map(([family, tools]) => `<li><a href="/atlas/family/${slugify(family)}/">${escapeHtml(family)} (${tools.length} tools)</a></li>`).join("")}</ul></section>`}
  </main>`
  })

  for (const [family, tools] of comparableFamilies) {
    const familySlug = slugify(family)
    pages.push({
      relativePath: `atlas/family/${familySlug}/index.html`,
      canonicalPath: `/atlas/family/${familySlug}/`,
      title: `${family} comparison — Tool atlas`,
      description: `Compare the released ${family} by use and distinguishing features.`,
      robots: "index,follow",
      routeId: "atlas-family",
      section: "atlas",
      body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/atlas/", label: "Tool atlas" }, { label: family }])}
    <section class="hero"><p class="eyebrow">Tool family</p><h1>Compare ${escapeHtml(family)}.</h1><p>Use both the job and the jaw or end construction to separate these nearby choices.</p></section>
    <div class="comparison-table-wrap"><table class="comparison-table"><caption>${escapeHtml(family)} comparison</caption><thead><tr><th scope="col">Tool</th><th scope="col">Supported use</th><th scope="col">Recognition cues</th></tr></thead><tbody>${tools.map((tool) => `<tr><th scope="row"><a href="/atlas/tool/${slugify(tool.canonicalTerm)}/">${escapeHtml(tool.canonicalTerm)}</a></th><td>${escapeHtml(tool.useSummary)}</td><td>${tool.distinguishingFeatures.map(escapeHtml).join("; ")}</td></tr>`).join("")}</tbody></table></div>
  </main>`
    })
  }

  for (const { slug, tool } of toolEntries) {
    const confusables = tool.confusableConceptIds.flatMap((conceptId) => {
      const candidate = toolById.get(conceptId)
      return candidate?.publicationGate === null ? [candidate] : []
    })
    pages.push({
      relativePath: `atlas/tool/${slug}/index.html`,
      canonicalPath: `/atlas/tool/${slug}/`,
      title: `${tool.canonicalTerm} — Tool atlas`,
      description: `${tool.useSummary} Learn its distinguishing features and source trail.`,
      robots: "index,follow",
      routeId: "atlas-tool",
      section: "atlas",
      body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ href: "/atlas/", label: "Tool atlas" }, { label: tool.canonicalTerm }])}
    <div class="reference-layout">
      <article>
        <p class="eyebrow">Tool atlas · ${escapeHtml(tool.family)}</p>
        <h1>${escapeHtml(tool.canonicalTerm)}</h1>
        <p class="lead-copy">${escapeHtml(tool.fullDescription)}</p>
        <figure class="tool-figure"><picture><source media="print" srcset="${derivativePath(tool, "print")}"><img src="${derivativePath(tool, "phone")}" srcset="${derivativePath(tool, "phone")} 320w, ${derivativePath(tool, "web")} 960w" sizes="(max-width: 46rem) calc(100vw - 4rem), 38rem" width="960" height="960" alt="${escapeHtml(tool.neutralDescription)}"></picture><figcaption>${escapeHtml(tool.neutralDescription)}</figcaption></figure>
        <dl class="fact-list"><dt>Primary use</dt><dd>${escapeHtml(tool.useSummary)}</dd><dt>Recognition cues</dt><dd>${tool.distinguishingFeatures.map(escapeHtml).join("; ")}</dd><dt>Practice status</dt><dd>${tool.practiceEligibility === "text-question" ? "Eligible for the released text-question format." : "Reference-only in this release."}</dd></dl>
        <section class="section-gap"><h2>Source trail</h2>${sourceLinks(tool.sourceIds, sourceById)}</section>
      </article>
      <aside class="reference-card"><h2>${confusables.length === 0 ? "Related study" : "Commonly confused"}</h2>${confusables.length === 0 ? "<p>Return to the atlas to compare other hand tools.</p>" : `<ul class="link-list">${confusables.map((candidate) => `<li><a href="/atlas/tool/${slugify(candidate.canonicalTerm)}/">${escapeHtml(candidate.canonicalTerm)}</a><span>${escapeHtml(candidate.useSummary)}</span></li>`).join("")}</ul>`}<a class="button button-primary" href="/practice/">Practice retrieval</a></aside>
    </div>
  </main>`
    })
  }

  pages.push({
    relativePath: "hazards/index.html",
    canonicalPath: "/hazards/",
    title: "Hazard practice — NY Custodian Exam Study",
    description: `${scenes.length} reviewed workplace scenes with neutral pre-answer descriptions and post-commit feedback.`,
    robots: "index,follow",
    routeId: "hazards-index",
    section: "hazards",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Hazards" }])}
    <section class="hero"><p class="eyebrow">${scenes.length} reviewed scenes</p><h1>Scan the whole workplace before you decide.</h1><p>Each scene starts with neutral orientation only. Hazard targets, safe decoys, corrections, and receipts remain unavailable until you commit.</p><div class="question-controls"><a class="button button-primary" href="/hazards/session/${manifest.releaseId}/scene/1/">Start visual scene 1</a><a class="button button-secondary" href="/hazards/session/${manifest.releaseId}-nonvisual/scene/1/">Start keyboard-native scene 1</a></div></section>
    <section class="section-gap"><h2>Environments in this release</h2><ul class="tag-list">${[...new Set(scenes.map(({ value }) => value.environment))].map((environment) => `<li>${escapeHtml(environment)}</li>`).join("")}</ul></section>
  </main>`
  })

  pages.push({
    relativePath: "transparency/index.html",
    canonicalPath: "/transparency/",
    title: "Transparency — NY Custodian Exam Study",
    description: "How the launch release separates public references, pre-answer prompts, and post-commit feedback.",
    robots: "index,follow",
    routeId: "transparency-index",
    section: "transparency",
    body: `
  <main class="page-shell" id="main-content" tabindex="-1">
    ${breadcrumb([{ label: "Transparency" }])}
    <section class="hero"><p class="eyebrow">Release ${escapeHtml(manifest.releaseId)} · version ${manifest.packVersion}</p><h1>Know what supports the study material.</h1><p>The public atlas cites ${catalog.sources.length} catalog source records. Interactive exercises embed neutral prompts and request one item’s reviewed feedback only after a durable local commitment.</p></section>
    <section class="card-grid"><article class="card"><h2>Source registry</h2><p>Review titles, exact locators, scope notes, and publishers where available.</p><a href="/transparency/sources/">Browse sources</a></article><article class="card"><h2>Release boundary</h2><p>${manifest.toolCount} tools, ${manifest.questionCount} questions, and ${manifest.hazardSceneCount} scenes are hash-bound in the release manifest. A consolidated answer pack is not published to the site.</p></article></section>
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
    ${breadcrumb([{ href: "/transparency/", label: "Transparency" }, { label: "Sources" }])}
    <section class="hero"><p class="eyebrow">${catalog.sources.length} catalog records</p><h1>Source registry</h1><p>These records support the public profile and atlas. Exercise-specific receipts are revealed with their individual feedback.</p></section>
    <div class="card-grid">${sourceEntries.map(({ slug, source }) => `<article class="card"><h2><a href="/transparency/sources/${slug}/">${escapeHtml(source.title)}</a></h2><p>${escapeHtml(source.scope)}</p><p><code>${escapeHtml(source.locator)}</code></p></article>`).join("")}</div>
  </main>`
  })

  for (const { slug, source } of sourceEntries) {
    const citedTools = releasedTools.filter((tool) => tool.sourceIds.includes(source.id))
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
    ${breadcrumb([{ href: "/transparency/", label: "Transparency" }, { href: "/transparency/sources/", label: "Sources" }, { label: source.title }])}
    <article class="reference-card source-record"><p class="eyebrow">Source record</p><h1>${escapeHtml(source.title)}</h1><dl class="fact-list">${source.publisher === undefined ? "" : `<dt>Publisher</dt><dd>${escapeHtml(source.publisher)}</dd>`}<dt>Locator</dt><dd><code>${escapeHtml(source.locator)}</code></dd><dt>Supported scope</dt><dd>${escapeHtml(source.scope)}</dd></dl>${externalSourceLink(source)}<section class="section-gap"><h2>Public pages using this record</h2>${citedTools.length === 0 ? "<p>This record supports the launch profile rather than a single tool page.</p>" : `<ul class="link-list">${citedTools.map((tool) => `<li><a href="/atlas/tool/${slugify(tool.canonicalTerm)}/">${escapeHtml(tool.canonicalTerm)}</a></li>`).join("")}</ul>`}</section></article>
  </main>`
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

  const paths = new Set<string>()
  const canonicals = new Set<string>()
  for (const page of pages) {
    if (paths.has(page.relativePath) || canonicals.has(page.canonicalPath)) {
      throw new Error(`Duplicate generated route: ${page.canonicalPath}`)
    }
    paths.add(page.relativePath)
    canonicals.add(page.canonicalPath)
  }
  return pages
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
    "practice",
    "review",
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

  const pages = buildPages(release)
  await Promise.all(pages.map(writePage))
  await Bun.write(new URL("404.html", siteRoot), notFoundDocument())
  await publishRelease(release.manifest)
  await cp(new URL("src/styles.css", siteRoot), new URL("public/styles.css", siteRoot))

  console.log(
    `generated ${pages.length} documents, ${release.catalog.tools.length} tool pages, ` +
      `${release.questions.length} questions, and ${release.scenes.length} hazard scenes`
  )
}

if (import.meta.main) await generateSite()
