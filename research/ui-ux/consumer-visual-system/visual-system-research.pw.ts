import AxeBuilder from "../../../apps/site/node_modules/@axe-core/playwright/dist/index.mjs"
import { request as rawHttpRequest } from "node:http"
import {
  expect,
  firefox as firefoxBrowser,
  test as baseTest,
  type Page,
  type Request
} from "../../../apps/site/node_modules/@playwright/test/index.mjs"
import { executionCoordinates, sharedFrames, territories } from "./prototype.mjs"

const evidenceCoordinates = {
  protocolId: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  humanReviewRequired: false,
  notHumanUsabilityTested: true
} as const

const diagnosticCoverageBoundary = {
  classification: "representative-visual-comparison-not-exhaustive-legal-state-validation",
  registryRouteIdCount: 36,
  representedRouteIdCount: 10,
  representativeFrameCount: 12,
  deferredHazardVariants: ["asset-unavailable", "region-required", "version-mismatch", "commit-failure-preservation"],
  deferredRecoveryVariants: ["not-found-404", "withdrawn-410", "invalid-publication", "storage-unavailable", "service-failure"],
  immutablePrintReceiptScope: "review-queue-empty / A-B-C / chromium-firefox-webkit / 9 cases",
  uncommittedPlaywrightResultClass: "diagnostic-only"
} as const

// Firefox was observed to stall during a later navigation when one browser
// process was reused across many evidence cases. A fresh Firefox process per
// case keeps execution serial and removes that cross-case lifecycle coupling.
// Chromium and WebKit continue using Playwright's worker-scoped browser.
const test = baseTest.extend({
  page: async ({ browser, browserName }, use) => {
    const ownedBrowser = browserName === "firefox" ? await firefoxBrowser.launch() : null
    const context = await (ownedBrowser ?? browser).newContext({
      locale: "en-US",
      serviceWorkers: "block",
      timezoneId: "UTC"
    })
    const page = await context.newPage()
    try {
      await use(page)
    } finally {
      await context.close()
      await ownedBrowser?.close()
    }
  }
})

type Frame = {
  asset: null | { opaqueAssetId: string; path: string }
  frameId: string
  legalState: string
}

const frames = sharedFrames as readonly Frame[]
const territoryIds = (territories as readonly { territoryId: string }[]).map(({ territoryId }) => territoryId)
const viewportPresentations = [
  { width: 320, height: 900 },
  { width: 390, height: 900 },
  { width: 768, height: 1_024 },
  { width: 1_440, height: 1_000 }
] as const
const allowedAssetPaths = new Set([
  "/content/assets/derivatives/tools/t037-phone.png",
  "/content/assets/derivatives/comparisons/p002-phone.png",
  "/content/assets/derivatives/scenes/s001-phone.png"
])
const forbiddenClosureMarkers = [
  "postcommit",
  "answer-key",
  "answer_key",
  "correctanswer",
  "correct-answer",
  "data-correct",
  "data-answer-key",
  "distractor-rationale"
]

const fixturePath = (
  territoryId: string,
  frameId: string,
  presentation: "default" | "large-text" | "reduced-motion" = "default"
) => `/?territory=${encodeURIComponent(territoryId)}&frame=${encodeURIComponent(frameId)}&presentation=${presentation}`

const trackUnexpectedNetwork = (page: Page, allowedOrigin: string) => {
  const external: string[] = []
  const failed: string[] = []
  const observeRequest = (request: Request) => {
    const url = new URL(request.url())
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== allowedOrigin) {
      external.push(request.url())
    }
  }
  page.on("request", observeRequest)
  page.on("requestfailed", (request) => failed.push(request.url()))
  return { external, failed }
}

