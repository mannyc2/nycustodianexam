import catalog from "../../../content/releases/vertical-slice/catalog.json" with { type: "json" }
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
  test(`the redesigned ${path} page reflows and has accessible mobile navigation`, { tag: "@cross-browser" }, async ({ page }) => {
    await page.setViewportSize({ height: 720, width: 320 })
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const navigation = page.getByRole("navigation", { name: "Primary", exact: true })
    await expect(navigation).toBeVisible()
    await expect(navigation.getByRole("link", { name: "Practice", exact: true })).toBeVisible()
    await expect(page.locator(".site-header").getByRole("link", { name: "Settings", exact: true })).toBeVisible()
    await expect(page.locator(".site-header a[href='/offline/'], .site-header a[href='/transparency/'], .exam-chip")).toHaveCount(0)
    await expectPageReflow(page)

    await navigation.locator("summary").click()
    await expect(navigation.getByRole("link", { name: /^Tool atlas/ })).toBeVisible()
    await expect(navigation.getByRole("link", { name: /^Hazard scenes/ })).toBeVisible()
    await expectPageReflow(page)

  })

  test(`the ${path} page has no serious WCAG A/AA axe violations`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Full DOM accessibility scans run in Chromium")
    await page.setViewportSize({ height: 720, width: 320 })
    await page.goto(path)
    await page.getByRole("navigation", { name: "Primary", exact: true }).locator("summary").click()
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(scan.violations
      .filter(({ impact }) => impact === "critical" || impact === "serious")
      .map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })))
      .toEqual([])
  })
}

test("Library supports keyboard dismissal, outside clicks, and normal link navigation", { tag: "@cross-browser" }, async ({ page }) => {
  await page.goto("/")
  const menu = page.locator("[data-library-menu]")
  const trigger = menu.locator("summary")
  await trigger.focus()
  await page.keyboard.press("Enter")
  await page.keyboard.press("Tab")
  await expect(menu.getByRole("link", { name: /^Tool atlas/ })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await expect(menu).not.toHaveAttribute("open")
  await trigger.click()
  await page.mouse.click(8, 400)
  await expect(menu).not.toHaveAttribute("open")
  await trigger.click()
  await menu.getByRole("link", { name: /^Hazard scenes/ }).click()
  await expect(page).toHaveURL(/\/hazards\/$/)
})

test("enlarged text keeps Settings on the right and the Library panel within the viewport", { tag: "@cross-browser" }, async ({ page }) => {
  for (const width of [320, 800, 900, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    await page.evaluate(() => document.documentElement.setAttribute("data-large-text", ""))
    await page.locator("[data-library-menu] summary").click()
    await expectPageReflow(page)
    const header = await page.locator(".site-header-inner").boundingBox()
    const settings = await page.locator(".nav-utility").boundingBox()
    expect(header).not.toBeNull()
    expect(settings).not.toBeNull()
    expect(settings!.x + settings!.width).toBeCloseTo(width < 768 ? width : header!.x + header!.width, 0)
  }
})

test("Library links and Settings downloads remain reachable without JavaScript", { tag: "@cross-browser" }, async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 720 } })
  const page = await context.newPage()
  await page.goto("/")
  const navigation = page.getByRole("navigation", { name: "Primary", exact: true })
  await navigation.locator("summary").click()
  await expect(navigation.getByRole("link", { name: /^Hazard scenes/ })).toBeVisible()
  await expectPageReflow(page)
  await page.locator(".site-header").getByRole("link", { name: "Settings", exact: true }).click()
  await expect(page.getByRole("link", { name: "Manage offline downloads", exact: true })).toHaveAttribute("href", "/offline/")
  await expect(page.locator(".site-footer").getByRole("link", { name: "Sources and methods", exact: true })).toBeVisible()
  await context.close()
})

