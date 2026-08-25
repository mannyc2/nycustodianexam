import { afterEach, describe, expect, it, vi } from "vitest"
import {
  applyConnectivityStatus,
  applyFreshDocumentStatus,
  bootPreferencesKey,
  clearBootPreferences,
  saveBootPreferences
} from "../src/settings/preferences-boot.ts"

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document")
const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage")

const restoreGlobal = (name: "document" | "localStorage", descriptor?: PropertyDescriptor) => {
  if (descriptor === undefined) {
    Reflect.deleteProperty(globalThis, name)
  } else {
    Object.defineProperty(globalThis, name, descriptor)
  }
}

afterEach(() => {
  restoreGlobal("document", originalDocument)
  restoreGlobal("localStorage", originalLocalStorage)
})

const anchorStub = (href: string) => {
  const attributes = new Map<string, string>([["href", href]])
  return {
    attributes,
    element: {
      getAttribute: (name: string) => attributes.get(name) ?? null,
      removeAttribute: (name: string) => attributes.delete(name),
      setAttribute: (name: string, value: string) => attributes.set(name, value)
    } as unknown as HTMLAnchorElement
  }
}

const documentStub = (links: readonly HTMLAnchorElement[] = []) => {
  const attributes = new Map<string, string>()
  const toggleAttribute = vi.fn()
  const setAttribute = vi.fn((name: string, value: string) => attributes.set(name, value))
  const removeAttribute = vi.fn((name: string) => attributes.delete(name))
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: {
        getAttribute: (name: string) => attributes.get(name) ?? null,
        removeAttribute,
        setAttribute,
        toggleAttribute
      },
      querySelectorAll: vi.fn(() => links)
    }
  })
  return { attributes, removeAttribute, setAttribute, toggleAttribute }
}

describe("preference boot mirror failures", () => {
  it("applies saved preferences in the current document when localStorage rejects the mirror", () => {
    const { toggleAttribute } = documentStub()
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        setItem: vi.fn(() => { throw new Error("denied") })
      }
    })

    expect(saveBootPreferences({ schemaVersion: 1, largeText: true, reduceMotion: false }))
      .toEqual({
        mirrored: false,
        detail: "The fast reload/cross-tab preference mirror is unavailable in this browser."
      })
    expect(localStorage.setItem).toHaveBeenCalledWith(
      bootPreferencesKey,
      JSON.stringify({ schemaVersion: 1, largeText: true, reduceMotion: false })
    )
    expect(toggleAttribute).toHaveBeenNthCalledWith(1, "data-large-text", true)
    expect(toggleAttribute).toHaveBeenNthCalledWith(2, "data-reduce-motion", false)
  })

  it("applies defaults in the current document when localStorage rejects mirror removal", () => {
    const { toggleAttribute } = documentStub()
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        removeItem: vi.fn(() => { throw new Error("denied") })
      }
    })

    expect(clearBootPreferences()).toEqual({
      mirrored: false,
      detail: "The fast reload/cross-tab preference mirror could not be cleared in this browser."
    })
    expect(localStorage.removeItem).toHaveBeenCalledWith(bootPreferencesKey)
    expect(toggleAttribute).toHaveBeenNthCalledWith(1, "data-large-text", false)
    expect(toggleAttribute).toHaveBeenNthCalledWith(2, "data-reduce-motion", false)
  })

  it("retains offline-stale after a reconnect event", () => {
    const { attributes, removeAttribute, setAttribute } = documentStub()

    applyConnectivityStatus(false)
    expect(setAttribute).toHaveBeenNthCalledWith(1, "data-connectivity", "offline")
    expect(setAttribute).toHaveBeenNthCalledWith(2, "data-freshness", "offline-stale")

    applyConnectivityStatus(true)
    expect(setAttribute).toHaveBeenNthCalledWith(3, "data-connectivity", "online")
    expect(attributes.get("data-freshness")).toBe("offline-stale")
    expect(removeAttribute).not.toHaveBeenCalledWith("data-freshness")
  })

  it("clears offline-stale only for a fresh online document boot", () => {
    const { attributes, removeAttribute } = documentStub()

    applyConnectivityStatus(false)
    applyFreshDocumentStatus(true)

    expect(attributes.get("data-connectivity")).toBe("online")
    expect(attributes.has("data-freshness")).toBe(false)
    expect(removeAttribute).toHaveBeenCalledWith("data-freshness")
  })

  it("keeps network-only sources disabled through reconnect and restores them on fresh boot", () => {
    const source = anchorStub("https://example.gov/public-source")
    documentStub([source.element])

    applyConnectivityStatus(false)
    expect(source.attributes.has("href")).toBe(false)
    expect(source.attributes.get("aria-disabled")).toBe("true")
    expect(source.attributes.get("data-network-href"))
      .toBe("https://example.gov/public-source")

    applyConnectivityStatus(true)
    expect(source.attributes.has("href")).toBe(false)
    expect(source.attributes.get("aria-disabled")).toBe("true")

    applyFreshDocumentStatus(true)
    expect(source.attributes.get("href")).toBe("https://example.gov/public-source")
    expect(source.attributes.has("aria-disabled")).toBe(false)
    expect(source.attributes.has("data-network-href")).toBe(false)
    expect(source.attributes.has("data-network-unavailable")).toBe(false)
  })
})
