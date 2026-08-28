import AxeBuilder from "../../../apps/site/node_modules/@axe-core/playwright/dist/index.mjs"
import { chromium, firefox, webkit } from "../../../apps/site/node_modules/@playwright/test/index.mjs"
import { createHash } from "node:crypto"
import { execFileSync, spawn } from "node:child_process"
import { readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { routeArchetypes, sharedFrames, territories } from "./prototype.mjs"

const researchDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(researchDirectory, "../../..")
const sourceArgument = process.argv.find((argument) => argument.startsWith("--source-sha="))
const portArgument = process.argv.find((argument) => argument.startsWith("--port="))
if (process.argv.length !== 3 + Number(portArgument !== undefined) || sourceArgument === undefined) {
  throw new Error("usage: node capture-browser-receipt.mjs --source-sha=FULL_SHA [--port=PORT]")
}
const sourceSha = sourceArgument.slice("--source-sha=".length)
if (!/^[0-9a-f]{40}$/.test(sourceSha)) throw new Error("--source-sha must be a full commit SHA")
const portText = portArgument?.slice("--port=".length) ?? "4197"
if (!/^\d+$/.test(portText) || Number(portText) < 1024 || Number(portText) > 65_535) throw new Error("--port must be an integer from 1024 through 65535")
const port = Number(portText)
const baseURL = `http://127.0.0.1:${port}`
const receiptPath = "research/ui-ux/consumer-visual-system/browser-receipt.json"
const prototypePaths = [
  "research/ui-ux/consumer-visual-system/prototype.css",
  "research/ui-ux/consumer-visual-system/prototype.html",
  "research/ui-ux/consumer-visual-system/prototype.mjs"
]
const harnessPaths = [
  "research/ui-ux/consumer-visual-system/capture-browser-receipt.mjs",
  "research/ui-ux/consumer-visual-system/playwright.config.ts",
  "research/ui-ux/consumer-visual-system/serve-prototype.mjs",
  "research/ui-ux/consumer-visual-system/visual-system-research.pw.ts"
]
const browserProjects = ["chromium", "firefox", "webkit"]
const presentations = [
  "default",
  "phone-320",
  "phone-390",
  "tablet-768",
  "desktop-1440",
  "large-text-125",
  "zoom-400",
  "forced-colors",
  "reduced-motion",
  "print"
]
const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const bytesAt = (path) => readFileSync(resolve(repositoryRoot, path))
const descriptor = (path) => {
  const bytes = bytesAt(path)
  return { path, bytes: bytes.byteLength, sha256: sha256(bytes) }
}
const prototypeFiles = prototypePaths.map(descriptor)
const bundleHash = createHash("sha256")
for (const file of [...prototypeFiles].sort((left, right) => left.path.localeCompare(right.path))) {
  bundleHash.update(file.path)
  bundleHash.update("\0")
  bundleHash.update(bytesAt(file.path))
  bundleHash.update("\0")
}
const prototypeBundleSha256 = bundleHash.digest("hex")

const git = (arguments_, encoding = "utf8") => execFileSync("git", arguments_, {
  cwd: repositoryRoot,
  encoding,
  maxBuffer: 10 * 1024 * 1024
})
git(["cat-file", "-e", `${sourceSha}^{commit}`])
git(["merge-base", "--is-ancestor", sourceSha, "HEAD"])
for (const file of prototypeFiles) {
  const committed = git(["show", `${sourceSha}:${file.path}`], null)
  if (committed.byteLength !== file.bytes || sha256(committed) !== file.sha256) throw new Error(`${file.path}: source commit does not contain the current comparison bytes`)
}

const frameById = Object.fromEntries(sharedFrames.map((frame) => [frame.frameId, frame]))
const representativePresentationFrames = {
  "phone-320": "orientation-home-check-fixture",
  "phone-390": "study-launcher-ready",
  "tablet-768": "browse-tool-detail",
  "desktop-1440": "browse-comparison",
  "large-text-125": "focused-question-precommit",
  "zoom-400": "focused-question-precommit",
  "forced-colors": "utility-correction-draft",
  "reduced-motion": "focused-hazard-precommit",
  print: "review-queue-empty"
}
const requestedCases = []
for (const territory of territories) {
  for (const frame of sharedFrames) requestedCases.push({ territoryId: territory.territoryId, frameId: frame.frameId, presentation: "default", browserProject: "chromium" })
  for (const [presentation, frameId] of Object.entries(representativePresentationFrames)) requestedCases.push({ territoryId: territory.territoryId, frameId, presentation, browserProject: "chromium" })
  requestedCases.push({ territoryId: territory.territoryId, frameId: "focused-question-precommit", presentation: "default", browserProject: "firefox" })
  requestedCases.push({ territoryId: territory.territoryId, frameId: "focused-question-precommit", presentation: "default", browserProject: "webkit" })
}

const semanticSignature = () => {
  const root = document.querySelector("[data-shared-root]")
  const clone = root.cloneNode(true)
  clone.querySelector(".fixture-note")?.remove()
  return JSON.stringify([...clone.querySelectorAll("*")].map((element) => ({
    alt: element.getAttribute("alt"),
    ariaCurrent: element.getAttribute("aria-current"),
    ariaLabel: element.getAttribute("aria-label"),
    assetId: element.getAttribute("data-asset-id"),
    href: element.getAttribute("href"),
    src: element.getAttribute("src"),
    tag: element.tagName.toLowerCase(),
    text: [...element.childNodes]
      .filter(({ nodeType }) => nodeType === Node.TEXT_NODE)
      .map(({ textContent }) => textContent?.replace(/\s+/g, " ").trim() ?? "")
      .filter(Boolean)
  })))
}

const configurePresentation = async (page, presentation) => {
  const viewport = {
    "phone-320": { width: 320, height: 900 },
    "phone-390": { width: 390, height: 900 },
    "tablet-768": { width: 768, height: 1024 },
    "desktop-1440": { width: 1440, height: 900 },
    "large-text-125": { width: 320, height: 900 },
    "zoom-400": { width: 320, height: 900 },
    "forced-colors": { width: 390, height: 900 },
    "reduced-motion": { width: 390, height: 900 },
    print: { width: 816, height: 1056 },
    default: { width: 390, height: 900 }
  }[presentation]
  await page.setViewportSize(viewport)
  await page.emulateMedia({
    forcedColors: presentation === "forced-colors" ? "active" : "none",
    media: presentation === "print" ? "print" : "screen",
    reducedMotion: presentation === "reduced-motion" ? "reduce" : "no-preference"
  })
  return presentation === "large-text-125" ? "large-text" : presentation === "reduced-motion" ? "reduced-motion" : "default"
}

const browserTypes = { chromium, firefox, webkit }
const startedAt = new Date().toISOString()
const cases = []
const launched = {}
const server = spawn(process.execPath, ["serve-prototype.mjs"], {
  cwd: researchDirectory,
  env: { ...process.env, NYCUSTODIAN_VISUAL_PROTOTYPE_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
})
let serverError = ""
server.stderr.on("data", (chunk) => { serverError += chunk.toString() })

const waitForServer = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`prototype server exited: ${serverError}`)
    try {
      const response = await fetch(`${baseURL}/prototype.html`)
      if (response.status === 200) return
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50))
  }
  throw new Error("prototype server did not become ready")
}

