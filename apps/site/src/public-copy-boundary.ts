export interface PublicCopyDocument {
  readonly path: string
  readonly html: string
}

const removeNoncopyBlocks = (html: string): string => html
  .replace(/<!--([\s\S]*?)-->/g, " ")
  .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")

const decodeCommonEntities = (value: string): string => value
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", "\"")
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")

const removeDetailsBlocks = (html: string): string => {
  const detailTag = /<\s*\/?\s*details\b[^>]*>/gi
  let depth = 0
  let cursor = 0
  let visible = ""
  for (const match of html.matchAll(detailTag)) {
    const index = match.index
    if (depth === 0) visible += html.slice(cursor, index)
    if (/^<\s*\/\s*details\b/i.test(match[0])) {
      depth = Math.max(0, depth - 1)
    } else {
      depth += 1
    }
    cursor = index + match[0].length
  }
  if (depth === 0) visible += html.slice(cursor)
  return visible
}

export const generatedVisibleText = (
  html: string,
  layer: "all" | "default" = "all"
): string => {
  const withoutNoncopy = removeNoncopyBlocks(html)
  const selectedLayer = layer === "default"
    ? removeDetailsBlocks(withoutNoncopy)
    : withoutNoncopy
  return decodeCommonEntities(selectedLayer.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
}

const allVisibleRules = [
  { label: "raw confusion-set label", expression: /\bConfusion-set\s*:/i },
  { label: "raw comparison identifier", expression: /\bcomparison\.[a-z0-9]/i },
  { label: "unexplained tool-tier code", expression: /\bTier\s+(?:A|B|C)(?:\b|\/)/ },
  { label: "unsupported durable-browser promise", expression: /\b(?:answers stay saved|progress and diagnostics stay on this device)\b/i },
  { label: "unsupported until-deleted promise", expression: /\bstays? (?:on this device|in this browser) until you delete it\b/i },
  { label: "false unmatched-marker scoring claim", expression: /\bnot scored as right or wrong\b/i },
  { label: "implementation-first checksum copy", expression: /\bfile carries a checksum\b/i },
  { label: "internal source-receipt copy", expression: /\b(?:source-line|exercise-specific) receipts?\b/i },
  { label: "internal profile-layer copy", expression: /\b(?:announcement|jurisdiction) layers?\b/i },
  { label: "non-U.S. spelling", expression: /\b(?:cancelled|labelled)\b/i }
] as const

const defaultLayerRules = [
  {
    label: "raw evidence-tier code",
    expression: /\b(?:official-primary(?:-synthesis)?|maintained-editorial-synthesis|accepted-release-record)\b/i
  },
  {
    label: "raw content-model identifier",
    expression: /\b(?:claim|source|inventory|marker)[.-][a-z0-9][a-z0-9.-]*\b/i
  },
  {
    label: "raw tool-scope code",
    expression: /\b(?:entry-level-supported|watchlist-or-gated)\b/i
  }
] as const

export const assertGeneratedPublicCopyBoundary = (
  documents: ReadonlyArray<PublicCopyDocument>
): void => {
  for (const document of documents) {
    const allVisibleText = generatedVisibleText(document.html)
    const defaultLayerText = generatedVisibleText(document.html, "default")
    for (const rule of allVisibleRules) {
      if (rule.expression.test(allVisibleText)) {
        throw new Error(`${document.path} exposes ${rule.label}`)
      }
    }
    for (const rule of defaultLayerRules) {
      if (rule.expression.test(defaultLayerText)) {
        throw new Error(`${document.path} exposes ${rule.label} in the default layer`)
      }
    }
  }
}
