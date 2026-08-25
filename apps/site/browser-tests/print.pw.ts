import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { expect, test, type Page } from "@playwright/test"
import { appDatabaseName, appDatabaseStores } from "../src/study-storage/app-database.ts"
import {
  verifiedContentCacheKey,
  verifiedContentCacheName
} from "../src/verified-content.ts"
import { waitForActiveServiceWorker } from "./service-worker-fixtures.ts"

interface PrintCacheReceipt {
  readonly path: string
  readonly bytes: number
  readonly sha256: string
  readonly kind: "asset" | "postcommit"
}

const primePrintLocalClosure = async (page: Page): Promise<void> => {
  const raw = await page.locator("#print-builder-data").textContent()
  if (raw === null) throw new Error("Print bootstrap was unavailable")
  const bootstrap = JSON.parse(raw) as {
    readonly questions: ReadonlyArray<{
      readonly answerReceipt: null | {
        readonly postcommitPath: string
        readonly postcommitBytes: number
        readonly postcommitSha256: string
      }
    }>
    readonly scenes: ReadonlyArray<{
      readonly answerReceipt: {
        readonly postcommitPath: string
        readonly postcommitBytes: number
        readonly postcommitSha256: string
      }
      readonly asset: { readonly path: string; readonly bytes: number; readonly sha256: string }
    }>
    readonly tools: ReadonlyArray<{
      readonly asset: { readonly path: string; readonly bytes: number; readonly sha256: string }
    }>
  }
  const receipts = [
    ...bootstrap.questions.flatMap(({ answerReceipt }) => answerReceipt === null ? [] : [{
      path: answerReceipt.postcommitPath,
      bytes: answerReceipt.postcommitBytes,
      sha256: answerReceipt.postcommitSha256,
      kind: "postcommit" as const
    }]),
    ...bootstrap.scenes.map(({ answerReceipt }) => ({
      path: answerReceipt.postcommitPath,
      bytes: answerReceipt.postcommitBytes,
      sha256: answerReceipt.postcommitSha256,
      kind: "postcommit" as const
    })),
    ...bootstrap.scenes.map(({ asset }) => ({ ...asset, kind: "asset" as const })),
    ...bootstrap.tools.map(({ asset }) => ({ ...asset, kind: "asset" as const }))
  ] satisfies ReadonlyArray<PrintCacheReceipt>
  const unique = [...new Map(receipts.map((receipt) => [
    `${receipt.kind}:${receipt.path}:${receipt.sha256}`,
    receipt
  ])).values()]
  const origin = new URL(page.url()).origin
  const entries = await Promise.all(unique.map(async (receipt) => {
    const bytes = await readFile(fileURLToPath(new URL(`../dist${receipt.path}`, import.meta.url)))
    if (bytes.byteLength !== receipt.bytes) throw new Error(`Print fixture bytes mismatch ${receipt.path}`)
    return {
      body: bytes.toString("base64"),
      cacheKey: verifiedContentCacheKey(origin, receipt),
      receipt
    }
  }))
  await page.evaluate(async ({ cacheName, entries }) => {
    const cache = await caches.open(cacheName)
    await Promise.all(entries.map(async ({ body, cacheKey, receipt }) => {
      const decoded = Uint8Array.from(atob(body), (character) => character.charCodeAt(0))
      await cache.put(cacheKey, new Response(decoded, {
        headers: {
          "content-type": receipt.kind === "postcommit" ? "application/json" : "image/png",
          "x-nycustodian-verified-bytes": String(receipt.bytes),
          "x-nycustodian-verified-kind": receipt.kind,
          "x-nycustodian-verified-path": receipt.path,
          "x-nycustodian-verified-protocol": "1",
          "x-nycustodian-verified-sha256": receipt.sha256
        },
        status: 200
      }))
    }))
  }, { cacheName: verifiedContentCacheName, entries })
}

const readPrintJobs = (
  page: Page
): Promise<ReadonlyArray<Readonly<Record<string, unknown>>>> =>
  page.evaluate(
    ({ databaseName, storeName }) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction(storeName, "readonly")
          const getAll = transaction.objectStore(storeName).getAll()
          getAll.onsuccess = () => resolve(
            getAll.result as ReadonlyArray<Readonly<Record<string, unknown>>>
          )
          getAll.onerror = () => reject(getAll.error)
          transaction.oncomplete = () => database.close()
          transaction.onabort = () => {
            database.close()
            reject(transaction.error ?? new Error("Print-job read aborted"))
          }
        }
      }),
    { databaseName: appDatabaseName, storeName: appDatabaseStores.printJobs }
  )

