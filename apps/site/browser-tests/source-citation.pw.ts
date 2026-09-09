import { expect, test } from "@playwright/test"

for (const width of [1042, 384]) {
  test(`source citation metadata and network availability at ${width}px`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    await page.goto("/transparency/sources/nys-dcs-entry-level-guide/")
    const record = page.locator(".source-record")
    await expect(record.getByText("Evidence tier", { exact: true })).toBeVisible()
    await expect(record.getByRole("heading", { name: "Retained source excerpts" })).toBeVisible()
    const link = record.locator("a[data-network-only-link]")
    await expect(link).toHaveAttribute("href", /^https:/)
    const href = await link.getAttribute("href")
    await record.getByText("Technical details", { exact: true }).first().click()
    await expect(record.getByText(/Supports claim records:/).first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`source-${width}.png`), fullPage: true })
    await record.locator("blockquote").first().scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`source-excerpt-${width}.png`) })
    await context.setOffline(true)
    await expect(link).toHaveAttribute("aria-disabled", "true")
    await expect(link).not.toHaveAttribute("href")
    await expect(record.locator("[data-network-only-status]")).toBeVisible()
    await context.setOffline(false)
    await expect(link).not.toHaveAttribute("href")
    await page.reload()
    await expect(link).toHaveAttribute("href", href!)
    expect(errors).toEqual([])
  })
}
