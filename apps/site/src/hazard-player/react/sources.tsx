import { sourceEvidenceTierLabel } from "../../public-content-labels.ts"
import type { PostcommitScene } from "../released-scene.ts"

export const HazardSourceLineReceipt = ({
  payload,
  sourceLineId
}: {
  readonly payload: PostcommitScene
  readonly sourceLineId: string
}) => {
  const source = payload.sources.find((candidate) => candidate.id === sourceLineId)
  if (source === undefined) {
    return <li>The exact released source-line receipt is unavailable.</li>
  }

  return <li>
    <p>
      <strong>{source.publisher}</strong> — {source.title} (verified{" "}
      <time dateTime={source.verifiedOn}>{source.verifiedOn}</time>)
    </p>
    <p><strong>Evidence:</strong> {sourceEvidenceTierLabel(source.evidenceTier)}</p>
    <blockquote>{source.excerpt}</blockquote>
    {source.url === undefined
      ? null
      : <p><a href={source.url} rel="external noopener">Open the official source</a></p>}
    {source.scope === undefined ? null : <p><strong>Scope note:</strong> {source.scope}</p>}
    <details className="source-note">
      <summary>Receipt details</summary>
      <dl>
        <div><dt>Source version</dt><dd>{source.version}</dd></div>
        <div><dt>Exact line locator</dt><dd><code>{source.locator}</code></dd></div>
        {source.sourceLocator === undefined
          ? null
          : <div><dt>Source document locator</dt><dd><code>{source.sourceLocator}</code></dd></div>}
        <div><dt>Source-line ID</dt><dd><code>{source.id}</code></dd></div>
        <div><dt>Source record ID</dt><dd><code>{source.sourceId}</code></dd></div>
      </dl>
    </details>
  </li>
}

export const HazardClaimSources = ({ payload, sourceLineIds, claimId }: {
  readonly payload: PostcommitScene
  readonly sourceLineIds: readonly string[]
  readonly claimId: string
}) => <details className="feedback-sources">
  <summary>Exact source-line receipts</summary>
  <ul>{sourceLineIds.map((sourceLineId) => <HazardSourceLineReceipt key={`${claimId}:${sourceLineId}`} payload={payload} sourceLineId={sourceLineId} />)}</ul>
</details>
