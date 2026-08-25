import { describe, expect, it } from "vitest"
import type {
  CorrectionWorkerEnv,
  D1Database,
  D1PreparedStatement,
  D1Result,
  RateLimiter
} from "../src/cloudflare-boundary.ts"
import { handleRequest } from "../src/worker.ts"

class Statement implements D1PreparedStatement {
  constructor(
    readonly query: string,
    readonly values: ReadonlyArray<unknown> = []
  ) {}

  bind(...values: ReadonlyArray<unknown>): D1PreparedStatement {
    return new Statement(this.query, values)
  }
}

class MemoryD1 implements D1Database {
  readonly rows = new Map<string, { readonly digest: string; readonly lane: string }>()

  prepare(query: string): D1PreparedStatement {
    return new Statement(query)
  }

  async batch(statements: ReadonlyArray<D1PreparedStatement>): Promise<ReadonlyArray<D1Result>> {
    const [insert, select] = statements as readonly [Statement, Statement]
    const receipt = String(insert.values[0])
    if (!this.rows.has(receipt)) {
      this.rows.set(receipt, {
        digest: String(insert.values[1]),
        lane: String(insert.values[12])
      })
    }
    const selectedReceipt = String(select.values[0])
    const row = this.rows.get(selectedReceipt)
    return [
      { success: true },
      {
        success: true,
        results: row === undefined
          ? []
          : [{ client_receipt_id: selectedReceipt, payload_sha256: row.digest }]
      }
    ]
  }
}

const receipt = "5b3a7f35-7bf7-4ee4-86de-57bc6fe601e7"
const report = {
  schemaVersion: 1,
  clientReceiptId: receipt,
  category: "fact",
  subject: { pagePath: "/ny/" },
  summary: "A factual correction",
  details: "The official public source now says something different.",
  publicSourceUrl: "https://example.gov/source",
  affirmsNoSecureExamMaterial: true
} as const

const request = (body: unknown): Request => new Request("https://study.example/api/corrections", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: "https://study.example",
    "sec-fetch-site": "same-origin",
    "cf-connecting-ip": "192.0.2.10"
  },
  body: JSON.stringify(body)
})

const activeEnv = (
  database = new MemoryD1(),
  clientRateLimiter: RateLimiter = { limit: async () => ({ success: true }) },
  globalRateLimiter: RateLimiter = { limit: async () => ({ success: true }) }
): CorrectionWorkerEnv => ({
  CORRECTION_INTAKE_MODE: "active-v1",
  CORRECTION_RATE_LIMIT_IDENTITY_MODE: "ephemeral-network-hash-v1",
  CORRECTION_RATE_KEY_SECRET: "test-only-secret-with-at-least-32-characters",
  CORRECTIONS_DB: database,
  CORRECTIONS_CLIENT_RATE_LIMITER: clientRateLimiter,
  CORRECTIONS_GLOBAL_RATE_LIMITER: globalRateLimiter
})

describe("dormant correction Worker", () => {
  it("reports disabled and refuses POST without consuming its body", async () => {
    const post = request(report)
    const response = await handleRequest(post, { CORRECTION_INTAKE_MODE: "disabled" })

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      schemaVersion: 1,
      status: "error",
      code: "disabled"
    })
    expect(post.bodyUsed).toBe(false)

    const status = await handleRequest(
      new Request("https://study.example/api/corrections/status"),
      { CORRECTION_INTAKE_MODE: "disabled" }
    )
    expect(await status.json()).toEqual({
      schemaVersion: 1,
      mode: "disabled",
      acceptsReports: false
    })
  })

  it("stays disabled if active mode lacks either uncommitted production binding", async () => {
    const response = await handleRequest(
      new Request("https://study.example/api/corrections/status"),
      { CORRECTION_INTAKE_MODE: "active-v1" }
    )
    expect(await response.json()).toMatchObject({ mode: "disabled", acceptsReports: false })
  })
})

describe("locally activated correction Worker", () => {
  it("accepts idempotently and rejects a receipt with different immutable data", async () => {
    const database = new MemoryD1()
    const environment = activeEnv(database)
    const first = await handleRequest(request(report), environment)
    const retry = await handleRequest(request({
      affirmsNoSecureExamMaterial: true,
      publicSourceUrl: report.publicSourceUrl,
      details: report.details,
      summary: report.summary,
      subject: { pagePath: report.subject.pagePath },
      category: report.category,
      clientReceiptId: report.clientReceiptId,
      schemaVersion: 1
    }), environment)
    const conflict = await handleRequest(request({ ...report, details: "Different details" }), environment)

    expect(first.status).toBe(202)
    expect(retry.status).toBe(202)
    expect(await retry.json()).toEqual({
      schemaVersion: 1,
      status: "accepted",
      clientReceiptId: receipt
    })
    expect(conflict.status).toBe(409)
    expect(database.rows.size).toBe(1)
  })

  it("routes security reports internally without changing the generic public response", async () => {
    const database = new MemoryD1()
    const response = await handleRequest(
      request({ ...report, category: "security" }),
      activeEnv(database)
    )

    expect(response.status).toBe(202)
    expect(await response.json()).toMatchObject({ status: "accepted" })
    expect(database.rows.get(receipt)?.lane).toBe("security_hold")
  })

  it("rejects cross-origin, invalid media, oversized, and rate-limited requests", async () => {
    const crossOrigin = request(report)
    crossOrigin.headers.set("origin", "https://attacker.example")
    expect((await handleRequest(crossOrigin, activeEnv())).status).toBe(403)

    const wrongMedia = request(report)
    wrongMedia.headers.set("content-type", "text/plain")
    expect((await handleRequest(wrongMedia, activeEnv())).status).toBe(415)

    const oversized = request({ ...report, details: "x".repeat(17_000) })
    expect((await handleRequest(oversized, activeEnv())).status).toBe(413)

    const limited = await handleRequest(
      request(report),
      activeEnv(new MemoryD1(), { limit: async () => ({ success: false }) })
    )
    expect(limited.status).toBe(429)
    expect(limited.headers.get("retry-after")).toBe("60")

    const globallyLimited = await handleRequest(
      request(report),
      activeEnv(
        new MemoryD1(),
        { limit: async () => ({ success: true }) },
        { limit: async () => ({ success: false }) }
      )
    )
    expect(globallyLimited.status).toBe(429)
  })

  it.each(["client", "global"] as const)(
    "returns typed service unavailable when the %s limiter binding throws",
    async (binding) => {
      const succeeds: RateLimiter = { limit: async () => ({ success: true }) }
      const throws: RateLimiter = { limit: async () => Promise.reject(new Error("binding unavailable")) }
      const response = await handleRequest(
        request(report),
        activeEnv(
          new MemoryD1(),
          binding === "client" ? throws : succeeds,
          binding === "global" ? throws : succeeds
        )
      )

      expect(response.status).toBe(503)
      expect(response.headers.get("retry-after")).toBe("3600")
      expect(await response.json()).toMatchObject({
        schemaVersion: 1,
        status: "error",
        code: "service-unavailable"
      })
    }
  )

  it("rejects excess properties and cannot activate without the approved identity contract", async () => {
    expect((await handleRequest(
      request({ ...report, unexpected: "not in the contract" }),
      activeEnv()
    )).status).toBe(400)

    const missingIdentityMode = activeEnv()
    const unavailable = await handleRequest(request(report), {
      ...missingIdentityMode,
      CORRECTION_RATE_LIMIT_IDENTITY_MODE: "disabled"
    })
    expect(unavailable.status).toBe(503)
  })
})
