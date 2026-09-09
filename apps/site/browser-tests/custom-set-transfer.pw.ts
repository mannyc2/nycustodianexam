import { expect, test } from "@playwright/test"

test("custom question and Hazard responses survive export and import into an empty browser", async ({ page, browser }) => {
  await page.goto("/practice/")
  const builder = page.getByRole("region", { name: "Build a practice set" })
  await builder.getByText("Repeat a set", { exact: true }).click()
  await builder.getByLabel("Set code", { exact: true }).fill("portable-custom")
  await builder.getByRole("button", { name: "Start this practice set" }).click()
  await page.getByRole("button", { name: "Flag for review", exact: true }).click()
  await page.getByRole("radio").first().check()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.locator(".feedback-rationales")).toBeVisible()
  const savedUrl = new URL(page.url())
  const savedPath = savedUrl.pathname + savedUrl.search
  const hazardPaths: string[] = []
  for (const mode of ["visual", "nonvisual"] as const) {
    await page.goto("/hazards/")
    const drill = page.getByRole("region", { name: "Build a hazard drill" })
    if (mode === "nonvisual") await drill.getByRole("radio", { name: /^Read and select zones/ }).check()
    await drill.getByRole("button", { name: "Start drill", exact: true }).click()
    await expect(page.locator(".player-position")).toHaveText("Scene 1 of 1 · Original scene")
    const url = new URL(page.url())
    hazardPaths.push(url.pathname + url.search)
    if (mode === "visual") {
      await page.getByRole("button", { name: "Save marks", exact: true }).click()
      await page.getByRole("button", { name: "Confirm and save no marks", exact: true }).click()
    } else {
      await page.getByRole("checkbox").first().check()
      await page.getByRole("button", { name: "Save response", exact: true }).click()
    }
    await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
  }
  await page.goto("/settings/")
  const downloading = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export a file", exact: true }).click()
  const download = await downloading
  const path = await download.path()
  if (path === null) throw new Error("Export has no downloaded file")
  const restored = await browser.newPage()
  try {
    await restored.goto(new URL("/settings/", savedUrl).href)
    await restored.getByRole("button", { name: "Choose a file", exact: true }).click()
    await restored.getByLabel("Local export JSON").setInputFiles(path)
    await restored.getByRole("button", { name: "Check and preview import", exact: true }).click()
    await expect(restored.getByRole("heading", { name: "Import preview — nothing written yet" })).toBeVisible()
    await restored.getByLabel("Apply exactly this preview without overwriting existing records").check()
    await restored.getByRole("button", { name: "Apply import", exact: true }).click()
    await expect(restored.getByRole("heading", { name: "Import complete", exact: true })).toBeVisible()
    await restored.goto(new URL("/review/", savedUrl).href)
    await restored.locator(`a[href="${savedPath}"]`).filter({ hasText: /^Read explanation$/ }).click()
    await expect(restored.locator(".feedback-rationales")).toBeVisible()
    await expect(restored.locator(".player-position")).toHaveText("Question 1 of 45 · Text version")
    for (const path of hazardPaths) {
      await restored.goto(new URL("/practice/", savedUrl).href)
      await restored.getByRole("region", { name: "Recent activity" }).locator(`a[href="${path}"]`).click()
      await expect(restored.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
      await expect(restored.locator(".player-position")).toHaveText("Scene 1 of 1 · Original scene")
    }
  } finally { await restored.close() }
})
