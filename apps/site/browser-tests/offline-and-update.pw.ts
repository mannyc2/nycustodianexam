import { readFile, unlink, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"
import {
  attemptsStore,
  databaseName,
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

const readStoredAttemptAt = (page: import("@playwright/test").Page, id: string): Promise<unknown> =>
  page.evaluate(({ expectedDatabaseName, expectedStore, expectedId }) =>
    new Promise<unknown>((resolve, reject) => {
      const open = indexedDB.open(expectedDatabaseName)
      open.onerror = () => reject(open.error)
      open.onsuccess = () => {
        const database = open.result
        const transaction = database.transaction(expectedStore, "readonly")
        const request = transaction.objectStore(expectedStore).get(expectedId)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        transaction.oncomplete = () => database.close()
        transaction.onabort = () => reject(transaction.error)
      }
    }), {
    expectedDatabaseName: databaseName,
    expectedStore: attemptsStore,
    expectedId: id
  })

test("a committed question reloads from the controlled service worker while offline", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service workers only in Chromium")

  await gotoReadyQuestion(page)
  await waitForActiveServiceWorker(page)
  await page.reload()
  await expect(page.getByRole("radio", { name: "Scrub brush" })).toBeEnabled()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

  await page.getByRole("radio", { name: "Scrub brush" }).check()
  await page.getByRole("button", { name: "Submit answer" }).click()
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
  await expect(page.locator("[data-connectivity-notice]")).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-freshness", "offline-stale")
  await expect(page.getByRole("heading", { name: "Correct", exact: true })).toBeFocused()
  expect(await readStoredAttempt(page)).toEqual(committed)

  await context.setOffline(false)
  await expect(page.locator("html")).toHaveAttribute("data-connectivity", "online")
  await expect(page.locator("html")).toHaveAttribute("data-freshness", "offline-stale")
  await expect(page.locator('[data-connectivity-message="stale-online"]')).toBeVisible()

  await page.reload({ waitUntil: "domcontentloaded" })
  await expect.poll(() => page.locator("html").getAttribute("data-freshness")).toBeNull()
  await expect(page.locator("[data-connectivity-notice]")).toBeHidden()
  expect(await readStoredAttempt(page)).toEqual(committed)
})

test("cached profile and source facts remain readable with truthful stale state", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service workers only in Chromium")

  const profilePath = "/ny/"
  const atlasPath = "/atlas/tool/pipe-wrench/"
  await gotoReadyQuestion(page)
  await waitForActiveServiceWorker(page)
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true)

  await page.goto(profilePath)
  await expect(page.getByRole("heading", {
    name: "New York Entry-Level Custodians and Janitors"
  })).toBeVisible()
  const profileFactTerm = page.locator(".fact-list dt").first()
  const profileFactLabel = (await profileFactTerm.innerText()).trim()
  const profileFactValue = (await profileFactTerm
    .locator("xpath=following-sibling::dd[1]").innerText()).trim()
  expect(profileFactLabel.length).toBeGreaterThan(0)
  expect(profileFactValue.length).toBeGreaterThan(0)
  await page.goto(atlasPath)
  const sourceTrail = page.getByRole("heading", { name: "Source trail" }).locator("..")
  const currentSourceLink = sourceTrail.getByRole("link").first()
  const sourceHeading = (await currentSourceLink.innerText()).trim()
  const sourceHref = await currentSourceLink.getAttribute("href")
  if (sourceHeading.length === 0 || sourceHref === null) {
    throw new Error("The generated atlas has no current source receipt")
  }
  const sourcePath = new URL(sourceHref, page.url()).pathname
  await page.goto(sourcePath)
  await expect(page.getByRole("heading", { name: sourceHeading, exact: true })).toBeVisible()
  const supportedScope = (await page.locator(".source-record .fact-list dd").nth(2).innerText())
    .trim()
  expect(supportedScope.length).toBeGreaterThan(0)
  await expect
    .poll(() => page.evaluate(async (paths) => {
      const cacheNames = (await caches.keys()).filter((name) =>
        name.startsWith("nycustodian-runtime-")
      )
      const hits = await Promise.all(paths.map(async (path) => {
        for (const cacheName of cacheNames) {
          if (await (await caches.open(cacheName)).match(path)) return true
        }
        return false
      }))
      return hits.every(Boolean)
    }, [profilePath, sourcePath]))
    .toBe(true)

  await context.setOffline(true)
  await page.goto(profilePath, { waitUntil: "domcontentloaded" })
  await expect(page).toHaveURL(profilePath)
  await expect(page.getByRole("heading", {
    name: "New York Entry-Level Custodians and Janitors"
  })).toBeVisible()
  const offlineProfileFactTerm = page.locator(".fact-list dt").first()
  await expect(offlineProfileFactTerm).toHaveText(profileFactLabel)
  await expect(offlineProfileFactTerm.locator("xpath=following-sibling::dd[1]"))
    .toHaveText(profileFactValue)
  await expect(page.locator("html")).toHaveAttribute("data-freshness", "offline-stale")

  await page.goto(sourcePath, { waitUntil: "domcontentloaded" })
  await expect(page).toHaveURL(sourcePath)
  await expect(page.getByRole("heading", { name: sourceHeading, exact: true })).toBeVisible()
  await expect(page.getByText(supportedScope, { exact: true })).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-freshness", "offline-stale")
})

