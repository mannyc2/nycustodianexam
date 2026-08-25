import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const internalRoots = [
  join(repositoryRoot, "packages/content/src/model"),
  join(repositoryRoot, "packages/content/src/compiler")
]
const siteSourceRoot = join(repositoryRoot, "apps/site/src")
const appDatabaseFacadePath = join(siteSourceRoot, "study-storage/app-database.ts")
const appDatabaseInternalRoot = join(siteSourceRoot, "study-storage/app-database")
const facadeImport = /from\s+["'](?:(?:\.\.\/)+(?:compiler|model)\.ts|@nycustodian\/content\/(?:compiler|model))["']/g
const appDatabaseFacadeImport = /from\s+["'](?:\.\.\/)+app-database\.ts["']/g
const moduleSpecifierImport = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g
const reactModuleImport = /from\s+["'][^"']+\.tsx["']/g
const indexedDbFactoryReference = /\bindexedDB\b/g

const isInside = (root: string, path: string): boolean => {
  const child = relative(root, path)
  return child.length > 0 && child !== ".." && !child.startsWith(`..${sep}`)
}

const sourceFiles: Array<string> = []
const collectTypeScript = (directory: string): void => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collectTypeScript(path)
    else if (entry.isFile() && entry.name.endsWith(".ts")) sourceFiles.push(path)
  }
}

for (const root of internalRoots) collectTypeScript(root)

const problems: Array<string> = []
for (const path of sourceFiles) {
  const source = readFileSync(path, "utf8")
  for (const match of source.matchAll(facadeImport)) {
    const line = source.slice(0, match.index ?? 0).split("\n").length
    problems.push(
      `${relative(repositoryRoot, path)}:${line}: internal modules must import their narrower owner, not a public facade`
    )
  }
}

const siteSourceFiles: Array<string> = []
const collectSiteSource = (directory: string): void => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collectSiteSource(path)
    else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) siteSourceFiles.push(path)
  }
}
collectSiteSource(siteSourceRoot)

for (const path of siteSourceFiles) {
  const source = readFileSync(path, "utf8")
  if (isInside(appDatabaseInternalRoot, path)) {
    for (const match of source.matchAll(appDatabaseFacadeImport)) {
      const line = source.slice(0, match.index ?? 0).split("\n").length
      problems.push(
        `${relative(repositoryRoot, path)}:${line}: app-database internals must import their narrower owner, not the public facade`
      )
    }
  }
  if (path !== appDatabaseFacadePath && !isInside(appDatabaseInternalRoot, path)) {
    for (const match of source.matchAll(moduleSpecifierImport)) {
      const specifier = match[1]
      if (specifier === undefined || !specifier.startsWith(".")) continue
      const target = resolve(dirname(path), specifier)
      if (target !== appDatabaseInternalRoot && !isInside(appDatabaseInternalRoot, target)) {
        continue
      }
      const line = source.slice(0, match.index ?? 0).split("\n").length
      problems.push(
        `${relative(repositoryRoot, path)}:${line}: import AppDatabase through study-storage/app-database.ts, not its private internals`
      )
    }
  }
  if (path.endsWith(".ts")) {
    for (const match of source.matchAll(reactModuleImport)) {
      const line = source.slice(0, match.index ?? 0).split("\n").length
      problems.push(
        `${relative(repositoryRoot, path)}:${line}: renderer-neutral TypeScript must not import a React .tsx adapter`
      )
    }
  }
  if (path !== appDatabaseFacadePath && !isInside(appDatabaseInternalRoot, path)) {
    for (const match of source.matchAll(indexedDbFactoryReference)) {
      const line = source.slice(0, match.index ?? 0).split("\n").length
      problems.push(
        `${relative(repositoryRoot, path)}:${line}: only the study-storage/app-database owner may access the global IndexedDB factory`
      )
    }
  }
}

if (problems.length > 0) {
  console.error(`Module boundary check failed with ${problems.length} problem(s):`)
  for (const problem of problems.sort()) console.error(`- ${problem}`)
  process.exit(1)
}

console.log(
  `Module boundary check passed for ${sourceFiles.length + siteSourceFiles.length} modules`
)
