import type { ReactNode } from "react"
import type { CatalogArtifact } from "@nycustodian/content/model"

type Catalog = typeof CatalogArtifact.Type
type ProfileFact = NonNullable<Catalog["profiles"][number]["announcementFactSheet"]>["facts"][number]
export interface ProfileFactProps {
  readonly fact: ProfileFact
  readonly profileVersion: number
  readonly factSheetVersion: number
  readonly sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>
  readonly sourceById: ReadonlyMap<string, Catalog["sources"][number]>
  readonly sourcePath: (id: string) => string
}

const FactRoot = ({ state, children }: { readonly state: ProfileFact["state"]; readonly children: ReactNode }) => <dd data-fact-state={state}>{children}</dd>
const FactLabel = ({ children }: { readonly children: ReactNode }) => <dt>{children}</dt>
const FactValue = ({ fact }: Pick<ProfileFactProps, "fact">) => <p>{fact.value ?? fact.detail ?? "No value asserted."}</p>
const FactStatus = ({ state, label }: { readonly state: ProfileFact["state"]; readonly label: string }) => <p><span className={`fact-state fact-state-${state}`}>Status: {label}</span></p>
const FactSource = ({ ids, sourceLineById, sourceById, sourcePath }: Omit<ProfileFactProps, "fact" | "profileVersion" | "factSheetVersion"> & { readonly ids: readonly string[] }) => <ul className="link-list">{ids.map(id => {
  const line = sourceLineById.get(id)
  if (line === undefined) throw new Error(`Profile references missing source line ${id}`)
  const source = sourceById.get(line.sourceId)
  if (source === undefined) throw new Error(`Source line ${id} references missing source`)
  return <li key={id}><a href={sourcePath(source.id)}>{source.title}</a><span><code>{line.locator}</code> — {line.excerpt}</span></li>
})}</ul>
const FactVerifiedAt = ({ fact }: Pick<ProfileFactProps, "fact">) => {
  const window = fact.effectiveFrom === null ? "No effective interval asserted." : fact.effectiveThrough === null ? `Effective from ${fact.effectiveFrom}.` : `Effective ${fact.effectiveFrom} through ${fact.effectiveThrough}.`
  return <p className="source-note">{`Exam ${fact.appliesToExamNumbers.join(", ")} · reviewed ${fact.reviewedOn} · ${window}`}</p>
}
const FactProfileVersion = ({ fact, profileVersion, factSheetVersion }: Pick<ProfileFactProps, "fact" | "profileVersion" | "factSheetVersion">) => <details className="source-note"><summary>Technical details</summary><p>{`Profile version ${profileVersion} · fact-sheet version ${factSheetVersion}.`}{fact.supersededByFactId === null ? null : <> Replaced by fact <code>{fact.supersededByFactId}</code>.</>}</p></details>

export const Fact = { Root: FactRoot, Label: FactLabel, Value: FactValue, Status: FactStatus, Source: FactSource, VerifiedAt: FactVerifiedAt, ProfileVersion: FactProfileVersion } as const

const FactRecord = ({ status, ...props }: ProfileFactProps & { readonly status: ReactNode }) => <>
  <Fact.Label>{props.fact.label}</Fact.Label>
  <Fact.Root state={props.fact.state}>
    {status}
    <Fact.Value fact={props.fact} />
    {props.fact.conflictingValues.length === 0 ? null : <ol className="link-list">{props.fact.conflictingValues.map((candidate) => <li key={JSON.stringify([candidate.value, candidate.sourceLineIds])}><strong>{candidate.value}</strong><Fact.Source {...props} ids={candidate.sourceLineIds} /></li>)}</ol>}
    {props.fact.sourceLineIds.length === 0 ? null : <Fact.Source {...props} ids={props.fact.sourceLineIds} />}
    <Fact.VerifiedAt fact={props.fact} />
    <Fact.ProfileVersion {...props} />
  </Fact.Root>
</>

export const VerifiedFact = (props: ProfileFactProps) => <FactRecord {...props} status={<Fact.Status state="verified" label="Verified" />} />
export const NotPublishedFact = (props: ProfileFactProps) => <FactRecord {...props} status={<Fact.Status state="not_published" label="Not published" />} />
export const UnverifiedFact = (props: ProfileFactProps) => <FactRecord {...props} status={<Fact.Status state="unverified" label="Unverified" />} />
export const ConflictingFact = (props: ProfileFactProps) => <FactRecord {...props} status={<Fact.Status state="conflicting" label="Conflicting" />} />
export const SupersededFact = (props: ProfileFactProps) => <FactRecord {...props} status={<Fact.Status state="superseded" label="Superseded" />} />
export const NotApplicableFact = (props: ProfileFactProps) => <FactRecord {...props} status={<Fact.Status state="not_applicable" label="Not applicable" />} />
export const ProfileFactView = (props: ProfileFactProps) => {
  switch (props.fact.state) {
    case "verified": return <VerifiedFact {...props} />
    case "not_published": return <NotPublishedFact {...props} />
    case "unverified": return <UnverifiedFact {...props} />
    case "conflicting": return <ConflictingFact {...props} />
    case "superseded": return <SupersededFact {...props} />
    case "not_applicable": return <NotApplicableFact {...props} />
  }
}
