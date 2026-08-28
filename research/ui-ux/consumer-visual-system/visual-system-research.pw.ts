import AxeBuilder from "../../../apps/site/node_modules/@axe-core/playwright/dist/index.mjs"
import { request as rawHttpRequest } from "node:http"
import {
  expect,
  test,
  type Page,
  type Request
} from "../../../apps/site/node_modules/@playwright/test/index.mjs"
import { sharedFrames, territories } from "./prototype.mjs"

type Frame = {
  asset: null | { opaqueAssetId: string; path: string }
  frameId: string
  legalState: string
}

const frames = sharedFrames as readonly Frame[]
const territoryIds = (territories as readonly { territoryId: string }[]).map(({ territoryId }) => territoryId)
const viewportWidths = [320, 390, 768, 1_440] as const
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
  const response = await page.goto(fixturePath(territoryId, frame.frameId, presentation))
  expect(response?.status()).toBe(200)
  expect(response?.headers()["content-security-policy"]).toContain("default-src 'none'")
  expect(response?.headers()["content-security-policy"]).toContain("script-src 'self'")
  expect(response?.headers()["content-security-policy"]).toContain("img-src 'self'")
  expect(response?.headers()["content-security-policy"]).toContain("connect-src 'self'")
  await expect(page.locator("[data-shared-root]")).toHaveAttribute("data-territory-id", territoryId)
  await expect(page.locator("[data-shared-root]")).toHaveAttribute("data-frame-id", frame.frameId)
  await expect(page.locator("[data-shared-root]")).toHaveAttribute("data-legal-state", frame.legalState)
  await page.waitForLoadState("networkidle")
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

const expectVisibleFocus = async (page: Page) => {
  const firstAction = page.locator(".action:visible").first()
  await firstAction.focus()
  await expect(firstAction).toBeFocused()
  const focus = await firstAction.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      color: style.outlineColor,
      offset: Number.parseFloat(style.outlineOffset),
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth)
    }
  })
  expect(focus.style).toBe("solid")
  expect(focus.width).toBeGreaterThanOrEqual(3)
  expect(focus.offset).toBeGreaterThanOrEqual(2)
  expect(focus.color).not.toBe("rgba(0, 0, 0, 0)")
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

const seriousOrCriticalViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  return results.violations
    .filter(({ impact }) => impact === "critical" || impact === "serious")
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

test.describe("A/B/C route-surface and presentation matrix", () => {
  for (const territoryId of territoryIds) {
    for (const frame of frames) {
      test(`${territoryId} · ${frame.frameId} passes deterministic browser checks`, async ({ page, baseURL }) => {
        test.setTimeout(90_000)
        expect(baseURL).toBeTruthy()
        const network = trackUnexpectedNetwork(page, new URL(baseURL!).origin)

        await gotoFixture(page, territoryId, frame)
        await expectAcceptedImageTreatment(page, frame)
        await expectNoPrecommitLeakage(page, frame)
        await expectVisibleFocus(page)
        expect(await seriousOrCriticalViolations(page)).toEqual([])

        for (const width of viewportWidths) {
          await page.setViewportSize({ width, height: 900 })
          await expectNoHorizontalOverflow(page, width)
          await expectActionsHaveTargetSize(page, width)
        }

        // CSS zoom forces the equivalent layout pressure of 400% zoom in a
        // 1280 CSS-pixel viewport while preserving a deterministic assertion.
        await page.setViewportSize({ width: 1_280, height: 900 })
        await page.locator("html").evaluate((element) => { element.style.zoom = "4" })
        const zoomedBounds = await page.locator("[data-shared-root]").evaluate((element) => {
          const bounds = element.getBoundingClientRect()
          return { left: bounds.left, right: bounds.right, viewport: window.innerWidth }
        })
        expect(zoomedBounds.left).toBeGreaterThanOrEqual(0)
        expect(zoomedBounds.right).toBeLessThanOrEqual(zoomedBounds.viewport + 0.5)
        await page.locator("html").evaluate((element) => { element.style.zoom = "" })

        await page.setViewportSize({ width: 320, height: 900 })
        await gotoFixture(page, territoryId, frame, "large-text")
        const largeTextSize = await page.locator("body").evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
        expect(largeTextSize).toBeGreaterThanOrEqual(20)
        await expectNoHorizontalOverflow(page, 320)
        await expectActionsHaveTargetSize(page, 320)

        await page.emulateMedia({ reducedMotion: "reduce" })
        await gotoFixture(page, territoryId, frame, "reduced-motion")
        const reducedMotion = await page.locator(".action").first().evaluate((element) => ({
          mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
          transitionDuration: getComputedStyle(element).transitionDuration
        }))
        expect(reducedMotion.mediaMatches).toBe(true)
        expect(Number.parseFloat(reducedMotion.transitionDuration)).toBeLessThanOrEqual(0.001)

        await page.emulateMedia({ forcedColors: "active", reducedMotion: "no-preference" })
        await gotoFixture(page, territoryId, frame)
        expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true)
        await expectVisibleFocus(page)
        await expectNoHorizontalOverflow(page, 320)

        await page.emulateMedia({ forcedColors: "none", media: "print" })
        await gotoFixture(page, territoryId, frame)
        await expect(page.locator(".research-toolbar")).toBeHidden()
        await expect(page.locator(".action-row")).toBeHidden()
        await expect(page.locator("#prototype-main")).toBeVisible()
        await expectNoHorizontalOverflow(page, 320)

        expect(network.external).toEqual([])
        expect(network.failed).toEqual([])
      })
    }
  }
})

test.describe("shared semantics and executable-closure boundary", () => {
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
