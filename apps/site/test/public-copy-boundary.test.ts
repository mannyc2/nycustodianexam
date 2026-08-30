import { describe, expect, it } from "vitest"
import {
  assertGeneratedPublicCopyBoundary,
  generatedVisibleText
} from "../src/public-copy-boundary.ts"

describe("generated public-copy boundary", () => {
  it("ignores executable data and permits exact support coordinates only in details", () => {
    const html = `<main><h1>Study tools</h1><details><summary>Technical details</summary><code>source.line-1</code><details open><summary>Nested details</summary><code>claim.hidden-1</code></details><code>source.line-2</code></details><p>Ready to study.</p><script type="application/json">{"comparison.id":"maintained-editorial-synthesis"}</script></main>`
    expect(generatedVisibleText(html, "default")).toBe("Study tools Ready to study.")
    expect(() => assertGeneratedPublicCopyBoundary([{ path: "/safe/", html }])).not.toThrow()
  })

  it.each([
    ["raw capacity key", "<p>Confusion-set: comparison.pipe-wrench</p>", "raw confusion-set label"],
    ["raw evidence tier", "<p>Evidence: maintained-editorial-synthesis</p>", "raw evidence-tier code"],
    ["tool tier code", "<p>Tier A/B</p>", "unexplained tool-tier code"],
    ["tool scope code", "<p>entry-level-supported</p>", "raw tool-scope code"],
    ["raw source ID", "<p>Source source.line-1</p>", "raw content-model identifier"],
    ["browser-data promise", "<p>Progress and diagnostics stay on this device.</p>", "unsupported durable-browser promise"],
    ["until-deleted promise", "<p>Your draft stays on this device until you delete it.</p>", "unsupported until-deleted promise"],
    ["false scoring claim", "<p>It is not scored as right or wrong.</p>", "false unmatched-marker scoring claim"],
    ["implementation-first checksum", "<p>The file carries a checksum.</p>", "implementation-first checksum copy"],
    ["source receipt jargon", "<p>Exercise-specific receipts are available.</p>", "internal source-receipt copy"],
    ["profile layer jargon", "<p>Choose a jurisdiction layer.</p>", "internal profile-layer copy"],
    ["non-U.S. spelling", "<p>Removal cancelled.</p>", "non-U.S. spelling"]
  ])("rejects %s", (_label, html, expected) => {
    expect(() => assertGeneratedPublicCopyBoundary([{ path: "/test/", html }])).toThrow(expected)
  })
})