const gotoFixture = async (
  page: Page,
  territoryId: string,
  frame: Frame,
  presentation: "default" | "large-text" | "reduced-motion" = "default"
) => {
  const response = await page.goto(fixturePath(territoryId, frame.frameId, presentation), {
    timeout: 30_000,
    waitUntil: "domcontentloaded"
  })
  expect(response?.status()).toBe(200)
  expect(response?.headers()["content-security-policy"]).toContain("default-src 'none'")
  expect(response?.headers()["content-security-policy"]).toContain("script-src 'self'")
  expect(response?.headers()["content-security-policy"]).toContain("img-src 'self'")
  expect(response?.headers()["content-security-policy"]).toContain("connect-src 'self'")
  await expect(page.locator("[data-shared-root]")).toHaveAttribute("data-territory-id", territoryId)
  await expect(page.locator("[data-shared-root]")).toHaveAttribute("data-frame-id", frame.frameId)
  await expect(page.locator("[data-shared-root]")).toHaveAttribute("data-legal-state", frame.legalState)
}

const expectNoHorizontalOverflow = async (page: Page, width: number) => {
  const dimensions = await page.evaluate(() => ({
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    rootClientWidth: document.documentElement.clientWidth,
    rootScrollWidth: document.documentElement.scrollWidth
  }))
  expect(dimensions.rootScrollWidth, `root overflow at ${width}px`).toBeLessThanOrEqual(dimensions.rootClientWidth)
  expect(dimensions.bodyScrollWidth, `body overflow at ${width}px`).toBeLessThanOrEqual(dimensions.bodyClientWidth)
}

const expectExactViewport = async (page: Page, width: number, height: number) => {
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  }))
  expect(viewport).toEqual({ clientWidth: width, innerWidth: width, innerHeight: height })
}

const typographyPx = (page: Page) => page.evaluate(() => {
  const size = (selector: string) => Number.parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize)
  return { root: size("html"), h1: size("h1"), lead: size(".lead"), eyebrow: size(".eyebrow") }
})

const expectActionsHaveTargetSize = async (page: Page, viewportWidth: number) => {
  const actions = page.locator(".action:visible")
  const count = await actions.count()
  expect(count).toBeGreaterThan(0)
  for (let index = 0; index < count; index += 1) {
    const box = await actions.nth(index).boundingBox()
    expect(box, `action ${index} has a box`).not.toBeNull()
    expect(box?.height, `action ${index} height`).toBeGreaterThanOrEqual(44)
    expect(box?.width, `action ${index} width`).toBeGreaterThanOrEqual(44)
    expect(box?.x, `action ${index} starts in viewport`).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0), `action ${index} ends in viewport`).toBeLessThanOrEqual(viewportWidth + 0.5)
  }
}

const focusableSnapshot = ({ direction, browserProject }: { direction: "forward" | "backward"; browserProject: string }) => {
  const selector = [
    "a[href]",
    "area[href]",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "iframe",
    "object",
    "embed",
    "[contenteditable]:not([contenteditable='false'])",
    "[tabindex]"
  ].join(",")
  const rendered = (element: HTMLElement) => {
    const style = getComputedStyle(element)
    const closedDetails = element.closest("details:not([open])")
    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.visibility !== "collapse" &&
      element.getClientRects().length > 0 &&
      !element.closest("[inert]") &&
      (closedDetails === null || element === closedDetails.querySelector(":scope > summary"))
  }
  const coordinateFor = (element: HTMLElement) => {
    if (element.id !== "") return `#${CSS.escape(element.id)}`
    const segments: string[] = []
    let current: Element | null = element
    while (current instanceof Element && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase()
      const sameTag = current.parentElement === null
        ? []
        : [...current.parentElement.children].filter((sibling) => sibling.tagName === current!.tagName)
      const suffix = sameTag.length > 1 ? `:nth-of-type(${sameTag.indexOf(current) + 1})` : ""
      segments.unshift(`${tag}${suffix}`)
      current = current.parentElement
    }
    return `html>${segments.join(">")}`
  }
  const candidates = [...document.querySelectorAll<HTMLElement>(selector)].filter((element) => {
    if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") return false
    if (element instanceof HTMLInputElement && element.type === "hidden") return false
    return element.tabIndex >= 0 && rendered(element)
  })
  const radioGroups = new Map<string, HTMLInputElement[]>()
  for (const element of candidates) {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio" || element.name === "") continue
    const formCoordinate = element.form === null ? "no-form" : coordinateFor(element.form)
    const key = `${formCoordinate}\u0000${element.name}`
    const group = radioGroups.get(key) ?? []
    group.push(element)
    radioGroups.set(key, group)
  }
  const eligible = candidates.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio" || element.name === "") return true
    const formCoordinate = element.form === null ? "no-form" : coordinateFor(element.form)
    const group = radioGroups.get(`${formCoordinate}\u0000${element.name}`)!
    const checked = group.find((candidate) => candidate.checked)
    const directionalFallback = direction === "backward" && browserProject === "webkit" ? group.at(-1) : group[0]
    return element === (checked ?? directionalFallback)
  })
  const documentOrder = new Map(eligible.map((element, index) => [element, index]))
  eligible.sort((left, right) => {
    const leftPositive = left.tabIndex > 0
    const rightPositive = right.tabIndex > 0
    if (leftPositive !== rightPositive) return leftPositive ? -1 : 1
    if (leftPositive && left.tabIndex !== right.tabIndex) return left.tabIndex - right.tabIndex
    return documentOrder.get(left)! - documentOrder.get(right)!
  })
  return eligible.map((element) => coordinateFor(element))
}

