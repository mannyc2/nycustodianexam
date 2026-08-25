import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"

const port = Number(process.env.NYCUSTODIAN_CORRECTION_WORKER_SMOKE_PORT ?? "8791")
if (!Number.isSafeInteger(port) || port < 1024 || port > 65_535) {
  throw new Error("Correction-worker smoke port must be a non-privileged TCP port")
}

const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8")) as
  Readonly<Record<string, unknown>>
for (const forbidden of [
  "routes",
  "route",
  "d1_databases",
  "services",
  "secrets_store_secrets",
  "ratelimits"
]) {
  if (forbidden in config) throw new Error(`Dormant correction config exposes ${forbidden}`)
}
if (
  config.workers_dev !== false ||
  config.preview_urls !== false ||
  (config.vars as Readonly<Record<string, unknown>> | undefined)?.CORRECTION_INTAKE_MODE !==
    "disabled"
) {
  throw new Error("Dormant correction config is not closed to public activation")
}

const child = spawn(
  "./node_modules/.bin/wrangler",
  [
    "dev",
    "--config",
    "wrangler.jsonc",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--show-interactive-dev-session=false"
  ],
  {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    stdio: ["ignore", "pipe", "pipe"]
  }
)

let output = ""
const retainOutput = (chunk: Buffer): void => {
  output = `${output}${chunk.toString("utf8")}`.slice(-16_384)
}
child.stdout.on("data", retainOutput)
child.stderr.on("data", retainOutput)

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const baseUrl = `http://127.0.0.1:${port}`
const waitUntilReady = async (): Promise<void> => {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Local correction workerd exited early (${child.exitCode}).\n${output}`)
    }
    try {
      const response = await fetch(`${baseUrl}/api/corrections/status`, { cache: "no-store" })
      if (response.ok) return
    } catch {
      // The local socket is expected to refuse connections until workerd is ready.
    }
    await delay(100)
  }
  throw new Error(`Local correction workerd did not become ready.\n${output}`)
}

const stop = async (): Promise<void> => {
  if (child.exitCode !== null) return
  child.kill("SIGTERM")
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()))
  const timedOut = await Promise.race([
    exited.then(() => false),
    delay(5_000).then(() => true)
  ])
  if (timedOut && child.exitCode === null) {
    child.kill("SIGKILL")
    await exited
  }
}

try {
  await waitUntilReady()

  const status = await fetch(`${baseUrl}/api/corrections/status`, { cache: "no-store" })
  if (
    status.status !== 200 ||
    status.headers.get("cache-control") !== "no-store" ||
    JSON.stringify(await status.json()) !==
      JSON.stringify({ schemaVersion: 1, mode: "disabled", acceptsReports: false })
  ) {
    throw new Error("Dormant correction status did not report the exact disabled contract")
  }

  const submission = await fetch(`${baseUrl}/api/corrections`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "not-even-json"
  })
  if (
    submission.status !== 503 ||
    submission.headers.get("cache-control") !== "no-store" ||
    submission.headers.get("retry-after") !== "86400" ||
    JSON.stringify(await submission.json()) !==
      JSON.stringify({ schemaVersion: 1, status: "error", code: "disabled" })
  ) {
    throw new Error("Dormant correction submission did not fail closed before parsing")
  }

  const unknown = await fetch(`${baseUrl}/not-a-correction-route`, { cache: "no-store" })
  if (unknown.status !== 404 || unknown.headers.get("cache-control") !== "no-store") {
    throw new Error("Dormant correction worker exposed an unexpected route")
  }

  console.log("Dormant correction workerd smoke passed: disabled status, 503 submit, closed routes.")
} finally {
  await stop()
}