try {
  await waitForServer()
  for (const project of browserProjects) launched[project] = await browserTypes[project].launch(project === "chromium" ? { channel: "chromium" } : {})
  for (const [index, requested] of requestedCases.entries()) {
    const context = await launched[requested.browserProject].newContext({ locale: "en-US", serviceWorkers: "block", timezoneId: "UTC" })
    const page = await context.newPage()
    const externalOrigins = new Set()
    page.on("request", (request) => {
      const url = new URL(request.url())
      if (["http:", "https:"].includes(url.protocol) && url.origin !== baseURL) externalOrigins.add(url.origin)
    })
    const presentationQuery = await configurePresentation(page, requested.presentation)
    const response = await page.goto(`${baseURL}/?territory=${requested.territoryId}&frame=${requested.frameId}&presentation=${presentationQuery}`)
    await page.waitForLoadState("networkidle")
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }))
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    const seriousAxeViolationCount = axeResults.violations.filter(({ impact }) => impact === "serious" || impact === "critical").length
    let keyboardFocusVisible = false
    let actionTargetMinimumCssPx = 0
    if (requested.presentation !== "print") {
      const actions = page.locator(".action:visible")
      const boxes = []
      for (let actionIndex = 0; actionIndex < await actions.count(); actionIndex += 1) {
        const box = await actions.nth(actionIndex).boundingBox()
        if (box !== null) boxes.push(Math.min(box.width, box.height))
      }
      actionTargetMinimumCssPx = boxes.length === 0 ? 0 : Math.floor(Math.min(...boxes))
      const first = actions.first()
      await first.focus()
      keyboardFocusVisible = await first.evaluate((element) => {
        const style = getComputedStyle(element)
        return style.outlineStyle === "solid" && Number.parseFloat(style.outlineWidth) >= 3 && Number.parseFloat(style.outlineOffset) >= 2
      })
    }
    const semanticSha256 = sha256(await page.evaluate(semanticSignature))
    const frame = frameById[requested.frameId]
    cases.push({
      caseId: `BRC${String(index + 1).padStart(3, "0")}`,
      territoryId: requested.territoryId,
      frameId: requested.frameId,
      archetypeId: frame.archetypeId,
      presentation: requested.presentation,
      browserProject: requested.browserProject,
      httpResult: response?.status() ?? 0,
      externalOriginCount: externalOrigins.size,
      scrollWidth: Math.round(dimensions.scrollWidth),
      clientWidth: Math.round(dimensions.clientWidth),
      seriousAxeViolationCount,
      keyboardFocusVisible,
      actionTargetMinimumCssPx,
      semanticSha256,
      capturedAt: new Date().toISOString()
    })
    await context.close()
  }
} finally {
  await Promise.all(Object.values(launched).map((browser) => browser.close()))
  server.kill("SIGTERM")
}