test("atlas family controls filter the released tools and restore the selected family", async ({ page }) => {
  await page.setViewportSize({ height: 720, width: 320 })
  await page.goto("/atlas/")
  const familyTabs = page.getByRole("tablist", { name: "Visual family", includeHidden: true })
  await expect(familyTabs).toBeHidden()
  const familySelect = page.getByRole("combobox", { name: "Family", exact: true })
  await expect(familySelect).toBeVisible()
  await expect(familySelect.getByRole("option")).toHaveCount(10)
  const family = familyTabs.locator('[data-atlas-family]:not([data-atlas-family="all"])').first()
  const familyName = await family.getAttribute("data-atlas-family")
  expect(familyName).not.toBeNull()
  const expected = await page.locator("[data-tool-family]").evaluateAll((cards, selectedFamily) =>
    cards.filter((card) => card.getAttribute("data-tool-family") === selectedFamily).length,
  familyName)
  expect(expected).toBeGreaterThan(0)

  await familySelect.selectOption(familyName!)
  await expect(family).toHaveAttribute("aria-selected", "true")
  await expect(page.locator("[data-tool-family]:visible")).toHaveCount(expected)
  await expect(page.locator("[data-atlas-count]")).toContainText(`Showing ${expected} illustrated`)
  expect(new URL(page.url()).searchParams.get("family")).toBe(familyName)
  await expectPageReflow(page)

  await page.reload()
  await expect(family).toHaveAttribute("aria-selected", "true")
  await expect(page.locator("[data-tool-family]:visible")).toHaveCount(expected)
  await page.setViewportSize({ width: 1248, height: 900 })
  await expect(familyTabs).toBeVisible()
  await expect(familySelect).toBeHidden()
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
  await page.getByText("Search and filter", { exact: true }).click()
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
  await expect(panel.getByRole("link", { name: "See what practice covers", exact: true })).toHaveAttribute("href", "/practice/#covers")
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
  await page.getByRole("button", { name: "Clear filters", exact: true }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue("")
  await expect(page.locator("[data-exam-row]:visible")).toHaveCount(total)
  const coverage = rows.first().locator(".exam-card-coverage").getByRole("link", { name: "See what practice covers", exact: true })
  await expect(coverage).toBeVisible()
  await coverage.click()
  await expect(page).toHaveURL(/\/practice\/#covers$/)
  await expect(page.locator("#covers")).toBeFocused()
  await expect(page.locator("#study-coverage-heading")).toBeInViewport()
})

test("compact navigation stays at the viewport bottom and all Library destinations resolve", { tag: "@cross-browser" }, async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 800 })
  await page.goto("/practice/")
  await expect(page.getByRole("heading", { name: "Start with a set of 45.", exact: true })).toBeVisible()
  const primary = page.getByRole("navigation", { name: "Primary", exact: true })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  const bar = await primary.boundingBox()
  expect(bar!.y + bar!.height).toBe(800)
  await primary.locator("summary").click()
  const panel = page.locator(".nav-popover")
  const sheet = await panel.boundingBox()
  expect(sheet!.x).toBe(0)
  expect(sheet!.width).toBe(384)
  expect(Math.abs(sheet!.y + sheet!.height - bar!.y)).toBeLessThanOrEqual(1)
  await panel.getByRole("link", { name: /^Tool comparisons/ }).click()
  await expect(page.locator("#comparisons")).toBeInViewport()
  await page.locator("[data-library-menu] summary").click()
  await page.locator(".nav-popover").getByRole("link", { name: /^What practice covers/ }).click()
  await expect(page.getByRole("heading", { name: "What practice covers", exact: true })).toBeInViewport()
})

test("Atlas preserves written records when released illustrations cannot load", async ({ page }) => {
  await page.route("**/content/**", async (route) => {
    if (route.request().resourceType() === "image") await route.abort()
    else await route.continue()
  })
  await page.setViewportSize({ width: 384, height: 800 })
  await page.goto("/atlas/")
  const firstCard = page.locator("[data-tool-family]").first()
  await expect(firstCard.locator("[data-atlas-image-notice]")).toBeVisible()
  const description = await firstCard.locator("img").getAttribute("alt")
  expect(description).toBeTruthy()
  await expect(firstCard.locator("[data-atlas-image-notice]")).toContainText(description!)
  await expect(firstCard.getByRole("link")).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Family", exact: true })).toBeEnabled()
  await expectPageReflow(page)
})


