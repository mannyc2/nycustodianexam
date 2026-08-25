import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import {
  createAssetRouter,
  escapeTerminalHtml,
  type AssetRouterEnvironment
} from "../src/asset-router.ts"
import {
  createWithdrawalRegistry,
  productionWithdrawalRegistry,
  type WithdrawalRecord
} from "../src/withdrawal-registry.ts"

const fixtureWithdrawal: WithdrawalRecord = {
  path: "/atlas/tool/withdrawn-fixture/",
  publicMessage: "This fixture page no longer has a safe public representation.",
  recoveryPath: "/atlas/",
  recoveryLabel: "Return to the reviewed tool atlas"
}

const environment = (
  fetchAsset: (request: Request) => Promise<Response>
): AssetRouterEnvironment => ({ ASSETS: { fetch: fetchAsset } })

describe("withdrawal registry", () => {
  it("is explicit and empty for launch while validating fixture records", () => {
    expect(productionWithdrawalRegistry.records).toEqual([])
    expect(createWithdrawalRegistry([fixtureWithdrawal]).find(fixtureWithdrawal.path))
      .toEqual(fixtureWithdrawal)

    expect(() => createWithdrawalRegistry([{
      ...fixtureWithdrawal,
      recoveryPath: "https://unsafe.example/"
    }])).toThrow(/root-relative document path/)
    expect(() => createWithdrawalRegistry([
      fixtureWithdrawal,
      fixtureWithdrawal
    ])).toThrow(/unique paths in ascending order/)
    expect(() => createWithdrawalRegistry([{
      ...fixtureWithdrawal,
      recoveryPath: fixtureWithdrawal.path
    }])).toThrow(/cannot recover to itself/)
  })

  it("escapes every HTML-sensitive character used by terminal renderers", () => {
    expect(escapeTerminalHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;")
  })
})

describe("asset-router terminal Worker", () => {
  it("serves an exact fixture withdrawal as deterministic 410 at the original URL", async () => {
    let assetCalls = 0
    const router = createAssetRouter(createWithdrawalRegistry([fixtureWithdrawal]))
    const request = new Request(
      `https://study.example${fixtureWithdrawal.path}?from=%3Cunsafe%3E&quote=%22`
    )
    const env = environment(async () => {
      assetCalls += 1
      return new Response("must not be used")
    })

    const first = await router.fetch(request, env)
    const second = await router.fetch(request, env)
    const firstHtml = await first.text()
    const secondHtml = await second.text()

    expect(first.status).toBe(410)
    expect(first.headers.get("location")).toBeNull()
    expect(first.headers.get("cache-control")).toBe("no-store")
    expect(first.headers.get("content-security-policy")).toContain("default-src 'none'")
    expect(first.headers.get("content-security-policy")).toContain("style-src 'self'")
    expect(first.headers.get("x-content-type-options")).toBe("nosniff")
    expect(firstHtml).toBe(secondHtml)
    expect(firstHtml).toContain(
      "/atlas/tool/withdrawn-fixture/?from=%3Cunsafe%3E&amp;quote=%22"
    )
    expect(firstHtml).toContain('href="/atlas/"')
    expect(firstHtml).toContain("This fixture page no longer has a safe public representation.")
    expect(firstHtml).toMatch(
      /<body[^>]*>\s*<a class="skip-link" href="#main-content">Skip to main content<\/a>/
    )
    expect(firstHtml).toContain(
      '<h1 id="terminal-heading" tabindex="-1" autofocus>This published study page was withdrawn.</h1>'
    )
    expect(firstHtml).not.toMatch(/<script\b|rel="canonical"/i)
    expect(firstHtml).not.toContain("<unsafe>")
    expect(assetCalls).toBe(0)

    const head = await router.fetch(new Request(request, { method: "HEAD" }), env)
    expect(head.status).toBe(410)
    expect(await head.text()).toBe("")
    expect(assetCalls).toBe(0)
  })

  it.each([
    {
      label: "a thrown asset-router dependency failure",
      fetchAsset: async () => {
        throw new Error("private injected failure detail")
      }
    },
    {
      label: "an upstream 5xx response",
      fetchAsset: async () => new Response("private upstream failure body", { status: 502 })
    }
  ])("renders service-unavailable HTML for $label without leaking the cause", async ({
    fetchAsset
  }) => {
    const router = createAssetRouter()
    const request = new Request("https://study.example/practice/?mode=%3Cunsafe%3E")
    const response = await router.fetch(request, environment(fetchAsset))
    const html = await response.text()

    expect(response.status).toBe(503)
    expect(response.headers.get("location")).toBeNull()
    expect(response.headers.get("retry-after")).toBe("60")
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'")
    expect(html).toContain("This study page is temporarily unavailable.")
    expect(html).toContain("/practice/?mode=%3Cunsafe%3E")
    expect(html).toContain('href="/practice/?mode=%3Cunsafe%3E"')
    expect(html).toContain(
      '<h1 id="terminal-heading" tabindex="-1" autofocus>This study page is temporarily unavailable.</h1>'
    )
    expect(html).not.toContain("private injected failure detail")
    expect(html).not.toContain("private upstream failure body")
    expect(html).not.toMatch(/<script\b|rel="canonical"/i)
  })

  it("passes a truthful asset 404 through without rewriting the request to /status/", async () => {
    let routedPath = ""
    const router = createAssetRouter()
    const response = await router.fetch(
      new Request("https://study.example/not-published/"),
      environment(async (request) => {
        routedPath = new URL(request.url).pathname
        return new Response("truthful static 404", { status: 404 })
      })
    )

    expect(routedPath).toBe("/not-published/")
    expect(response.status).toBe(404)
    expect(await response.text()).toBe("truthful static 404")
  })
})

describe("terminal-edge deployment configuration", () => {
  it.each(["../wrangler.jsonc", "../scripts/wrangler-preview.jsonc"])(
    "runs the Worker first for every route without enabling SPA fallback in %s",
    async (relativePath) => {
      const configuration = JSON.parse(
        await readFile(new URL(relativePath, import.meta.url), "utf8")
      ) as {
        readonly assets?: {
          readonly not_found_handling?: unknown
          readonly run_worker_first?: unknown
        }
      }
      expect(configuration.assets?.run_worker_first).toBe(true)
      expect(configuration.assets?.not_found_handling).toBe("404-page")
      expect(configuration.assets?.not_found_handling).not.toBe("single-page-application")
    }
  )
})