test("an uncached offline navigation renders its requested path as inert text", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service workers only in Chromium")

  const requestedPath = "/never-cached-%3Cimg%20src=x%20onerror=alert(1)%3E/"
  await gotoReadyQuestion(page)
  await waitForActiveServiceWorker(page)
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true)
  await page.evaluate(async (path) => {
    for (const cacheName of await caches.keys()) {
      await (await caches.open(cacheName)).delete(path)
    }
  }, requestedPath)

  await context.setOffline(true)
  await page.goto(requestedPath, { waitUntil: "domcontentloaded" })

  await expect(page).toHaveURL(requestedPath)
  await expect(page.locator("body")).toHaveAttribute("data-offline-route", "status")
  await expect(page.locator("body")).toHaveAttribute(
    "data-status-kind",
    "offline-unavailable"
  )
  await expect(page.locator("[data-requested-target]")).toHaveText(requestedPath)
  await expect(page.locator("main img")).toHaveCount(0)
  await expect(page.locator("[onerror]")).toHaveCount(0)
  await expect(page.locator('[data-recovery-link="retry-requested-path"]'))
    .toHaveAttribute("href", "")
  await expect(page.locator('[data-recovery-link="offline-packs"]'))
    .toHaveAttribute("href", "/offline/")
  await expect(page.locator('[data-recovery-link="settings"]'))
    .toHaveAttribute("href", "/settings/")
  await expect(page.locator('[data-recovery-link="home"]')).toHaveAttribute("href", "/")
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
  const start90 = page
    .getByLabel("Available whole-bank practice lengths")
    .getByRole("link", { name: "Start 90" })
  const sessionHref = await start90.getAttribute("href")
  if (sessionHref === null) throw new Error("The generated 90-question session has no path")
  const sessionPath = new URL(sessionHref, page.url()).pathname
  await page.goto(sessionPath)
  const currentOptionLabels = await page.locator("#question-data").evaluate((element) => {
    const decoded = JSON.parse(element.textContent ?? "") as {
      readonly options?: ReadonlyArray<{ readonly label?: unknown }>
    }
    const labels = decoded.options?.map((option) => option.label)
    if (labels === undefined || labels.length !== 4 ||
      labels.some((label) => typeof label !== "string")) {
      throw new Error("The generated question bootstrap has no four-option label set")
    }
    return labels as ReadonlyArray<string>
  })
  const currentReceipt = await page.locator("#question-receipt-data").evaluate((element) => {
    const decoded = JSON.parse(element.textContent ?? "") as {
      readonly postcommitPath?: unknown
    }
    if (typeof decoded.postcommitPath !== "string") {
      throw new Error("The generated question bootstrap has no postcommit receipt path")
    }
    return decoded.postcommitPath
  })
  const currentAttemptId = await page.locator("[data-question-attempt-id]")
    .getAttribute("data-question-attempt-id")
  if (currentAttemptId === null) {
    throw new Error("The generated question bootstrap has no durable attempt identity")
  }
  // Study navigation now belongs to explicit packs rather than the baseline
  // shell. Cache this exact document through one controlled online navigation
  // so the test isolates missing verified feedback, not missing navigation.
  await page.reload()
  for (const label of currentOptionLabels) {
    await expect(page.getByRole("radio", { name: label, exact: true })).toBeEnabled()
  }
  await page.goto("/practice/")
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  expect(await page.evaluate((cacheName) => caches.delete(cacheName), verifiedContentCacheName))
    .toBe(true)
  let postcommitRequests = 0
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === currentReceipt) postcommitRequests += 1
  })

  // Chromium's CDP offline emulation can report navigator.onLine as true in a
  // new document when its navigation is fulfilled by a service worker. Keep
  // the network offline and pin the product's known-offline signal as well.
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "onLine", {
      configurable: true,
      get: () => false
    })
  })
  await context.setOffline(true)
  expect(await page.evaluate(() => navigator.onLine)).toBe(false)
  await page
    .getByLabel("Available whole-bank practice lengths")
    .getByRole("link", { name: "Start 90" })
    .click()
  await expect(page).toHaveURL(sessionPath)
  expect(await page.evaluate(() => navigator.onLine)).toBe(false)
  await expect(page.getByRole("heading", { name: "Required study content is unavailable" }))
    .toBeVisible()
  const choices = await page.getByRole("radio").all()
  expect(choices).toHaveLength(4)
  for (const choice of choices) await expect(choice).toBeDisabled()
  await expect(page.getByRole("button", { name: "Submit answer" })).toBeDisabled()
  expect(postcommitRequests).toBe(0)
  expect(await readStoredAttemptAt(page, currentAttemptId)).toBeUndefined()
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
