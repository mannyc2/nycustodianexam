import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import {
  cacheVersionFor,
  finalizeServiceWorker,
  type CacheVersionInput
} from "../scripts/service-worker-finalization.ts"

const input = (path: string, contents: string): CacheVersionInput => ({
  path,
  bytes: new TextEncoder().encode(contents)
})

describe("service-worker finalization", () => {
  it("derives an order-independent version that changes with postcommit content", () => {
    const shell = input("index.html", "<main>Study</main>")
    const firstPostcommit = input(
      "content/vertical-slice/question.postcommit.json",
      '{"correctOptionId":"a"}'
    )
    const secondPostcommit = input(
      "content/vertical-slice/question.postcommit.json",
      '{"correctOptionId":"b"}'
    )

    const firstVersion = cacheVersionFor([shell, firstPostcommit])

    expect(cacheVersionFor([firstPostcommit, shell])).toBe(firstVersion)
    expect(cacheVersionFor([shell, secondPostcommit])).not.toBe(firstVersion)
    expect(firstVersion).toMatch(/^[a-f0-9]{16}$/)
  })

  it("injects the same cache version into both namespaces and sorts assets", () => {
    const template = [
      'const shellCache = "nycustodian-shell-__NYCUSTODIAN_CACHE_VERSION__"',
      'const runtimeCache = "nycustodian-runtime-__NYCUSTODIAN_CACHE_VERSION__"',
      "const builtAssets = [/*__PRECACHE_ASSETS__*/]"
    ].join("\n")

    const finalized = finalizeServiceWorker({
      template,
      cacheVersion: "0123456789abcdef",
      assetNames: ["/assets/z.js", "/assets/a.css", "/assets/z.js"]
    })

    expect(finalized).toContain('const shellCache = "nycustodian-shell-0123456789abcdef"')
    expect(finalized).toContain('const runtimeCache = "nycustodian-runtime-0123456789abcdef"')
    expect(finalized).toContain('"/assets/a.css",\n  "/assets/z.js"')
    expect(finalized).not.toContain("__NYCUSTODIAN_CACHE_VERSION__")
    expect(finalized).not.toContain("/*__PRECACHE_ASSETS__*/")
  })
})

describe("service-worker activation", () => {
  it("deletes obsolete project caches without touching unrelated origin caches", async () => {
    type WaitUntilEvent = {
      readonly waitUntil: (promise: PromiseLike<unknown>) => void
    }
    type Listener = (event: WaitUntilEvent) => void

    const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8")
    const listeners = new Map<string, Listener>()
    const deleted: string[] = []
    const currentVersion = "__NYCUSTODIAN_CACHE_VERSION__"
    const cacheNames = [
      "nycustodian-shell-old",
      "nycustodian-runtime-old",
      "shared-origin-image-cache",
      "workbox-precache-other-app",
      "nycustodian-shell-" + currentVersion,
      "nycustodian-runtime-" + currentVersion
    ]
    const serviceWorkerGlobal = {
      addEventListener: (type: string, listener: Listener): void => {
        listeners.set(type, listener)
      }
    }
    const cacheStorage = {
      keys: async (): Promise<readonly string[]> => cacheNames,
      delete: async (key: string): Promise<boolean> => {
        deleted.push(key)
        return true
      }
    }

    const evaluate = new Function("self", "caches", "fetch", "Response", source)
    evaluate(serviceWorkerGlobal, cacheStorage, globalThis.fetch, globalThis.Response)

    const activate = listeners.get("activate")
    expect(activate).toBeDefined()

    let completion: PromiseLike<unknown> | undefined
    activate?.({
      waitUntil: (promise) => {
        completion = promise
      }
    })
    expect(completion).toBeDefined()
    await completion

    expect(deleted).toEqual(["nycustodian-shell-old", "nycustodian-runtime-old"])
  })
})

