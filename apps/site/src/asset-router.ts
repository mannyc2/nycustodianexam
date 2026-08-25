import { printPreviewPathPattern } from "./print/identity.ts"
import {
  productionWithdrawalRegistry,
  type WithdrawalRecord,
  type WithdrawalRegistry
} from "./withdrawal-registry.ts"

export interface StaticAssetsBinding {
  readonly fetch: (request: Request) => Promise<Response>
}

export interface AssetRouterEnvironment {
  readonly ASSETS: StaticAssetsBinding
}

export interface AssetRouter {
  readonly fetch: (request: Request, environment: AssetRouterEnvironment) => Promise<Response>
}

const simulationQuestionRoute =
  /^\/simulations\/session\/sim-[a-z0-9][a-z0-9-]{7,63}\/question\/[1-9][0-9]*\/$/
const simulationResultsRoute =
  /^\/simulations\/session\/sim-[a-z0-9][a-z0-9-]{7,63}\/results\/$/

export const localProductShellPath = (pathname: string): string | undefined => {
  if (simulationQuestionRoute.test(pathname)) {
    return "/simulations/session/sim-shell0000/question/1/"
  }
  if (simulationResultsRoute.test(pathname)) {
    return "/simulations/session/sim-shell0000/results/"
  }
  if (printPreviewPathPattern.test(pathname)) {
    return "/print/preview/print-shell0000/"
  }
  return undefined
}

const shellRequest = (request: Request, shellPath: string): Request => {
  const url = new URL(request.url)
  url.pathname = shellPath
  return new Request(url, request)
}

export const escapeTerminalHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;")

const terminalContentSecurityPolicy = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "style-src 'self'"
].join("; ")

const requestedTarget = (url: URL): string => `${url.pathname}${url.search}`

const terminalDocument = (input: {
  readonly eyebrow: string
  readonly heading: string
  readonly detail: string
  readonly requestedTarget: string
  readonly recoveryLinks: ReadonlyArray<{
    readonly href: string
    readonly label: string
  }>
  readonly title: string
}): string => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <title>${escapeTerminalHtml(input.title)}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body data-route-id="terminal-status">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <main class="page-shell" id="main-content" tabindex="-1">
    <section class="hero" aria-labelledby="terminal-heading">
      <p class="eyebrow">${escapeTerminalHtml(input.eyebrow)}</p>
      <h1 id="terminal-heading" tabindex="-1" autofocus>${escapeTerminalHtml(input.heading)}</h1>
      <p>${escapeTerminalHtml(input.detail)}</p>
      <p>Requested address: <code>${escapeTerminalHtml(input.requestedTarget)}</code></p>
    </section>
    <nav class="reference-card" aria-label="Safe recovery options">
      <h2>Safe recovery options</h2>
      <ul class="link-list">${input.recoveryLinks.map((link) =>
        `<li><a href="${escapeTerminalHtml(link.href)}">${escapeTerminalHtml(link.label)}</a></li>`
      ).join("")}</ul>
    </nav>
  </main>
</body>
</html>
`

export const renderWithdrawalHtml = (
  url: URL,
  record: WithdrawalRecord
): string => terminalDocument({
  eyebrow: "Content withdrawn",
  heading: "This published study page was withdrawn.",
  detail: record.publicMessage,
  requestedTarget: requestedTarget(url),
  recoveryLinks: [
    { href: record.recoveryPath, label: record.recoveryLabel },
    { href: "/transparency/corrections/", label: "Read correction history" },
    { href: "/", label: "Return to the study home" }
  ],
  title: "Study page withdrawn — NY Custodian Exam Study"
})

export const renderServiceUnavailableHtml = (url: URL): string => terminalDocument({
  eyebrow: "Temporary service failure",
  heading: "This study page is temporarily unavailable.",
  detail: "The application could not safely finish this request. No replacement page was shown.",
  requestedTarget: requestedTarget(url),
  recoveryLinks: [
    { href: requestedTarget(url), label: "Retry the requested page" },
    { href: "/status/", label: "Open the recovery guide" },
    { href: "/", label: "Return to the study home" }
  ],
  title: "Study service unavailable — NY Custodian Exam Study"
})

const terminalResponse = (
  request: Request,
  status: 410 | 503,
  html: string
): Response => {
  const headers = new Headers({
    "cache-control": "no-store",
    "content-security-policy": terminalContentSecurityPolicy,
    "content-type": "text/html; charset=utf-8",
    "permissions-policy": "camera=(), geolocation=(), microphone=()",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-robots-tag": "noindex"
  })
  if (status === 503) headers.set("retry-after", "60")
  return new Response(request.method === "HEAD" ? null : html, { status, headers })
}

export const createAssetRouter = (
  withdrawalRegistry: WithdrawalRegistry = productionWithdrawalRegistry
): AssetRouter => ({
  async fetch(request: Request, environment: AssetRouterEnvironment): Promise<Response> {
    const url = new URL(request.url)
    try {
      const withdrawal = withdrawalRegistry.find(url.pathname)
      if (withdrawal !== undefined) {
        return terminalResponse(request, 410, renderWithdrawalHtml(url, withdrawal))
      }
      const assetRequest = request.method === "GET" || request.method === "HEAD"
        ? (() => {
            const shellPath = localProductShellPath(url.pathname)
            return shellPath === undefined ? request : shellRequest(request, shellPath)
          })()
        : request
      const response = await environment.ASSETS.fetch(assetRequest)
      if (response.status < 500) return response
      return terminalResponse(request, 503, renderServiceUnavailableHtml(url))
    } catch {
      return terminalResponse(request, 503, renderServiceUnavailableHtml(url))
    }
  }
})

export default createAssetRouter()
