import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { gotoReadyQuestion } from "./question-player-fixtures.ts"

const seriousAccessibilityViolations = async (page: Page) => {
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  return scan.violations
    .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
    .map(({ help, id, nodes }) => ({ help, id, targets: nodes.map((node) => node.target) }))
}

test("ready and revealed states have no serious WCAG A/AA axe violations", async ({ page }) => {
  await gotoReadyQuestion(page)
  expect(await seriousAccessibilityViolations(page)).toEqual([])

  await page.getByRole("radio", { name: "Staple gun" }).check()
  await page.getByRole("button", { name: "Commit answer" }).click()
  await expect(page.getByRole("heading", { name: "Review this one" })).toBeFocused()
  expect(await seriousAccessibilityViolations(page)).toEqual([])
})

test("the question reflows without page-level horizontal scrolling at 320 CSS pixels", async ({
  page
}) => {
  await page.setViewportSize({ height: 720, width: 320 })
  await gotoReadyQuestion(page)

  const dimensions = await page.evaluate(() => ({
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    rootClientWidth: document.documentElement.clientWidth,
    rootScrollWidth: document.documentElement.scrollWidth
  }))
  expect(dimensions.rootScrollWidth).toBeLessThanOrEqual(dimensions.rootClientWidth)
  expect(dimensions.bodyScrollWidth).toBeLessThanOrEqual(dimensions.bodyClientWidth)

  for (const locator of [
    page.getByText("Staple gun", { exact: true }).locator(".."),
    page.getByRole("button", { name: "Flag for review" })
  ]) {
    const box = await locator.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
    expect(box?.x).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320)
  }
})

test("forced colors preserves a non-color selected indicator", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" })
  await gotoReadyQuestion(page)
  await page.getByRole("radio", { name: "Scrub brush" }).check()

  const selectedStyle = await page
    .getByText("Scrub brush", { exact: true })
    .locator("..")
    .evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        boxShadow: style.boxShadow,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth
      }
    })
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true)
  expect(selectedStyle.boxShadow).toBe("none")
  expect(selectedStyle.outlineStyle).toBe("solid")
  expect(Number.parseFloat(selectedStyle.outlineWidth)).toBeGreaterThanOrEqual(2)
})

test("reduced motion removes smooth scrolling and transition delays", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await gotoReadyQuestion(page)

  const media = await page.evaluate(() => ({
    matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    transitionDuration: getComputedStyle(document.querySelector(".button")!).transitionDuration
  }))
  expect(media.matches).toBe(true)
  expect(media.scrollBehavior).toBe("auto")
  const transitionSeconds = media.transitionDuration.endsWith("ms")
    ? Number.parseFloat(media.transitionDuration) / 1_000
    : Number.parseFloat(media.transitionDuration)
  expect(transitionSeconds).toBeLessThanOrEqual(0.00001)
})

test("print media removes application chrome and controls while retaining feedback", async ({
  page
}) => {
  await gotoReadyQuestion(page)
  await page.getByRole("radio", { name: "Scrub brush" }).check()
  await page.getByRole("button", { name: "Commit answer" }).click()
  await expect(page.getByRole("heading", { name: "Correct", exact: true })).toBeVisible()

  await page.emulateMedia({ media: "print" })
  const printState = await page.evaluate(() => {
    const display = (selector: string) => getComputedStyle(document.querySelector(selector)!).display
    return {
      feedback: display(".feedback"),
      footer: display(".site-footer"),
      header: display(".site-header"),
      questionControls: display(".question-controls")
    }
  })
  expect(printState.header).toBe("none")
  expect(printState.footer).toBe("none")
  expect(printState.questionControls).toBe("none")
  expect(printState.feedback).not.toBe("none")
})
