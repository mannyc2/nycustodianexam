/** Add view intent without changing the saved drill/version coordinates. */
export const hazardReviewPath = (path: string): string => {
  const url = new URL(path, "https://local.invalid")
  url.searchParams.set("review", "1")
  return `${url.pathname}${url.search}${url.hash}`
}