test("generates, restores, and prints a separate deterministic question packet", async ({ page }) => {
  await page.goto("/print/")
  await expect(page.getByRole("heading", { name: "Build a deterministic print packet" })).toBeVisible()
  await expect(page.getByRole("radio", { name: "Blank hazard worksheet" })).toBeEnabled()
  await expect(page.getByRole("radio", { name: "Announcement-profile fact sheet" })).toBeDisabled()
  await expect(page.getByText(/No source-bound announcement fact history is published for this profile/)).toBeVisible()
  await expect(page.getByRole("radio", { name: "Correction\/change-log excerpt" })).toBeDisabled()
  await expect(page.getByText(/No publishable structured correction or change-log record exists/)).toBeVisible()

  const bootstrap = await page.locator("#print-builder-data").textContent()
  expect(bootstrap).not.toContain("correctOptionId")
  expect(bootstrap).not.toContain("rationales")
  expect(bootstrap).not.toContain('"claim"')
  expect(bootstrap).not.toContain('"targetRegions"')

  await page.getByLabel("Number of questions").fill("2")
  await page.getByLabel("Deterministic seed").fill("browser-print-proof")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page).toHaveURL(/\/print\/preview\/print-[a-f0-9-]+\/$/)

  await expect(page.getByRole("heading", { name: "Original multiple-choice practice" })).toBeFocused()
  await expect(page.getByText("Original practice — not an official or past exam")).toBeVisible()
  await expect(page.getByText(/Site-designed distribution: Tool selection 2/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Questions", exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Answer key" })).toHaveCount(0)
  await expect(page.getByText(/Rationale for/)).toHaveCount(0)

  const fingerprint = await page.locator("[data-print-fingerprint]").getAttribute("data-print-fingerprint")
  const beforeReload = await readPrintJobs(page)
  expect(beforeReload).toHaveLength(1)
  expect(beforeReload[0]).toMatchObject({ status: "preview-ready" })

  await page.reload()
  await expect(page.locator("[data-print-fingerprint]")).toHaveAttribute("data-print-fingerprint", fingerprint ?? "")
  await expect(page.getByRole("heading", { name: "Questions", exact: true })).toBeVisible()

  await page.emulateMedia({ media: "print" })
  await expect(page.locator(".site-header")).toBeHidden()
  await expect(page.locator(".site-footer")).toBeHidden()
  await expect(page.locator(".print-preview-actions")).toBeHidden()
  expect(await page.locator(".print-preview").evaluate((element) => getComputedStyle(element).fontSize)).toBe("16px")
  await page.emulateMedia({ media: "screen" })

  await page.evaluate(() => {
    ;(window as typeof window & { __printDialogRequested?: boolean }).__printDialogRequested = false
    window.print = () => {
      ;(window as typeof window & { __printDialogRequested?: boolean }).__printDialogRequested = true
    }
  })
  const printButton = page.getByRole("button", { name: "Open system print" })
  await expect(printButton).toBeDisabled()
  await page.getByLabel(/I inspected browser print preview/).check()
  await printButton.click()
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __printDialogRequested?: boolean }).__printDialogRequested)).toBe(true)
  await expect.poll(async () => (await readPrintJobs(page))[0]?.status).toBe("system-print-requested")
  await expect(page.getByText("System print was requested; completion is not confirmed.")).toBeVisible()
})

