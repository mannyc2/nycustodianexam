/** Stable render identity for authored prose, including repeated observations. */
export const keyedQuestionObservations = (observations: ReadonlyArray<string>) => {
  const occurrences = new Map<string, number>()
  return observations.map(text => {
    const occurrence = occurrences.get(text) ?? 0
    occurrences.set(text, occurrence + 1)
    return { text, key: JSON.stringify([text, occurrence]) }
  })
}
