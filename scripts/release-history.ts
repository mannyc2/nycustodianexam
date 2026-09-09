import historicalV3 from "../content/authoring/compatibility/launch-v1-v3-review.json"
import historicalV4 from "../content/authoring/compatibility/launch-v1-v4-review.json"

/** Current release entries already have canonical routes and registry keys. */
export const previousReleaseInventories = (current: { readonly releaseId: string; readonly packVersion: number }) =>
  [historicalV3, historicalV4].filter(archive =>
    archive.releaseId === current.releaseId && archive.packVersion < current.packVersion)