const activeFocusObservation = () => {
  const coordinateFor = (element: HTMLElement) => {
    if (element.id !== "") return `#${CSS.escape(element.id)}`
    const segments: string[] = []
    let current: Element | null = element
    while (current instanceof Element && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase()
      const sameTag = current.parentElement === null
        ? []
        : [...current.parentElement.children].filter((sibling) => sibling.tagName === current!.tagName)
      const suffix = sameTag.length > 1 ? `:nth-of-type(${sameTag.indexOf(current) + 1})` : ""
      segments.unshift(`${tag}${suffix}`)
      current = current.parentElement
    }
    return `html>${segments.join(">")}`
  }
  const element = document.activeElement
  if (!(element instanceof HTMLElement) || element === document.body || element === document.documentElement) return null
  const style = getComputedStyle(element)
  const transparentOutline = style.outlineColor === "transparent" || style.outlineColor === "rgba(0, 0, 0, 0)"
  return {
    coordinate: coordinateFor(element),
    focusVisible: element.matches(":focus-visible") &&
      style.outlineStyle !== "none" &&
      style.outlineStyle !== "hidden" &&
      Number.parseFloat(style.outlineWidth) >= 3 &&
      Number.parseFloat(style.outlineOffset) >= 2 &&
      !transparentOutline
  }
}

const expectKeyboardTraversalAndVisibleFocus = async (page: Page, browserProject: string) => {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  })
  const expectedOrder = await page.evaluate(focusableSnapshot, { direction: "forward", browserProject })
  expect(expectedOrder.length, "fixture has enabled rendered sequential focus stops").toBeGreaterThan(0)
  expect(new Set(expectedOrder).size, "derived focus coordinates are unique").toBe(expectedOrder.length)
  const visited: { coordinate: string; focusVisible: boolean }[] = []
  for (let step = 0; step < expectedOrder.length; step += 1) {
    await page.keyboard.press("Tab")
    const observation = await page.evaluate(activeFocusObservation)
    expect(observation, `forward Tab stop ${step + 1} remains in the document`).not.toBeNull()
    visited.push(observation!)
    expect(observation!.focusVisible, `forward Tab stop ${visited.length} exposes a visible focus indicator`).toBe(true)
  }
  const visitedOrder = visited.map(({ coordinate }) => coordinate)
  expect(visitedOrder, "native Tab visits the complete derived order, including late controls").toEqual(expectedOrder)
  expect(new Set(visitedOrder).size, "native Tab cycle has no duplicate stop or trap").toBe(visitedOrder.length)

  // Firefox headless transfers forward focus into browser chrome after the
  // final document stop but does not expose that path to page automation.
  // Use only native Shift+Tab events for the observable return traversal;
  // no document control is focused programmatically.
  const backwardDocumentOrder = await page.evaluate(focusableSnapshot, { direction: "backward", browserProject })
  const returnExpectedOrder = backwardDocumentOrder.slice(0, -1).reverse()
  const returnVisited: { coordinate: string; focusVisible: boolean }[] = []
  for (let step = 0; step < returnExpectedOrder.length; step += 1) {
    await page.keyboard.press("Shift+Tab")
    const observation = await page.evaluate(activeFocusObservation)
    expect(observation, `return Shift+Tab stop ${step + 1} remains in the document`).not.toBeNull()
    returnVisited.push(observation!)
    expect(observation!.focusVisible, `return Shift+Tab stop ${returnVisited.length} exposes a visible focus indicator`).toBe(true)
  }
  expect(returnVisited.map(({ coordinate }) => coordinate), "native Shift+Tab follows the exact reverse return order").toEqual(returnExpectedOrder)
  expect(returnVisited.at(-1)?.coordinate, "the native keyboard round trip returns to the first stop").toBe(expectedOrder[0])
}

