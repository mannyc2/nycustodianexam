export const setupDestinations = [
  { id: "practice", label: "Practice set", href: "/practice/custom/" },
  { id: "hazards", label: "Hazard drill", href: "/hazards/" },
  { id: "simulation", label: "Full simulation", href: "/simulations/" }
] as const
export type SetupDestination = typeof setupDestinations[number]["id"]