test("exam cycle keeps the responsive reading order and sources without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    for (const width of [1248, 384]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/exams/")
      const cycle = page.locator("#exams-cycle")
      await expect(cycle.locator(".timeline > li:visible")).toHaveCount(width === 384 ? 3 : 4)
      await expect(cycle.locator('.timeline time[datetime="2026-08-22"]')).toHaveCount(1)
      await expect(cycle.locator('.timeline time[datetime="2026-07-05"]').locator("..")).toContainText(/Jericho/)
      const notice = cycle.locator("[data-administration-state]:visible")
      await expect(notice).toHaveCount(1)
      const noticeBox = await notice.boundingBox()
      const datesBox = await cycle.locator(".timeline").boundingBox()
      expect(noticeBox).not.toBeNull()
      expect(datesBox).not.toBeNull()
      if (width === 384) expect(noticeBox!.y).toBeLessThan(datesBox!.y)
      else expect(noticeBox!.y).toBeGreaterThan(datesBox!.y)
      await cycle.getByText("Sources and review dates", { exact: true }).click()
      await expect(cycle.locator("details .proof-line")).toBeVisible()
      expect(await cycle.locator("details a:visible").count()).toBeGreaterThan(0)
      await expectPageReflow(page)
    }
  } finally { await context.close() }
})

test("filing filters compose with search, restore from the URL, and never select a study exam", async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 900 })
  await page.goto("/exams/?filing=closed")
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }))
  const filters = page.getByRole("group", { name: "Filing status at source review" })
  const rows = page.locator("[data-exam-row]:visible")
  await expect(filters.getByRole("button", { name: "Filing closed", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(rows).toHaveCount(2)
  const search = page.getByRole("searchbox")
  await search.fill("promotion")
  await expect(rows).toHaveCount(1)
  await page.locator("[data-exam-choice]:visible").click()
  await expect(page.locator("[data-exam-panel]:visible")).toHaveCount(1)
  await filters.getByRole("button", { name: "Plan only", exact: true }).click()
  await expect(rows).toHaveCount(0)
  await expect(page.locator("[data-exam-panel]:visible")).toHaveCount(0)
  expect(new URL(page.url()).searchParams.has("record")).toBe(false)
  await page.getByRole("button", { name: "Clear filters", exact: true }).click()
  await expect(search).toBeFocused()
  await expect(rows).toHaveCount(3)
  await filters.getByRole("button", { name: "Plan only", exact: true }).click()
  await expect(rows).toHaveCount(1)
  await page.reload()
  await expect(rows).toHaveCount(1)
  await filters.getByRole("button", { name: "Open for filing", exact: true }).click()
  await expect(rows).toHaveCount(0)
  await expect(page.locator("[data-exam-empty]")).toBeVisible()
  await expect(page.locator("[data-exam-prompt]")).toBeHidden()
  await expectPageReflow(page)
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before)
})


test("exam controls align on desktop and compact records omit the empty selection panel", { tag: "@cross-browser" }, async ({ page }) => {
  // Layout and disclosure checks should not race focus-triggered smooth scrolling.
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const width of [1248, 384]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/exams/")
    if (width === 384) await page.getByText("Search and filter", { exact: true }).click()
    const search = page.getByRole("searchbox")
    const filters = page.getByRole("group", { name: "Filing status at source review" })
    await expect(search).toBeVisible()
    const searchBox = (await search.boundingBox())!
    const filterBox = (await filters.boundingBox())!
    if (width === 1248) expect(Math.abs(searchBox.y - filterBox.y)).toBeLessThan(10)
    else {
      expect(filterBox.y).toBeGreaterThan(searchBox.y + searchBox.height)
      await expect(page.locator("[data-exam-prompt]")).toBeHidden()
    }
    await page.locator("[data-exam-choice]").first().click()
    const panel = page.locator("[data-exam-panel]:visible")
    await expect(panel.locator(".fact-table details")).toHaveCount(0)
    await expect(panel.locator(".record-source-trail")).toHaveCount(1)
    await panel.getByText("Sources for this record", { exact: true }).click()
    await expect(panel.locator(".record-source-trail")).toHaveAttribute("open")
    await expect(panel.locator(".record-fact-sources")).toBeVisible()
    await expectPageReflow(page)
  }
})