const expectAcceptedImageTreatment = async (page: Page, frame: Frame) => {
  const images = page.locator(".figure-frame img")
  if (frame.asset === null) {
    await expect(images).toHaveCount(0)
    return
  }

  expect(allowedAssetPaths.has(frame.asset.path)).toBe(true)
  await expect(images).toHaveCount(1)
  await expect(images).toHaveAttribute("src", frame.asset.path)
  await expect(images).toHaveJSProperty("complete", true)
  const treatment = await images.evaluate((image: HTMLImageElement) => {
    const style = getComputedStyle(image)
    return {
      backgroundImage: style.backgroundImage,
      clipPath: style.clipPath,
      filter: style.filter,
      mixBlendMode: style.mixBlendMode,
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      objectFit: style.objectFit,
      objectPosition: style.objectPosition,
      opacity: Number.parseFloat(style.opacity)
    }
  })
  expect(treatment.naturalWidth).toBeGreaterThan(0)
  expect(treatment.naturalHeight).toBeGreaterThan(0)
  expect(treatment.objectFit).toBe("contain")
  expect(treatment.objectPosition).toBe("50% 50%")
  expect(treatment.filter).toBe("none")
  expect(treatment.clipPath).toBe("none")
  expect(treatment.backgroundImage).toBe("none")
  expect(treatment.mixBlendMode).toBe("normal")
  expect(treatment.opacity).toBe(1)
}

const expectNoPrecommitLeakage = async (page: Page, frame: Frame) => {
  const leakSelectors = [
    "[data-answer-key]",
    "[data-correct]",
    "[data-correct-answer]",
    "[data-postcommit]",
    "[href*='postcommit']",
    "[src*='postcommit']"
  ].join(",")
  await expect(page.locator(leakSelectors)).toHaveCount(0)
  const requestedPaths = await page.evaluate(() => performance.getEntriesByType("resource").map(({ name }) => new URL(name).pathname))
  expect(requestedPaths.some((path) => path.toLowerCase().includes("postcommit"))).toBe(false)

  if (frame.legalState.startsWith("precommit")) {
    const visibleText = (await page.locator("[data-shared-root]").innerText()).toLowerCase()
    for (const phrase of ["answer key", "correct answer", "distractor rationale", "you are correct", "you are incorrect"]) {
      expect(visibleText, `precommit frame excludes ${phrase}`).not.toContain(phrase)
    }
  }
}

const allAxeViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  return results.violations
    .map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) }))
}

const semanticSignature = (page: Page) => page.locator("[data-shared-root]").evaluate((root) => {
  const clone = root.cloneNode(true) as HTMLElement
  clone.querySelector(".fixture-note")?.remove()
  const entries = [...clone.querySelectorAll("*")].map((element) => ({
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
  }))
  return JSON.stringify(entries)
})

