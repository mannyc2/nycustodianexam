import { describe, expect, it } from "vitest"
import {
  catalogToolEvidenceTierLabel,
  hazardFamilyLabel,
  sourceEvidenceTierLabel,
  toolEvidenceTierLabel,
  toolScopeStatusLabel,
  type SourceEvidenceTierValue,
  type ToolEvidenceTierValue,
  type ToolScopeStatusValue
} from "../src/public-content-labels.ts"

describe("public content labels", () => {
  it("maps every source-evidence tier without exposing its storage code", () => {
    const cases = [
      ["official-primary", "Official primary source"],
      ["official-primary-synthesis", "Summary of official primary sources"],
      ["maintained-editorial-synthesis", "Maintained editorial summary"],
      ["accepted-release-record", "Accepted project release record"]
    ] as const satisfies ReadonlyArray<readonly [SourceEvidenceTierValue, string]>

    for (const [tier, label] of cases) expect(sourceEvidenceTierLabel(tier)).toBe(label)
  })

  it("maps every tool evidence and scope code to plain public copy", () => {
    const evidenceCases = [
      ["A", "Official sample or series evidence"],
      ["A/A-B overlap", "Official evidence with broader entry-level support"],
      ["A/B", "Official concept with strong entry-level support"],
      ["B", "Strong entry-level support"],
      ["B/C", "Entry-level-adjacent support; watchlist"],
      ["A visual/C operational", "Official visual concept; operational use is watchlist-only"]
    ] as const satisfies ReadonlyArray<readonly [ToolEvidenceTierValue, string]>
    const scopeCases = [
      ["entry-level-supported", "Supported for the entry-level series"],
      ["watchlist-or-gated", "Watchlist or reference-only"]
    ] as const satisfies ReadonlyArray<readonly [ToolScopeStatusValue, string]>

    for (const [tier, label] of evidenceCases) expect(toolEvidenceTierLabel(tier)).toBe(label)
    for (const [tier, label] of evidenceCases) expect(catalogToolEvidenceTierLabel(tier)).toBe(label)
    for (const [status, label] of scopeCases) expect(toolScopeStatusLabel(status)).toBe(label)
    expect(() => catalogToolEvidenceTierLabel("new-unreviewed-code")).toThrow(
      /Unsupported tool evidence tier/
    )
  })

  it("maps released hazard families without exposing storage codes", () => {
    const cases = [
      ["biological-sanitation", "Biological and sanitation safety"],
      ["chemical", "Chemical safety"],
      ["egress-fire", "Exit and fire safety"],
      ["electrical", "Electrical safety"],
      ["machine-tool-safety", "Machine and tool safety"],
      ["material-handling-storage", "Material handling and storage"],
      ["sharps-broken-material", "Sharp and broken material"],
      ["slip-trip-fall", "Slips, trips, and falls"]
    ] as const
    for (const [family, label] of cases) expect(hazardFamilyLabel(family)).toBe(label)
    expect(hazardFamilyLabel(null)).toBe("No-hazard control")
    expect(hazardFamilyLabel("future-unreviewed-family")).toBe("Other hazard category")
  })
})
