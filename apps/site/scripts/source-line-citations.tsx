import type { CatalogArtifact } from "@nycustodian/content/model"

type Catalog = typeof CatalogArtifact.Type

export interface SourceLineCitationsProps {
  readonly ids: readonly string[]
  readonly sourceLineById: ReadonlyMap<string, Catalog["sourceLines"][number]>
  readonly sourceById: ReadonlyMap<string, Catalog["sources"][number]>
  readonly sourcePath: (id: string) => string
}

export const SourceLineCitations = ({ ids, sourceLineById, sourceById, sourcePath }: SourceLineCitationsProps) => <ul className="link-list">{ids.map(id => {
  const line = sourceLineById.get(id)
  if (line === undefined) throw new Error(`Profile references missing source line ${id}`)
  const source = sourceById.get(line.sourceId)
  if (source === undefined) throw new Error(`Source line ${id} references missing source`)
  return <li key={id}><a href={sourcePath(source.id)}>{source.title}</a><span><code>{line.locator}</code> — {line.excerpt}</span></li>
})}</ul>
