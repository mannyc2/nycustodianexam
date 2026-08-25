const expectedBun = "1.4.0"
const expectedNode = "v22.22.0"
const actualBun = Bun.version
const allowUnsupported = process.env.NYCUSTODIAN_ALLOW_UNSUPPORTED_BUN === "1"

if (actualBun !== expectedBun && !allowUnsupported) {
  console.error(
    `Expected Bun ${expectedBun}, received ${actualBun}. ` +
      "Set NYCUSTODIAN_ALLOW_UNSUPPORTED_BUN=1 only for a deliberate local compatibility check."
  )
  process.exit(1)
}

const nodeVersion = Bun.spawnSync(["node", "--version"])
const actualNode = new TextDecoder().decode(nodeVersion.stdout).trim()
const allowUnsupportedNode = process.env.NYCUSTODIAN_ALLOW_UNSUPPORTED_NODE === "1"

if ((nodeVersion.exitCode !== 0 || actualNode !== expectedNode) && !allowUnsupportedNode) {
  const detail = nodeVersion.exitCode === 0 && actualNode.length > 0
    ? actualNode
    : "an unavailable Node executable"
  console.error(
    `Expected Node ${expectedNode.slice(1)}, received ${detail}. ` +
      "Set NYCUSTODIAN_ALLOW_UNSUPPORTED_NODE=1 only for a deliberate local compatibility check."
  )
  process.exit(1)
}

console.log(
  `toolchain ok: bun ${actualBun}${allowUnsupported ? " (override)" : ""}; ` +
    `node ${actualNode.replace(/^v/, "")}${allowUnsupportedNode ? " (override)" : ""}`
)
