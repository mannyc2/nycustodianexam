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
      detail: "The fast reload/cross-tab preference mirror is unavailable in this browser."
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
      detail: "The fast reload/cross-tab preference mirror could not be cleared in this browser."
    }
  } finally {
    applyBootPreferences(undefined)
  }
  return result
}

if (typeof document !== "undefined") applyBootPreferences(readBootPreferences())
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === bootPreferencesKey) applyBootPreferences(readBootPreferences())
  })
}
