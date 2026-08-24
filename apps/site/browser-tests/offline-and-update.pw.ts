import { readFile, unlink, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"
import {
  gotoReadyQuestion,
  questionReceipt,
  questionPath,
  questionPostcommitPath,
  readStoredAttempt
} from "./question-player-fixtures.ts"
import { waitForActiveServiceWorker } from "./service-worker-fixtures.ts"
import {
  verifiedContentCacheKey,
  verifiedContentCacheName
} from "../src/verified-content.ts"

const builtWorkerPath = fileURLToPath(new URL("../dist/sw.js", import.meta.url))
const updateWorkerPath = fileURLToPath(new URL("../dist/sw-browser-update.js", import.meta.url))

test("a committed question reloads from the controlled service worker while offline", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service workers only in Chromium")

  await gotoReadyQuestion(page)
  await waitForActiveServiceWorker(page)
  await page.reload()
  await expect(page.getByRole("radio", { name: "Pipe wrench" })).toBeEnabled()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

  await page.getByRole("radio", { name: "Pipe wrench" }).check()
  await page.getByRole("button", { name: "Commit answer" }).click()
  await expect(page.getByRole("heading", { name: "Correct", exact: true })).toBeVisible()

  const verifiedCacheKey = verifiedContentCacheKey(new URL(page.url()).origin, {
    path: questionPostcommitPath,
    sha256: questionReceipt.postcommitSha256
  })
  await expect
    .poll(() =>
      page.evaluate(async ({ cacheKey, cacheName, receipt }) => {
        const cache = await caches.open(cacheName)
        const response = await cache.match(cacheKey)
        return response?.status === 200 &&
          response.headers.get("x-nycustodian-verified-protocol") === "1" &&
          response.headers.get("x-nycustodian-verified-kind") === "postcommit" &&
          response.headers.get("x-nycustodian-verified-path") === receipt.postcommitPath &&
          response.headers.get("x-nycustodian-verified-bytes") ===
            String(receipt.postcommitBytes) &&
          response.headers.get("x-nycustodian-verified-sha256") ===
            receipt.postcommitSha256
      }, {
        cacheKey: verifiedCacheKey,
        cacheName: verifiedContentCacheName,
        receipt: questionReceipt
      })
    )
    .toBe(true)

  const committed = await readStoredAttempt(page)
  await context.setOffline(true)
  await page.reload({ waitUntil: "domcontentloaded" })

  await expect(page).toHaveURL(questionPath)
  await expect(page.getByRole("heading", { name: "Correct", exact: true })).toBeFocused()
  expect(await readStoredAttempt(page)).toEqual(committed)
})

test("known-offline partial start blocks commitment when exact feedback is absent", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service workers only in Chromium")

  await gotoReadyQuestion(page)
  await waitForActiveServiceWorker(page)
  await page.goto("/practice/")
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  await page.evaluate((cacheName) => caches.delete(cacheName), verifiedContentCacheName)
  let postcommitRequests = 0
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === questionPostcommitPath) postcommitRequests += 1
  })

  await context.setOffline(true)
  await page.getByRole("link", { name: "Start question 1" }).click()
  await expect(page).toHaveURL(questionPath)
  await expect(page.getByRole("heading", { name: "Required study content is unavailable" }))
    .toBeVisible()
  expect(
    await page.getByRole("radio").evaluateAll(
      (controls) => controls.filter((control) => !(control as HTMLInputElement).disabled).length
    )
  ).toBe(0)
  expect(
    await page.getByRole("button", { name: "Commit answer" }).evaluateAll(
      (controls) => controls.filter((control) => !(control as HTMLButtonElement).disabled).length
    )
  ).toBe(0)
  expect(postcommitRequests).toBe(0)
  expect(await readStoredAttempt(page)).toBeUndefined()
})

test("an update waits for the active client, then evicts only stale owned cache namespaces", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service workers only in Chromium")

  const builtWorker = await readFile(builtWorkerPath, "utf8")
  const currentVersion = builtWorker.match(/nycustodian-shell-([a-f0-9]{16})/)?.[1]
  if (currentVersion === undefined) {
    throw new Error("The finalized service worker has no deterministic cache namespace")
  }
  const nextVersion = currentVersion === "0000000000000000"
    ? "1111111111111111"
    : "0000000000000000"
  await writeFile(updateWorkerPath, builtWorker.replaceAll(currentVersion, nextVersion))

  try {
    await gotoReadyQuestion(page)
    await waitForActiveServiceWorker(page)
    await page.reload()
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

    await page.evaluate(async () => {
      await caches.open("nycustodian-shell-stale-browser-test")
      await caches.open("unrelated-browser-test")
    })

    const registrationState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.register("/sw-browser-update.js", {
        scope: "/",
        updateViaCache: "none"
      })
      const candidate = registration.installing ?? registration.waiting
      if (candidate === null) throw new Error("Updated service worker did not install")
      if (candidate.state !== "installed" && candidate.state !== "activated") {
        await new Promise<void>((resolve, reject) => {
          candidate.addEventListener("statechange", () => {
            if (candidate.state === "installed" || candidate.state === "activated") resolve()
            if (candidate.state === "redundant") reject(new Error("Updated worker became redundant"))
          })
        })
      }
      return {
        active: registration.active?.scriptURL ?? null,
        waiting: registration.waiting?.scriptURL ?? null
      }
    })

    expect(registrationState.active).toMatch(/\/sw\.js$/)
    expect(registrationState.waiting).toMatch(/\/sw-browser-update\.js$/)
    expect(await page.evaluate(() => caches.keys())).toEqual(
      expect.arrayContaining([
        `nycustodian-shell-${currentVersion}`,
        `nycustodian-shell-${nextVersion}`,
        "nycustodian-shell-stale-browser-test",
        "unrelated-browser-test"
      ])
    )

    await page.goto("about:blank")
    await page.waitForTimeout(250)
    await page.goto("/offline.html")
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const registration = await navigator.serviceWorker.getRegistration()
          return registration?.active?.scriptURL ?? null
        })
      )
      .toMatch(/\/sw-browser-update\.js$/)

    await expect
      .poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null))
      .toMatch(/\/sw-browser-update\.js$/)
    expect(
      await page.evaluate(async () =>
        (await fetch("/content/vertical-slice/manifest.json")).ok
      )
    ).toBe(true)

    const cacheNames = await page.evaluate(() => caches.keys())
    expect(cacheNames.filter((name) => name.startsWith("nycustodian-")).sort()).toEqual([
      `nycustodian-runtime-${nextVersion}`,
      `nycustodian-shell-${nextVersion}`,
      verifiedContentCacheName
    ].sort())
    expect(cacheNames).toContain("unrelated-browser-test")
  } finally {
    await unlink(updateWorkerPath).catch(() => undefined)
  }
})
