export const localFailureDetail = (cause: unknown, fallback: string): string => {
  if (typeof cause === "object" && cause !== null) {
    const detail = (cause as { readonly detail?: unknown }).detail
    if (typeof detail === "string" && detail.length > 0) return detail
    const message = (cause as { readonly message?: unknown }).message
    if (typeof message === "string" && message.length > 0) return message
  }
  return fallback
}

// An error whose message was written for learners and may appear as the primary
// public copy. Anything else is logged internally while the stable fallback is
// shown without publishing the raw detail.
export class LocalActionError extends Error {}

export interface LocalFailureReport {
  readonly message: string
  readonly diagnostic: string | null
}

export const localFailureReport = (cause: unknown, fallback: string): LocalFailureReport => {
  if (cause instanceof LocalActionError) {
    return { message: cause.message, diagnostic: null }
  }
  console.error("Local action failed", cause)
  return { message: fallback, diagnostic: null }
}
