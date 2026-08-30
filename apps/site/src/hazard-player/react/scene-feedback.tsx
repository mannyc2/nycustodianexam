import { hazardFamilyLabel, sourceEvidenceTierLabel } from "../../public-content-labels.ts"
import type { ReleasedPostcommitScene } from "../attempt.ts"
import {
  isCurrentPostcommitScene,
  zonedStatementsForScene,
  type PostcommitScene
} from "../released-scene.ts"

type HeadingTag = "h3" | "h4"

const displayTag = (value: string): string =>
  value.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase())

const SourceLineReceipt = ({
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

const ClaimFeedback = ({
  label,
  payload,
  claimId
}: {
  readonly label: string
  readonly payload: PostcommitScene
  readonly claimId: string
}) => {
  const claim = payload.claims.find((candidate) => candidate.id === claimId)
  if (claim === undefined) {
    return <div><dt>{label}</dt><dd>The released claim is unavailable.</dd></div>
  }

  return <div>
    <dt>{label}</dt>
    <dd>
      <p>{claim.text}</p>
      {claim.caveat === null ? null : <p><strong>Scope note:</strong> {claim.caveat}</p>}
      <details className="feedback-sources">
        <summary>Exact source-line receipts</summary>
        <ul>{claim.sourceLineIds.map((sourceLineId) => <SourceLineReceipt
          key={`${claim.id}:${sourceLineId}`}
          payload={payload}
          sourceLineId={sourceLineId}
        />)}</ul>
      </details>
    </dd>
  </div>
}

const CurrentSceneFacts = ({
  heading,
  payload
}: {
  readonly heading: HeadingTag
  readonly payload: PostcommitScene
}) => {
  const Heading = heading
  return <section aria-label="Scene explanation and evidence">
    <Heading>Scene explanation and evidence</Heading>
    <dl className="feedback-answer-summary">
      <div><dt>Environment</dt><dd>{displayTag(payload.tags.environment)}</dd></div>
      <div><dt>Hazard category</dt><dd>{hazardFamilyLabel(payload.tags.hazardCategory)}</dd></div>
      <div><dt>Series scope</dt><dd>{displayTag(payload.tags.seriesScope)}</dd></div>
      <div><dt>Difficulty</dt><dd>{displayTag(payload.tags.editorialDifficulty)}</dd></div>
    </dl>
    <p><strong>Hazards and how to correct them</strong></p>
    {payload.targets.length === 0
      ? <p>This scene contains no hazard that needs correction.</p>
      : <ol>{payload.targets.map((target) => <li key={target.id}>
          <p><strong>{target.observableCondition}</strong></p>
          <dl>
            <ClaimFeedback
              claimId={target.whyUnsafeClaimId}
              label="Why this is unsafe"
              payload={payload}
            />
            <ClaimFeedback
              claimId={target.likelyConsequenceClaimId}
              label="Likely consequence"
              payload={payload}
            />
            <ClaimFeedback
              claimId={target.immediateCorrectionClaimId}
              label="Immediate correction"
              payload={payload}
            />
          </dl>
          <p>
            <strong>Tags:</strong> Concepts {target.conceptIds.map(displayTag).join(", ")};{" "}
            correction category {displayTag(target.correctionCategory)}.
          </p>
        </li>)}</ol>}
    <p><strong>Details that are safe as shown</strong></p>
    <ol>{payload.decoys.map((decoy) => <li key={decoy.id}>
      <p><strong>{decoy.observableCondition}</strong></p>
      <dl>
        <div><dt>Why it may look suspicious</dt><dd>{decoy.suspiciousBecause}</dd></div>
        <ClaimFeedback
          claimId={decoy.safeAsDepictedClaimId}
          label="Why it is safe as depicted"
          payload={payload}
        />
        <ClaimFeedback
          claimId={decoy.unsafeIfClaimId}
          label="Condition that would make it unsafe"
          payload={payload}
        />
      </dl>
      <p><strong>Tags:</strong> Concepts {decoy.conceptIds.map(displayTag).join(", ")}.</p>
    </li>)}</ol>
    {payload.safeBackground.length === 0 ? null : <>
      <p><strong>Other safe background details</strong></p>
      <ul>{payload.safeBackground.map((detail) => <li
        key={`${detail.zone}:${detail.observableCondition}`}
      ><strong>{detail.zone}:</strong> {detail.observableCondition}</li>)}</ul>
    </>}
  </section>
}

const LegacySceneFacts = ({
  heading,
  payload
}: {
  readonly heading: HeadingTag
  readonly payload: Exclude<ReleasedPostcommitScene, PostcommitScene>
}) => {
  const Heading = heading
  return <>
    <details className="feedback-sources">
      <summary>Where this comes from</summary>
      <p>This older saved result keeps the source format published with its release.</p>
      <ul>{payload.fullPostAnswer.sources.map((source) => <li key={source.id}>
        <a href={source.url} rel="external noopener">{source.title}</a>, {source.locator}. {source.scope}
      </li>)}</ul>
    </details>
    <section aria-label="Historical scene explanation">
      <Heading>Scene explanation</Heading>
      <p>{payload.claim}</p>
      <p><strong>Hazards and how to correct them</strong></p>
      {payload.fullPostAnswer.targets.length === 0
        ? <p>This scene contains no hazard that needs correction.</p>
        : <ul>{payload.fullPostAnswer.targets.map((target) => <li
            key={`${target.condition}:${target.correction}`}
          ><strong>{target.condition}.</strong> {target.correction}.</li>)}</ul>}
      <p><strong>Details that are safe as shown</strong></p>
      <ul>
        {payload.fullPostAnswer.decoys.map((decoy) => <li
          key={`${decoy.condition}:${decoy.safeBecause}`}
        ><strong>{decoy.condition}:</strong> {decoy.safeBecause}.</li>)}
        {payload.fullPostAnswer.safeBackground.map((detail) => <li key={detail}>{detail}</li>)}
      </ul>
    </section>
  </>
}

export const HazardSceneFacts = ({
  heading = "h3",
  payload
}: {
  readonly heading?: HeadingTag
  readonly payload: ReleasedPostcommitScene
}) => isCurrentPostcommitScene(payload)
  ? <CurrentSceneFacts heading={heading} payload={payload} />
  : <LegacySceneFacts heading={heading} payload={payload} />

const roleLabel = (role: "target" | "decoy" | "safe-background"): string => {
  switch (role) {
    case "target": return "Condition needing correction"
    case "decoy": return "Safe detail that may look suspicious"
    case "safe-background": return "Safe background detail"
  }
}

export const HazardPostcommitEquivalent = ({
  heading = "h3",
  payload
}: {
  readonly heading?: HeadingTag
  readonly payload: ReleasedPostcommitScene
}) => {
  const Heading = heading
  const statements = zonedStatementsForScene(payload)
  return <section aria-label="Full scene description by zone">
    <Heading>Full scene description by zone</Heading>
    <p>This covers the same knowledge in text form; it is not the same task as marking the image.</p>
    <ul>{statements.map((statement) => <li
      key={`${statement.zone}:${statement.role}:${statement.statement}`}
    >
      <strong>{statement.zone} — {roleLabel(statement.role)}:</strong> {statement.statement}
    </li>)}</ul>
  </section>
}