test("every announcement fact keeps its exact source excerpt without JavaScript", async ({ browser, baseURL }) => {
  if (baseURL === undefined) throw new Error("Browser base URL is required")
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 384, height: 900 } })
  try {
    const page = await context.newPage()
    await page.goto("/exams/")
    const facts = catalog.profiles.flatMap(profile => profile.announcementFactSheet?.facts ?? [])
    const format = page.getByRole("region", { name: "How the real test works" })
    await expect(format).toContainText("Follow your admission notice")
    await expect(format).toContainText("No official count verified")
    await format.getByText("Where the format facts come from", { exact: true }).click()
    const source = format.getByRole("link", { name: "Test Guide for the Entry-Level Custodians and Janitors Series", exact: true })
    await expect(source).toBeVisible()
    const response = await page.request.get((await source.getAttribute("href"))!)
    expect(response.ok()).toBe(true)
    const expectedSourceRows = catalog.profiles.reduce((total, profile) => total + profile.examIdentities.reduce((count, identity) => count + (profile.announcementFactSheet?.facts.filter(fact => fact.state !== "superseded" && fact.appliesToExamNumbers.includes(identity.examNumber)).length ?? 0), 0), 0)
    expect(expectedSourceRows).toBeGreaterThan(0)
    await expect(page.locator("[data-source-fact]")).toHaveCount(expectedSourceRows)
    const panels = page.locator("[data-exam-panel]")
    for (const panel of await panels.all()) {
      await panel.getByText("Sources for this record", { exact: true }).click()
      for (const row of await panel.locator("[data-source-fact]").all()) {
        const id = await row.getAttribute("data-source-fact")
        const fact = facts.find(fact => fact.id === id)!
        expect(fact).toBeDefined()
        await expect(row.locator("dt")).toHaveText(fact.label)
        for (const lineId of new Set([...fact.sourceLineIds, ...(fact.conflictingValues as ReadonlyArray<{ sourceLineIds: readonly string[] }>).flatMap(value => value.sourceLineIds)])) {
          const line = catalog.sourceLines.find(line => line.id === lineId)!
          await expect(row).toContainText(line.excerpt)
          await expect(row).toContainText(line.locator)
        }
      }
    }
  } finally { await context.close() }
})

for (const javaScriptEnabled of [true, false]) {
  test(`compact exam subject disclosures work with JavaScript ${javaScriptEnabled ? "enabled" : "disabled"}`, async ({ browser, baseURL }) => {
    if (baseURL === undefined) throw new Error("Browser base URL is required")
    const context = await browser.newContext({ baseURL, javaScriptEnabled, viewport: { width: 384, height: 900 } })
    try {
      const page = await context.newPage()
      await page.goto("/exams/")
      const before = page.url()
      const cards = page.locator(".exam-card-subjects")
      await expect(cards).toHaveCount(3)
      for (const card of await cards.all()) {
        await expect(card.locator("ol")).toBeHidden()
        await card.locator("summary").focus()
        await page.keyboard.press("Enter")
        await expect(card.locator("ol")).toBeVisible()
        await expect(card.locator("li")).toHaveText([
          "Cleaning Tools and Their Uses",
          "Tools Used for Minor Maintenance and Repair",
          "Health and Safety Issues in Custodial Work"
        ])
        await expectPageReflow(page)
        await page.keyboard.press("Enter")
        await expect(card.locator("ol")).toBeHidden()
      }
      expect(page.url()).toBe(before)
      if (javaScriptEnabled) await expect(page.locator("[data-exam-panel]:visible")).toHaveCount(0)
      await page.setViewportSize({ width: 1248, height: 900 })
      await expect(page.locator(".exam-card-coverage:visible")).toHaveCount(0)
    } finally { await context.close() }
  })
}

