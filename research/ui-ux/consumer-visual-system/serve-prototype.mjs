import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

export const evidenceCoordinates = Object.freeze({
  protocolId: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  humanReviewRequired: false,
  notHumanUsabilityTested: true
})

const prototypeRoot = fileURLToPath(new URL("./", import.meta.url))
const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))

const parsePort = (rawPort) => {
  const normalizedPort = rawPort ?? "4196"
  if (!/^\d+$/.test(normalizedPort)) {
    throw new Error("NYCUSTODIAN_VISUAL_PROTOTYPE_PORT must be an integer from 1024 through 65535")
  }
  const port = Number.parseInt(normalizedPort, 10)
  if (!Number.isSafeInteger(port) || port < 1024 || port > 65_535) {
    throw new Error("NYCUSTODIAN_VISUAL_PROTOTYPE_PORT must be an integer from 1024 through 65535")
  }
  return port
}

const port = parsePort(process.env.NYCUSTODIAN_VISUAL_PROTOTYPE_PORT)
const loopbackHost = "127.0.0.1"

const routes = new Map([
  ["/", { contentType: "text/html; charset=utf-8", path: `${prototypeRoot}prototype.html` }],
  ["/prototype.html", { contentType: "text/html; charset=utf-8", path: `${prototypeRoot}prototype.html` }],
  ["/prototype.css", { contentType: "text/css; charset=utf-8", path: `${prototypeRoot}prototype.css` }],
  ["/prototype.mjs", { contentType: "text/javascript; charset=utf-8", path: `${prototypeRoot}prototype.mjs` }],
  [
    "/content/assets/derivatives/tools/t037-phone.png",
    {
      contentType: "image/png",
      path: `${repositoryRoot}content/assets/derivatives/tools/t037-phone.png`
    }
  ],
  [
    "/content/assets/derivatives/comparisons/p002-phone.png",
    {
      contentType: "image/png",
      path: `${repositoryRoot}content/assets/derivatives/comparisons/p002-phone.png`
    }
  ],
  [
    "/content/assets/derivatives/scenes/s001-phone.png",
    {
      contentType: "image/png",
      path: `${repositoryRoot}content/assets/derivatives/scenes/s001-phone.png`
    }
  ]
])

const contentSecurityPolicy = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'self'",
  "font-src 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "img-src 'self'",
  "manifest-src 'none'",
  "media-src 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "worker-src 'none'"
].join("; ")

const responseHeaders = Object.freeze({
  "Cache-Control": "no-store",
  "Content-Security-Policy": contentSecurityPolicy,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff"
})

const reject = (response, statusCode, message) => {
  response.writeHead(statusCode, {
    ...responseHeaders,
    "Content-Type": "text/plain; charset=utf-8"
  })
  response.end(message)
}

const server = createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.setHeader("Allow", "GET, HEAD")
      reject(response, 405, "Method not allowed\n")
      return
    }

    const requestHost = request.headers.host?.split(":", 1)[0]
    if (requestHost !== loopbackHost) {
      reject(response, 421, "Loopback host required\n")
      return
    }

    const rawTarget = request.url ?? "/"
    const queryIndex = rawTarget.indexOf("?")
    const rawPath = queryIndex === -1 ? rawTarget : rawTarget.slice(0, queryIndex)
    let decodedPath
    try {
      decodedPath = decodeURIComponent(rawPath)
    } catch {
      reject(response, 400, "Malformed request path\n")
      return
    }

    const pathSegments = decodedPath.split("/")
    if (
      decodedPath.includes("\\") ||
      decodedPath.includes("\0") ||
      pathSegments.some((segment) => segment === "." || segment === "..")
    ) {
      reject(response, 400, "Invalid request path\n")
      return
    }

    const route = routes.get(decodedPath)
    if (route === undefined) {
      reject(response, 404, "Not found\n")
      return
    }

    const body = await readFile(route.path)
    response.writeHead(200, {
      ...responseHeaders,
      "Content-Length": String(body.byteLength),
      "Content-Type": route.contentType
    })
    response.end(request.method === "HEAD" ? undefined : body)
  } catch {
    reject(response, 500, "Prototype server error\n")
  }
})

const close = () => {
  server.close((error) => {
    if (error) {
      process.stderr.write("Prototype server shutdown failed\n")
      process.exitCode = 1
    }
  })
}

server.on("error", () => {
  process.stderr.write("Prototype server failed to start\n")
  process.exitCode = 1
})

server.listen(port, loopbackHost, () => {
  process.stdout.write(`Visual-system prototype listening on http://${loopbackHost}:${port}\n`)
})

process.once("SIGINT", close)
process.once("SIGTERM", close)
