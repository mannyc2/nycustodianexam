export const localFailureDetail = (cause: unknown, fallback: string): string => {
  if (typeof cause === "object" && cause !== null) {
    const detail = (cause as { readonly detail?: unknown }).detail
    if (typeof detail === "string" && detail.length > 0) return detail
    const message = (cause as { readonly message?: unknown }).message
    if (typeof message === "string" && message.length > 0) return message
  }
  return fallback
}
