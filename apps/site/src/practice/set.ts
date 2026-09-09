/** Versioned, answer-free identity for a generated practice set. */
export const practiceSetAlgorithm = "pb1"
export const practiceSetSeedLimit = 128

export interface PracticeSetSpec {
  readonly seed: string
  readonly categories: ReadonlyArray<string>
  readonly length: number
}

export interface PracticeSetItem {
  readonly id: string
  readonly category: string
}

// Encode UTF-16 code units explicitly: stable in browsers and the build runtime,
// including lone surrogates. No locale, random source, or browser storage needed.
const encodeSeed = (seed: string): string => {
  let output = ""
  for (let index = 0; index < seed.length; index += 1) {
    output += seed.charCodeAt(index).toString(16).padStart(4, "0")
  }
  return output
}

const decodeSeed = (encoded: string): string | undefined => {
  if (!/^(?:[a-f0-9]{4}){1,128}$/.test(encoded)) return undefined
  let seed = ""
  for (let index = 0; index < encoded.length; index += 4) {
    seed += String.fromCharCode(Number.parseInt(encoded.slice(index, index + 4), 16))
  }
  return seed
}

const canonicalCategories = (categories: ReadonlyArray<string>): string[] =>
  [...categories].sort()

/** A complete identity: category order does not change the chosen set. */
export const practiceSetId = (spec: PracticeSetSpec, availableCategories: ReadonlyArray<string>): string => {
  const categories = canonicalCategories(availableCategories)
  if (new Set(categories).size !== categories.length || categories.length > 30 || categories.length === 0) {
    throw new Error("Practice categories must be unique and bounded")
  }
  const selected = new Set(spec.categories)
  const seed = spec.seed.trim()
  if (selected.size !== spec.categories.length || selected.size === 0 ||
    spec.categories.some((category) => !categories.includes(category))) {
    throw new Error("Choose unique categories from the released practice inventory")
  }
  if (seed.length === 0 || seed.length > practiceSetSeedLimit ||
    !Number.isSafeInteger(spec.length) || spec.length <= 0) {
    throw new Error("Choose a positive set length and a bounded, non-empty set code")
  }
  const mask = categories.reduce((value, category, index) =>
    selected.has(category) ? value + 2 ** index : value, 0)
  return `${practiceSetAlgorithm}.${mask.toString(16)}.${spec.length}.${encodeSeed(seed)}`
}

export const parsePracticeSetId = (
  id: string,
  availableCategories: ReadonlyArray<string>
): PracticeSetSpec | undefined => {
  if (id.length > 550) return undefined
  const match = /^pb1\.([a-f0-9]+)\.([1-9][0-9]*)\.([a-f0-9]+)$/.exec(id)
  if (match === null) return undefined
  const seed = decodeSeed(match[3]!)
  const mask = Number.parseInt(match[1]!, 16)
  const categories = canonicalCategories(availableCategories)
  const length = Number(match[2])
  if (seed === undefined || !Number.isSafeInteger(mask) || mask <= 0 ||
    mask >= 2 ** categories.length) return undefined
  const spec = { seed, length, categories: categories.filter((_, index) => (mask & 2 ** index) !== 0) }
  try {
    return practiceSetId(spec, categories) === id ? spec : undefined
  } catch {
    return undefined
  }
}

const hash = (value: string): number => {
  let state = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    state = Math.imul(state ^ value.charCodeAt(index), 0x01000193)
  }
  return state >>> 0
}

/**
 * Only released item IDs and safe categories enter selection. Receipts and
 * postcommit payloads remain outside this calculation. Never pads or truncates
 * an invalid request; the caller must present an explicit replacement choice.
 */
export const selectPracticeSet = <T extends PracticeSetItem>(
  inventory: ReadonlyArray<T>,
  releaseId: string,
  spec: PracticeSetSpec
): { readonly id: string; readonly items: ReadonlyArray<T> } => {
  if (new Set(inventory.map(({ id }) => id)).size !== inventory.length) {
    throw new Error("Practice inventory contains duplicate item IDs")
  }
  const categories = [...new Set(inventory.map(({ category }) => category))]
  const id = practiceSetId(spec, categories)
  const items = inventory.filter(({ category }) => spec.categories.includes(category))
    .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
  if (spec.length > items.length) {
    throw new Error(`Choose a replacement length: only ${items.length} unique items match`)
  }
  let state = hash(JSON.stringify([releaseId, id]))
  for (let index = items.length - 1; index > 0; index -= 1) {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    const target = Math.floor(((value ^ (value >>> 14)) >>> 0) / 4_294_967_296 * (index + 1))
    ;[items[index], items[target]] = [items[target]!, items[index]!]
  }
  return { id, items: items.slice(0, spec.length) }
}