test("generates an answer key as its own product without question or rationale sections", async ({ page }) => {
  await page.goto("/print/")
  await primePrintLocalClosure(page)
  await page.getByRole("radio", { name: "Separate answer key" }).check()
  await page.getByLabel("Number of questions").fill("2")
  await page.getByLabel("Deterministic seed").fill("browser-print-proof")
  await page.getByLabel("Paper").selectOption("a4")
  await page.getByLabel("Margins").selectOption("wide")
  await page.getByLabel("Large print (at least 18pt)").check()
  await page.getByRole("button", { name: "Generate preview" }).click()

  await expect(page.getByRole("heading", { level: 1, name: "Answer key" })).toBeVisible()
  await expect(page.locator(".print-preview")).toHaveClass(/print-a4/)
  await expect(page.locator(".print-preview")).toHaveClass(/print-margin-wide/)
  await expect(page.locator(".print-preview")).toHaveClass(/print-size-large/)
  await expect(page.getByRole("heading", { name: "Questions", exact: true })).toHaveCount(0)
  await expect(page.getByRole("heading", { name: /Explanations/ })).toHaveCount(0)
  await expect(page.getByText(/Rationale for/)).toHaveCount(0)
  const jobs = await readPrintJobs(page)
  expect(jobs).toHaveLength(1)
  expect(jobs[0]).toMatchObject({
    status: "preview-ready",
    packet: { sections: [{ tag: "answer-key" }] }
  })
  await page.emulateMedia({ media: "print" })
  expect(await page.locator(".print-preview").evaluate((element) => getComputedStyle(element).fontSize)).toBe("24px")
})

test("regenerates exact saved settings into a new durable job and replaces preview history", async ({
  page
}) => {
  await page.goto("/print/")
  await page.getByLabel("Number of questions").fill("1")
  await page.getByLabel("Deterministic seed").fill("browser-regenerate-exact")
  await page.getByLabel("Paper").selectOption("a4")
  await page.getByLabel("Margins").selectOption("wide")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page).toHaveURL(/\/print\/preview\/print-[a-f0-9-]+\/$/)
  await expect(page.getByRole("heading", { name: "Original multiple-choice practice" })).toBeVisible()
  const originalUrl = page.url()
  const originalJobs = await readPrintJobs(page)
  expect(originalJobs).toHaveLength(1)

  await page.getByRole("button", { name: "Regenerate exact settings" }).click()
  await expect.poll(() => page.url()).not.toBe(originalUrl)
  await expect(page).toHaveURL(/\/print\/preview\/print-[a-f0-9-]+\/$/)
  const regeneratedJobs = await readPrintJobs(page)
  expect(regeneratedJobs).toHaveLength(2)
  const regenerated = regeneratedJobs.find((job) => job.id !== originalJobs[0]?.id)
  expect(regenerated?.manifest).toEqual(originalJobs[0]?.manifest)
  await page.reload()
  await expect(page.getByRole("heading", { name: "Original multiple-choice practice" })).toBeFocused()

  await page.evaluate(() => history.back())
  await expect(page).toHaveURL(/\/print\/$/)
  expect(page.url()).not.toBe(originalUrl)
})

test("keeps the previous preview and URL when durable regeneration fails", async ({ page }) => {
  await page.goto("/print/")
  await page.getByLabel("Number of questions").fill("1")
  await page.getByLabel("Deterministic seed").fill("browser-regenerate-failure")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page).toHaveURL(/\/print\/preview\/print-[a-f0-9-]+\/$/)
  await expect(page.getByRole("heading", { name: "Original multiple-choice practice" })).toBeVisible()
  const originalUrl = page.url()
  const jobs = await readPrintJobs(page)
  const originalId = jobs[0]?.id
  if (typeof originalId !== "string") throw new Error("Expected a saved print job")

  await page.evaluate(({ originalId, storeName }) => {
    const prototype = IDBObjectStore.prototype
    const originalPut = prototype.put
    const injected = function(
      this: IDBObjectStore,
      value: unknown,
      key?: IDBValidKey
    ): IDBRequest<IDBValidKey> {
      const candidate = value as { readonly id?: string }
      if (this.name === storeName && candidate.id !== originalId) {
        Object.defineProperty(prototype, "put", {
          configurable: true,
          writable: true,
          value: originalPut
        })
        throw new DOMException("Injected print regeneration failure", "QuotaExceededError")
      }
      return key === undefined
        ? originalPut.call(this, value)
        : originalPut.call(this, value, key)
    }
    Object.defineProperty(prototype, "put", {
      configurable: true,
      writable: true,
      value: injected
    })
  }, { originalId, storeName: appDatabaseStores.printJobs })

  await page.getByRole("button", { name: "Regenerate exact settings" }).click()
  await expect(page.getByRole("heading", { name: "Print preview was not regenerated" })).toBeFocused()
  expect(page.url()).toBe(originalUrl)
  await expect(page.getByRole("heading", { name: "Questions", exact: true })).toBeVisible()
  expect(await readPrintJobs(page)).toHaveLength(1)

  await page.getByRole("button", { name: "Regenerate exact settings" }).click()
  await expect.poll(() => page.url()).not.toBe(originalUrl)
  expect(await readPrintJobs(page)).toHaveLength(2)
})

