import { localProductShellPath } from "../src/asset-router.ts"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { test as base } from "@playwright/test"

interface OfflineOrigin {
  readonly url: string
  readonly serveRelease: (directory: string) => void
  readonly disconnect: () => Promise<void>
}

const root = fileURLToPath(new URL("../dist/", import.meta.url))
const contentTypes: Readonly<Record<string, string>> = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".woff2": "font/woff2"
}

// A dedicated origin tests actual network loss. In the pinned WebKit runtime,
// offline emulation rejects even a minimal worker-cached navigation.
export const test = base.extend<{ readonly offlineOrigin: OfflineOrigin }>({
  offlineOrigin: async ({}, use) => {
    let servedRoot = root
    const server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
        const documentPath = localProductShellPath(pathname) ?? pathname
        const path = resolve(servedRoot, "." + documentPath + (documentPath.endsWith("/") ? "index.html" : ""))
        if (!path.startsWith(resolve(servedRoot) + sep)) {
          response.writeHead(403).end()
          return
        }
        const bytes = await readFile(path)
        response.writeHead(200, { "Content-Type": contentTypes[extname(path)] ?? "application/octet-stream" })
        response.end(bytes)
      } catch {
        response.writeHead(404).end()
      }
    })
    await new Promise<void>((resolveListen, reject) => {
      server.once("error", reject)
      server.listen(0, "127.0.0.1", resolveListen)
    })
    const address = server.address()
    if (address === null || typeof address === "string") throw new Error("Missing test server port")
    const disconnect = async (): Promise<void> => {
      if (!server.listening) return
      await new Promise<void>((resolveClose, reject) => {
        server.close((error) => error ? reject(error) : resolveClose())
        server.closeAllConnections()
      })
    }
    try {
      await use({ url: `http://127.0.0.1:${address.port}`, disconnect, serveRelease: directory => { servedRoot = resolve(directory) } })
    } finally {
      await disconnect()
    }
  }
})
