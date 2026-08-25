import { expect, test } from "@playwright/test"
import { questionPath } from "./question-player-fixtures.ts"

test("@cloudflare serves canonical nested documents with the intended route identities", async ({
  page
}) => {
  for (const route of [
    { canonical: "/", id: "home", path: "/" },
    { canonical: "/atlas/tool/pipe-wrench/", id: "atlas-tool", path: "/atlas/tool/pipe-wrench/" },
    { canonical: questionPath, id: "question-player", path: questionPath }
  ]) {
    const response = await page.goto(route.path)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toHaveAttribute("data-route-id", route.id)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", route.canonical)
  }
})

test("@cloudflare keeps the static atlas runtime-free and the initial question closure answer-free", async ({
  request
}) => {
  const atlas = await request.get("/atlas/tool/pipe-wrench/")
  const atlasHtml = await atlas.text()
  expect(atlas.status()).toBe(200)
  expect(atlasHtml).not.toMatch(/<script\b/i)
  expect(atlasHtml).not.toMatch(/react|effect/i)

  const question = await request.get(questionPath)
  const questionHtml = await question.text()
  expect(question.status()).toBe(200)
  expect(questionHtml).not.toContain("correctOptionId")
  expect(questionHtml).not.toContain("rationales")
  expect(questionHtml).not.toContain("docs/TAXONOMY.md#L120-L130")
})

test("@cloudflare returns the truthful noindex status document for an unknown path", async ({
  page
}) => {
  const response = await page.goto("/definitely-not-a-published-study-page/")
  expect(response?.status()).toBe(404)
  await expect(page.locator("body")).toHaveAttribute("data-route-id", "status")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow")
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "That study page was not found." })).toBeVisible()
})
