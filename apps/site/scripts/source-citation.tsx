import type { CatalogArtifact } from "@nycustodian/content/model"
import { sourceEvidenceTierLabel } from "../src/public-content-labels.ts"

type Catalog = typeof CatalogArtifact.Type
type Source = Catalog["sources"][number]
type Line = Catalog["sourceLines"][number]

const SourceOnlineLink = ({ source }: { readonly source: Source }) => {
  if (source.url === undefined) return null
  let href: string
  try {
    const parsed = new URL(source.url)
    if (parsed.protocol !== "https:") return null
    href = parsed.href
  } catch {
    return null
  }
  return <p><a data-network-only-link="" href={href} rel="external noopener">Open the public source</a><span className="network-only-status" data-network-only-status=""> This external source is unavailable until a fresh online page loads.</span></p>
}

const SourceMetadata = ({ source }: { readonly source: Source }) => <dl className="fact-list">
  <dt>Publisher</dt><dd>{source.publisher}</dd>
  <dt>Evidence tier</dt><dd>{sourceEvidenceTierLabel(source.evidenceTier)}</dd>
  <dt>Version</dt><dd>{source.version}</dd>
  <dt>Locator</dt><dd><code>{source.locator}</code></dd>
  <dt>Supported scope</dt><dd>{source.scope}</dd>
</dl>

const SourceRetainedLines = ({ lines }: { readonly lines: readonly Line[] }) => lines.length === 0 ? null : <section className="section-gap">
  <h2>Retained source excerpts</h2>
  {lines.map(line => <article key={line.id}>
    <p><code>{line.locator}</code> · Verified {line.verifiedOn}</p>
    <blockquote>{line.excerpt}</blockquote>
    <details className="source-note"><summary>Technical details</summary><p>Source line: <code>{line.id}</code></p><p>Supports claim records: {line.supportedClaimIds.map((id, index) => <span key={id}>{index === 0 ? "" : ", "}<code>{id}</code></span>)}</p></details>
  </article>)}
</section>

export const SourceCitation = { Metadata: SourceMetadata, OnlineLink: SourceOnlineLink, RetainedLines: SourceRetainedLines } as const

export const SourceCitationDetails = ({ source, lines }: { readonly source: Source; readonly lines: readonly Line[] }) => <>
  <SourceCitation.Metadata source={source} />
  <SourceCitation.OnlineLink source={source} />
  <SourceCitation.RetainedLines lines={lines} />
</>
