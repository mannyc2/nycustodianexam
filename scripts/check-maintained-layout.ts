import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const listedFiles = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { cwd: repositoryRoot, encoding: "utf8" }
)

if (listedFiles.error !== undefined) {
  console.error("Could not inspect the maintained repository layout", listedFiles.error)
  process.exit(1)
}
if (listedFiles.status !== 0) {
  console.error(listedFiles.stderr.trim())
  process.exit(listedFiles.status ?? 1)
}

interface MaintainedPath {
  readonly path: string
  readonly workspaceName?: string
  readonly relativePath: string
  readonly area: "source" | "test" | "browser-test" | "script" | "workflow" | "config"
}

const classifyMaintainedPath = (path: string): MaintainedPath | undefined => {
  if (path.startsWith("scripts/")) {
    return { path, relativePath: path.slice("scripts/".length), area: "script" }
  }
  if (path.startsWith(".github/workflows/")) {
    return {
      path,
      relativePath: path.slice(".github/workflows/".length),
      area: "workflow"
    }
  }

  const visualScriptMatch = /^content\/authoring\/visuals\/(.+\.mjs)$/.exec(path)
  const visualScriptPath = visualScriptMatch?.[1]
  if (visualScriptPath !== undefined) {
    return { path, relativePath: visualScriptPath, area: "script" }
  }

  const workspaceRootMatch = /^(apps|packages)\/([^/]+)\/([^/]+)$/.exec(path)
  if (workspaceRootMatch !== null) {
    const [, , workspaceName, relativePath] = workspaceRootMatch
    if (workspaceName !== undefined && relativePath !== undefined) {
      return { path, workspaceName, relativePath, area: "config" }
    }
  }

  const workspaceMatch = /^(apps|packages)\/([^/]+)\/(src|scripts|test|browser-tests)\/(.+)$/.exec(path)
  if (workspaceMatch === null) return undefined
  const [, workspaceKind, workspaceName, workspaceArea, relativePath] = workspaceMatch
  if (
    workspaceKind === undefined ||
    workspaceName === undefined ||
    workspaceArea === undefined ||
    relativePath === undefined
  ) {
    return undefined
  }
  const area = workspaceArea === "test"
    ? "test"
    : workspaceArea === "browser-tests"
      ? "browser-test"
      : workspaceArea === "scripts"
        ? "script"
        : "source"
  return { path, workspaceName, relativePath, area }
}

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const standardFileNames = new Set([
  "README.md",
  "package.json",
  "playwright.config.ts",
  "tsconfig.json",
  "vite.config.ts",
  "wrangler.jsonc"
])
const ambiguousStems = new Set(["common", "components", "contract", "family", "helpers", "types", "utils"])

const problems: Array<string> = []
let checkedCount = 0
const repositoryFiles = new Set(listedFiles.stdout.split("\n").filter((path) => path.length > 0))

for (const path of repositoryFiles) {
  const maintained = classifyMaintainedPath(path)
  if (maintained === undefined) continue
  checkedCount += 1

  if (
    maintained.workspaceName !== undefined &&
    !kebabCase.test(maintained.workspaceName)
  ) {
    problems.push(`${path}: workspace directory must use lowercase kebab-case`)
  }

  const segments = maintained.relativePath.split("/")
  const fileName = segments.pop()
  if (fileName === undefined) continue
  for (const directory of segments) {
    if (!kebabCase.test(directory)) {
      problems.push(`${path}: directory ${directory} must use lowercase kebab-case`)
    }
  }

  if (!standardFileNames.has(fileName)) {
    const nameSegments = fileName.split(".").slice(0, -1)
    const stem = nameSegments[0]
    const invalidSegment = nameSegments.find((segment) => !kebabCase.test(segment))
    if (stem === undefined || invalidSegment !== undefined) {
      problems.push(`${path}: every file-name segment must use lowercase kebab-case`)
    } else if (ambiguousStems.has(stem)) {
      problems.push(`${path}: ${stem} is ambiguous; name the owned concept instead`)
    }
  }

  if (
    maintained.area === "test" &&
    /\.tsx?$/.test(fileName) &&
    !/\.test\.tsx?$/.test(fileName)
  ) {
    problems.push(`${path}: unit tests must end in .test.ts or .test.tsx`)
  }
  if (
    maintained.area === "browser-test" &&
    /\.tsx?$/.test(fileName) &&
    !/\.pw\.tsx?$/.test(fileName) &&
    !/-fixtures\.tsx?$/.test(fileName)
  ) {
    problems.push(`${path}: browser tests must end in .pw.ts or .pw.tsx`)
  }
  if (
    maintained.area === "source" &&
    fileName.endsWith(".tsx") &&
    !segments.includes("react")
  ) {
    problems.push(`${path}: React source must live below a react directory`)
  }
  if (/^apps\/[^/]+\/src\/.+\/runtime\.ts$/.test(path)) {
    problems.push(`${path}: feature code must import the application runtime directly`)
  }
}

if (problems.length > 0) {
  console.error(`Maintained layout check failed with ${problems.length} problem(s):`)
  for (const problem of problems.sort()) console.error(`- ${problem}`)
  process.exit(1)
}

console.log(`Maintained layout check passed for ${checkedCount} files`)
