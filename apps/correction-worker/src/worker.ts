import {
  CorrectionReport,
  type CorrectionErrorResponseValue,
  type CorrectionReportValue
} from "@nycustodian/correction-intake"
import { Schema } from "effect"
import type { CorrectionWorkerEnv } from "./cloudflare-boundary.ts"
import { persistCorrectionReport } from "./intake-repository.ts"

const maximumBodyBytes = 16_384
const noStoreHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff"
} as const

const json = (value: unknown, status = 200, headers?: HeadersInit): Response =>
  new Response(JSON.stringify(value), {
    status,
    headers: { ...noStoreHeaders, ...headers }
  })

const error = (
  status: number,
  code: CorrectionErrorResponseValue["code"],
  headers?: HeadersInit
): Response => json({ schemaVersion: 1, status: "error", code }, status, headers)

const readBoundedBody = async (request: Request): Promise<Uint8Array> => {
  if (request.body === null) return new Uint8Array()
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      size += next.value.byteLength
      if (size > maximumBodyBytes) throw new RangeError("payload-too-large")
      chunks.push(next.value)
    }
  } finally {
    reader.releaseLock()
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

const sha256 = async (bytes: Uint8Array): Promise<string> => {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer)
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
}

const hmacSha256 = async (secret: string, value: string): Promise<string> => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value))
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

const sameOriginRequest = (request: Request): boolean => {
  const origin = request.headers.get("origin")
  if (origin === null || origin !== new URL(request.url).origin) return false
  const fetchSite = request.headers.get("sec-fetch-site")
  return fetchSite === null || fetchSite === "same-origin"
}

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    )
  }
  return value
}

const canonicalReportBytes = (report: CorrectionReportValue): Uint8Array =>
  new TextEncoder().encode(JSON.stringify(canonicalize(report)))

const isActivatedEnvironment = (env: CorrectionWorkerEnv): boolean =>
  env.CORRECTION_INTAKE_MODE === "active-v1" &&
  env.CORRECTION_RATE_LIMIT_IDENTITY_MODE === "ephemeral-network-hash-v1" &&
  typeof env.CORRECTION_RATE_KEY_SECRET === "string" &&
  env.CORRECTION_RATE_KEY_SECRET.length >= 32 &&
  env.CORRECTIONS_DB !== undefined &&
  env.CORRECTIONS_CLIENT_RATE_LIMITER !== undefined &&
  env.CORRECTIONS_GLOBAL_RATE_LIMITER !== undefined

const correctionStatus = (env: CorrectionWorkerEnv): Response => {
  const active = isActivatedEnvironment(env)
  return json({
    schemaVersion: 1,
    mode: active ? "active-v1" : "disabled",
    acceptsReports: active
  })
}

const submitCorrection = async (
  request: Request,
  env: CorrectionWorkerEnv
): Promise<Response> => {
  if (env.CORRECTION_INTAKE_MODE !== "active-v1") {
    // This branch deliberately returns before inspecting headers or consuming a byte.
    return error(503, "disabled", { "retry-after": "86400" })
  }
  const database = env.CORRECTIONS_DB
  const clientRateLimiter = env.CORRECTIONS_CLIENT_RATE_LIMITER
  const globalRateLimiter = env.CORRECTIONS_GLOBAL_RATE_LIMITER
  const rateKeySecret = env.CORRECTION_RATE_KEY_SECRET
  if (
    !isActivatedEnvironment(env) ||
    database === undefined ||
    clientRateLimiter === undefined ||
    globalRateLimiter === undefined ||
    rateKeySecret === undefined
  ) {
    return error(503, "service-unavailable", { "retry-after": "3600" })
  }
  if (!sameOriginRequest(request)) return error(403, "invalid-origin")
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return error(415, "invalid-content-type")
  }

  const networkIdentity = request.headers.get("cf-connecting-ip")
  if (networkIdentity === null) {
    return error(503, "service-unavailable", { "retry-after": "3600" })
  }
  // The raw network identifier is used ephemerally and is never written to D1
  // or logs. Only a secret-keyed digest reaches the approved limiter binding.
  try {
    const clientKey = await hmacSha256(rateKeySecret, networkIdentity)
    const clientLimited = await clientRateLimiter.limit({
      key: `correction-client:${clientKey}`
    })
    if (!clientLimited.success) return error(429, "rate-limited", { "retry-after": "60" })
    const globallyLimited = await globalRateLimiter.limit({
      key: "correction-intake-global-v1"
    })
    if (!globallyLimited.success) return error(429, "rate-limited", { "retry-after": "60" })
  } catch {
    return error(503, "service-unavailable", { "retry-after": "3600" })
  }

  let bytes: Uint8Array
  try {
    bytes = await readBoundedBody(request)
  } catch (cause) {
    if (cause instanceof RangeError) return error(413, "payload-too-large")
    return error(400, "invalid-report")
  }

  let report: CorrectionReportValue
  try {
    report = Schema.decodeUnknownSync(CorrectionReport, { onExcessProperty: "error" })(
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes))
    )
  } catch {
    return error(400, "invalid-report")
  }

  try {
    const result = await persistCorrectionReport(database, {
      report,
      payloadSha256: await sha256(canonicalReportBytes(report)),
      receivedAt: new Date().toISOString()
    })
    if (result === "conflict") return error(409, "receipt-conflict")
    return json({
      schemaVersion: 1,
      status: "accepted",
      clientReceiptId: report.clientReceiptId
    }, 202)
  } catch {
    return error(503, "service-unavailable", { "retry-after": "3600" })
  }
}

export const handleRequest = async (
  request: Request,
  env: CorrectionWorkerEnv
): Promise<Response> => {
  const path = new URL(request.url).pathname
  if (path === "/api/corrections/status" && request.method === "GET") {
    return correctionStatus(env)
  }
  if (path === "/api/corrections" && request.method === "POST") {
    return await submitCorrection(request, env)
  }
  return new Response(null, { status: 404, headers: { "cache-control": "no-store" } })
}

export default {
  fetch: handleRequest
}