test("compact exam filters disclose on demand and recover visible controls across resize", { tag: "@cross-browser" }, async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 900 })
  await page.goto("/exams/")
  const disclosure = page.locator("[data-exam-filter-disclosure]")
  const summary = disclosure.locator("summary")
  const search = page.getByRole("searchbox")
  await expect(disclosure).toBeVisible()
  await expect(search).toBeHidden()
  await summary.focus()
  await page.keyboard.press("Enter")
  await expect(search).toBeVisible()
  await search.fill("no such announcement")
  await summary.click()
  await expect(search).toBeHidden()
  await page.getByRole("button", { name: "Clear filters", exact: true }).click()
  await expect(search).toBeFocused()
  await expect(page.locator("[data-exam-row]:visible")).toHaveCount(3)
  await summary.click()
  await page.setViewportSize({ width: 1248, height: 900 })
  await expect(search).toBeVisible()
  await expect(summary).toBeHidden()
  await page.setViewportSize({ width: 384, height: 900 })
  await expect(search).toBeVisible()
  await page.goto("/exams/?filing=plan")
  await expect(search).toBeVisible()
  await expect(page.locator("[data-exam-row]:visible")).toHaveCount(1)
})

test("Atlas desktop cards follow the reference grid and retain every family count", async ({ page }) => {
  await page.setViewportSize({ width: 1042, height: 900 })
  await page.goto("/atlas/")
  const cards = page.locator("[data-tool-family]:visible")
  await expect(cards).toHaveCount(65)
  expect(await cards.locator("h2").evaluateAll(headings => headings.every(heading => heading.scrollWidth <= heading.clientWidth))).toBe(true)
  const first = (await cards.nth(0).boundingBox())!
  expect((await cards.nth(4).boundingBox())!.y).toBe(first.y)
  expect((await cards.nth(5).boundingBox())!.y).toBeGreaterThan(first.y + first.height)
  const families = page.locator('[data-atlas-family]:not([data-atlas-family="all"])')
  await expect(families).toHaveCount(9)
  for (const family of await families.all()) {
    const count = Number(await family.locator(".filter-count").textContent())
    await family.click()
    await expect(cards).toHaveCount(count)
    await expectPageReflow(page)
  }
  await page.locator('[data-atlas-family="all"]').click()
  await expect(page.locator(".tool-eligibility:not(.tool-eligibility-scored):visible")).toHaveCount(12)
  await expect(page.locator(".tool-eligibility-scored:visible")).toHaveCount(0)
  await page.setViewportSize({ width: 384, height: 900 })
  await expect(page.locator(".tool-eligibility-scored:visible")).toHaveCount(53)
})

test("Atlas recovery follows visible failures and its study guidance is usable without JavaScript", async ({ page, browser, baseURL }) => {
  await page.setViewportSize({ width: 384, height: 900 })
  await page.goto("/atlas/")
  const recovery = page.locator("[data-atlas-image-recovery]")
  await expect(recovery).toBeHidden()
  const firstSource = await page.locator("[data-tool-family] img").first().getAttribute("src")
  expect(firstSource).toBeTruthy()
  await page.route(`**${firstSource}`, route => route.abort())
  await page.reload()
  await expect(recovery).toBeVisible()
  await page.getByRole("combobox", { name: "Family", exact: true }).selectOption("PPE")
  await expect(recovery).toBeHidden()
  await page.getByRole("combobox", { name: "Family", exact: true }).selectOption("all")
  await expect(recovery).toBeVisible()
  await recovery.getByRole("link", { name: "Manage downloads", exact: true }).click()
  await expect(page).toHaveURL(/\/offline\/$/)
  if (baseURL === undefined) throw new Error("Browser base URL is required")
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 384, height: 900 } })
  try {
    const document = await context.newPage()
    await document.goto("/atlas/")
    await expect(document.getByRole("heading", { name: "All 65 records have released illustrations", exact: true })).toHaveCount(0)
    const details = document.locator(".atlas-help")
    await details.locator("summary").click()
    await expect(details.getByText(/These tools are available to study/)).toBeVisible()
    await expect(details.getByRole("link", { name: "Sources and methods", exact: true })).toHaveAttribute("href", "/transparency/")
    await details.getByRole("link", { name: "Download a study copy", exact: true }).click()
    await expect(document).toHaveURL(/\/offline\/$/)
    await expectPageReflow(document)
  } finally { await context.close() }
})
