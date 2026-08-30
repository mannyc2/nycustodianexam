import type { AuthoredTool, SourceEvidenceTier } from "@nycustodian/content/model"

export type SourceEvidenceTierValue = typeof SourceEvidenceTier.Type
export type ToolEvidenceTierValue = (typeof AuthoredTool.Type)["evidenceTier"]
export type ToolScopeStatusValue = (typeof AuthoredTool.Type)["scopeStatus"]

const sourceEvidenceTierLabels = {
  "official-primary": "Official primary source",
  "official-primary-synthesis": "Summary of official primary sources",
  "maintained-editorial-synthesis": "Maintained editorial summary",
  "accepted-release-record": "Accepted project release record"
} satisfies Record<SourceEvidenceTierValue, string>

const toolEvidenceTierLabels = {
  "A": "Official sample or series evidence",
  "A/A-B overlap": "Official evidence with broader entry-level support",
  "A/B": "Official concept with strong entry-level support",
  "B": "Strong entry-level support",
  "B/C": "Entry-level-adjacent support; watchlist",
  "A visual/C operational": "Official visual concept; operational use is watchlist-only"
} satisfies Record<ToolEvidenceTierValue, string>

const toolScopeStatusLabels = {
  "entry-level-supported": "Supported for the entry-level series",
  "watchlist-or-gated": "Watchlist or reference-only"
} satisfies Record<ToolScopeStatusValue, string>

const hazardFamilyLabels: Readonly<Record<string, string>> = {
  "biological-sanitation": "Biological and sanitation safety",
  "chemical": "Chemical safety",
  "egress-fire": "Exit and fire safety",
  "electrical": "Electrical safety",
  "machine-tool-safety": "Machine and tool safety",
  "material-handling-storage": "Material handling and storage",
  "sharps-broken-material": "Sharp and broken material",
  "slip-trip-fall": "Slips, trips, and falls"
}

export const sourceEvidenceTierLabel = (tier: SourceEvidenceTierValue): string =>
  sourceEvidenceTierLabels[tier]

export const toolEvidenceTierLabel = (tier: ToolEvidenceTierValue): string =>
  toolEvidenceTierLabels[tier]

export const catalogToolEvidenceTierLabel = (tier: string): string => {
  if (!Object.hasOwn(toolEvidenceTierLabels, tier)) {
    throw new Error(`Unsupported tool evidence tier ${tier}`)
  }
  return toolEvidenceTierLabels[tier as ToolEvidenceTierValue]
}

export const toolScopeStatusLabel = (status: ToolScopeStatusValue): string =>
  toolScopeStatusLabels[status]

export const hazardFamilyLabel = (family: string | null): string =>
  family === null ? "No-hazard control" : hazardFamilyLabels[family] ?? "Other hazard category"
