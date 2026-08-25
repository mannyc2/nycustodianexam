import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"

const port = Number(process.env.NYCUSTODIAN_TERMINAL_EDGE_SMOKE_PORT ?? "8792")
if (!Number.isSafeInteger(port) || port < 1024 || port > 65_535) {
  throw new Error("Terminal-edge smoke port must be a non-privileged TCP port")
}

const fixtureConfig = JSON.parse(
  await readFile(new URL("./wrangler-terminal-fixture.jsonc", import.meta.url), "utf8")
) as {
  readonly assets?: {
    readonly not_found_handling?: unknown
    readonly run_worker_first?: unknown
  }
  readonly main?: unknown
  readonly preview_urls?: unknown
  readonly workers_dev?: unknown
}
if (
  fixtureConfig.main !== "./terminal-edge-fixture-worker.ts" ||
  fixtureConfig.workers_dev !== false ||
  fixtureConfig.preview_urls !== false ||
  fixtureConfig.assets?.run_worker_first !== true ||
  fixtureConfig.assets?.not_found_handling !== "404-page"
) {
  throw new Error("Terminal-edge workerd fixture is not closed to its exact local test contract")
}

const child = spawn(
  "./node_modules/.bin/wrangler",
  [
    "dev",
    "--config",
    "scripts/wrangler-terminal-fixture.jsonc",
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
      throw new Error(`Local terminal-edge workerd exited early (${child.exitCode}).\n${output}`)
    }
    try {
      const response = await fetch(`${baseUrl}/`, { cache: "no-store" })
      if (response.ok) return
    } catch {
      // The local socket is expected to refuse connections until workerd is ready.
    }
    await delay(100)
  }
  throw new Error(`Local terminal-edge workerd did not become ready.\n${output}`)
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

  const withdrawnUrl = `${baseUrl}/terminal-fixture/withdrawn/?source=%3Cunsafe%3E`
  const withdrawn = await fetch(withdrawnUrl, { cache: "no-store", redirect: "manual" })
  const withdrawnHtml = await withdrawn.text()
  if (
    withdrawn.status !== 410 ||
    withdrawn.url !== withdrawnUrl ||
    withdrawn.headers.get("location") !== null ||
    withdrawn.headers.get("cache-control") !== "no-store" ||
    !withdrawn.headers.get("content-security-policy")?.includes("default-src 'none'") ||
    !withdrawnHtml.includes("/terminal-fixture/withdrawn/?source=%3Cunsafe%3E") ||
    !withdrawnHtml.includes("known withdrawal without publishing removed content") ||
    /<script\b|rel="canonical"/i.test(withdrawnHtml)
  ) {
    throw new Error("Fixture withdrawal did not preserve the exact deterministic 410 contract")
  }

  const withdrawnHead = await fetch(withdrawnUrl, { method: "HEAD", redirect: "manual" })
  if (withdrawnHead.status !== 410 || (await withdrawnHead.text()) !== "") {
    throw new Error("Fixture withdrawal HEAD did not preserve status while omitting the body")
  }

  const failedUrl = `${baseUrl}/terminal-fixture/service-unavailable/?retry=1`
  const failed = await fetch(failedUrl, { cache: "no-store", redirect: "manual" })
  const failedHtml = await failed.text()
  if (
    failed.status !== 503 ||
    failed.url !== failedUrl ||
    failed.headers.get("location") !== null ||
    failed.headers.get("retry-after") !== "60" ||
    !failedHtml.includes("temporarily unavailable") ||
    !failedHtml.includes("/terminal-fixture/service-unavailable/?retry=1") ||
    failedHtml.includes("injected fixture detail") ||
    /<script\b|rel="canonical"/i.test(failedHtml)
  ) {
    throw new Error("Injected workerd failure did not produce the closed 503 HTML contract")
  }

  const unknownUrl = `${baseUrl}/terminal-fixture/not-published/`
  const unknown = await fetch(unknownUrl, { cache: "no-store", redirect: "manual" })
  if (unknown.status !== 404 || unknown.url !== unknownUrl) {
    throw new Error("Unknown workerd route was rewritten instead of retaining its truthful 404 URL")
  }

  console.log(
    "Terminal-edge workerd smoke passed: fixture 410, injected 503, HEAD, CSP, and original-URL 404."
  )
} finally {
  await stop()
}
