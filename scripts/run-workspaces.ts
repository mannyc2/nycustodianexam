import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const command = process.argv[2]
if (command !== "test" && command !== "typecheck") {
  console.error("run-workspaces requires either test or typecheck")
  process.exit(2)
}

const workspaces = ["packages/content", "apps/content-compiler", "apps/site"] as const
const repositoryRoot = new URL("../", import.meta.url)

for (const workspace of workspaces) {
  const result = spawnSync("bun", ["run", command], {
    cwd: fileURLToPath(new URL(`${workspace}/`, repositoryRoot)),
    stdio: "inherit"
  })
  if (result.error !== undefined) {
    console.error(`${workspace} ${command} could not start`, result.error)
    process.exit(1)
  }
  if (result.status !== 0) {
    const exitCode = result.status ?? 1
    console.error(`${workspace} ${command} failed with exit code ${exitCode}`)
    process.exit(exitCode)
  }
}

console.log(`${command} passed in ${workspaces.length} workspaces`)
