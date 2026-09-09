/** Render identity for repeated content without using its list position. */
export const keyedContent = <T>(values: ReadonlyArray<T>, identify: (value: T) => string) => {
  const occurrences = new Map<string, number>()
  return values.map(value => {
    const identity = identify(value)
    const occurrence = occurrences.get(identity) ?? 0
    occurrences.set(identity, occurrence + 1)
    return { value, key: JSON.stringify([identity, occurrence]) }
  })
}
