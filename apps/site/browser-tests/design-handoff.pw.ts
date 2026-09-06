import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const expectPageReflow = async (page: Page): Promise<void> => {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }))
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport)
}

for (const path of ["/", "/exams/", "/atlas/", "/practice/", "/review/", "/simulations/", "/offline/", "/settings/", "/report/"]) {
  test(`the redesigned ${path} page reflows and has accessible mobile navigation`, async ({ page }) => {
    await page.setViewportSize({ height: 720, width: 320 })
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const compactNavigation = page.getByRole("navigation", { name: "Compact primary", exact: true })
    await expect(compactNavigation).toBeVisible()
    await expectPageReflow(page)

    await compactNavigation.locator("summary").click()
    await expect(compactNavigation.getByRole("link", { name: "Build a simulation" })).toBeVisible()
    await expectPageReflow(page)

    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(scan.violations
      .filter(({ impact }) => impact === "critical" || impact === "serious")
      .map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })))
      .toEqual([])
  })
}

test("atlas family tabs filter the released tools and restore the selected family", async ({ page }) => {
  await page.setViewportSize({ height: 720, width: 320 })
  await page.goto("/atlas/")
  const familyTabs = page.getByRole("tablist", { name: "Visual family" })
  await expect(familyTabs).toBeVisible()
  const family = familyTabs.locator('[data-atlas-family]:not([data-atlas-family="all"])').first()
  const familyName = await family.getAttribute("data-atlas-family")
  expect(familyName).not.toBeNull()
  const expected = await page.locator("[data-tool-family]").evaluateAll((cards, selectedFamily) =>
    cards.filter((card) => card.getAttribute("data-tool-family") === selectedFamily).length,
  familyName)
  expect(expected).toBeGreaterThan(0)

  await family.click()
  await expect(family).toHaveAttribute("aria-selected", "true")
  await expect(page.locator("[data-tool-family]:visible")).toHaveCount(expected)
  await expect(page.locator("[data-atlas-count]")).toContainText(`Showing ${expected} illustrated`)
  expect(new URL(page.url()).searchParams.get("family")).toBe(familyName)
  await expectPageReflow(page)

  await page.reload()
  await expect(family).toHaveAttribute("aria-selected", "true")
  await expect(page.locator("[data-tool-family]:visible")).toHaveCount(expected)
  await family.focus()
  await page.keyboard.press("Home")
  const all = familyTabs.getByRole("tab", { name: /^All families/ })
  await expect(all).toBeFocused()
  await expect(all).toHaveAttribute("aria-selected", "true")
  expect(new URL(page.url()).searchParams.has("family")).toBe(false)
  await expect(page.locator("[data-tool-family]:visible")).toHaveCount(await page.locator("[data-tool-family]").count())
})

test("exam search, record selection, and detail tabs use the published records", async ({ page }) => {
  await page.setViewportSize({ height: 720, width: 320 })
  await page.goto("/exams/")
  const search = page.getByRole("searchbox", { name: "Search announcements and study plans" })
  await expect(search).toBeVisible()
  const rows = page.locator("[data-exam-row]")
  const total = await rows.count()
  expect(total).toBeGreaterThan(0)
  const firstChoice = page.locator("[data-exam-choice]").first()
  const recordId = await firstChoice.getAttribute("data-exam-choice")
  const title = (await firstChoice.locator("strong").textContent())?.trim() ?? ""
  expect(title.length).toBeGreaterThan(0)
  await search.fill(title)
  await firstChoice.click()
  expect(new URL(page.url()).searchParams.get("record")).toBe(recordId)
  const panel = page.locator("[data-exam-panel]:visible")
  await expect(panel).toHaveCount(1)
  await expect(panel).toBeFocused()
  const subjectTab = panel.getByRole("tab", { name: "What it tests", exact: true })
  await subjectTab.click()
  await expect(subjectTab).toHaveAttribute("aria-selected", "true")
  await expect(panel.getByRole("tabpanel", { name: "What it tests" })).toBeVisible()
  await expectPageReflow(page)

  await search.fill("no-such-published-custodian-exam")
  await expect(page.locator("[data-exam-row]:visible")).toHaveCount(0)
  await expect(page.locator("[data-exam-empty]")).toBeVisible()
  await expect(page.locator("[data-exam-panel]:visible")).toHaveCount(0)
  expect(new URL(page.url()).searchParams.has("record")).toBe(false)
  await page.getByRole("button", { name: "Clear search", exact: true }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue("")
  await expect(page.locator("[data-exam-row]:visible")).toHaveCount(total)
})
