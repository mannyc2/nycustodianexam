import { afterEach, describe, expect, it, vi } from "vitest"
import {
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

const documentStub = () => {
  const toggleAttribute = vi.fn()
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: { toggleAttribute } }
  })
  return toggleAttribute
}

describe("preference boot mirror failures", () => {
  it("applies saved preferences in the current document when localStorage rejects the mirror", () => {
    const toggleAttribute = documentStub()
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
    const toggleAttribute = documentStub()
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
})