const completedAt = new Date().toISOString()
const failedCases = cases.filter((browserCase) =>
  browserCase.httpResult !== 200 ||
  browserCase.externalOriginCount !== 0 ||
  browserCase.scrollWidth > browserCase.clientWidth ||
  browserCase.seriousAxeViolationCount !== 0 ||
  (browserCase.presentation === "print"
    ? browserCase.keyboardFocusVisible !== false || browserCase.actionTargetMinimumCssPx !== 0
    : browserCase.keyboardFocusVisible !== true || browserCase.actionTargetMinimumCssPx < 44)
)
if (failedCases.length > 0) throw new Error(`browser receipt has ${failedCases.length} failed cases: ${failedCases.map(({ caseId }) => caseId).join(", ")}`)
for (const frame of sharedFrames) {
  const semanticDigests = territories.map(({ territoryId }) => cases.find((browserCase) =>
    browserCase.territoryId === territoryId &&
    browserCase.frameId === frame.frameId &&
    browserCase.presentation === "default" &&
    browserCase.browserProject === "chromium"
  )?.semanticSha256)
  if (new Set(semanticDigests).size !== 1) throw new Error(`semantic parity failed for ${frame.frameId}`)
}
const receipt = {
  schemaVersion: 1,
  receiptId: "plan-006-browser-evidence",
  protocolId: "CODEX-ONLY-UIUX-V1",
  status: "passed",
  sourceSha,
  prototypeBundleSha256,
  prototypeFiles,
  harnessFiles: harnessPaths.map(descriptor),
  startedAt,
  completedAt,
  browserProjects,
  presentations,
  cases,
  screenshotBytesRetained: false
}
writeFileSync(resolve(repositoryRoot, receiptPath), `${JSON.stringify(receipt, null, 2)}\n`, { flag: "w" })
const routeCount = routeArchetypes.flatMap(({ routeIds }) => routeIds).length
process.stdout.write(`Browser receipt captured: ${cases.length} cases, ${territories.length} territories, ${sharedFrames.length} shared frames, ${routeCount} routes, bundle ${prototypeBundleSha256}.\n`)
