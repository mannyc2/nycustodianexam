import { printPreviewPathPattern } from "./print/identity.ts"

interface StaticAssetsBinding {
  readonly fetch: (request: Request) => Promise<Response>
}

interface AssetRouterEnvironment {
  readonly ASSETS: StaticAssetsBinding
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

export default {
  async fetch(request: Request, environment: AssetRouterEnvironment): Promise<Response> {
    if (request.method === "GET" || request.method === "HEAD") {
      const shellPath = localProductShellPath(new URL(request.url).pathname)
      if (shellPath !== undefined) {
        return environment.ASSETS.fetch(shellRequest(request, shellPath))
      }
    }

    return environment.ASSETS.fetch(request)
  }
}