test("pairs separate jobs and page-breaks an appended key with optional explanations", async ({ page }) => {
  await page.goto("/print/")
  await primePrintLocalClosure(page)
  await page.getByLabel("Number of questions").fill("2")
  await page.getByLabel("Deterministic seed").fill("browser-paired-set")
  await expect(page.getByLabel("Answer-key placement")).toHaveValue("separate-job")
  await page.getByRole("button", { name: "Generate preview" }).click()
  const questionPairing = await page.locator("[data-print-pairing-fingerprint]")
    .getAttribute("data-print-pairing-fingerprint")
  expect(questionPairing).toMatch(/^[a-f0-9]{16}$/)
  await expect(page.getByText("Set pairing identifier")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Answer key" })).toHaveCount(0)

  await page.goto("/print/")
  await page.getByRole("radio", { name: "Separate answer key" }).check()
  await page.getByLabel("Number of questions").fill("2")
  await page.getByLabel("Deterministic seed").fill("browser-paired-set")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page.locator("[data-print-pairing-fingerprint]")).toHaveAttribute(
    "data-print-pairing-fingerprint",
    questionPairing ?? ""
  )

  await page.goto("/print/")
  await page.getByLabel("Number of questions").fill("2")
  await page.getByLabel("Deterministic seed").fill("browser-paired-set")
  await page.getByLabel("Answer-key placement").selectOption("new-section")
  await page.getByLabel("Append explanations after the answer key").check()
  await page.getByRole("button", { name: "Generate preview" }).click()

  await expect(page.locator("[data-print-pairing-fingerprint]")).toHaveAttribute(
    "data-print-pairing-fingerprint",
    questionPairing ?? ""
  )
  await expect(page.getByRole("heading", { name: "Questions", exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Answer key" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Explanations and source references" })).toBeVisible()
  await expect(page.locator(".print-appended-section")).toHaveCount(2)
  await page.emulateMedia({ media: "print" })
  expect(await page.locator(".print-appended-section").first().evaluate(
    (element) => getComputedStyle(element).breakBefore
  )).toBe("page")

  const jobs = await readPrintJobs(page)
  expect(jobs).toHaveLength(3)
  const appended = jobs.find((job) =>
    (job.packet as { sections?: ReadonlyArray<unknown> }).sections?.length === 3)
  expect((appended?.packet as { sections?: ReadonlyArray<{ tag?: string }> }).sections?.map(
    (section) => section.tag
  )).toEqual(["questions", "answer-key", "explanations"])
})

test("tool-family cards count complete families and retain exact verified images", async ({
  browserName,
  context,
  page
}) => {
  await page.goto("/print/")
  await primePrintLocalClosure(page)
  await page.getByRole("radio", { name: "Tool-family contrast cards" }).check()
  await expect(page.getByLabel("Number of families")).toHaveValue("1")
  await expect(page.getByText("Available families: 1")).toBeVisible()
  await expect(page.getByLabel("Content filter")).toHaveValue("")
  await page.getByLabel("Content filter").selectOption("wrenches")
  await page.getByLabel("Deterministic seed").fill("browser-tool-family")
  await page.getByRole("button", { name: "Generate preview" }).click()

  await expect(page.getByRole("heading", { level: 1, name: "Tool-family contrast cards" })).toBeVisible()
  await expect(page.getByRole("heading", { level: 3, name: "wrenches" })).toBeVisible()
  await expect(page.locator(".print-tool-grid > section")).toHaveCount(3)
  await expect(page.locator(".print-tool-grid img")).toHaveCount(3)
  for (const image of await page.locator(".print-tool-grid img").all()) {
    await expect(image).toHaveAttribute("src", /^data:image\/png;base64,/)
  }
  const jobs = await readPrintJobs(page)
  expect(jobs).toHaveLength(1)
  expect(jobs[0]).toMatchObject({
    manifest: { actualLength: 1, itemIds: ["wrenches"] },
    packet: { sections: [{ tag: "tool-family-cards" }] }
  })
  expect(((jobs[0]?.packet as { sections?: Array<{ families?: Array<{ tools?: unknown[] }> }> })
    ?.sections?.[0]?.families?.[0]?.tools ?? [])).toHaveLength(3)

  if (browserName === "chromium") {
    await waitForActiveServiceWorker(page)
    await page.reload()
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
    await context.setOffline(true)
    await page.reload({ waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { level: 1, name: "Tool-family contrast cards" })).toBeVisible()
    await expect(page.locator(".print-tool-grid img")).toHaveCount(3)
  }
})