describe("service-worker fetch", () => {
  it.each([
    {
      label: "an explicit no-store pack fetch",
      request: new Request("https://study.example/content/releases/new/object.json", {
        cache: "no-store"
      })
    },
    {
      label: "the correction status API",
      request: new Request("https://study.example/api/corrections/status")
    }
  ])("bypasses every application cache for $label", async ({ request }) => {
    type FetchHarnessEvent = {
      readonly request: Request
      readonly respondWith: (promise: Promise<Response>) => void
      readonly waitUntil: (promise: PromiseLike<unknown>) => void
    }
    type Listener = (event: FetchHarnessEvent) => void

    const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8")
    const listeners = new Map<string, Listener>()
    let cacheTouches = 0
    let networkRequests = 0
    let responsePromise: Promise<Response> | undefined
    let lifetimeRegistered = false
    const cacheStorage = {
      has: async (): Promise<boolean> => {
        cacheTouches += 1
        return false
      },
      open: async (): Promise<never> => {
        cacheTouches += 1
        throw new Error("A cache-bypassing request must not open application caches")
      },
      keys: async (): Promise<readonly string[]> => [],
      delete: async (): Promise<boolean> => true
    }
    const serviceWorkerGlobal = {
      location: { origin: "https://study.example" },
      addEventListener: (type: string, listener: Listener): void => {
        listeners.set(type, listener)
      }
    }
    const networkFetch = async (): Promise<Response> => {
      networkRequests += 1
      return new Response("fresh-network-response", {
        headers: { "cache-control": "no-store" }
      })
    }
    const evaluate = new Function("self", "caches", "fetch", "Response", source)
    evaluate(serviceWorkerGlobal, cacheStorage, networkFetch, globalThis.Response)

    listeners.get("fetch")?.({
      request,
      respondWith: (promise) => {
        responsePromise = promise
      },
      waitUntil: () => {
        lifetimeRegistered = true
      }
    })

    expect(await responsePromise?.then((response) => response.text())).toBe("fresh-network-response")
    expect(networkRequests).toBe(1)
    expect(cacheTouches).toBe(0)
    expect(lifetimeRegistered).toBe(false)
  })

  it.each([
    "/content/vertical-slice/questions/q-1.postcommit.json",
    "/content/assets/derivatives/scenes/s001-web.png"
  ])("leaves app-verified content out of generic caches: %s", async (path) => {
    type FetchHarnessEvent = {
      readonly request: Request
      readonly respondWith: (promise: Promise<Response>) => void
      readonly waitUntil: (promise: PromiseLike<unknown>) => void
    }
    type Listener = (event: FetchHarnessEvent) => void

    const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8")
    const listeners = new Map<string, Listener>()
    let cacheOpens = 0
    let networkRequests = 0
    let responsePromise: Promise<Response> | undefined
    let lifetimeRegistered = false
    const cacheStorage = {
      has: async (): Promise<boolean> => false,
      open: async () => {
        cacheOpens += 1
        throw new Error("Protected content must not enter a generic cache")
      },
      keys: async (): Promise<readonly string[]> => [],
      delete: async (): Promise<boolean> => true
    }
    const serviceWorkerGlobal = {
      location: { origin: "https://study.example" },
      addEventListener: (type: string, listener: Listener): void => {
        listeners.set(type, listener)
      }
    }
    const networkFetch = async (): Promise<Response> => {
      networkRequests += 1
      return new Response("verified-by-app")
    }
    const evaluate = new Function("self", "caches", "fetch", "Response", source)
    evaluate(serviceWorkerGlobal, cacheStorage, networkFetch, globalThis.Response)

    listeners.get("fetch")?.({
      request: new Request(`https://study.example${path}`),
      respondWith: (promise) => {
        responsePromise = promise
      },
      waitUntil: () => {
        lifetimeRegistered = true
      }
    })

    expect(await responsePromise?.then((response) => response.text())).toBe("verified-by-app")
    expect(networkRequests).toBe(1)
    expect(cacheOpens).toBe(0)
    expect(lifetimeRegistered).toBe(false)
  })

  it("uses only the active namespaces and keeps a runtime write alive", async () => {
    type FetchHarnessEvent = {
      readonly request: Request
      readonly respondWith: (promise: Promise<Response>) => void
      readonly waitUntil: (promise: PromiseLike<unknown>) => void
    }
    type Listener = (event: FetchHarnessEvent) => void

    const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8")
    const listeners = new Map<string, Listener>()
    const opened: string[] = []
    const shellIgnoreVary: boolean[] = []
    const writes: string[] = []
    let finishWrite: (() => void) | undefined
    const writeBarrier = new Promise<void>((resolve) => {
      finishWrite = resolve
    })
    const shell = {
      match: async (
        _request: Request,
        options?: CacheQueryOptions
      ): Promise<Response | undefined> => {
        shellIgnoreVary.push(options?.ignoreVary ?? false)
        return undefined
      }
    }
    const runtime = {
      match: async (): Promise<Response | undefined> => undefined,
      put: async (request: Request): Promise<void> => {
        writes.push(request.url)
        await writeBarrier
      }
    }
    const cacheStorage = {
      has: async (): Promise<boolean> => false,
      open: async (name: string) => {
        opened.push(name)
        return name.startsWith("nycustodian-shell-") ? shell : runtime
      },
      keys: async (): Promise<readonly string[]> => [],
      delete: async (): Promise<boolean> => true
    }
    const serviceWorkerGlobal = {
      location: { origin: "https://study.example" },
      addEventListener: (type: string, listener: Listener): void => {
        listeners.set(type, listener)
      }
    }
    const networkFetch = async (): Promise<Response> => new Response("network")
    const evaluate = new Function("self", "caches", "fetch", "Response", source)
    evaluate(serviceWorkerGlobal, cacheStorage, networkFetch, globalThis.Response)

    const handleFetch = listeners.get("fetch")
    expect(handleFetch).toBeDefined()

    let responsePromise: Promise<Response> | undefined
    let lifetimePromise: PromiseLike<unknown> | undefined
    handleFetch?.({
      request: new Request("https://study.example/content/runtime.json"),
      respondWith: (promise) => {
        responsePromise = promise
      },
      waitUntil: (promise) => {
        lifetimePromise = promise
      }
    })

    const response = await responsePromise
    expect(await response?.text()).toBe("network")
    expect(opened).toEqual([
      "nycustodian-shell-__NYCUSTODIAN_CACHE_VERSION__",
      "nycustodian-runtime-__NYCUSTODIAN_CACHE_VERSION__",
      "nycustodian-runtime-__NYCUSTODIAN_CACHE_VERSION__"
    ])
    expect(shellIgnoreVary).toEqual([true])
    expect(writes).toEqual(["https://study.example/content/runtime.json"])

    let lifetimeSettled = false
    void Promise.resolve(lifetimePromise).then(() => {
      lifetimeSettled = true
    })
    await Promise.resolve()
    expect(lifetimeSettled).toBe(false)

    finishWrite?.()
    await lifetimePromise
    expect(lifetimeSettled).toBe(true)
  })

  it("does not runtime-cache a same-origin response marked no-store", async () => {
    type FetchHarnessEvent = {
      readonly request: Request
      readonly respondWith: (promise: Promise<Response>) => void
      readonly waitUntil: (promise: PromiseLike<unknown>) => void
    }
    type Listener = (event: FetchHarnessEvent) => void

    const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8")
    const listeners = new Map<string, Listener>()
    let writes = 0
    let responsePromise: Promise<Response> | undefined
    let lifetimePromise: PromiseLike<unknown> | undefined
    const cacheStorage = {
      has: async (): Promise<boolean> => false,
      open: async (name: string) => name.startsWith("nycustodian-shell-")
        ? { match: async (): Promise<Response | undefined> => undefined }
        : {
            match: async (): Promise<Response | undefined> => undefined,
            put: async (): Promise<void> => {
              writes += 1
            }
          },
      keys: async (): Promise<readonly string[]> => [],
      delete: async (): Promise<boolean> => true
    }
    const serviceWorkerGlobal = {
      location: { origin: "https://study.example" },
      addEventListener: (type: string, listener: Listener): void => {
        listeners.set(type, listener)
      }
    }
    const networkFetch = async (): Promise<Response> => new Response("uncacheable", {
      headers: { "cache-control": "private, no-store" }
    })
    const evaluate = new Function("self", "caches", "fetch", "Response", source)
    evaluate(serviceWorkerGlobal, cacheStorage, networkFetch, globalThis.Response)

    listeners.get("fetch")?.({
      request: new Request("https://study.example/runtime-uncacheable.json"),
      respondWith: (promise) => {
        responsePromise = promise
      },
      waitUntil: (promise) => {
        lifetimePromise = promise
      }
    })

    expect(await responsePromise?.then((response) => response.text())).toBe("uncacheable")
    await lifetimePromise
    expect(writes).toBe(0)
  })
})
