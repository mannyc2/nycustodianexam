/* PLAN_009_METADATA_START
{
  "status": "provisional-prework",
  "participantEvidence": "none",
  "humanEvidence": "none",
  "notHumanUsabilityTested": true,
  "decisionStatus": "pending",
  "requiredDependencyShas": null,
  "mustRebaseAndReverify": true,
  "productionAuthorization": false,
  "authorizationInterface": "CODEX-ONLY-UIUX-V1",
  "observedAtSha": "9fc7dcacfc961752e5d9a2cedbc426deead54a05"
}
PLAN_009_METADATA_END */

import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { lstat, readFile } from "node:fs/promises"
import { posix, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const observedAtSha = "9fc7dcacfc961752e5d9a2cedbc426deead54a05"
const planPath = "plans/009-consumer-ui-migration-plan.draft.md"
const mapPath = "plans/009-consumer-ui-current-file-map.json"
const validatorPath = "plans/validate-009-migration-draft.mjs"
const packetPaths = [mapPath, planPath, validatorPath]
const indexPath = "plans/README.md"

const requiredMetadata = Object.freeze({
  status: "provisional-prework",
  participantEvidence: "none",
  humanEvidence: "none",
  notHumanUsabilityTested: true,
  decisionStatus: "pending",
  requiredDependencyShas: null,
  mustRebaseAndReverify: true,
  productionAuthorization: false,
  authorizationInterface: "CODEX-ONLY-UIUX-V1",
  observedAtSha
})

const requiredAreas = [
  "component",
  "route",
  "state",
  "stylesheet",
  "content",
  "test",
  "build",
  "accessibility",
  "offline",
  "print",
  "deployment"
]

const requiredDependencyIds = [
  "consumer-language",
  "task-navigation",
  "consumer-visual-system",
  "ui-foundations-responsive-contract",
  "integrated-consumer-validation",
  "parallel-step-04-source-inventory",
  "rollout-feature-flag-decision",
  "observability-privacy-decision",
  "production-authorization-evidence"
]

const requiredDependencyContracts = Object.freeze({
  "consumer-language": Object.freeze({
    sourcePlan: "plans/004-establish-consumer-language-boundary.md",
    purpose: "accepted consumer vocabulary, copy ownership, and internal-wording disposition",
    canonicalConsumers: Object.freeze(["product/CONTENT_DESIGN.md"]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/CONTENT_DESIGN.md` plus assigned production copy owners",
    markdownDisposition: "Repository-attested Codex decision, merge/artifact coordinates, independent Codex review, and CI"
  }),
  "task-navigation": Object.freeze({
    sourcePlan: "plans/005-rebuild-learner-task-navigation.md",
    purpose: "accepted learner-task hierarchy, labels, route relationships, and navigation behavior",
    canonicalConsumers: Object.freeze([
      "product/ROUTES.md",
      "product/SCREEN_STATES.md",
      "product/COMPONENT_ARCHITECTURE.md",
      "product/DESIGN_SYSTEM.md"
    ]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/ROUTES.md`, `product/SCREEN_STATES.md`, `product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md`",
    markdownDisposition: "Accepted hierarchy, labels, route behavior, and merge/artifact coordinates"
  }),
  "consumer-visual-system": Object.freeze({
    sourcePlan: "plans/006-select-consumer-visual-system.md",
    purpose: "accepted visual territory and token contract",
    canonicalConsumers: Object.freeze(["product/DESIGN_SYSTEM.md"]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/DESIGN_SYSTEM.md`",
    markdownDisposition: "Accepted visual territory, token contract, and merge/artifact coordinates"
  }),
  "ui-foundations-responsive-contract": Object.freeze({
    sourcePlan: "plans/007-specify-ui-foundations-and-responsive-contract.md",
    purpose: "accepted component anatomy, route archetypes, responsive behavior, and authoritative migration ordering",
    canonicalConsumers: Object.freeze(["product/COMPONENT_ARCHITECTURE.md", "product/DESIGN_SYSTEM.md"]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/COMPONENT_ARCHITECTURE.md` and `product/DESIGN_SYSTEM.md`",
    markdownDisposition: "Accepted anatomy, route archetypes, responsive rules, migration map, and coordinates"
  }),
  "integrated-consumer-validation": Object.freeze({
    sourcePlan: "plans/008-run-integrated-consumer-ux-validation.md",
    purpose: "accepted integrated journey, accessibility, and conditional rollout evidence",
    canonicalConsumers: Object.freeze([
      "product/CONTENT_DESIGN.md",
      "product/ROUTES.md",
      "product/COMPONENT_ARCHITECTURE.md",
      "product/DESIGN_SYSTEM.md"
    ]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/CONTENT_DESIGN.md`, `product/ROUTES.md`, `product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md` plus final retained validation evidence",
    markdownDisposition: "Acceptable implementation disposition, zero unresolved critical failures, every condition assigned, and exact coordinates"
  }),
  "parallel-step-04-source-inventory": Object.freeze({
    sourcePlan: null,
    purpose: "exact source-string, component, selector, route, and generated-output inventory produced in parallel",
    canonicalConsumers: Object.freeze([planPath, mapPath]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "This plan and the current-file map",
    markdownDisposition: "Exact merged commit, complete path/string/selector assignment, drift reconciliation"
  }),
  "rollout-feature-flag-decision": Object.freeze({
    sourcePlan: null,
    purpose: "optional accepted decision only if the current no-runtime-flag hard cut is replaced",
    canonicalConsumers: Object.freeze([]),
    coordinateKind: "optional-git-decision",
    markdownConsumer: "Release section of the final plan",
    markdownDisposition: "Optional Git decision only if the current no-runtime-flag hard cut is replaced"
  }),
  "observability-privacy-decision": Object.freeze({
    sourcePlan: null,
    purpose: "optional accepted privacy and retention decision only if remote observability is proposed",
    canonicalConsumers: Object.freeze([]),
    coordinateKind: "optional-git-decision",
    markdownConsumer: "Observability section of the final plan",
    markdownDisposition: "Optional Git decision only if remote measurement or logging is proposed"
  }),
  "production-authorization-evidence": Object.freeze({
    sourcePlan: null,
    purpose: "post-graduation candidate-bound CI certification and protected deployment-control evidence; this remains null when Plan 009 becomes executable and no Git SHA is assumed",
    canonicalConsumers: Object.freeze(["docs/certification/production-v1.json"]),
    coordinateKind: "technical-deployment-evidence",
    markdownConsumer: "Protected environment and candidate-bound certification",
    markdownDisposition: "Post-graduation release gate; remains null when Plan 009 becomes executable and is populated only after candidate certification"
  })
})

const expectedOriginUrl = "https://github.com/mannyc2/nycustodianexam"

let activeCodexReviewEntries = Object.freeze([])

const requiredCodexReviewTasks = Object.freeze([
  Object.freeze({
    taskId: "/root/topology_fact_check",
    reviewOccurrenceId: "codex-only-uiux-v1-topology-final",
    reviewKind: "topology-and-source-fact-check"
  }),
  Object.freeze({
    taskId: "/root/final_packet_consistency",
    reviewOccurrenceId: "codex-only-uiux-v1-consistency-final",
    reviewKind: "packet-consistency-and-contract-review"
  }),
  Object.freeze({
    taskId: "/root/validator_quality_review",
    reviewOccurrenceId: "codex-only-uiux-v1-validator-final",
    reviewKind: "validator-integrity-review"
  })
])

const criticalAnchors = [
  "product/FEATURE_SPEC.md",
  "product/ARCHITECTURE_CONSTRAINTS.md",
  "product/ROUTES.md",
  "product/SCREEN_STATES.md",
  "product/COMPONENT_ARCHITECTURE.md",
  "product/DESIGN_SYSTEM.md",
  "docs/FACTBASE.md",
  "docs/SCOPE.md",
  "docs/TAXONOMY.md",
  "docs/OPEN.md",
  "illustration/VISUAL_AUTHORING_POLICY.md",
  "apps/site/src/route-registry.ts",
  "apps/site/scripts/generate-pages.tsx",
  "apps/site/vite.config.ts",
  "apps/site/src/asset-router.ts",
  "apps/site/src/styles.css",
  "apps/site/src/settings/preferences-boot.ts",
  "apps/site/src/screen/store.ts",
  "apps/site/src/app-runtime.ts",
  "apps/site/src/verified-content.ts",
  "apps/site/src/attempt-receipt.ts",
  "apps/site/src/trusted-release-content.ts",
  "apps/site/src/delivery-manifest.ts",
  "apps/site/src/session-navigation.ts",
  "apps/site/src/study-storage/app-database/storage-model.ts",
  "apps/site/src/question-player/persistence.ts",
  "apps/site/src/question-player/commit-and-reveal.ts",
  "apps/site/src/question-player/react/player.tsx",
  "apps/site/src/hazard-player/persistence.ts",
  "apps/site/src/hazard-player/commit-and-reveal.ts",
  "apps/site/src/hazard-player/react/player.tsx",
  "apps/site/src/hazard-player/react/bootstrap.tsx",
  "apps/site/src/review/model.ts",
  "apps/site/src/review/persistence.ts",
  "apps/site/src/review/projection.ts",
  "apps/site/src/review/react/review-queue.tsx",
  "apps/site/src/simulation/model.ts",
  "apps/site/src/simulation/persistence.ts",
  "apps/site/src/simulation/react/bootstrap-player.tsx",
  "apps/site/src/simulation/react/player.tsx",
  "apps/site/src/simulation/react/results.tsx",
  "apps/site/src/settings-runtime.ts",
  "apps/site/src/settings/persistence.ts",
  "apps/site/src/settings/review-rebuild.ts",
  "apps/site/src/settings/react/bootstrap.tsx",
  "apps/site/src/offline-pack-runtime.ts",
  "apps/site/src/offline-packs/react/bootstrap.tsx",
  "apps/site/src/offline-packs/react/pack-manager.tsx",
  "apps/site/src/correction-runtime.ts",
  "apps/site/src/corrections/client.ts",
  "apps/site/src/corrections/persistence.ts",
  "apps/site/src/corrections/react/bootstrap.tsx",
  "apps/site/public/sw.js",
  "apps/site/src/print/workflow.ts",
  "apps/site/src/print/persistence.ts",
  "apps/site/src/print/react/builder-bootstrap.tsx",
  "apps/site/src/print/react/preview-bootstrap.tsx",
  "content/authoring/packs/launch-v1.curated.mjs",
  "packages/content/src/model.ts",
  "packages/content/src/compiler.ts",
  "apps/content-compiler/src/main.ts",
  "package.json",
  "bun.lock",
  "scripts/verify-artifacts.ts",
  "apps/site/playwright.config.ts",
  "apps/site/browser-tests/accessibility-and-presentation.pw.ts",
  "apps/site/browser-tests/delivery.pw.ts",
  "apps/site/browser-tests/question-player.pw.ts",
  "apps/site/browser-tests/hazard-player.pw.ts",
  "apps/site/browser-tests/review-queue.pw.ts",
  "apps/site/browser-tests/simulation.pw.ts",
  "apps/site/browser-tests/settings-review-rebuild.pw.ts",
  "apps/site/browser-tests/app-database.pw.ts",
  "apps/site/browser-tests/offline-and-update.pw.ts",
  "apps/site/browser-tests/print.pw.ts",
  "docs/DEPLOYMENT.md",
  "docs/certification/production-v1.json",
  "scripts/check-production-certification.ts",
  ".github/workflows/certification.yml",
  ".github/workflows/cloudflare-preview.yml",
  ".github/workflows/cloudflare-production.yml",
  "apps/site/wrangler.jsonc",
  "packages/correction-intake/src/model.ts",
  "apps/correction-worker/src/worker.ts",
  "apps/correction-worker/wrangler.jsonc"
]

const allowedAuthorities = new Set([
  "maintained-authority",
  "production-source",
  "content-source",
  "build-release",
  "test-evidence",
  "release-gate"
])

const exactDisclaimer = "This packet is provisional prework only. It is not a final migration plan, an accepted upstream decision, implementation authorization, or production authorization."

const requiredPlanSections = [
  "## Status and use boundary",
  "## Current production topology at the observed baseline",
  "## Dependency and decision slots",
  "## Codex-only authorization and review evidence",
  "## Contract adoption procedure after Steps 02–05 land",
  "## Provisional hard-cut mechanics",
  "## Provisional eight-tranche dependency order",
  "## Cross-tranche test and certification strategy",
  "## Accessibility and performance budgets",
  "## Offline and state migration contract",
  "## Anti-AI-slop and internal-wording removal gates",
  "## Analytics, observability, and rollout evidence",
  "## Ownership slots",
  "## Risk and rollback matrix",
  "## Explicit production stop conditions",
  "## Non-goals",
  "## Rebase, reverify, and graduation checklist",
  "## Validation for this provisional packet"
]

const requiredTrancheLabels = [
  "**Contract slots:**",
  "**Scope:**",
  "**Preserved invariant:**",
  "**Review slice:**",
  "**Verification:**",
  "**Rollback boundary:**",
  "**STOP conditions:**"
]

const forbiddenStateValues = new Set([
  "accepted",
  "approved",
  "authorized",
  "certified",
  "complete",
  "completed",
  "done",
  "final",
  "implementation-authorized",
  "production-authorized",
  "production-ready"
])

const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const assertObject = (value, label) => {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`)
}

const assertExactKeys = (value, expected, label) => {
  assertObject(value, label)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  assert(
    JSON.stringify(actual) === JSON.stringify(wanted),
    `${label} keys differ: expected ${wanted.join(", ")}; received ${actual.join(", ")}`
  )
}

const assertNonEmptyString = (value, label) => {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`)
}

const readUtf8 = (path) => readFile(resolve(repositoryRoot, path), "utf8")

const git = (arguments_, { allowFailure = false } = {}) => {
  const result = spawnSync("git", arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  })
  if (result.error !== undefined) throw result.error
  if (!allowFailure && result.status !== 0) {
    throw new Error(`git ${arguments_.join(" ")} failed: ${result.stderr.trim() || `exit ${result.status}`}`)
  }
  return result
}

const nulPaths = (output) => output.split("\0").filter((path) => path.length > 0)

const parseJsonNoDuplicateKeys = (source, label) => {
  let cursor = 0

  const fail = (message) => {
    throw new Error(`${label} is not valid JSON: ${message} at offset ${cursor}`)
  }

  const skipWhitespace = () => {
    while (/[ \t\n\r]/u.test(source[cursor] ?? "")) cursor += 1
  }

  const parseString = () => {
    assert(source[cursor] === '"', `${label} JSON parser expected a string at offset ${cursor}`)
    const start = cursor
    cursor += 1
    while (cursor < source.length) {
      const character = source[cursor]
      if (character === '"') {
        cursor += 1
        try {
          return JSON.parse(source.slice(start, cursor))
        } catch (cause) {
          fail(cause instanceof Error ? cause.message : String(cause))
        }
      }
      if (character === "\\") {
        cursor += 2
      } else {
        cursor += 1
      }
    }
    fail("unterminated string")
  }

  const parseValue = () => {
    skipWhitespace()
    const character = source[cursor]
    if (character === "{") {
      cursor += 1
      skipWhitespace()
      const value = Object.create(null)
      const keys = new Set()
      if (source[cursor] === "}") {
        cursor += 1
        return value
      }
      while (cursor < source.length) {
        skipWhitespace()
        if (source[cursor] !== '"') fail("object key must be a string")
        const key = parseString()
        if (keys.has(key)) throw new Error(`${label} contains duplicate JSON key ${JSON.stringify(key)}`)
        assert(!["__proto__", "constructor", "prototype"].includes(key), `${label} contains forbidden JSON key ${JSON.stringify(key)}`)
        keys.add(key)
        skipWhitespace()
        if (source[cursor] !== ":") fail("object key must be followed by a colon")
        cursor += 1
        const entry = parseValue()
        Object.defineProperty(value, key, { configurable: true, enumerable: true, value: entry, writable: true })
        skipWhitespace()
        if (source[cursor] === "}") {
          cursor += 1
          return value
        }
        if (source[cursor] !== ",") fail("object entries must be comma-separated")
        cursor += 1
      }
      fail("unterminated object")
    }
    if (character === "[") {
      cursor += 1
      skipWhitespace()
      const value = []
      if (source[cursor] === "]") {
        cursor += 1
        return value
      }
      while (cursor < source.length) {
        value.push(parseValue())
        skipWhitespace()
        if (source[cursor] === "]") {
          cursor += 1
          return value
        }
        if (source[cursor] !== ",") fail("array entries must be comma-separated")
        cursor += 1
      }
      fail("unterminated array")
    }
    if (character === '"') return parseString()
    for (const [literal, value] of [["true", true], ["false", false], ["null", null]]) {
      if (source.startsWith(literal, cursor)) {
        cursor += literal.length
        return value
      }
    }
    const number = source.slice(cursor).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/u)?.[0]
    if (number !== undefined) {
      cursor += number.length
      return Number(number)
    }
    fail("unexpected token")
  }

  const value = parseValue()
  skipWhitespace()
  if (cursor !== source.length) fail("unexpected trailing input")
  return value
}

const parseMarkedMetadata = (source, label) => {
  const starts = [...source.matchAll(/^[^\S\r\n]*(?:<!--|\/\*) PLAN_009_METADATA_START[^\S\r\n]*$/gmu)]
  const ends = [...source.matchAll(/^[^\S\r\n]*PLAN_009_METADATA_END (?:-->|\*\/)[^\S\r\n]*$/gmu)]
  assert(starts.length === 1, `${label} must contain exactly one metadata start marker; found ${starts.length}`)
  assert(ends.length === 1, `${label} must contain exactly one metadata end marker; found ${ends.length}`)
  assert(ends[0].index > starts[0].index, `${label} metadata markers are out of order`)
  const jsonStart = source.indexOf("\n", starts[0].index) + 1
  return parseJsonNoDuplicateKeys(source.slice(jsonStart, ends[0].index).trim(), `${label} metadata`)
}

const visibleMarkdown = (source) => {
  const hiddenStructuralPattern = /^(?: {0,3}#{1,6}\s| {0,3}\|| {0,3}\*\*(?:Scope|Preserved invariant|Contract-adoption slots|Implementation surface|Verification|Rollback boundary|Stop before next tranche if):\*\*)/u
  const stripContainers = (line) => {
    let current = line
    while (true) {
      const next = current
        .replace(/^ {0,3}>[ \t]?/u, "")
        .replace(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/u, "")
      if (next === current) return current
      current = next
    }
  }
  const assertNoHiddenStructure = (hidden, label) => {
    for (const line of hidden.split("\n")) {
      assert(
        !hiddenStructuralPattern.test(stripContainers(line)),
        `migration draft contains a structural token inside ${label}`
      )
    }
  }
  for (const comment of source.match(/<!--[\s\S]*?-->/gu) ?? []) {
    assertNoHiddenStructure(comment.slice(4, -3), "an HTML comment")
  }
  const withoutComments = source.replace(/<!--[\s\S]*?-->/gu, "")
  assert(!/<(?:\/?[a-z]|[?!])/iu.test(withoutComments), "migration draft cannot use raw HTML containers")
  const visible = []
  let fence
  for (const line of withoutComments.split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/u)
    if (fence === undefined && marker !== null) {
      fence = { kind: marker[1][0], length: marker[1].length }
      continue
    }
    if (
      fence !== undefined &&
      marker !== null &&
      marker[1][0] === fence.kind &&
      marker[1].length >= fence.length &&
      marker[2].trim().length === 0
    ) {
      fence = undefined
      continue
    }
    if (fence === undefined) {
      visible.push(line)
    } else {
      assertNoHiddenStructure(line, "a fenced block")
    }
  }
  assert(fence === undefined, "migration draft contains an unclosed fenced block")
  return visible.join("\n")
}

const validateMarkdownContainers = (source) => {
  const lines = source.split("\n")
  for (const [index, line] of lines.entries()) {
    assert(
      !/^\s+#{1,6}\s/u.test(line),
      `migration draft contains an indented heading at visible line ${index + 1}`
    )
    assert(
      !/^\s+\|/u.test(line),
      `migration draft contains an indented table row at visible line ${index + 1}`
    )
    let reduced = line
    let containerCount = 0
    while (true) {
      const next = reduced
        .replace(/^ {0,3}>[ \t]?/u, "")
        .replace(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/u, "")
      if (next === reduced) break
      reduced = next
      containerCount += 1
    }
    if (containerCount > 0) {
      assert(
        !/^(?: {0,3}#{1,6}\s| {0,3}\|| {0,3}\*\*(?:Scope|Preserved invariant|Contract-adoption slots|Implementation surface|Verification|Rollback boundary|Stop before next tranche if):\*\*)/u.test(reduced),
        `migration draft contains a container-hidden heading, table row, or tranche label at visible line ${index + 1}`
      )
    }
    if (index > 0 && /^ {0,3}(?:=+|-+)\s*$/u.test(line) && lines[index - 1].trim().length > 0) {
      throw new Error(`migration draft contains a Setext heading at visible line ${index + 1}`)
    }
  }
}

const normalizeWhitespace = (source) => source.replace(/\s+/gu, " ").trim()

const decodePercentRuns = (source) => {
  let current = source
  for (let pass = 0; pass < 4; pass += 1) {
    const next = current.replace(/(?:%[0-9a-f]{2})+/giu, (run) => {
      try {
        return decodeURIComponent(run)
      } catch {
        return run
      }
    })
    if (next === current) return current
    current = next
  }
  return current
}

const semanticClaimProjection = (source, { preserveCommentBodies = true } = {}) => {
  const destinations = []
  const visible = source
    .normalize("NFKC")
    .replace(/!?\[([^\]\n]*)\]\(([^)\n]*)\)/gu, (_match, text, destination) => {
      destinations.push(destination)
      return text
    })
    .replace(/!?\[([^\]\n]*)\][ \t]*(?:\n[ \t]*)?\[[^\]\n]*\]/gu, "$1")
    .replace(/!?\[([^\]\n]*)\]/gu, "$1")
    .replace(/<!--([\s\S]*?)-->/gu, preserveCommentBodies ? "$1" : "")
    .replace(/\\([\\`*_[\]{}()#+\-.!|>~])/gu, "$1")
    .replace(/[*_~`]/gu, "")
    .replace(/\p{Cf}/gu, "")
  return decodePercentRuns(`${visible}\n\n${destinations.join("\n")}`)
    .replace(/[ \t]*\n(?:[ \t]*\n)+[ \t]*/gu, "\u0000")
    .replace(/[ \t]*\n[ \t]*/gu, " ")
    .replaceAll("\u0000", "\n")
    .replace(/[ \t]+/gu, " ")
    .trim()
}

const validateNoMarkdownReferenceLinks = (source) => {
  assert(
    !/^ {0,3}\[[^\]\n]+\]:/mu.test(source),
    "migration draft cannot use reference-style link definitions"
  )
  assert(
    !/!?\[[^\]\n]*\][ \t]*(?:\n[ \t]*)?\[[^\]\n]*\]/u.test(source),
    "migration draft cannot use full or collapsed reference-style links"
  )
}

const validateMarkdownStateAssignments = (source) => {
  const expected = Object.freeze({
    status: "provisional-prework",
    decisionstatus: "pending",
    participantevidence: "none",
    humanevidence: "none",
    nothumanusabilitytested: "true",
    requireddependencyshas: "null",
    productionauthorization: "false",
    authorizationinterface: "codex-only-uiux-v1"
  })
  const assignments = source.matchAll(
    /\b(decisionStatus|decision status|participantEvidence|participant evidence|humanEvidence|human evidence|notHumanUsabilityTested|not human usability tested|requiredDependencyShas|required dependency SHAs|productionAuthorization|production authorization|authorizationInterface|authorization interface|status)[`"'\s*]*(?:[:=]|\||\bis\b)\s*[`"'\s*]*([^\s|,;`]+)/giu
  )
  for (const match of assignments) {
    const field = match[1].replaceAll(" ", "").toLowerCase()
    const value = match[2].replace(/^[\[("']+|[\])}.:"']+$/gu, "").toLowerCase()
    assert(
      value === expected[field],
      `migration draft ${match[1]} assignment must remain ${expected[field]}; received ${match[2]}`
    )
  }
}

const validateMetadata = (metadata, label) => {
  assertExactKeys(metadata, Object.keys(requiredMetadata), `${label} metadata`)
  for (const [key, expected] of Object.entries(requiredMetadata)) {
    assert(
      Object.is(metadata[key], expected),
      `${label} metadata ${key} must be ${JSON.stringify(expected)}; received ${JSON.stringify(metadata[key])}`
    )
  }
}

const validateStructuredState = (value, label, path = []) => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateStructuredState(entry, label, [...path, String(index)]))
    return
  }
  if (value === null || typeof value !== "object") return
  for (const [key, entry] of Object.entries(value)) {
    const location = `${label}.${[...path, key].join(".")}`
    if (key === "participantEvidence") {
      assert(entry === "none", `${location} must remain none`)
    }
    if (key === "humanEvidence") {
      assert(entry === "none", `${location} must remain none`)
    }
    if (key === "notHumanUsabilityTested") {
      assert(entry === true, `${location} must remain true`)
    }
    if (key === "authorizationInterface") {
      assert(entry === "CODEX-ONLY-UIUX-V1", `${location} must remain CODEX-ONLY-UIUX-V1`)
    }
    if (/participantCount$/iu.test(key)) {
      assert(entry === 0 || entry === null, `${location} cannot contain participant evidence`)
    }
    if (key === "decisionStatus") {
      assert(entry === "pending", `${location} must remain pending`)
    }
    if (key === "requiredDependencyShas") {
      assert(entry === null, `${location} must remain null`)
    }
    if (key === "mustRebaseAndReverify") {
      assert(entry === true, `${location} must remain true`)
    }
    if (key === "productionAuthorization") {
      assert(entry === false, `${location} must remain false`)
    }
    if (["acceptedDecisionSha", "mergeCommitSha", "ciRunId", "ciHeadSha", "independentReviewRecordSha256", "upstreamInputRef", "artifactSha256ByPath", "externalEvidenceId"].includes(key)) {
      assert(entry === null, `${location} must remain null until deliberate graduation`)
    }
    if (/status$/iu.test(key) && typeof entry === "string") {
      assert(!forbiddenStateValues.has(entry.toLowerCase()), `${location} contains forbidden state ${entry}`)
    }
    validateStructuredState(entry, label, [...path, key])
  }
}

const validateNoUnexpectedShaLiterals = (
  source,
  label,
  { allowedLiterals = [], expectedObservedCount, expectedLiteralCounts = new Map() } = {}
) => {
  const allowed = new Set([observedAtSha, ...allowedLiterals].map((literal) => literal.toLowerCase()))
  const matches = source.match(/\b[0-9a-f]{7,64}\b/giu) ?? []
  for (const match of matches) {
    if (!/[a-f]/iu.test(match) && match.length !== 40 && match.length !== 64) continue
    assert(allowed.has(match.toLowerCase()), `${label} contains an unverified SHA literal ${match}`)
  }
  const contextual = source.matchAll(
    /\b(?:sha(?:-?1|-?256)?|commit(?:\s+(?:sha|hash))?|decision|merge|coordinate|ref|attestation)\b[^\n]{0,64}?\b([0-9a-f]{4,64})\b/giu
  )
  for (const match of contextual) {
    assert(allowed.has(match[1].toLowerCase()), `${label} contains an unverified contextual SHA literal ${match[1]}`)
  }
  if (expectedObservedCount !== undefined) {
    const count = (source.match(new RegExp(observedAtSha, "giu")) ?? []).length
    assert(count === expectedObservedCount, `${label} must contain the observed baseline SHA exactly ${expectedObservedCount} times; found ${count}`)
  }
  for (const [literal, expectedCount] of expectedLiteralCounts) {
    const count = (source.match(new RegExp(literal, "giu")) ?? []).length
    assert(count === expectedCount, `${label} must contain attested SHA ${literal} exactly ${expectedCount} times; found ${count}`)
  }
}

const validateNoAffirmativeAuthorization = (source, label) => {
  const affirmativeAuthorizationPatterns = [
    /\bproduction(?: deployment| use| release| traffic| rollout)?\s+(?:is |was |has been )?(?:approved|authorized|allowed|ready|cleared)\b/iu,
    /\b(?:production|implementation) authorization (?:is |was |has been )?(?:granted|approved|received|issued)\b/iu,
    /\b(?:authorized|approved|cleared|ready) for production\b/iu,
    /\b(?:release|rollout|deployment|traffic) to production (?:may|can|should|will) proceed\b/iu,
    /\bpermission to (?:deploy|release|serve)(?: to)? production (?:is |was |has been )?(?:granted|approved|received)\b/iu,
    /\b(?:we|this packet|this plan|the plan)\s+(?:have|has) (?:approval|permission|clearance|authorization) to (?:implement|deploy(?: to production)?|release(?: to production)?|serve(?: to production)?)\b/iu,
    /\bproduction (?:sign[- ]?off|clearance|approval|authorization) (?:is |was |has been )?(?:complete|completed|issued|granted|approved|authorized|received)\b/iu,
    /\b(?:this packet|this plan|this draft|this migration plan|the plan|the migration plan) (?:permits|allows|authorizes|approves|clears|green[- ]?lights) (?:implementation|production|deployment|release|use|traffic|rollout)\b/iu,
    /\b(?:implementation|deployment|release|rollout) (?:may|can|should|will) (?:now )?(?:proceed|begin|start)\b/iu,
    /\b(?:this plan|this packet|this draft|we|the candidate|implementation) (?:is |are )?(?:now )?ready to implement\b/iu,
    /\b(?:approved|authorized|cleared) to implement\b/iu
  ]
  assert(
    !affirmativeAuthorizationPatterns.some((pattern) => pattern.test(source)),
    `${label} contains affirmative production or implementation authorization`
  )
  assert(!/^\s*deploy(?:ment)?(?: to)? production(?: now)?[.!]?\s*$/imu.test(source), `${label} contains a production deployment imperative`)
}

const validateNoGraduatedNarrativeClaims = (source, label) => {
  assert(
    !/\b(?:plan 009|this migration draft|this migration plan|this draft|this plan|this packet|the packet|the migration decision|the migration draft|the migration plan|the migration|implementation|the implementation)\s+(?:is|was|has been|:)\s*(?!not\b)(?:now\s+)?(?:done|final|approved|accepted|authorized|cleared|ready|complete|completed|certified|implementation-authorized|production-ready)\b/iu.test(source),
    `${label} contains a narrative graduated-state claim`
  )
}

const validateNoHumanGateClaims = (source, label) => {
  assert(!/HUMAN-APPROVAL-V1/iu.test(source), `${label} contains a non-Codex authorization interface`)
  assert(
    !/\b(?:human approval|human review(?:er)?|human sign[- ]?off|human selector|human decision owner)\b[^\n]{0,50}\b(?:required|approved|accepted|complete|completed|granted|provided|supplied|passed|received|issued)\b/iu.test(source),
    `${label} contains an affirmative human gate or approval claim`
  )
  assert(
    !/\b(?:a\s+)?human reviewer\b[^\n]{0,40}\b(?:approved|accepted|completed|signed off)\b/iu.test(source),
    `${label} contains an affirmative human-review claim`
  )
  assert(
    !/\bhumans\b[^\n]{0,40}\b(?:approved|accepted|completed|signed off|authorized|cleared)\b/iu.test(source),
    `${label} contains an affirmative human-review claim`
  )
  assert(
    !/\bcodex agents?\s+(?:count|counts|are counted|qualify|serve)\s+as\s+humans?\b/iu.test(source),
    `${label} counts Codex agents as humans`
  )
  const numberWord = "(?:[1-9]\\d*|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)"
  assert(
    !new RegExp(`\\b${numberWord}\\s+(?:human\\s+)?(?:participants?|users?)\\b[^\\n]{0,50}\\b(?:completed|conducted|passed|participated|tested)\\b[^\\n]{0,40}\\b(?:usability|study|testing|test)\\b`, "iu").test(source),
    `${label} contains nonzero human usability evidence`
  )
  assert(
    !new RegExp(`^(?=[^\\n]*\\b(?:usability|study|testing|test)\\b)(?=[^\\n]*\\b${numberWord}\\s+(?:human\\s+)?(?:participants?|users?)\\b)(?=[^\\n]*\\b(?:completed|conducted|passed|participated|tested|succeeded)\\b)[^\\n]*$`, "imu").test(source),
    `${label} contains nonzero human usability evidence`
  )
}

const validateNoBoundUpstreamCoordinates = (source, label) => {
  assert(
    !/\b(?:step\s*0?[2-5]\b[^\n]{0,80}?\b(?:decision|merge|sha|commit|coordinate|ref|attestation)\b|(?:decision|merge|attestation)\s+(?:sha|commit|coordinate|ref)\b)[^\n]{0,80}?\b[0-9a-f]{4,64}\b/iu.test(source),
    `${label} contains a bound or invented upstream coordinate`
  )
}

const validateNoAffirmativeEvidenceClaims = (source, label) => {
  assert(!/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/iu.test(source), `${label} cannot encode claims with HTML entities`)
  const candidates = [
    [source, label],
    [semanticClaimProjection(source), `${label} comment-preserving semantic projection`],
    [semanticClaimProjection(source, { preserveCommentBodies: false }), `${label} comment-eliding semantic projection`]
  ]
  for (const [candidate, candidateLabel] of candidates) {
    validateNoGraduatedNarrativeClaims(candidate, candidateLabel)
    validateNoHumanGateClaims(candidate, candidateLabel)
    validateNoBoundUpstreamCoordinates(candidate, candidateLabel)
    validateNoAffirmativeAuthorization(candidate, candidateLabel)
    assert(
      !/\bparticipant evidence (?:is )?(?:present|nonzero|complete|completed|accepted|approved)\b/iu.test(candidate),
      `${candidateLabel} contains an affirmative participant-evidence claim`
    )
    assert(
      !/\bhuman evidence (?:is )?(?:present|nonzero|complete|completed|accepted|approved)\b/iu.test(candidate),
      `${candidateLabel} contains an affirmative human-evidence claim`
    )
    assert(
      !/\bhuman usability (?:test|testing|study)\b[^\n]{0,40}\b(?:completed|conducted|passed|succeeded|included participants)\b/iu.test(candidate),
      `${candidateLabel} claims a human usability test`
    )
    assert(
      !/\bparticipant(?: study| testing| round| evidence)?\b[^\n]{0,50}\b(?:n\s*=\s*[1-9]\d*|(?:included|had|has|contains|count(?:ed)?)\s+(?:at least\s+)?[1-9]\d*)\b/iu.test(candidate),
      `${candidateLabel} contains nonzero participant results`
    )
  }
}

const validateDecodedStringClaims = (value, label, path = [], allowedShaLiterals = []) => {
  if (typeof value === "string") {
    const location = `${label}.${path.join(".") || "root"}`
    validateNoAffirmativeEvidenceClaims(value, location)
    validateNoUnexpectedShaLiterals(value, location, { allowedLiterals: allowedShaLiterals })
    validateNoUnexpectedShaLiterals(semanticClaimProjection(value), `${location} semantic projection`, {
      allowedLiterals: allowedShaLiterals
    })
    validateNoUnexpectedShaLiterals(
      semanticClaimProjection(value, { preserveCommentBodies: false }),
      `${location} comment-eliding semantic projection`,
      { allowedLiterals: allowedShaLiterals }
    )
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateDecodedStringClaims(entry, label, [...path, String(index)], allowedShaLiterals))
    return
  }
  if (value === null || typeof value !== "object") return
  for (const [key, entry] of Object.entries(value)) {
    validateDecodedStringClaims(entry, label, [...path, key], allowedShaLiterals)
  }
}

const validatePathShape = (path, label) => {
  assertNonEmptyString(path, label)
  assert(!path.startsWith("/"), `${label} must be repository-relative`)
  assert(!path.includes("\\"), `${label} must use forward slashes`)
  assert(!/^[a-z][a-z0-9+.-]*:/iu.test(path), `${label} must not be a URL`)
  assert(!/[?*\[\]{}]/u.test(path), `${label} must not contain a glob`)
  assert(posix.normalize(path) === path, `${label} must be normalized`)
  assert(!path.split("/").some((part) => part === "." || part === ".." || part.length === 0), `${label} has an unsafe segment`)
}

const validateTrackedBlob = async (path) => {
  const tree = git(["ls-tree", observedAtSha, "--", path]).stdout.trim()
  assert(tree.length > 0, `${path} is not tracked at observedAtSha`)
  const match = tree.match(/^(\d{6})\s+blob\s+[0-9a-f]{40}\t(.+)$/u)
  assert(match !== null && match[2] === path, `${path} is not a regular tracked blob at observedAtSha`)
  assert(match[1] === "100644" || match[1] === "100755", `${path} has unsupported Git mode ${match[1]}`)
  const stats = await lstat(resolve(repositoryRoot, path))
  assert(stats.isFile() && !stats.isSymbolicLink(), `${path} must be a current regular non-symlink file`)
}

const extractRouteIds = (source) => {
  const block = source.match(/CANONICAL_ROUTE_IDS\s*=\s*\[([\s\S]*?)\]\s*as const/u)
  assert(block !== null, "route registry array could not be parsed")
  return [...block[1].matchAll(/"([^"]+)"/gu)].map((match) => match[1])
}

const extractDatabaseStores = (source) => {
  const block = source.match(/appDatabaseStores\s*=\s*\{([\s\S]*?)\}\s*as const/u)
  assert(block !== null, "appDatabaseStores could not be parsed")
  return [...block[1].matchAll(/:\s*"([^"]+)"/gu)].map((match) => match[1])
}

const validateDependencySlots = (slots) => {
  assert(Array.isArray(slots), "dependencySlots must be an array")
  assert(slots.length === requiredDependencyIds.length, `dependencySlots must contain ${requiredDependencyIds.length} entries`)
  const exactKeys = [
    "id",
    "sourcePlan",
    "purpose",
    "canonicalConsumers",
    "coordinateKind",
    "participantEvidence",
    "decisionStatus",
    "requiredDependencyShas",
    "upstreamInputRef",
    "artifactSha256ByPath",
    "externalEvidenceId",
    "status",
    "mustRebaseAndReverify"
  ]
  const ids = []
  for (const [index, slot] of slots.entries()) {
    const label = `dependencySlots[${index}]`
    assertExactKeys(slot, exactKeys, label)
    ids.push(slot.id)
    assertNonEmptyString(slot.id, `${label}.id`)
    const contract = requiredDependencyContracts[slot.id]
    assert(contract !== undefined, `${label}.id is not a required dependency contract`)
    assert(slot.purpose === contract.purpose, `${label}.purpose differs from the required slot contract`)
    assert(slot.sourcePlan === contract.sourcePlan, `${label}.sourcePlan differs from the required slot contract`)
    assert(
      JSON.stringify(slot.canonicalConsumers) === JSON.stringify(contract.canonicalConsumers),
      `${label}.canonicalConsumers differ from the required slot contract`
    )
    if (slot.sourcePlan !== null) {
      validatePathShape(slot.sourcePlan, `${label}.sourcePlan`)
      assert(
        /^100644 blob [0-9a-f]{40}\t/u.test(git(["ls-tree", observedAtSha, "--", slot.sourcePlan]).stdout),
        `${label}.sourcePlan is not a tracked regular plan at observedAtSha`
      )
    }
    assert(Array.isArray(slot.canonicalConsumers), `${label}.canonicalConsumers must be an array`)
    for (const [consumerIndex, consumer] of slot.canonicalConsumers.entries()) {
      validatePathShape(consumer, `${label}.canonicalConsumers[${consumerIndex}]`)
    }
    assert(
      slot.coordinateKind === contract.coordinateKind,
      `${label}.coordinateKind differs from the required slot contract`
    )
    assert(slot.participantEvidence === "none", `${label}.participantEvidence must remain none`)
    assert(slot.decisionStatus === "pending", `${label}.decisionStatus must remain pending`)
    assert(slot.requiredDependencyShas === null, `${label}.requiredDependencyShas must remain null`)
    assert(slot.upstreamInputRef === null, `${label}.upstreamInputRef must remain null`)
    assert(slot.artifactSha256ByPath === null, `${label}.artifactSha256ByPath must remain null`)
    assert(slot.externalEvidenceId === null, `${label}.externalEvidenceId must remain null`)
    assert(slot.status === "provisional-prework", `${label}.status must remain provisional-prework`)
    assert(slot.mustRebaseAndReverify === true, `${label}.mustRebaseAndReverify must remain true`)
  }
  assert(JSON.stringify(ids) === JSON.stringify(requiredDependencyIds), "dependency slot IDs or ordering differ")
}

const validateFileRecords = async (records, { checkGit = true } = {}) => {
  assert(Array.isArray(records) && records.length >= 50, "fileRecords must contain at least 50 load-bearing tracked files")
  const paths = new Set()
  const coveredAreas = new Set()
  const exactKeys = ["path", "areas", "role", "migrationSeam", "authority"]
  for (const [index, record] of records.entries()) {
    const label = `fileRecords[${index}]`
    assertExactKeys(record, exactKeys, label)
    validatePathShape(record.path, `${label}.path`)
    assert(!paths.has(record.path), `fileRecords contains duplicate path ${record.path}`)
    paths.add(record.path)
    assert(Array.isArray(record.areas) && record.areas.length > 0, `${label}.areas must be non-empty`)
    assert(new Set(record.areas).size === record.areas.length, `${label}.areas contains duplicates`)
    for (const area of record.areas) {
      assert(requiredAreas.includes(area), `${label}.areas contains unknown area ${area}`)
      coveredAreas.add(area)
    }
    assertNonEmptyString(record.role, `${label}.role`)
    assertNonEmptyString(record.migrationSeam, `${label}.migrationSeam`)
    assert(allowedAuthorities.has(record.authority), `${label}.authority is unknown: ${record.authority}`)
    if (checkGit) await validateTrackedBlob(record.path)
  }
  for (const area of requiredAreas) assert(coveredAreas.has(area), `topology area ${area} has no file record`)
  for (const path of criticalAnchors) assert(paths.has(path), `critical topology anchor missing: ${path}`)
}

const assertStringArray = (value, label, { allowEmpty = false, unique = false } = {}) => {
  assert(Array.isArray(value), `${label} must be an array`)
  if (!allowEmpty) assert(value.length > 0, `${label} must be non-empty`)
  value.forEach((entry, index) => assertNonEmptyString(entry, `${label}[${index}]`))
  if (unique) assert(new Set(value).size === value.length, `${label} must not contain duplicates`)
}

const validateAuthorizationModel = (value) => {
  assertExactKeys(
    value,
    [
      "interfaceId",
      "researchReviewDecisionSignoff",
      "humanEvidence",
      "notHumanUsabilityTested",
      "agentsCountAsHumans",
      "humanApprovalArtifactRequired",
      "requiredEvidence",
      "productionDeploymentControls",
      "productionAuthorization"
    ],
    "authorizationModel"
  )
  assert(value.interfaceId === "CODEX-ONLY-UIUX-V1", "authorization interface differs")
  assert(value.researchReviewDecisionSignoff === "codex-only", "research/review/decision/sign-off must remain Codex-only")
  assert(value.humanEvidence === "none", "authorizationModel.humanEvidence must remain none")
  assert(value.notHumanUsabilityTested === true, "authorizationModel.notHumanUsabilityTested must remain true")
  assert(value.agentsCountAsHumans === false, "Codex agents cannot be counted as humans")
  assert(value.humanApprovalArtifactRequired === false, "human approval artifacts cannot be required")
  assert(
    JSON.stringify(value.requiredEvidence) === JSON.stringify([
      "exact-repository-attested-step-02-through-step-05-decision-shas",
      "independent-codex-subagent-review-records",
      "exact-ci-certification"
    ]),
    "authorizationModel.requiredEvidence differs"
  )
  assert(value.productionDeploymentControls === "separate-technical-gates", "production deployment controls must remain separate")
  assert(value.productionAuthorization === false, "authorization model cannot authorize production")
}

const validateUpstreamDecisionInputs = (inputs) => {
  assert(Array.isArray(inputs) && inputs.length === 4, "upstreamDecisionInputs must contain only Step 02 through Step 05")
  const exactKeys = [
    "stepId",
    "acceptanceInterface",
    "scopeBinding",
    "decisionStatus",
    "acceptedDecisionSha",
    "mergeCommitSha",
    "ciRunId",
    "ciHeadSha",
    "independentReviewRecordSha256",
    "mustRebaseAndReverify"
  ]
  const expectedIds = ["step-02", "step-03", "step-04", "step-05"]
  for (const [index, input] of inputs.entries()) {
    const label = `upstreamDecisionInputs[${index}]`
    assertExactKeys(input, exactKeys, label)
    assert(input.stepId === expectedIds[index], `${label}.stepId differs`)
    assert(input.acceptanceInterface === "CODEX-ONLY-UIUX-V1", `${label}.acceptanceInterface differs`)
    assert(
      input.scopeBinding === "resolve-from-the-accepted-repository-attestation-only-after-landing",
      `${label}.scopeBinding differs`
    )
    assert(input.decisionStatus === "pending", `${label}.decisionStatus must remain pending`)
    for (const key of ["acceptedDecisionSha", "mergeCommitSha", "ciRunId", "ciHeadSha", "independentReviewRecordSha256"]) {
      assert(input[key] === null, `${label}.${key} must remain null`)
    }
    assert(input.mustRebaseAndReverify === true, `${label}.mustRebaseAndReverify must remain true`)
  }
}

const codexReviewPayload = (entry) => ({
  taskId: entry.taskId,
  reviewOccurrenceId: entry.reviewOccurrenceId,
  reviewKind: entry.reviewKind,
  reviewedCommitSha: entry.reviewedCommitSha,
  reviewedBaseSha: entry.reviewedBaseSha,
  reviewedPacketBlobs: entry.reviewedPacketBlobs,
  findingIds: entry.findingIds,
  findingSummary: entry.findingSummary,
  evidencePaths: entry.evidencePaths,
  disposition: entry.disposition,
  consensus: entry.consensus,
  dissent: entry.dissent
})

const validateCodexReviewLedger = (entries) => {
  assert(Array.isArray(entries), "codexReviewLedger must be an array")
  assert(
    entries.length === 0 || entries.length === requiredCodexReviewTasks.length,
    "codexReviewLedger must be pending or contain all independent reviews"
  )
  const exactKeys = [
    "taskId",
    "reviewOccurrenceId",
    "reviewKind",
    "reviewedCommitSha",
    "reviewedBaseSha",
    "reviewedPacketBlobs",
    "findingIds",
    "findingSummary",
    "evidencePaths",
    "disposition",
    "consensus",
    "dissent",
    "recordSha256"
  ]
  const hashes = []
  for (const [index, entry] of entries.entries()) {
    const label = `codexReviewLedger[${index}]`
    assertExactKeys(entry, exactKeys, label)
    const expected = requiredCodexReviewTasks[index]
    const payload = codexReviewPayload(entry)
    assert(entry.taskId === requiredCodexReviewTasks[index].taskId, `${label}.taskId differs`)
    assert(entry.reviewKind === requiredCodexReviewTasks[index].reviewKind, `${label}.reviewKind differs`)
    assert(entry.reviewOccurrenceId === expected.reviewOccurrenceId, `${label}.reviewOccurrenceId differs`)
    assert(/^[0-9a-f]{40}$/u.test(entry.reviewedCommitSha), `${label}.reviewedCommitSha must be a full lowercase Git SHA`)
    assert(entry.reviewedBaseSha === observedAtSha, `${label}.reviewedBaseSha differs from the observed baseline`)
    assertExactKeys(entry.reviewedPacketBlobs, packetPaths, `${label}.reviewedPacketBlobs`)
    assert(
      JSON.stringify(Object.keys(entry.reviewedPacketBlobs)) === JSON.stringify(packetPaths),
      `${label}.reviewedPacketBlobs must use canonical packet-path order`
    )
    for (const path of packetPaths) {
      assert(/^[0-9a-f]{40}$/u.test(entry.reviewedPacketBlobs[path]), `${label}.reviewedPacketBlobs[${path}] is invalid`)
    }
    assertStringArray(entry.findingIds, `${label}.findingIds`, { unique: true })
    assertNonEmptyString(entry.findingSummary, `${label}.findingSummary`)
    assertStringArray(entry.evidencePaths, `${label}.evidencePaths`, { unique: true })
    assert(entry.disposition === "accepted-after-repair", `${label}.disposition differs`)
    assert(entry.consensus === "root-and-independent-review-agree", `${label}.consensus differs`)
    assert(entry.dissent === "none-recorded-after-final-recheck", `${label}.dissent differs`)
    assert(/^[0-9a-f]{64}$/u.test(entry.recordSha256), `${label}.recordSha256 must be a lowercase SHA-256`)
    const actualHash = createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex")
    assert(entry.recordSha256 === actualHash, `${label}.recordSha256 differs from its canonical payload`)
    hashes.push(actualHash)
  }
  return hashes
}

const incrementCount = (counts, literal, amount = 1) => {
  counts.set(literal, (counts.get(literal) ?? 0) + amount)
}

const reviewShaCounts = (entries) => {
  const counts = new Map()
  for (const entry of entries) {
    incrementCount(counts, entry.reviewedCommitSha)
    for (const path of packetPaths) incrementCount(counts, entry.reviewedPacketBlobs[path])
    incrementCount(counts, entry.recordSha256)
  }
  return counts
}

const codexReviewMarkerStem = ["PLAN", "009", "CODEX", "REVIEW", "RECORDS"].join("_")
const planReviewStart = `<!-- ${codexReviewMarkerStem}_START -->`
const planReviewEnd = `<!-- ${codexReviewMarkerStem}_END -->`

const locateDelimitedReviewBlock = (source, startMarker, endMarker, label) => {
  const starts = [...source.matchAll(new RegExp(`^${startMarker.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "gmu"))]
  const ends = [...source.matchAll(new RegExp(`^${endMarker.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "gmu"))]
  assert(starts.length === 1 && ends.length === 1, `${label} must contain exactly one review-record block`)
  assert(ends[0].index > starts[0].index, `${label} review-record block is out of order`)
  const end = ends[0].index + endMarker.length
  return { start: starts[0].index, end }
}

const extractDelimitedReviewBlock = (source, startMarker, endMarker, label) => {
  const range = locateDelimitedReviewBlock(source, startMarker, endMarker, label)
  return source.slice(range.start, range.end)
}

const normalizeDelimitedReviewBlock = (source, startMarker, endMarker, label) => {
  const range = locateDelimitedReviewBlock(source, startMarker, endMarker, label)
  return `${source.slice(0, range.start)}${startMarker}\n<CODEX_REVIEW_RECORDS_EXCLUDED>\n${endMarker}${source.slice(range.end)}`
}

const renderPlanReviewBlock = (entries) => {
  const introduction = entries.length === 0
    ? "The current immutable-subject independent Codex reviews are pending. This block\nwill be populated only after the repaired packet is committed, reviewed by\nexact commit and packet blob hashes, and found free of unresolved dissent."
    : "Independent Codex review evidence for this immutable subject is recorded\nwithout hidden reasoning in `codexReviewLedger`. Each result binds the exact\nreview occurrence, subject/base commits, and all three packet Git blobs."
  const rows = entries.map((entry) =>
    `| \`${entry.taskId}\` | Accepted after repair | Root and independent review agree / none recorded after final recheck | \`${entry.recordSha256}\` |`
  )
  return [
    planReviewStart,
    introduction,
    "",
    "| Codex task ID | Disposition | Consensus / dissent | Record SHA-256 |",
    "|---|---|---|---|",
    ...rows,
    planReviewEnd
  ].join("\n")
}

const normalizeMapReviewRecords = (raw) => {
  const value = parseJsonNoDuplicateKeys(raw, "review-subject map")
  value.codexReviewLedger = []
  return JSON.stringify(value)
}

const normalizePlanReviewRecords = (source) =>
  normalizeDelimitedReviewBlock(source, planReviewStart, planReviewEnd, "migration draft")

const assertValidatorReviewIdentity = (current, reviewed) => {
  assert(current === reviewed, "validator must remain byte-identical to the independently reviewed subject")
}

const packetBlobAt = (commit, path) => git(["rev-parse", `${commit}:${path}`]).stdout.trim()

const validateCodexReviewBinding = async (entries, { rawMap, markdown, validatorSource }) => {
  if (entries.length === 0) {
    const headPresence = packetPaths.map((path) => git(["cat-file", "-e", `HEAD:${path}`], { allowFailure: true }).status === 0)
    assert(headPresence.every(Boolean) || headPresence.every((present) => !present), "pending review subject is only partially present in HEAD")
    if (headPresence.every(Boolean)) {
      for (const path of packetPaths) {
        assert(
          git(["cat-file", "-e", `HEAD^:${path}`], { allowFailure: true }).status !== 0,
          "an empty Codex review ledger is allowed only on the first immutable review-subject commit"
        )
      }
    }
    return
  }

  const reviewedCommit = entries[0].reviewedCommitSha
  assert(entries.every((entry) => entry.reviewedCommitSha === reviewedCommit), "Codex reviews must bind one immutable packet commit")
  assert(git(["cat-file", "-e", `${reviewedCommit}^{commit}`], { allowFailure: true }).status === 0, "reviewed packet commit is not reachable")
  assert(git(["rev-parse", `${reviewedCommit}^`]).stdout.trim() === observedAtSha, "reviewed packet commit must be based directly on observedAtSha")
  assert(git(["merge-base", "--is-ancestor", reviewedCommit, "HEAD"], { allowFailure: true }).status === 0, "reviewed packet commit is not an ancestor of HEAD")

  for (const entry of entries) {
    for (const path of packetPaths) {
      assert(entry.reviewedPacketBlobs[path] === packetBlobAt(reviewedCommit, path), `${entry.taskId} reviewed blob differs for ${path}`)
    }
  }

  const reviewedRawMap = git(["show", `${reviewedCommit}:${mapPath}`]).stdout
  const reviewedMarkdown = git(["show", `${reviewedCommit}:${planPath}`]).stdout
  const reviewedValidator = git(["show", `${reviewedCommit}:${validatorPath}`]).stdout
  const reviewedMap = parseJsonNoDuplicateKeys(reviewedRawMap, "reviewed packet map")
  assert(Array.isArray(reviewedMap.codexReviewLedger) && reviewedMap.codexReviewLedger.length === 0, "reviewed packet commit must be the pending-review subject")
  assert(normalizeMapReviewRecords(rawMap) === normalizeMapReviewRecords(reviewedRawMap), "map changed outside its Codex review ledger after independent review")
  assert(normalizePlanReviewRecords(markdown) === normalizePlanReviewRecords(reviewedMarkdown), "migration draft changed outside its Codex review block after independent review")
  assertValidatorReviewIdentity(validatorSource, reviewedValidator)

  const changed = nulPaths(git(["diff", "--name-only", "-z", reviewedCommit, "--"]).stdout)
  assert(
    JSON.stringify(changed.sort()) === JSON.stringify([mapPath, planPath].sort()),
    `post-review attestation changes must contain only ${mapPath} and ${planPath}`
  )
}

const validateObservationSchema = (observations) => {
  assertExactKeys(
    observations,
    [
      "routeRegistry",
      "documentDelivery",
      "stylesheetProjection",
      "appDatabase",
      "bundleBudget",
      "accessibilityEvidence",
      "rollout",
      "generatedEvidence"
    ],
    "observations"
  )

  assertExactKeys(
    observations.routeRegistry,
    ["source", "routeIds", "plannedContractIsBroaderThanImplementedRegistry", "omittedFamiliesRequireReviewedMachineReadableContent"],
    "observations.routeRegistry"
  )
  assert(observations.routeRegistry.source === "apps/site/src/route-registry.ts", "routeRegistry source differs")
  assertStringArray(observations.routeRegistry.routeIds, "observations.routeRegistry.routeIds", { unique: true })
  assert(observations.routeRegistry.plannedContractIsBroaderThanImplementedRegistry === true, "routeRegistry broader-contract fact differs")
  assert(observations.routeRegistry.omittedFamiliesRequireReviewedMachineReadableContent === true, "routeRegistry omitted-family gate differs")

  assertExactKeys(
    observations.documentDelivery,
    ["mode", "spaRouter", "generator", "buildInputDiscovery", "workerRouter"],
    "observations.documentDelivery"
  )
  assert(observations.documentDelivery.mode === "generated-multi-document-static-assets-with-react-islands", "document delivery mode differs")
  assert(observations.documentDelivery.spaRouter === false, "document delivery cannot claim an SPA router")
  const expectedDocumentPaths = Object.freeze({
    generator: "apps/site/scripts/generate-pages.tsx",
    buildInputDiscovery: "apps/site/vite.config.ts",
    workerRouter: "apps/site/src/asset-router.ts"
  })
  for (const key of ["generator", "buildInputDiscovery", "workerRouter"]) {
    validatePathShape(observations.documentDelivery[key], `observations.documentDelivery.${key}`)
    assert(observations.documentDelivery[key] === expectedDocumentPaths[key], `documentDelivery.${key} differs`)
  }

  assertExactKeys(
    observations.stylesheetProjection,
    ["authoredSource", "generatedPublicCopy", "copyOwner", "generatedPublicCopyIsTracked"],
    "observations.stylesheetProjection"
  )
  for (const key of ["authoredSource", "generatedPublicCopy", "copyOwner"]) {
    validatePathShape(observations.stylesheetProjection[key], `observations.stylesheetProjection.${key}`)
  }
  assert(observations.stylesheetProjection.authoredSource === "apps/site/src/styles.css", "stylesheet authored source differs")
  assert(observations.stylesheetProjection.generatedPublicCopy === "apps/site/public/styles.css", "generated stylesheet path differs")
  assert(observations.stylesheetProjection.copyOwner === "apps/site/scripts/generate-pages.tsx", "stylesheet copy owner differs")
  assert(observations.stylesheetProjection.generatedPublicCopyIsTracked === false, "generated stylesheet tracking fact differs")

  assertExactKeys(
    observations.appDatabase,
    [
      "source",
      "name",
      "version",
      "stores",
      "uiOnlyMigrationMayChangeSchema",
      "portableExportSchemaVersion",
      "legacyPortableVersionSupported"
    ],
    "observations.appDatabase"
  )
  validatePathShape(observations.appDatabase.source, "observations.appDatabase.source")
  assert(observations.appDatabase.source === "apps/site/src/study-storage/app-database/storage-model.ts", "app database source differs")
  assertNonEmptyString(observations.appDatabase.name, "observations.appDatabase.name")
  assert(Number.isSafeInteger(observations.appDatabase.version) && observations.appDatabase.version > 0, "app database version is invalid")
  assertStringArray(observations.appDatabase.stores, "observations.appDatabase.stores", { unique: true })
  assert(observations.appDatabase.uiOnlyMigrationMayChangeSchema === false, "UI-only migration cannot change the database schema")
  assert(observations.appDatabase.portableExportSchemaVersion === 2, "portable export schema version differs")
  assert(observations.appDatabase.legacyPortableVersionSupported === 1, "legacy portable version differs")

  assertExactKeys(
    observations.bundleBudget,
    [
      "source",
      "rawBytes",
      "gzipBytes",
      "brotliBytes",
      "recordedLargestFamily",
      "recordedLargestRawBytes",
      "recordedLargestGzipBytes",
      "recordedLargestBrotliBytes",
      "budgetMayBeRaisedByDraft",
      "staticRouteEffectClosureBudgetBytes",
      "webVitalsNumericBudget"
    ],
    "observations.bundleBudget"
  )
  validatePathShape(observations.bundleBudget.source, "observations.bundleBudget.source")
  assert(observations.bundleBudget.source === "scripts/verify-artifacts.ts", "bundle budget source differs")
  for (const key of [
    "rawBytes",
    "gzipBytes",
    "brotliBytes",
    "recordedLargestRawBytes",
    "recordedLargestGzipBytes",
    "recordedLargestBrotliBytes",
    "staticRouteEffectClosureBudgetBytes"
  ]) {
    assert(Number.isSafeInteger(observations.bundleBudget[key]) && observations.bundleBudget[key] >= 0, `bundleBudget.${key} is invalid`)
  }
  assertNonEmptyString(observations.bundleBudget.recordedLargestFamily, "observations.bundleBudget.recordedLargestFamily")
  assert(observations.bundleBudget.recordedLargestFamily === "Settings", "recorded largest bundle family differs")
  assert(observations.bundleBudget.recordedLargestRawBytes === 468355, "recorded largest raw closure differs")
  assert(observations.bundleBudget.recordedLargestGzipBytes === 139994, "recorded largest gzip closure differs")
  assert(observations.bundleBudget.recordedLargestBrotliBytes === 118248, "recorded largest brotli closure differs")
  assert(observations.bundleBudget.budgetMayBeRaisedByDraft === false, "draft cannot raise bundle budgets")
  assert(observations.bundleBudget.webVitalsNumericBudget === null, "draft cannot invent a Web Vitals budget")

  assertExactKeys(observations.accessibilityEvidence, ["automated", "codexTechnicalProductionGates"], "observations.accessibilityEvidence")
  assertStringArray(observations.accessibilityEvidence.automated, "observations.accessibilityEvidence.automated", { unique: true })
  assertStringArray(observations.accessibilityEvidence.codexTechnicalProductionGates, "observations.accessibilityEvidence.codexTechnicalProductionGates", { unique: true })
  assert(
    JSON.stringify(observations.accessibilityEvidence.automated) === JSON.stringify([
      "axe WCAG A/AA serious and critical checks",
      "320 CSS-pixel reflow",
      "minimum target sizing",
      "forced colors",
      "reduced motion",
      "focus and live-region mutations",
      "print-media visibility"
    ]),
    "automated accessibility evidence differs"
  )
  assert(
    JSON.stringify(observations.accessibilityEvidence.codexTechnicalProductionGates) === JSON.stringify([
      "NVDA with Firefox on Windows",
      "VoiceOver with Safari on macOS",
      "VoiceOver with Safari on iOS",
      "TalkBack with Chrome on Android",
      "JAWS smoke when licensed",
      "true 400 percent zoom in Chrome, Firefox, and Safari",
      "US Letter and A4 normal and large print",
      "grayscale physical print"
    ]),
    "Codex technical accessibility evidence differs"
  )

  assertExactKeys(
    observations.rollout,
    [
      "runtimeFeatureFlagSystemPresent",
      "launchAnalyticsEnabled",
      "remotePreviewActivatesTraffic",
      "productionCertificationStatus",
      "documentedInstantProductionRollback",
      "provisionalRollbackMechanism"
    ],
    "observations.rollout"
  )
  assert(observations.rollout.runtimeFeatureFlagSystemPresent === false, "draft cannot claim a runtime flag system")
  assert(observations.rollout.launchAnalyticsEnabled === false, "draft cannot enable launch analytics")
  assert(observations.rollout.remotePreviewActivatesTraffic === false, "preview cannot be represented as activating traffic")
  assert(observations.rollout.productionCertificationStatus === "blocked", "mapped production certification must remain blocked")
  assert(observations.rollout.documentedInstantProductionRollback === false, "draft cannot claim instant rollback")
  assertNonEmptyString(observations.rollout.provisionalRollbackMechanism, "observations.rollout.provisionalRollbackMechanism")

  assertExactKeys(
    observations.generatedEvidence,
    [
      "recordedSource",
      "baselineCiRunId",
      "baselineCiUrl",
      "baselineCiHeadSha",
      "baselineCiConclusion",
      "recordedGeneratedDocuments",
      "recordedUnitTests",
      "recordedBrowserCases",
      "recordedBrowserPasses",
      "recordedBrowserSkips",
      "rerunByThisDraft"
    ],
    "observations.generatedEvidence"
  )
  validatePathShape(observations.generatedEvidence.recordedSource, "observations.generatedEvidence.recordedSource")
  assert(observations.generatedEvidence.recordedSource === "docs/OPEN.md", "generated evidence source differs")
  assert(observations.generatedEvidence.baselineCiRunId === 33165017762, "baseline CI run ID differs")
  assert(
    observations.generatedEvidence.baselineCiUrl === "https://github.com/mannyc2/nycustodianexam/actions/runs/33165017762",
    "baseline CI URL differs"
  )
  assert(observations.generatedEvidence.baselineCiHeadSha === observedAtSha, "baseline CI head SHA differs")
  assert(observations.generatedEvidence.baselineCiConclusion === "success", "baseline CI conclusion differs")
  for (const key of ["recordedGeneratedDocuments", "recordedUnitTests", "recordedBrowserCases", "recordedBrowserPasses", "recordedBrowserSkips"]) {
    assert(Number.isSafeInteger(observations.generatedEvidence[key]) && observations.generatedEvidence[key] >= 0, `generatedEvidence.${key} is invalid`)
  }
  assert(observations.generatedEvidence.recordedGeneratedDocuments === 526, "recorded generated-document count differs")
  assert(observations.generatedEvidence.recordedUnitTests === 352, "recorded unit-test count differs")
  assert(observations.generatedEvidence.recordedBrowserCases === 198, "recorded browser-case count differs")
  assert(observations.generatedEvidence.recordedBrowserPasses === 172, "recorded browser-pass count differs")
  assert(observations.generatedEvidence.recordedBrowserSkips === 26, "recorded browser-skip count differs")
  assert(observations.generatedEvidence.rerunByThisDraft === true, "draft verification rerun must be recorded")
}

const validateSupportingRecordSchema = (value) => {
  assert(Array.isArray(value.knownPreMigrationConfounders), "knownPreMigrationConfounders must be an array")
  assert(
    JSON.stringify(value.knownPreMigrationConfounders.map((entry) => entry?.id)) === JSON.stringify([
      "player-navigation-not-state-gated",
      "offline-restoration-can-project-empty-before-reconcile",
      "review-question-route-mounts-practice-composition"
    ]),
    "known pre-migration confounders differ"
  )
  for (const [index, entry] of value.knownPreMigrationConfounders.entries()) {
    const label = `knownPreMigrationConfounders[${index}]`
    assertExactKeys(entry, ["id", "status", "evidence", "observedFact", "requiredBeforeVisualMigration"], label)
    assertNonEmptyString(entry.id, `${label}.id`)
    assert(entry.status === "characterization-required", `${entry.id} must remain characterization-required`)
    assertStringArray(entry.evidence, `${label}.evidence`, { unique: true })
    assertNonEmptyString(entry.observedFact, `${label}.observedFact`)
    assertNonEmptyString(entry.requiredBeforeVisualMigration, `${label}.requiredBeforeVisualMigration`)
  }

  assert(Array.isArray(value.unresolvedEvidence) && value.unresolvedEvidence.length === 3, "unresolvedEvidence must retain three records")
  const expectedUnresolvedSources = Object.freeze({
    "stale-browser-evidence-readme": Object.freeze(["docs/OPEN.md", "apps/site/browser-tests/README.md"]),
    "production-performance-evidence": Object.freeze(["docs/OPEN.md", "scripts/verify-artifacts.ts"]),
    "production-rollback-proof": Object.freeze(["docs/DEPLOYMENT.md", ".github/workflows/cloudflare-production.yml"])
  })
  assert(
    JSON.stringify(value.unresolvedEvidence.map((entry) => entry?.id)) === JSON.stringify(Object.keys(expectedUnresolvedSources)),
    "unresolvedEvidence IDs or ordering differ"
  )
  for (const [index, entry] of value.unresolvedEvidence.entries()) {
    const label = `unresolvedEvidence[${index}]`
    assertExactKeys(entry, ["id", "sources", "conflict", "requiredAction"], label)
    assertNonEmptyString(entry.id, `${label}.id`)
    assertStringArray(entry.sources, `${label}.sources`, { unique: true })
    assert(JSON.stringify(entry.sources) === JSON.stringify(expectedUnresolvedSources[entry.id]), `${label}.sources differ`)
    assertNonEmptyString(entry.conflict, `${label}.conflict`)
    assertNonEmptyString(entry.requiredAction, `${label}.requiredAction`)
  }

  assert(Array.isArray(value.prohibitedInferences) && value.prohibitedInferences.length >= 5, "prohibitedInferences is incomplete")
  assertStringArray(value.prohibitedInferences, "prohibitedInferences", { unique: true })
}

const validateMap = async (value, raw, options = {}) => {
  const topLevelKeys = [
    "schemaVersion",
    "artifact",
    "artifactKind",
    "metadata",
    "observedAt",
    "scope",
    "authorizationModel",
    "upstreamDecisionInputs",
    "codexReviewLedger",
    "dependencySlots",
    "topologyAreas",
    "fileRecords",
    "observations",
    "knownPreMigrationConfounders",
    "unresolvedEvidence",
    "prohibitedInferences"
  ]
  assertExactKeys(value, topLevelKeys, "current-file map")
  assert(value.schemaVersion === 1, "current-file map schemaVersion must be 1")
  assert(value.artifact === mapPath, `current-file map artifact must be ${mapPath}`)
  assert(value.artifactKind === "current-file-map", "current-file map artifactKind is invalid")
  validateMetadata(value.metadata, "current-file map")
  assert(value.observedAt === "2026-08-28", "current-file map observedAt is invalid")
  assertExactKeys(
    value.scope,
    [
      "coverageMode",
      "implementationRoot",
      "sourceInventoryCompleteness",
      "generatedOutputsAreCanonical",
      "productionFilesModified",
      "planIndexModified"
    ],
    "current-file map scope"
  )
  assert(value.scope.coverageMode === "canonical-owners-and-load-bearing-seams", "scope coverageMode is invalid")
  assert(value.scope.implementationRoot === ".", "scope implementationRoot must be .")
  assert(
    value.scope.sourceInventoryCompleteness === "provisional-until-parallel-step-04-inventory-is-merged-and-verified",
    "scope sourceInventoryCompleteness differs"
  )
  assert(value.scope.generatedOutputsAreCanonical === false, "generated outputs cannot be canonical")
  assert(value.scope.productionFilesModified === false, "productionFilesModified must remain false")
  assert(value.scope.planIndexModified === false, "planIndexModified must remain false")
  validateAuthorizationModel(value.authorizationModel)
  validateUpstreamDecisionInputs(value.upstreamDecisionInputs)
  validateCodexReviewLedger(value.codexReviewLedger)
  const reviewCounts = reviewShaCounts(value.codexReviewLedger)
  validateDependencySlots(value.dependencySlots)
  assert(JSON.stringify(value.topologyAreas) === JSON.stringify(requiredAreas), "topologyAreas differ or are out of order")
  await validateFileRecords(value.fileRecords, options)
  validateObservationSchema(value.observations)
  validateSupportingRecordSchema(value)
  validateStructuredState(value, "current-file map")
  validateDecodedStringClaims(value, "current-file map", [], [...reviewCounts.keys()])
  validateNoUnexpectedShaLiterals(raw, "current-file map", {
    allowedLiterals: [...reviewCounts.keys()],
    expectedObservedCount: 2 + value.codexReviewLedger.length,
    expectedLiteralCounts: reviewCounts
  })
  validateNoAffirmativeAuthorization(raw, "current-file map")

  const routeSource = await readUtf8("apps/site/src/route-registry.ts")
  const actualRouteIds = extractRouteIds(routeSource)
  assert(
    JSON.stringify(value.observations.routeRegistry.routeIds) === JSON.stringify(actualRouteIds),
    "mapped route IDs differ from apps/site/src/route-registry.ts"
  )
  assert(actualRouteIds.length === 27, `expected 27 implemented route IDs; found ${actualRouteIds.length}`)

  const storageSource = await readUtf8("apps/site/src/study-storage/app-database/storage-model.ts")
  const databaseName = storageSource.match(/appDatabaseName\s*=\s*"([^"]+)"/u)?.[1]
  const databaseVersion = Number(storageSource.match(/appDatabaseVersion\s*=\s*(\d+)/u)?.[1])
  assert(value.observations.appDatabase.name === databaseName, "mapped database name differs from source")
  assert(value.observations.appDatabase.version === databaseVersion, "mapped database version differs from source")
  assert(
    JSON.stringify(value.observations.appDatabase.stores) === JSON.stringify(extractDatabaseStores(storageSource)),
    "mapped database stores differ from source"
  )

  const budgetSource = await readUtf8("scripts/verify-artifacts.ts")
  const budget = budgetSource.match(/bundleBudgets\s*=\s*\{\s*raw:\s*([\d_]+),\s*gzip:\s*([\d_]+),\s*brotli:\s*([\d_]+)/u)
  assert(budget !== null, "bundle budget could not be parsed")
  const numeric = (text) => Number(text.replaceAll("_", ""))
  assert(value.observations.bundleBudget.rawBytes === numeric(budget[1]), "raw bundle budget differs from source")
  assert(value.observations.bundleBudget.gzipBytes === numeric(budget[2]), "gzip bundle budget differs from source")
  assert(value.observations.bundleBudget.brotliBytes === numeric(budget[3]), "brotli bundle budget differs from source")
  for (const entry of value.knownPreMigrationConfounders) {
    for (const path of entry.evidence) {
      validatePathShape(path, `${entry.id}.evidence`)
      if (options.checkGit !== false) await validateTrackedBlob(path)
    }
  }
  for (const entry of value.unresolvedEvidence) {
    for (const path of entry.sources) {
      validatePathShape(path, `${entry.id}.sources`)
      if (options.checkGit !== false) await validateTrackedBlob(path)
    }
  }
  for (const review of value.codexReviewLedger) {
    for (const path of review.evidencePaths) {
      validatePathShape(path, `${review.taskId}.evidencePaths`)
      if (options.checkGit !== false && !packetPaths.includes(path)) await validateTrackedBlob(path)
    }
  }
}

const validateMarkdown = (source, reviewEntries = activeCodexReviewEntries) => {
  validateMetadata(parseMarkedMetadata(source, "migration draft"), "migration draft")
  validateNoMarkdownReferenceLinks(source)
  assert(
    extractDelimitedReviewBlock(source, planReviewStart, planReviewEnd, "migration draft") === renderPlanReviewBlock(reviewEntries),
    "migration draft Codex review-record block differs from its canonical data"
  )
  const reviewCounts = new Map(reviewEntries.map((entry) => [entry.recordSha256, 1]))
  validateNoUnexpectedShaLiterals(source, "migration draft", {
    allowedLiterals: [...reviewCounts.keys()],
    expectedObservedCount: 3,
    expectedLiteralCounts: reviewCounts
  })
  validateNoUnexpectedShaLiterals(semanticClaimProjection(source), "migration draft semantic projection", {
    allowedLiterals: [...reviewCounts.keys()]
  })
  validateNoUnexpectedShaLiterals(
    semanticClaimProjection(source, { preserveCommentBodies: false }),
    "migration draft comment-eliding semantic projection",
    { allowedLiterals: [...reviewCounts.keys()] }
  )
  validateNoAffirmativeEvidenceClaims(source, "migration draft")
  validateMarkdownStateAssignments(source)
  const visible = visibleMarkdown(source)
  validateMarkdownContainers(visible)
  const disclaimerParagraphs = visible
    .split(/\n[ \t]*\n/gu)
    .filter((paragraph) => normalizeWhitespace(paragraph) === exactDisclaimer)
  assert(
    disclaimerParagraphs.length === 1 && disclaimerParagraphs[0].split("\n").every((line) => !/^[ \t]/u.test(line)),
    "migration draft exact provisional disclaimer is missing"
  )

  let priorSectionIndex = -1
  const visibleLines = visible.split("\n")
  for (const section of requiredPlanSections) {
    const matches = visibleLines.reduce((count, line) => count + (line === section ? 1 : 0), 0)
    assert(matches === 1, `migration draft must contain exactly one visible section ${section}; found ${matches}`)
    const index = visible.indexOf(section)
    assert(index > priorSectionIndex, `migration draft section is out of order: ${section}`)
    priorSectionIndex = index
  }

  const matches = [...visible.matchAll(/^### Tranche (\d+):[^\n]+$/gmu)]
  assert(matches.length === 8, `migration draft must contain exactly eight tranche headings; found ${matches.length}`)
  assert(
    JSON.stringify(matches.map((match) => Number(match[1]))) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8]),
    "migration draft tranche headings must be ordered 1 through 8"
  )
  for (const [index, match] of matches.entries()) {
    const start = match.index
    const end = matches[index + 1]?.index ?? visible.indexOf("\n## Cross-tranche test and certification strategy")
    assert(end > start, `Tranche ${index + 1} section boundary is invalid`)
    const section = visible.slice(start, end)
    const labelPositions = requiredTrancheLabels.map((label) => {
      const pattern = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`, "gmu")
      const occurrences = [...section.matchAll(pattern)]
      assert(occurrences.length > 0, `Tranche ${index + 1} is missing ${label}`)
      assert(occurrences.length === 1, `Tranche ${index + 1} contains duplicate ${label}`)
      return occurrences[0].index
    })
    assert(
      labelPositions.every((position, labelIndex) => labelIndex === 0 || position > labelPositions[labelIndex - 1]),
      `Tranche ${index + 1} labels are out of order`
    )
    for (const [labelIndex, label] of requiredTrancheLabels.entries()) {
      const bodyStart = labelPositions[labelIndex] + label.length
      const bodyEnd = labelPositions[labelIndex + 1] ?? section.length
      const body = section.slice(bodyStart, bodyEnd)
      assert(body.trim().length > 0, `Tranche ${index + 1} has an empty ${label}`)
      assert(
        body.split("\n").some((line) => line.trim().length > 0 && !/^(?: {4}|\t)/u.test(line)),
        `Tranche ${index + 1} has only indented-code content for ${label}`
      )
    }
  }

  const dependencyStart = visible.indexOf("## Dependency and decision slots")
  const dependencyEnd = visible.indexOf("\n## Codex-only authorization and review evidence", dependencyStart)
  assert(dependencyStart !== -1 && dependencyEnd > dependencyStart, "migration draft dependency section boundary is invalid")
  const dependencyTableLines = visible
    .slice(dependencyStart, dependencyEnd)
    .split("\n")
    .filter((line) => line.startsWith("|"))
  assert(
    dependencyTableLines[0] === "| Slot | Canonical consumer | Current value | Required disposition before graduation or release use |",
    "migration draft dependency table header differs"
  )
  assert(dependencyTableLines[1] === "|---|---|---:|---|", "migration draft dependency table separator differs")
  assert(
    dependencyTableLines.length === requiredDependencyIds.length + 2,
    "migration draft dependency table must contain only its header, separator, and nine contract rows"
  )
  const dependencyRows = dependencyTableLines
    .slice(2)
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
  assert(dependencyRows.length === requiredDependencyIds.length, "migration draft dependency table row count differs")
  const dependencyIds = dependencyRows.map((cells, index) => {
    assert(cells.length === 4, `migration draft dependency row ${index + 1} must contain four cells`)
    assert(cells[2] === "`null`", `migration draft dependency row ${index + 1} current value must remain null`)
    const id = cells[0].match(/^`([^`]+)`$/u)?.[1]
    const contract = requiredDependencyContracts[id]
    assert(contract !== undefined, `migration draft dependency row ${index + 1} has an unknown slot ID`)
    assert(cells[1] === contract.markdownConsumer, `migration draft dependency row ${id} canonical consumer differs`)
    assert(cells[3] === contract.markdownDisposition, `migration draft dependency row ${id} disposition differs`)
    return id
  })
  assert(JSON.stringify(dependencyIds) === JSON.stringify(requiredDependencyIds), "migration draft dependency IDs or ordering differ")

  const codexInterfaceStart = visible.indexOf("## Codex-only authorization and review evidence")
  const codexInterfaceEnd = visible.indexOf("\n## Contract adoption procedure after Steps 02–05 land", codexInterfaceStart)
  assert(codexInterfaceStart !== -1 && codexInterfaceEnd > codexInterfaceStart, "Codex-only interface section boundary is invalid")
  const codexInterfaceTableLines = visible
    .slice(codexInterfaceStart, codexInterfaceEnd)
    .split("\n")
    .filter((line) => line.startsWith("|"))
  const expectedCodexInterfaceTableLines = [
    "| Future input | Current binding | Acceptance interface |",
    "|---|---:|---|",
    "| Step 02 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Step 03 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Step 04 accepted repository attestation, including the exact source inventory | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Step 05 accepted repository attestation and integrated disposition | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Codex task ID | Disposition | Consensus / dissent | Record SHA-256 |",
    "|---|---|---|---|",
    ...reviewEntries.map((entry) =>
      `| \`${entry.taskId}\` | Accepted after repair | Root and independent review agree / none recorded after final recheck | \`${entry.recordSha256}\` |`
    )
  ]
  assert(
    JSON.stringify(codexInterfaceTableLines) === JSON.stringify(expectedCodexInterfaceTableLines),
    "migration draft Codex-only input/review tables differ"
  )

  validateMarkdownStateAssignments(visible)
}

const validatePlanIndexText = (source) => {
  assert(!/^\|\s*009\s*\|/gmu.test(source), "plans/README.md must not contain a Plan 009 status row")
  for (const id of ["004", "005", "006", "007", "008"]) {
    const row = source.split("\n").find((line) => new RegExp(`^\\|\\s*${id}\\s*\\|`, "u").test(line))
    assert(row !== undefined, `plans/README.md is missing Plan ${id}`)
    const cells = row.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0)
    const status = cells.at(-1) ?? ""
    assert(
      !/^(?:accepted|approved|complete|completed|done|final)\b/iu.test(status),
      `Plan ${id} has a graduated status; this provisional packet must be rebased and regenerated`
    )
  }
}

const validateCertificationRecord = async () => {
  const value = parseJsonNoDuplicateKeys(await readUtf8("docs/certification/production-v1.json"), "production certification")
  assert(value.status === "blocked", "production certification is no longer blocked; rebase and regenerate the draft")
  assert(value.candidateCommitSha === null, "production candidate SHA must remain null for provisional prework")
}

const validateTrackedIndexFlags = (output) => {
  for (const entry of nulPaths(output)) {
    assert(entry.length >= 3 && entry[1] === " ", `could not parse git index flag entry ${JSON.stringify(entry)}`)
    assert(entry[0] === "H", `tracked path uses a masking or nonstandard index flag: ${entry.slice(2)} (${entry[0]})`)
  }
}

const validatePacketFileShapes = async () => {
  for (const path of packetPaths) {
    const stats = await lstat(resolve(repositoryRoot, path))
    assert(stats.isFile() && !stats.isSymbolicLink(), `${path} must be a regular non-symlink packet file`)
    assert((stats.mode & 0o111) === 0, `${path} must not be executable`)
  }
}

const parseGitBlobEntry = (entry, expectedPath, label) => {
  const match = entry.match(/^(\d{6}) ([0-9a-f]{40}) (\d)\t(.+)$/u)
  assert(match !== null && match[4] === expectedPath, `${label} could not be parsed for ${expectedPath}`)
  return { mode: match[1], hash: match[2], stage: match[3] }
}

const validatePacketGitRepresentations = () => {
  for (const path of packetPaths) {
    const indexEntries = nulPaths(git(["ls-files", "--stage", "-z", "--", path]).stdout)
    const headEntry = git(["ls-tree", "HEAD", "--", path]).stdout.trim()
    if (headEntry.length > 0) {
      assert(indexEntries.length === 1, `${path} exists in HEAD but is missing from the index`)
      const head = headEntry.match(/^(\d{6}) blob ([0-9a-f]{40})\t(.+)$/u)
      assert(head !== null && head[3] === path, `HEAD packet entry could not be parsed for ${path}`)
      assert(head[1] === "100644", `HEAD packet mode for ${path} must be 100644; received ${head[1]}`)
    }
    if (indexEntries.length === 0) continue
    assert(indexEntries.length === 1, `${path} must have exactly one stage-zero index entry`)
    const indexed = parseGitBlobEntry(indexEntries[0], path, "index packet entry")
    assert(indexed.stage === "0", `${path} has an unresolved nonzero index stage`)
    assert(indexed.mode === "100644", `index packet mode for ${path} must be 100644; received ${indexed.mode}`)
    const workingHash = git(["hash-object", "--", path]).stdout.trim()
    assert(workingHash === indexed.hash, `${path} working bytes differ from the indexed packet blob`)
  }
}

const validateGitBoundary = (planIndex) => {
  assert(git(["cat-file", "-e", `${observedAtSha}^{commit}`], { allowFailure: true }).status === 0, "observedAtSha is not a reachable commit")
  assert(
    git(["merge-base", "--is-ancestor", observedAtSha, "HEAD"], { allowFailure: true }).status === 0,
    "observedAtSha is not an ancestor of HEAD"
  )
  const originUrls = git(["remote", "get-url", "--all", "origin"]).stdout.trim().split("\n")
  const originPushUrls = git(["remote", "get-url", "--push", "--all", "origin"]).stdout.trim().split("\n")
  assert(JSON.stringify(originUrls) === JSON.stringify([expectedOriginUrl]), `origin fetch URL differs from the pinned repository: ${originUrls.join(", ")}`)
  assert(JSON.stringify(originPushUrls) === JSON.stringify([expectedOriginUrl]), `origin push URL differs from the pinned repository: ${originPushUrls.join(", ")}`)
  const rewriteResult = git(["config", "--get-regexp", "^url\\..*\\.(insteadof|pushinsteadof)$"], { allowFailure: true })
  if (rewriteResult.status === 0) {
    for (const line of rewriteResult.stdout.trim().split("\n")) {
      const prefix = line.match(/^\S+\s+(.+)$/u)?.[1]
      assert(prefix === undefined || !expectedOriginUrl.startsWith(prefix), `Git URL rewrite can replace the pinned origin prefix: ${prefix}`)
    }
  }
  const originMain = git(["rev-parse", "origin/main"]).stdout.trim()
  assert(originMain === observedAtSha, `origin/main advanced to ${originMain}; fetch, rebase, regenerate, and reverify`)
  const remoteMainOutput = git(["ls-remote", "--heads", "origin", "refs/heads/main"]).stdout.trim()
  const remoteMain = remoteMainOutput.match(/^([0-9a-f]{40})\s+refs\/heads\/main$/u)?.[1]
  assert(remoteMain !== undefined, "could not resolve the exact remote origin/main head")
  assert(remoteMain === observedAtSha, `remote origin/main advanced to ${remoteMain}; fetch, rebase, regenerate, and reverify`)
  validateTrackedIndexFlags(git(["ls-files", "-v", "-z"]).stdout)
  validatePacketGitRepresentations()
  assert(
    git(["diff", "--quiet", observedAtSha, "--", indexPath], { allowFailure: true }).status === 0,
    `${indexPath} changed from the observed baseline`
  )
  assert(git(["show", `${observedAtSha}:${indexPath}`]).stdout === planIndex, `${indexPath} bytes differ from the observed baseline`)

  const changed = new Set([
    ...nulPaths(git(["diff", "--name-only", "-z", observedAtSha, "HEAD"]).stdout),
    ...nulPaths(git(["diff", "--name-only", "-z"]).stdout),
    ...nulPaths(git(["diff", "--cached", "--name-only", "-z"]).stdout),
    ...nulPaths(git(["ls-files", "--others", "--exclude-standard", "-z"]).stdout)
  ])
  for (const path of changed) {
    assert(packetPaths.includes(path), `out-of-scope path changed from observedAtSha: ${path}`)
  }
  for (const path of packetPaths) assert(changed.has(path), `packet path is missing from the draft diff: ${path}`)
}

const parseArguments = (arguments_) => {
  assert(new Set(arguments_).size === arguments_.length, "duplicate CLI arguments are not allowed")
  for (const argument of arguments_) assert(argument === "--self-test", `unknown argument: ${argument}`)
  return { selfTest: arguments_.includes("--self-test") }
}

const expectFailure = async (name, action, fragment) => {
  let message
  try {
    await action()
  } catch (cause) {
    message = cause instanceof Error ? cause.message : String(cause)
  }
  assert(message !== undefined, `self-test ${name} unexpectedly passed`)
  assert(message.includes(fragment), `self-test ${name} failed with unexpected message: ${message}`)
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const runSelfTests = async ({ map, markdown, planIndex, scriptMetadata, validatorSource }) => {
  let count = 0
  const negative = async (name, action, fragment) => {
    await expectFailure(name, action, fragment)
    count += 1
  }

  const withPlanStatus = (source, id, status) => source
    .split("\n")
    .map((line) => {
      if (!new RegExp(`^\\|\\s*${id}\\s*\\|`, "u").test(line)) return line
      const cells = line.split("|")
      cells[cells.length - 2] = ` ${status} `
      return cells.join("|")
    })
    .join("\n")

  const metadataFixtures = [
    ["map", map.metadata],
    ["markdown", parseMarkedMetadata(markdown, "self-test markdown")],
    ["validator", scriptMetadata]
  ]
  for (const [label, metadata] of metadataFixtures) {
    for (const key of Object.keys(requiredMetadata)) {
      const missing = clone(metadata)
      delete missing[key]
      await negative(`${label}-missing-${key}`, () => validateMetadata(missing, label), "keys differ")
    }
  }

  for (const status of ["final", "approved", "DONE", "accepted", "complete", "certified"]) {
    const value = clone(map.metadata)
    value.status = status
    await negative(`status-${status}`, () => validateMetadata(value, "status fixture"), "status must be")
  }
  for (const decisionStatus of ["final", "approved", "DONE", "accepted", "complete", "certified"]) {
    const value = clone(map.metadata)
    value.decisionStatus = decisionStatus
    await negative(`decision-${decisionStatus}`, () => validateMetadata(value, "decision fixture"), "decisionStatus must be")
  }
  for (const evidence of ["present", 1]) {
    const value = clone(map.metadata)
    value.participantEvidence = evidence
    await negative(`participant-${evidence}`, () => validateMetadata(value, "participant fixture"), "participantEvidence must be")
  }
  {
    const value = clone(map.metadata)
    value.humanEvidence = "present"
    await negative("human-evidence-present", () => validateMetadata(value, "human fixture"), "humanEvidence must be")
  }
  {
    const value = clone(map.metadata)
    value.notHumanUsabilityTested = false
    await negative("human-usability-claimed", () => validateMetadata(value, "human fixture"), "notHumanUsabilityTested must be")
  }
  {
    const value = clone(map.metadata)
    value.authorizationInterface = "HUMAN-APPROVAL-V1"
    await negative("human-authorization-interface", () => validateMetadata(value, "authorization fixture"), "authorizationInterface must be")
  }
  {
    const value = clone(map.metadata)
    value.requiredDependencyShas = ["a".repeat(40)]
    await negative("dependency-collection", () => validateMetadata(value, "dependency fixture"), "requiredDependencyShas must be")
  }
  {
    const value = clone(map.metadata)
    value.mustRebaseAndReverify = false
    await negative("rebase-false", () => validateMetadata(value, "rebase fixture"), "mustRebaseAndReverify must be")
  }
  for (const authorization of [true, "authorized"]) {
    const value = clone(map.metadata)
    value.productionAuthorization = authorization
    await negative(`production-${authorization}`, () => validateMetadata(value, "production fixture"), "productionAuthorization must be")
  }

  const markdownMarker = markdown.match(/<!-- PLAN_009_METADATA_START[\s\S]*?PLAN_009_METADATA_END -->/u)?.[0]
  const validatorMarker = validatorSource.match(/\/\* PLAN_009_METADATA_START[\s\S]*?PLAN_009_METADATA_END \*\//u)?.[0]
  assert(markdownMarker !== undefined && validatorMarker !== undefined, "self-test marker fixtures are missing")
  await negative(
    "duplicate-markdown-metadata-block",
    () => parseMarkedMetadata(`${markdown}\n${markdownMarker}\n`, "duplicate markdown fixture"),
    "exactly one metadata start marker"
  )
  await negative(
    "duplicate-validator-metadata-block",
    () => parseMarkedMetadata(`${validatorSource}\n${validatorMarker}\n`, "duplicate validator fixture"),
    "exactly one metadata start marker"
  )
  await negative(
    "validator-post-review-byte-change",
    () => assertValidatorReviewIdentity(`${validatorSource}\n`, validatorSource),
    "byte-identical"
  )
  await negative(
    "duplicate-json-key",
    () => parseJsonNoDuplicateKeys('{"outer":{"status":"pending","status":"approved"}}', "duplicate fixture"),
    "duplicate JSON key"
  )
  await negative(
    "escaped-duplicate-json-key",
    () => parseJsonNoDuplicateKeys('{"status":"pending","\\u0073tatus":"approved"}', "escaped duplicate fixture"),
    "duplicate JSON key"
  )
  await negative(
    "prototype-json-key",
    () => parseJsonNoDuplicateKeys('{"__proto__":{"status":"approved"}}', "prototype fixture"),
    "forbidden JSON key"
  )
  await negative(
    "non-json-whitespace",
    () => parseJsonNoDuplicateKeys(`{\u00a0"status":"pending"}`, "whitespace fixture"),
    "not valid JSON"
  )
  await negative(
    "indented-duplicate-markdown-metadata-block",
    () => parseMarkedMetadata(`${markdown}\n${markdownMarker.replace(/^/gmu, "  ")}\n`, "indented duplicate fixture"),
    "exactly one metadata start marker"
  )
  await negative(
    "unicode-indented-duplicate-markdown-metadata-block",
    () => parseMarkedMetadata(`${markdown}\n${markdownMarker.replace(/^/gmu, "\u00a0")}\n`, "Unicode-indented duplicate fixture"),
    "exactly one metadata start marker"
  )

  {
    const value = clone(map.authorizationModel)
    value.humanApprovalArtifactRequired = true
    await negative("human-approval-artifact", () => validateAuthorizationModel(value), "human approval artifacts cannot be required")
  }
  {
    const value = clone(map.authorizationModel)
    value.agentsCountAsHumans = true
    await negative("agents-count-as-humans", () => validateAuthorizationModel(value), "Codex agents cannot be counted as humans")
  }
  {
    const value = clone(map.upstreamDecisionInputs)
    value[0].acceptedDecisionSha = "a".repeat(40)
    await negative("bound-upstream-decision", () => validateUpstreamDecisionInputs(value), "acceptedDecisionSha must remain null")
  }
  if (map.codexReviewLedger.length > 0) {
    const tampered = clone(map.codexReviewLedger)
    tampered[0].findingSummary += " Tampered."
    await negative("tampered-review-record", () => validateCodexReviewLedger(tampered), "recordSha256 differs")

    const badHash = clone(map.codexReviewLedger)
    badHash[0].recordSha256 = "0".repeat(64)
    await negative("review-record-hash-mismatch", () => validateCodexReviewLedger(badHash), "recordSha256 differs")

    const badOccurrence = clone(map.codexReviewLedger)
    badOccurrence[0].reviewOccurrenceId = "codex-only-uiux-v1-invented"
    await negative("review-occurrence-mismatch", () => validateCodexReviewLedger(badOccurrence), "reviewOccurrenceId differs")
  }

  for (const key of ["upstreamInputRef", "artifactSha256ByPath", "externalEvidenceId"]) {
    const value = clone(map)
    value.dependencySlots[0][key] = key === "externalEvidenceId" ? "operator-record" : "x"
    await negative(`slot-${key}`, () => validateDependencySlots(value.dependencySlots), `${key} must remain null`)
  }
  {
    const value = clone(map)
    value.dependencySlots[0].coordinateKind = "external-operator-evidence"
    await negative("slot-coordinate-kind", () => validateDependencySlots(value.dependencySlots), "coordinateKind differs")
  }
  {
    const value = clone(map)
    value.dependencySlots.pop()
    await negative("missing-dependency-slot", () => validateDependencySlots(value.dependencySlots), "must contain 9 entries")
  }
  {
    const value = clone(map)
    value.unknown = true
    await negative("unknown-map-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "keys differ")
  }
  {
    const value = clone(map)
    value.observations.routeRegistry.aliases = []
    await negative("unknown-observation-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "routeRegistry keys differ")
  }
  {
    const value = clone(map)
    delete value.observations.rollout.launchAnalyticsEnabled
    await negative("missing-rollout-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "rollout keys differ")
  }
  {
    const value = clone(map)
    value.knownPreMigrationConfounders[0].unknownAlias = "unsafe"
    await negative("unknown-confounder-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "knownPreMigrationConfounders[0] keys differ")
  }
  {
    const value = clone(map)
    value.topologyAreas[0] = "components"
    await negative("unknown-topology-alias", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "topologyAreas differ")
  }
  {
    const value = clone(map)
    value.prohibitedInferences[0] = ""
    await negative("empty-prohibited-inference", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "must be a non-empty string")
  }
  {
    const value = clone(map)
    value.fileRecords[0].role = "Production is " + "authorized."
    await negative(
      "map-production-authorization-phrase",
      () => validateMap(value, JSON.stringify(value), { checkGit: false }),
      "affirmative production or implementation authorization"
    )
  }
  await negative(
    "decoded-map-production-authorization-phrase",
    () => validateDecodedStringClaims(
      parseJsonNoDuplicateKeys('{"claim":"Production is authoriz\\u0065d."}', "decoded fixture"),
      "decoded fixture"
    ),
    "affirmative production or implementation authorization"
  )
  for (const [name, claim, fragment] of [
    ["decoded-map-done", "Plan 009 is DONE.", "narrative graduated-state claim"],
    ["decoded-map-migration-final", "This migration plan is final.", "narrative graduated-state claim"],
    ["decoded-map-packet-approved", "This packet is approved.", "narrative graduated-state claim"],
    ["decoded-map-packet-done", "The packet is DONE.", "narrative graduated-state claim"],
    ["decoded-map-migration-approved", "The migration is approved.", "narrative graduated-state claim"],
    ["decoded-map-implementation-approved", "Implementation is approved.", "narrative graduated-state claim"],
    ["decoded-map-plan-authorizes-implementation", "This plan authorizes implementation.", "affirmative production or implementation authorization"],
    ["decoded-map-comment-split-authorization", "This plan autho<!--x-->rizes implementation.", "affirmative production or implementation authorization"],
    ["decoded-map-implementation-proceeds", "Implementation may proceed.", "affirmative production or implementation authorization"],
    ["decoded-map-ready-to-implement", "We are ready to implement.", "affirmative production or implementation authorization"],
    ["decoded-map-human-approval", "A human reviewer approved this plan.", "human gate or approval claim"],
    ["decoded-map-human-approval-received", "Human approval has been received.", "human gate or approval claim"],
    ["decoded-map-humans-approved", "Humans approved the plan.", "human-review claim"],
    ["decoded-map-usability-with-users", "A usability study with 12 users passed.", "nonzero human usability evidence"],
    ["decoded-map-usability-by-users", "Usability testing was completed by 12 users.", "nonzero human usability evidence"],
    ["decoded-map-agent-human", "Codex agents count as humans.", "counts Codex agents as humans"],
    ["decoded-map-alternate-interface", "The interface accepts HUMAN-APPROVAL-V1.", "non-Codex authorization interface"],
    ["decoded-map-release-proceed", "Release to production may proceed.", "affirmative production or implementation authorization"],
    ["decoded-map-rollout-cleared", "Production rollout is cleared.", "affirmative production or implementation authorization"],
    ["decoded-map-deploy-approval", "We have approval to deploy to production.", "affirmative production or implementation authorization"],
    ["decoded-map-upstream-sha", `Step 02 decision SHA: ${("de" + "ad" + "be" + "ef").repeat(5)}`, "bound or invented upstream coordinate"],
    ["decoded-map-unlabeled-upstream-sha", `Step 02 uses ${("de" + "ad" + "be" + "ef").repeat(5)}.`, "unverified SHA literal"],
    ["decoded-map-short-upstream-sha", `Step 2 points at ${"de" + "ad" + "be" + "e"}.`, "unverified SHA literal"]
  ]) {
    await negative(name, () => validateDecodedStringClaims({ claim }, "decoded narrative fixture"), fragment)
  }
  {
    const value = clone(map)
    const claim = `Step 02 uses ${("de" + "ad" + "be" + "ef").repeat(5)}.`
    value.fileRecords[0].role = claim
    const encodedClaim = [...claim]
      .map((character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`)
      .join("")
    const raw = JSON.stringify(value).replace(JSON.stringify(claim), `"${encodedClaim}"`)
    const parsed = parseJsonNoDuplicateKeys(raw, "Unicode-escaped map fixture")
    await negative(
      "unicode-escaped-map-upstream-sha",
      () => validateMap(parsed, raw, { checkGit: false }),
      "unverified SHA literal"
    )
  }
  for (const path of ["/absolute", "../parent", "back\\slash", "https://example.test/a", "apps/*", "apps//double"]) {
    await negative(`path-${path}`, () => validatePathShape(path, "path fixture"), "path fixture")
  }
  {
    const records = clone(map.fileRecords)
    records.push(clone(records[0]))
    await negative("duplicate-file", () => validateFileRecords(records, { checkGit: false }), "duplicate path")
  }
  {
    const records = clone(map.fileRecords).filter((record) => record.path !== criticalAnchors[0])
    await negative("missing-anchor", () => validateFileRecords(records, { checkGit: false }), "critical topology anchor missing")
  }
  {
    const records = clone(map.fileRecords)
    records[0] = null
    await negative("null-file-record", () => validateFileRecords(records, { checkGit: false }), "must be an object")
  }
  {
    const records = clone(map.fileRecords)
    records[0].areas = ["component", "components"]
    await negative("unknown-file-area", () => validateFileRecords(records, { checkGit: false }), "unknown area")
  }
  {
    const source = markdown.replace(/^### Tranche 8:[^\n]+\n/mu, "")
    await negative("missing-tranche", () => validateMarkdown(source), "exactly eight tranche headings")
  }
  {
    const source = markdown.replace("### Tranche 1:", "### Tranche 2:")
    await negative("duplicate-tranche", () => validateMarkdown(source), "ordered 1 through 8")
  }
  {
    const source = markdown.replace("**Rollback boundary:**", "**Reversion note:**")
    await negative("missing-rollback", () => validateMarkdown(source), "Tranche 1 is missing **Rollback boundary:**")
  }
  {
    const source = markdown.replace("## Anti-AI-slop and internal-wording removal gates", "<!-- ## Anti-AI-slop and internal-wording removal gates -->")
    await negative("comment-hidden-required-section", () => validateMarkdown(source), "structural token inside an HTML comment")
  }
  {
    const source = markdown.replace("## Anti-AI-slop and internal-wording removal gates", "<div>\n## Anti-AI-slop and internal-wording removal gates\n</div>")
    await negative("raw-html-required-section", () => validateMarkdown(source), "cannot use raw HTML containers")
  }
  {
    const source = `${markdown}\n<?hidden status=approved?>\n`
    await negative("processing-instruction", () => validateMarkdown(source), "status assignment must remain provisional-prework")
  }
  {
    const source = `${markdown}\n<![CDATA[status=approved]]>\n`
    await negative("cdata-container", () => validateMarkdown(source), "status assignment must remain provisional-prework")
  }
  {
    const source = `${markdown}\n## Anti-AI-slop and internal-wording removal gates\n`
    await negative("duplicate-required-section", () => validateMarkdown(source), "exactly one visible section")
  }
  {
    const source = markdown.replace(
      /(### Tranche 8:[\s\S]*?)(?=\n## Cross-tranche test and certification strategy)/u,
      "```text\n$1```\n"
    )
    await negative("fenced-tranche", () => validateMarkdown(source), "structural token inside a fenced block")
  }
  {
    const source = markdown.replace(
      /(## Anti-AI-slop and internal-wording removal gates[\s\S]*?)(?=\n## Analytics, observability, and rollout evidence)/u,
      "````text\n$1\n```\n````\n"
    )
    await negative("long-fence-hides-section", () => validateMarkdown(source), "structural token inside a fenced block")
  }
  {
    const source = markdown.replace("## Anti-AI-slop and internal-wording removal gates", "    ## Anti-AI-slop and internal-wording removal gates")
    await negative("indented-required-section", () => validateMarkdown(source), "indented heading")
  }
  for (const [name, line, fragment] of [
    ["one-space-extra-heading", " ### Tranche 9: Extra", "indented heading"],
    ["blockquote-extra-heading", "> ### Tranche 9: Extra", "container-hidden heading"],
    ["list-extra-heading", "- ### Tranche 9: Extra", "container-hidden heading"],
    ["nested-blockquote-heading", ">> ### Tranche 9: Extra", "container-hidden heading"],
    ["spaced-nested-blockquote-heading", "> > ### Tranche 9: Extra", "container-hidden heading"],
    ["ordered-list-heading", "1. ### Tranche 9: Extra", "container-hidden heading"],
    ["parenthesized-list-heading", "1) ### Tranche 9: Extra", "container-hidden heading"],
    ["list-blockquote-heading", "- > ### Tranche 9: Extra", "container-hidden heading"],
    ["blockquote-list-heading", "> - ### Tranche 9: Extra", "container-hidden heading"],
    ["nested-list-heading", "+ + ### Tranche 9: Extra", "container-hidden heading"],
    ["setext-heading", "Final migration plan\n====", "Setext heading"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${line}\n`), fragment)
  }
  {
    const source = markdown.replace("**Scope:**", "<!-- **Scope:** -->")
    await negative("comment-hidden-label", () => validateMarkdown(source), "structural token inside an HTML comment")
  }
  for (const [name, hidden, fragment] of [
    ["comment-hidden-extra-tranche", "<!-- ### Tranche 9: Hidden -->", "structural token inside an HTML comment"],
    ["comment-hidden-tranche-label", "<!-- **Scope:** hidden duplicate -->", "structural token inside an HTML comment"],
    ["comment-hidden-dependency-row", "<!-- | `consumer-language` | invented | `null` | waived | -->", "structural token inside an HTML comment"],
    ["fence-hidden-extra-tranche", "```text\n### Tranche 9: Hidden\n```", "structural token inside a fenced block"],
    ["fence-hidden-required-section", "```text\n## Explicit production stop conditions\n```", "structural token inside a fenced block"],
    ["fence-hidden-tranche-label", "```text\n**Scope:** hidden duplicate\n```", "structural token inside a fenced block"],
    ["fence-hidden-dependency-row", "```text\n| `consumer-language` | invented | `null` | waived |\n```", "structural token inside a fenced block"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${hidden}\n`), fragment)
  }
  {
    const source = markdown.replace("**Scope:**", "    **Scope:**")
    await negative("indented-label", () => validateMarkdown(source), "Tranche 1 is missing **Scope:**")
  }
  {
    const source = markdown.replace("**Scope:**", "**Scope:**\n\nDuplicate scope.\n\n**Scope:**")
    await negative("duplicate-label", () => validateMarkdown(source), "Tranche 1 contains duplicate **Scope:**")
  }
  {
    const source = markdown.replace(/\*\*Scope:\*\*[\s\S]*?(?=\n\n\*\*Preserved invariant:\*\*)/u, "**Scope:**")
    await negative("empty-label", () => validateMarkdown(source), "Tranche 1 has an empty **Scope:**")
  }
  {
    const source = markdown.replace(/\*\*Scope:\*\*[\s\S]*?(?=\n\n\*\*Preserved invariant:\*\*)/u, "**Scope:**\n\n    hidden code only")
    await negative("indented-only-label-body", () => validateMarkdown(source), "only indented-code content")
  }
  {
    const source = markdown.replace(/^\| `consumer-language` \|[^\n]+\n/mu, "")
    await negative("missing-markdown-dependency-row", () => validateMarkdown(source), "header, separator, and nine contract rows")
  }
  {
    const source = markdown.replace(
      "| `consumer-language` |",
      "| invented-slot | Invented consumer | null | Invented disposition |\n| `consumer-language` |"
    )
    await negative("extra-markdown-dependency-row", () => validateMarkdown(source), "header, separator, and nine contract rows")
  }
  for (const [name, row, fragment] of [
    ["indented-dependency-row", " | `consumer-language` | `invented/consumer.md` | `accepted` | waived |", "indented table row"],
    ["blockquote-dependency-row", "> | `consumer-language` | `invented/consumer.md` | `accepted` | waived |", "container-hidden heading"]
  ]) {
    const source = markdown.replace("| `consumer-language` |", `${row}\n| \`consumer-language\` |`)
    await negative(name, () => validateMarkdown(source), fragment)
  }
  {
    const source = markdown.replace(
      /^(\| `consumer-language` \| [^|]+ \|) `null` (\| [^|]+ \|)$/mu,
      "$1 `pending` $2"
    )
    await negative("populated-markdown-dependency", () => validateMarkdown(source), "current value must remain null")
  }
  {
    const source = markdown.replace("| `consumer-language` |", "| `task-navigation` |")
    await negative("duplicate-markdown-dependency-id", () => validateMarkdown(source), "canonical consumer differs")
  }
  {
    const source = markdown.replace(
      "`product/CONTENT_DESIGN.md` plus assigned production copy owners",
      "Invented canonical consumer"
    )
    await negative("mutated-markdown-dependency-consumer", () => validateMarkdown(source), "canonical consumer differs")
  }
  {
    const source = markdown.replace(
      "Repository-attested Codex decision, merge/artifact coordinates, independent Codex review, and CI",
      "Invented disposition"
    )
    await negative("mutated-markdown-dependency-disposition", () => validateMarkdown(source), "disposition differs")
  }
  {
    const source = markdown.replace(
      "| Step 02 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |",
      "| Step 02 accepted repository attestation | `null` | `HUMAN-APPROVAL-V1` |"
    )
    await negative("tampered-codex-interface-table", () => validateMarkdown(source), "non-Codex authorization interface")
  }
  const currentReviewHashes = activeCodexReviewEntries.map((review) => review.recordSha256)
  if (currentReviewHashes.length > 0) {
    const source = markdown.replace(currentReviewHashes[0], "0".repeat(64))
    await negative("tampered-markdown-review-hash", () => validateMarkdown(source), "Codex review-record block differs")
  }
  for (const [name, row, fragment] of [
    ["indented-codex-review-row", " | `/root/fake_review` | Pending | No result | `null` |", "Codex review-record block differs"],
    ["blockquote-codex-review-row", "> | `/root/fake_review` | Pending | No result | `null` |", "Codex review-record block differs"]
  ]) {
    const source = markdown.replace("|---|---|---|---|", `|---|---|---|---|\n${row}`)
    await negative(name, () => validateMarkdown(source), fragment)
  }
  for (const state of ["accepted", "approved", "complete", "certified", "DONE", "final"]) {
    await negative(
      `markdown-status-${state}`,
      () => validateMarkdown(`${markdown}\nstatus=${state}\n`),
      "status assignment must remain provisional-prework"
    )
  }
  await negative(
    "markdown-decision-complete",
    () => validateMarkdown(`${markdown}\ndecisionStatus=complete\n`),
    "decisionStatus assignment must remain pending"
  )
  await negative(
    "markdown-participant-evidence",
    () => validateMarkdown(`${markdown}\nparticipantEvidence=1\n`),
    "participantEvidence assignment must remain none"
  )
  await negative(
    "markdown-participant-table",
    () => validateMarkdown(`${markdown}\n| Participant evidence | present |\n`),
    "Participant evidence assignment must remain none"
  )
  await negative(
    "markdown-human-evidence",
    () => validateMarkdown(`${markdown}\nHuman evidence is present.\n`),
    "affirmative human-evidence claim"
  )
  await negative(
    "markdown-human-usability-test",
    () => validateMarkdown(`${markdown}\nHuman usability testing was completed.\n`),
    "claims a human usability test"
  )
  await negative(
    "markdown-participant-count",
    () => validateMarkdown(`${markdown}\nParticipant study n=25.\n`),
    "nonzero participant results"
  )
  await negative(
    "markdown-dependency-shas",
    () => validateMarkdown(`${markdown}\nrequiredDependencyShas=[upstream-coordinate]\n`),
    "requiredDependencyShas assignment must remain null"
  )
  await negative(
    "markdown-production-authorization",
    () => validateMarkdown(`${markdown}\nproductionAuthorization=true\n`),
    "productionAuthorization assignment must remain false"
  )
  await negative(
    "markdown-production-phrase",
    () => validateMarkdown(`${markdown}\nProduction is authorized.\n`),
    "affirmative production or implementation authorization"
  )
  await negative(
    "markdown-production-deployment-phrase",
    () => validateMarkdown(`${markdown}\nProduction deployment is authorized.\n`),
    "affirmative production or implementation authorization"
  )
  await negative(
    "markdown-implementation-authorization-phrase",
    () => validateMarkdown(`${markdown}\nImplementation authorization is granted.\n`),
    "affirmative production or implementation authorization"
  )
  await negative(
    "markdown-status-is-done",
    () => validateMarkdown(`${markdown}\nstatus is DONE\n`),
    "status assignment must remain provisional-prework"
  )
  for (const [name, claim, fragment] of [
    ["markdown-plan-done", "Plan 009 is DONE.", "narrative graduated-state claim"],
    ["markdown-draft-final", "This migration draft is final.", "narrative graduated-state claim"],
    ["markdown-migration-plan-final", "This migration plan is final.", "narrative graduated-state claim"],
    ["markdown-packet-approved", "This packet is approved.", "narrative graduated-state claim"],
    ["markdown-packet-done", "The packet is DONE.", "narrative graduated-state claim"],
    ["markdown-migration-approved", "The migration is approved.", "narrative graduated-state claim"],
    ["markdown-implementation-approved", "Implementation is approved.", "narrative graduated-state claim"],
    ["markdown-plan-authorizes-implementation", "This plan authorizes implementation.", "affirmative production or implementation authorization"],
    ["markdown-implementation-proceeds", "Implementation may proceed.", "affirmative production or implementation authorization"],
    ["markdown-ready-to-implement", "We are ready to implement.", "affirmative production or implementation authorization"],
    ["markdown-inline-final", "This plan is **final**.", "narrative graduated-state claim"],
    ["markdown-comment-inline-final", "<!-- This plan is **final**. -->", "narrative graduated-state claim"],
    ["markdown-comment-split-final", "This plan is fi<!--x-->nal.", "narrative graduated-state claim"],
    ["markdown-comment-split-authorization", "This plan auth<!--x-->orizes implementation.", "affirmative production or implementation authorization"],
    ["markdown-comment-split-participants", "Twelve partici<!--x-->pants completed usability testing.", "nonzero human usability evidence"],
    ["markdown-inline-participants", "Twelve partici**pants** completed usability testing.", "nonzero human usability evidence"],
    ["markdown-decision-approved", "The migration decision is approved.", "narrative graduated-state claim"],
    ["markdown-comment-done", "<!-- Plan 009 is DONE. -->", "narrative graduated-state claim"],
    ["markdown-fenced-status", "```text\nstatus=approved\n```", "status assignment must remain provisional-prework"],
    ["markdown-numbered-participants", "12 participants completed usability testing.", "nonzero human usability evidence"],
    ["markdown-word-participants", "Twelve users completed the usability study.", "nonzero human usability evidence"],
    ["markdown-human-approval-required", "Human approval is required.", "human gate or approval claim"],
    ["markdown-human-approval-received", "Human approval has been received.", "human gate or approval claim"],
    ["markdown-humans-approved", "Humans approved the plan.", "human-review claim"],
    ["markdown-human-review-approved", "A human reviewer approved this plan.", "human gate or approval claim"],
    ["markdown-human-signoff", "Human sign-off is complete.", "human gate or approval claim"],
    ["markdown-agents-human", "Codex agents count as humans.", "counts Codex agents as humans"],
    ["markdown-alternate-interface", "The interface accepts HUMAN-APPROVAL-V1.", "non-Codex authorization interface"],
    ["markdown-production-signoff", "Production sign-off is complete.", "affirmative production or implementation authorization"],
    ["markdown-packet-permits-deploy", "This packet permits deployment to production.", "affirmative production or implementation authorization"],
    ["markdown-deploy-imperative", "Deploy to production now.", "production deployment imperative"],
    ["markdown-production-clearance", "Production clearance has been issued.", "affirmative production or implementation authorization"],
    ["markdown-release-proceed", "Release to production may proceed.", "affirmative production or implementation authorization"],
    ["markdown-rollout-cleared", "Production rollout is cleared.", "affirmative production or implementation authorization"],
    ["markdown-deploy-approval", "We have approval to deploy to production.", "affirmative production or implementation authorization"],
    ["markdown-usability-with-users", "A usability study with 12 users passed.", "nonzero human usability evidence"],
    ["markdown-usability-by-users", "Usability testing was completed by 12 users.", "nonzero human usability evidence"],
    ["markdown-encoded-authorization", "Production is authoriz&#101;d.", "cannot encode claims with HTML entities"],
    ["markdown-short-upstream-ref", `Step 02 decision ${"coord" + "inate"}: ${"d" + "ea" + "db" + "e"}`, "unverified contextual SHA literal"],
    ["markdown-numeric-upstream-ref", `Step 02 merge ${"coord" + "inate"}: ${"12" + "34" + "56" + "7"}`, "unverified contextual SHA literal"],
    ["markdown-inline-upstream-sha", "Step 02 decision SHA: dea**dbe**efd**ead**bee**fde**adb**eef**dea**dbe**efd**ead**bee**f.", "unverified SHA literal"],
    ["markdown-comment-split-upstream-sha", "Step 02 decision SHA: dea<!--x-->dbe<!--x-->efd<!--x-->ead<!--x-->bee<!--x-->fde<!--x-->adb<!--x-->eef<!--x-->dea<!--x-->dbe<!--x-->efd<!--x-->ead<!--x-->bee<!--x-->f.", "unverified SHA literal"],
    ["markdown-encoded-upstream-sha", `Step 02 decision SHA: ${"&#100;".repeat(40)}`, "cannot encode claims with HTML entities"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${claim}\n`), fragment)
  }
  for (const [name, claim] of [
    ["markdown-full-reference-link", "Production [is][gate] authorized.\n\n[gate]: /policy"],
    ["markdown-collapsed-reference-link", "Production [is][] authorized.\n\n[is]: </policy> \"gate\""],
    ["markdown-shortcut-reference-link", "This plan is [final].\n\n[final]: /status\n  'state'"],
    ["markdown-multiline-reference-link", "This plan [authorizes]\n[gate] implementation.\n\n[gate]: /policy"],
    ["markdown-reference-split-sha", "Step 02 decision SHA: [dea][r1][dbe][r2][efd][r3][ead][r4][bee][r5][fde][r6][adb][r7][eef][r8][dea][r9][dbe][r10][efd][r11][ead][r12][bee][r13][f][r14].\n\n[r1]: /1"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${claim}\n`), "reference-style")
  }
  {
    const invented = ("de" + "ad" + "be" + "ef").repeat(5)
    const encoded = [...invented]
      .map((character) => `%${character.codePointAt(0).toString(16).padStart(2, "0")}`)
      .join("")
    await negative(
      "markdown-percent-encoded-upstream-sha",
      () => validateMarkdown(`${markdown}\nStep 02 decision: [commit](https://invalid.test/${encoded}).\n`),
      "unverified SHA literal"
    )
  }
  await negative(
    "allowed-hash-reused-as-upstream",
    () => validateNoBoundUpstreamCoordinates(`Step 02 decision SHA: ${observedAtSha}`, "upstream reuse fixture"),
    "bound or invented upstream coordinate"
  )
  {
    const source = `${planIndex}\n| 009 | Draft | P1 | L | 008 | TODO |\n`
    await negative("index-row", () => validatePlanIndexText(source), "must not contain a Plan 009 status row")
  }
  for (const status of ["DONE", "approved", "complete", "final"]) {
    await negative(
      `graduated-upstream-plan-${status}`,
      () => validatePlanIndexText(withPlanStatus(planIndex, "004", status)),
      "has a graduated status"
    )
  }
  {
    const value = clone(map.metadata)
    value.observedAtSha = "a".repeat(40)
    await negative("invented-observed-sha", () => validateMetadata(value, "sha fixture"), "observedAtSha must be")
  }
  for (const literal of ["d" + "eadbee", observedAtSha.slice(0, 7).toUpperCase(), "A".repeat(64)]) {
    await negative(
      `unexpected-sha-${literal.length}`,
      () => validateNoUnexpectedShaLiterals(`${markdown}\n${literal}\n`, "SHA fixture"),
      "unverified SHA literal"
    )
  }
  await negative(
    "unexpected-contextual-short-sha",
    () => validateNoUnexpectedShaLiterals(`merge SHA: ${"d0" + "0d"}`, "contextual SHA fixture"),
    "unverified contextual SHA literal"
  )
  await negative(
    "duplicated-observed-baseline-sha",
    () => validateMarkdown(`${markdown}\nRepeated baseline: ${observedAtSha}\n`),
    "must contain the observed baseline SHA exactly 3 times"
  )
  await negative(
    "skip-worktree-index-flag",
    () => validateTrackedIndexFlags("S apps/site/src/styles.css\0"),
    "masking or nonstandard index flag"
  )
  await negative(
    "assume-unchanged-index-flag",
    () => validateTrackedIndexFlags("h plans/README.md\0"),
    "masking or nonstandard index flag"
  )
  await negative("unknown-cli", () => parseArguments(["--unknown"]), "unknown argument")
  await negative("duplicate-cli", () => parseArguments(["--self-test", "--self-test"]), "duplicate CLI arguments")
  await negative(
    "out-of-scope-drift",
    () => {
      const changed = [planPath, mapPath, validatorPath, "apps/site/src/styles.css"]
      for (const path of changed) assert(packetPaths.includes(path), `out-of-scope path changed from observedAtSha: ${path}`)
    },
    "out-of-scope path changed"
  )
  return count
}

const validatePacket = async () => {
  await validatePacketFileShapes()
  const [markdown, rawMap, validatorSource, planIndex] = await Promise.all([
    readUtf8(planPath),
    readUtf8(mapPath),
    readUtf8(validatorPath),
    readUtf8(indexPath)
  ])
  const map = parseJsonNoDuplicateKeys(rawMap, "current-file map")
  activeCodexReviewEntries = Object.freeze([...map.codexReviewLedger])
  assert(rawMap.endsWith("\n") && !rawMap.includes("\t"), "current-file map must end with a newline and use spaces")
  const scriptMetadata = parseMarkedMetadata(validatorSource, "validator")
  validateMetadata(scriptMetadata, "validator")
  await validateMap(map, rawMap)
  assert(!validatorSource.includes(`${codexReviewMarkerStem}_START`), "validator cannot embed mutable Codex review records")
  validateNoUnexpectedShaLiterals(validatorSource, "validator", {
    expectedObservedCount: 2
  })
  validateMarkdown(markdown, map.codexReviewLedger)
  validatePlanIndexText(planIndex)
  await validateCertificationRecord()
  validateGitBoundary(planIndex)
  await validateCodexReviewBinding(map.codexReviewLedger, { rawMap, markdown, validatorSource })
  return { map, markdown, planIndex, scriptMetadata, validatorSource }
}

const main = async () => {
  const { selfTest } = parseArguments(process.argv.slice(2))
  const packet = await validatePacket()
  if (!selfTest) {
    console.log("Plan 009 provisional migration draft valid.")
    return
  }
  const count = await runSelfTests(packet)
  console.log(`Plan 009 provisional migration draft valid; ${count} negative self-tests passed.`)
}

main().catch((cause) => {
  console.error(`Plan 009 provisional migration draft invalid: ${cause instanceof Error ? cause.message : String(cause)}`)
  process.exitCode = 1
})