test("hazard worksheet, annotated answers, and text equivalents remain separate filtered products", async ({
  page
}) => {
  const postcommitRequests: string[] = []
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname
    if (pathname.endsWith(".postcommit.json")) postcommitRequests.push(pathname)
  })

  await page.goto("/print/")
  await primePrintLocalClosure(page)
  await page.getByRole("radio", { name: "Blank hazard worksheet" }).check()
  await expect(page.getByLabel("Number of scenes")).toBeVisible()
  await page.getByLabel("Content filter").selectOption("hallway/common area")
  await page.getByLabel("Number of scenes").fill("1")
  await page.getByLabel("Deterministic seed").fill("paired-hazard-products")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Blank hazard worksheet" })).toBeVisible()
  await expect(page.locator(".print-hazard-worksheet img")).toHaveAttribute("src", /^data:image\/png;base64,/)
  await expect(page.getByText(/Reviewed claim/)).toHaveCount(0)
  await expect(page.getByText(/Conditions needing correction and proposed controls/)).toBeVisible()
  expect(postcommitRequests).toEqual([])

  await page.goto("/print/")
  await page.getByRole("radio", { name: "Annotated hazard-answer packet" }).check()
  await page.getByLabel("Content filter").selectOption("hallway/common area")
  await page.getByLabel("Number of scenes").fill("1")
  await page.getByLabel("Deterministic seed").fill("paired-hazard-products")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Annotated hazard-answer packet" })).toBeVisible()
  await expect(page.getByText(/Reviewed claim/)).toBeVisible()
  await expect(page.locator(".print-annotated-scene svg polygon")).not.toHaveCount(0)
  expect(postcommitRequests).toHaveLength(0)

  await page.goto("/print/")
  await page.getByRole("radio", { name: "Text-equivalent\/nonvisual set" }).check()
  await page.getByLabel("Content filter").selectOption("hallway/common area")
  await page.getByLabel("Number of scenes").fill("1")
  await page.getByLabel("Deterministic seed").fill("paired-hazard-products")
  await page.getByRole("button", { name: "Generate preview" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Text-equivalent hazard set" })).toBeVisible()
  await expect(page.getByText(/equivalent knowledge task, not the same visual-recognition construct/)).toBeVisible()
  await expect(page.locator(".print-text-equivalent img")).toHaveCount(0)

  const jobs = await readPrintJobs(page)
  expect(jobs).toHaveLength(3)
  const sections = jobs.map((job) =>
    (job.packet as { sections?: Array<{ tag?: string }> }).sections?.[0]?.tag)
  expect(sections.sort()).toEqual([
    "annotated-hazard-answers",
    "hazard-worksheet",
    "text-equivalent-scenes"
  ])
  const itemIds = jobs.map((job) =>
    JSON.stringify((job.manifest as { itemIds?: string[] }).itemIds))
  expect(new Set(itemIds).size).toBe(1)
})

test("blocks an uncached online print image without fetching or retaining a partial preview", async ({ context, page }) => {
  let imageRequests = 0
  await context.route("**/content/assets/derivatives/scenes/*-print.png", async (route) => {
    imageRequests += 1
    await route.fulfill({ body: "corrupt", contentType: "image/png", status: 200 })
  })
  await page.goto("/print/")
  await page.getByRole("radio", { name: "Blank hazard worksheet" }).check()
  await page.getByLabel("Content filter").selectOption("hallway/common area")
  await page.getByLabel("Number of scenes").fill("1")
  await page.getByRole("button", { name: "Generate preview" }).click()

  await expect(page.getByRole("heading", { name: "Print preview was not generated" })).toBeFocused()
  await expect(page).toHaveURL(/\/print\/$/)
  expect(await readPrintJobs(page)).toEqual([])
  expect(imageRequests).toBe(0)
})
