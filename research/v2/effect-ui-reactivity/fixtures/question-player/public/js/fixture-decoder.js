const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value)

export class FixtureDecodeError extends Error {
  constructor(path, message) {
    super(`${path}: ${message}`)
    this.name = "FixtureDecodeError"
    this.path = path
  }
}

export function decodeQuestionFixture(input) {
  if (!isRecord(input)) throw new FixtureDecodeError("$", "expected object")
  for (const key of ["id", "version", "prompt", "options"]) {
    if (!(key in input)) throw new FixtureDecodeError(`$.${key}`, "missing")
  }
  if (typeof input.id !== "string" || input.id.length === 0) {
    throw new FixtureDecodeError("$.id", "expected non-empty string")
  }
  if (typeof input.version !== "string" || input.version.length === 0) {
    throw new FixtureDecodeError("$.version", "expected non-empty string")
  }
  if (typeof input.prompt !== "string" || input.prompt.length === 0) {
    throw new FixtureDecodeError("$.prompt", "expected non-empty string")
  }
  if (!Array.isArray(input.options) || input.options.length < 2) {
    throw new FixtureDecodeError("$.options", "expected at least two options")
  }
  const seen = new Set()
  const options = input.options.map((option, index) => {
    if (!isRecord(option)) throw new FixtureDecodeError(`$.options[${index}]`, "expected object")
    if (typeof option.id !== "string" || option.id.length === 0) {
      throw new FixtureDecodeError(`$.options[${index}].id`, "expected non-empty string")
    }
    if (seen.has(option.id)) throw new FixtureDecodeError(`$.options[${index}].id`, "duplicate")
    seen.add(option.id)
    if (typeof option.label !== "string" || option.label.length === 0) {
      throw new FixtureDecodeError(`$.options[${index}].label`, "expected non-empty string")
    }
    return Object.freeze({ id: option.id, label: option.label })
  })
  return Object.freeze({
    id: input.id,
    version: input.version,
    prompt: input.prompt,
    options: Object.freeze(options)
  })
}
