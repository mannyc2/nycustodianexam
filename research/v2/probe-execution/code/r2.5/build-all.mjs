import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"

const entries = readdirSync("entries").filter((f) => f.endsWith(".ts")).sort()
for (const file of entries) {
  const out = file.replace(/\.ts$/, "")
  const started = performance.now()
  execFileSync("./node_modules/.bin/vite", ["build", "--logLevel", "error"], {
    env: { ...process.env, PROBE_ENTRY: `entries/${file}`, PROBE_OUT: out },
    stdio: ["ignore", "inherit", "inherit"]
  })
  console.log(`built ${out} in ${Math.round(performance.now() - started)}ms`)
}
