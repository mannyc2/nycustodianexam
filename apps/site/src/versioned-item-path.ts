/** Historical documents retain the original receipt coordinates under a versioned prefix. */
export const matchesVersionedItemPath = (
  path: string,
  canonical: string,
  receipt: { readonly releaseId: string; readonly packVersion: number }
): boolean => path === canonical || path === `/history/${receipt.releaseId}-v${receipt.packVersion}${canonical}`
