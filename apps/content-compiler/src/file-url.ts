import { isAbsolute, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const scheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/

export const resolveFileUrlWithinRoot = (root: URL, relativePath: string): URL => {
  if (root.protocol !== "file:" || !root.pathname.endsWith("/")) {
    throw new TypeError("Filesystem roots must be file URLs ending in a slash")
  }
  if (
    relativePath.length === 0 ||
    relativePath.startsWith("/") ||
    relativePath.includes("\\") ||
    relativePath.includes("%") ||
    scheme.test(relativePath) ||
    relativePath.split("/").some(
      (segment) => segment.length === 0 || segment === "." || segment === ".."
    )
  ) {
    throw new RangeError(`Path must be a traversal-free relative path: ${relativePath}`)
  }

  const target = new URL(relativePath, root)
  if (target.protocol !== "file:" || target.search.length > 0 || target.hash.length > 0) {
    throw new RangeError(`Path must resolve to a local file: ${relativePath}`)
  }

  const rootPath = resolve(fileURLToPath(root))
  const targetPath = resolve(fileURLToPath(target))
  const relativeTarget = relative(rootPath, targetPath)
  if (
    relativeTarget.length === 0 ||
    relativeTarget === ".." ||
    relativeTarget.startsWith(`..${sep}`) ||
    isAbsolute(relativeTarget)
  ) {
    throw new RangeError(`Path resolves outside its filesystem root: ${relativePath}`)
  }
  return target
}
