export const CANONICAL_ROUTE_IDS = [
  "atlas-family",
  "atlas-index",
  "atlas-tool",
  "correction-submit",
  "corrections",
  "exam-selector",
  "foil",
  "hazards-index",
  "hazard-player",
  "home",
  "offline-packs",
  "print-center",
  "print-preview",
  "privacy",
  "profile",
  "question-player",
  "review-player",
  "review-queue",
  "security",
  "settings",
  "simulation-player",
  "simulation-results",
  "simulation-setup",
  "source",
  "status",
  "study-hub",
  "transparency-index"
] as const

export type RouteId = (typeof CANONICAL_ROUTE_IDS)[number]

const routeIds = new Set<string>(CANONICAL_ROUTE_IDS)

export const assertCanonicalRouteId: (value: string) => asserts value is RouteId = (value) => {
  if (!routeIds.has(value)) {
    throw new Error(`Unknown canonical route id: ${value}`)
  }
}