const rawStatus = (baseURL: string, path: string, options: { host?: string; method?: string } = {}) =>
  new Promise<number>((resolve, reject) => {
    const target = new URL(baseURL)
    const request = rawHttpRequest({
      headers: options.host === undefined ? undefined : { Host: options.host },
      host: target.hostname,
      method: options.method ?? "GET",
      path,
      port: target.port
    }, (response) => {
      response.resume()
      response.once("end", () => resolve(response.statusCode ?? 0))
    })
    request.once("error", reject)
    request.end()
  })

test.describe("diagnostic A/B/C representative route-surface and presentation matrix", () => {
  for (const territoryId of territoryIds) {
    for (const frame of frames) {
      test(`${territoryId} · ${frame.frameId} passes deterministic browser checks`, async ({ page, baseURL, browserName }) => {
        test.setTimeout(90_000)
        expect(baseURL).toBeTruthy()
        const network = trackUnexpectedNetwork(page, new URL(baseURL!).origin)

        await gotoFixture(page, territoryId, frame)
        await expectAcceptedImageTreatment(page, frame)
        await expectNoPrecommitLeakage(page, frame)
        await expectKeyboardTraversalAndVisibleFocus(page, browserName)
        expect(await allAxeViolations(page)).toEqual([])

        for (const { width, height } of viewportPresentations) {
          await page.setViewportSize({ width, height })
          await expectExactViewport(page, width, height)
          await expectNoHorizontalOverflow(page, width)
          await expectActionsHaveTargetSize(page, width)
        }

        // WCAG 400% reflow is layout-equivalent to a 320 CSS-pixel viewport
        // when a 1280-pixel-wide viewport is zoomed to 400%. Using the
        // effective CSS viewport avoids Chromium's nonstandard CSS zoom,
        // which scales paint without reproducing browser-zoom reflow.
        await page.setViewportSize({ width: 320, height: 900 })
        await expectExactViewport(page, 320, 900)
        await expectNoHorizontalOverflow(page, 320)
        await expectActionsHaveTargetSize(page, 320)

        await page.setViewportSize({ width: 320, height: 900 })
        await gotoFixture(page, territoryId, frame)
        const largeTextBaseline = await typographyPx(page)
        await gotoFixture(page, territoryId, frame, "large-text")
        await expect(page.locator("html")).toHaveAttribute("data-presentation", "large-text")
        await expectExactViewport(page, 320, 900)
        const largeTextScaled = await typographyPx(page)
        for (const key of ["root", "h1", "lead", "eyebrow"] as const) {
          expect(largeTextScaled[key] / largeTextBaseline[key], `${key} scales at 125 percent`).toBeCloseTo(1.25, 2)
        }
        await expectNoHorizontalOverflow(page, 320)
        await expectActionsHaveTargetSize(page, 320)

        await page.setViewportSize({ width: 390, height: 900 })
        await page.emulateMedia({ reducedMotion: "reduce" })
        await gotoFixture(page, territoryId, frame, "reduced-motion")
        await expect(page.locator("html")).toHaveAttribute("data-presentation", "reduced-motion")
        await expectExactViewport(page, 390, 900)
        const reducedMotion = await page.locator(".action").first().evaluate((element) => ({
          mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
          transitionDuration: getComputedStyle(element).transitionDuration
        }))
        expect(reducedMotion.mediaMatches).toBe(true)
        expect(Number.parseFloat(reducedMotion.transitionDuration)).toBeLessThanOrEqual(0.001)

        await page.emulateMedia({ forcedColors: "active", reducedMotion: "no-preference" })
        await gotoFixture(page, territoryId, frame)
        await expectExactViewport(page, 390, 900)
        expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true)
        await expectKeyboardTraversalAndVisibleFocus(page, browserName)
        await expectNoHorizontalOverflow(page, 320)

        await page.setViewportSize({ width: 816, height: 1_056 })
        await page.emulateMedia({ forcedColors: "none", media: "print" })
        await gotoFixture(page, territoryId, frame)
        await expectExactViewport(page, 816, 1_056)
        expect(await page.locator(".research-toolbar").count()).toBeGreaterThan(0)
        expect(await page.locator(".action-row").count()).toBeGreaterThan(0)
        expect(await page.locator(".action").count()).toBeGreaterThan(0)
        await expect(page.locator(".research-toolbar")).toBeHidden()
        await expect(page.locator(".action-row")).toBeHidden()
        for (let actionIndex = 0; actionIndex < await page.locator(".action").count(); actionIndex += 1) {
          await expect(page.locator(".action").nth(actionIndex)).toBeHidden()
        }
        await expect(page.locator("#prototype-main")).toBeVisible()
        await expectNoHorizontalOverflow(page, 816)

        expect(network.external).toEqual([])
        expect(network.failed).toEqual([])
      })
    }
  }
})

