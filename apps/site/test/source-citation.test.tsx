import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SourceCitationDetails } from "../scripts/source-citation.tsx"

const source = {
  id: "source", title: "Public source", publisher: "Publisher", evidenceTier: "official-primary" as const,
  version: "2026 edition", locator: "Page 1", scope: "Reference scope", rightsNotes: "Public reference",
  url: "https://example.org/reference"
}
const line = {
  id: "line", sourceId: "source", locator: "Page 1, paragraph 2", excerpt: '<script>alert("retained")</script>',
  language: "en" as const, verifiedOn: "2026-09-09", supportedClaimIds: ["claim-one"] as const
}

describe("static source citation", () => {
  it("retains evidence metadata, exact excerpt and claim relationship with escaped text", () => {
    const html = renderToStaticMarkup(<SourceCitationDetails source={source} lines={[line]} />)
    for (const value of ["Official primary source", "2026 edition", "Page 1, paragraph 2", "2026-09-09", "claim-one", "Publisher", "Reference scope", "data-network-only-link", "data-network-only-status"]) expect(html).toContain(value)
    expect(html).toContain("&lt;script&gt;")
    expect(html).not.toContain("<script>")
  })

  it("does not advertise an external link for absent, invalid or non-HTTPS URLs", () => {
    for (const url of [undefined, "not a URL", "http://example.org", "javascript:alert(1)"]) {
      const { url: _url, ...record } = source
      const html = renderToStaticMarkup(<SourceCitationDetails source={url === undefined ? record : { ...record, url }} lines={[]} />)
      expect(html).not.toContain("data-network-only-link")
      expect(html).not.toContain("Retained source excerpts")
    }
  })
})
