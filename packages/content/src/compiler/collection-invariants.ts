export const firstDuplicate = (values: ReadonlyArray<string>): string | undefined => {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) return value
    seen.add(value)
  }
  return undefined
}

export const sameMembers = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value) => right.includes(value))

export const sameOrderedValues = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const isBlank = (value: string): boolean => value.trim().length === 0
