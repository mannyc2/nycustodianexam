export interface BootPreferences {
  readonly schemaVersion: 1
  readonly largeText: boolean
  readonly reduceMotion: boolean
}

export const bootPreferencesKey = "nycustodian-boot-preferences-v1"

export interface BootPreferenceMirrorResult {
  readonly mirrored: boolean
  readonly detail: string | null
}

const decodeBootPreferences = (value: unknown): BootPreferences | undefined => {
  if (value === null || typeof value !== "object") return undefined
  const candidate = value as Partial<BootPreferences>
  return candidate.schemaVersion === 1 &&
    typeof candidate.largeText === "boolean" &&
    typeof candidate.reduceMotion === "boolean"
    ? {
        schemaVersion: 1,
        largeText: candidate.largeText,
        reduceMotion: candidate.reduceMotion
      }
    : undefined
}

export const readBootPreferences = (): BootPreferences | undefined => {
  try {
    const raw = localStorage.getItem(bootPreferencesKey)
    return raw === null ? undefined : decodeBootPreferences(JSON.parse(raw) as unknown)
  } catch {
    return undefined
  }
}

export const applyBootPreferences = (preferences?: BootPreferences): void => {
  document.documentElement.toggleAttribute("data-large-text", preferences?.largeText === true)
  document.documentElement.toggleAttribute("data-reduce-motion", preferences?.reduceMotion === true)
}

export const saveBootPreferences = (
  preferences: BootPreferences
): BootPreferenceMirrorResult => {
  let result: BootPreferenceMirrorResult = { mirrored: true, detail: null }
  try {
    localStorage.setItem(bootPreferencesKey, JSON.stringify(preferences))
  } catch {
    result = {
      mirrored: false,
      detail: "This browser could not store the quick-apply copy of your display choices, so they may not apply until a page finishes loading."
    }
  } finally {
    applyBootPreferences(preferences)
  }
  return result
}

export const clearBootPreferences = (): BootPreferenceMirrorResult => {
  let result: BootPreferenceMirrorResult = { mirrored: true, detail: null }
  try {
    localStorage.removeItem(bootPreferencesKey)
  } catch {
    result = {
      mirrored: false,
      detail: "This browser could not clear the quick-apply copy of your display choices."
    }
  } finally {
    applyBootPreferences(undefined)
  }
  return result
}

const networkOnlyLinkSelector = "a[data-network-only-link]"

const applyNetworkOnlyLinkAvailability = (available: boolean): void => {
  const links = document.querySelectorAll<HTMLAnchorElement>(networkOnlyLinkSelector)
  for (const link of links) {
    const retainedHref = link.getAttribute("data-network-href")
    if (available) {
      if (retainedHref !== null) link.setAttribute("href", retainedHref)
      link.removeAttribute("aria-disabled")
      link.removeAttribute("data-network-href")
      link.removeAttribute("data-network-unavailable")
      continue
    }

    const href = link.getAttribute("href")
    if (href !== null && retainedHref === null) link.setAttribute("data-network-href", href)
    link.removeAttribute("href")
    link.setAttribute("aria-disabled", "true")
    link.setAttribute("data-network-unavailable", "")
  }
}

const applyNetworkAvailabilityFromDocumentState = (): void => {
  applyNetworkOnlyLinkAvailability(
    document.documentElement.getAttribute("data-connectivity") === "online" &&
      document.documentElement.getAttribute("data-freshness") !== "offline-stale"
  )
}

/**
 * A newly loaded document is the only event this boot layer may treat as fresh.
 * A later network event proves connectivity, not the currency of cached markup.
 */
export const applyFreshDocumentStatus = (online: boolean): void => {
  document.documentElement.setAttribute("data-connectivity", online ? "online" : "offline")
  if (online) {
    document.documentElement.removeAttribute("data-freshness")
  } else {
    document.documentElement.setAttribute("data-freshness", "offline-stale")
  }
  applyNetworkAvailabilityFromDocumentState()
}

export const applyAwaitingFreshDocumentStatus = (): void => {
  document.documentElement.setAttribute("data-connectivity", "online")
  document.documentElement.setAttribute("data-freshness", "offline-stale")
  applyNetworkAvailabilityFromDocumentState()
}

export const applyConnectivityStatus = (online: boolean): void => {
  document.documentElement.setAttribute("data-connectivity", online ? "online" : "offline")
  if (!online) document.documentElement.setAttribute("data-freshness", "offline-stale")
  applyNetworkAvailabilityFromDocumentState()
}

const transientBootAttributes = [
  "data-connectivity",
  "data-freshness",
  "data-large-text",
  "data-reduce-motion"
] as const

const normalizedDocumentMarkup = (root: HTMLElement): string => {
  const clone = root.cloneNode(true) as HTMLElement
  for (const attribute of transientBootAttributes) clone.removeAttribute(attribute)
  return clone.outerHTML
}

const validateControlledDocument = async (expectedMarkup: string): Promise<void> => {
  try {
    const response = await fetch(window.location.href, {
      cache: "no-store",
      credentials: "omit",
      headers: { accept: "text/html" },
      redirect: "error"
    })
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return
    const freshDocument = new DOMParser().parseFromString(await response.text(), "text/html")
    if (normalizedDocumentMarkup(freshDocument.documentElement) === expectedMarkup) {
      applyFreshDocumentStatus(true)
    }
  } catch {
    // A failed validation leaves the visible offline-stale state intact.
  }
}

if (typeof document !== "undefined") applyBootPreferences(readBootPreferences())
if (typeof window !== "undefined") {
  if (navigator.onLine === false) {
    applyFreshDocumentStatus(false)
  } else if (!("serviceWorker" in navigator) || navigator.serviceWorker.controller === null) {
    applyFreshDocumentStatus(true)
  } else {
    const expectedMarkup = normalizedDocumentMarkup(document.documentElement)
    applyAwaitingFreshDocumentStatus()
    void validateControlledDocument(expectedMarkup)
  }
  window.addEventListener("online", () => applyConnectivityStatus(true))
  window.addEventListener("offline", () => applyConnectivityStatus(false))
  window.addEventListener("storage", (event) => {
    if (event.key === bootPreferencesKey) applyBootPreferences(readBootPreferences())
  })
}