test.describe("shared semantics and executable-closure boundary", () => {
  test("coverage claims stay representative and keep deferred legal states explicit", () => {
    expect(diagnosticCoverageBoundary).toEqual({
      classification: "representative-visual-comparison-not-exhaustive-legal-state-validation",
      registryRouteIdCount: 36,
      representedRouteIdCount: 10,
      representativeFrameCount: 12,
      deferredHazardVariants: ["asset-unavailable", "region-required", "version-mismatch", "commit-failure-preservation"],
      deferredRecoveryVariants: ["not-found-404", "withdrawn-410", "invalid-publication", "storage-unavailable", "service-failure"],
      immutablePrintReceiptScope: "review-queue-empty / A-B-C / chromium-firefox-webkit / 9 cases",
      uncommittedPlaywrightResultClass: "diagnostic-only"
    })
  })
  test("machine evidence coordinates are exact and nonhuman", () => {
    expect({
      protocolId: executionCoordinates.programVersion,
      reviewMode: executionCoordinates.reviewMode,
      humanEvidence: executionCoordinates.humanEvidence,
      humanParticipantCount: executionCoordinates.humanParticipantCount,
      humanReviewRequired: executionCoordinates.humanReviewRequired,
      notHumanUsabilityTested: executionCoordinates.notHumanUsabilityTested
    }).toEqual(evidenceCoordinates)
  })
  for (const frame of frames) {
    test(`${frame.frameId} has identical copy, links, and assets in A/B/C`, async ({ page }) => {
      const signatures: string[] = []
      for (const territoryId of territoryIds) {
        await gotoFixture(page, territoryId, frame)
        signatures.push(await semanticSignature(page))
      }
      expect(new Set(signatures).size).toBe(1)
    })
  }

  test("served document and executable closure contain no postcommit or answer-key markers", async ({ page, baseURL }) => {
    expect(baseURL).toBeTruthy()
    const sources = await Promise.all(
      ["/prototype.html", "/prototype.mjs"].map(async (path) => {
        const response = await page.request.get(path)
        expect(response.status()).toBe(200)
        return (await response.text()).toLowerCase()
      })
    )
    const closure = sources.join("\n")
    for (const marker of forbiddenClosureMarkers) expect(closure).not.toContain(marker)
  })

  test("server denies traversal, unlisted files, external Host, and mutating methods", async ({ baseURL }) => {
    expect(baseURL).toBeTruthy()
    for (const path of [
      "/package.json",
      "/product/DESIGN_SYSTEM.md",
      "/content/assets/derivatives/tools/t036-phone.png",
      "/content/assets/derivatives/tools/../t037-phone.png",
      "/content/assets/derivatives/tools/%2e%2e/scenes/s001-phone.png"
    ]) {
      expect([400, 404]).toContain(await rawStatus(baseURL!, path))
    }
    expect(await rawStatus(baseURL!, "/prototype.html", { method: "POST" })).toBe(405)
    expect(await rawStatus(baseURL!, "/prototype.html", { host: "example.invalid" })).toBe(421)
  })
})
