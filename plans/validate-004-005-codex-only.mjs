import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { access, readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const fail = (message) => {
  throw new Error(message)
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, "..")
const evidenceDirectory = resolve(repositoryRoot, "research/ui-ux/codex-only-v1")
const manifestPath = resolve(evidenceDirectory, "evidence-manifest.json")
const packetPath = resolve(scriptDirectory, "004-005-codex-only-evaluation.md")
const contentDesignPath = resolve(repositoryRoot, "product/CONTENT_DESIGN.md")
const routesPath = resolve(repositoryRoot, "product/ROUTES.md")
const planIndexPath = resolve(scriptDirectory, "README.md")

const exact = {
  base: "9fc7dcacfc961752e5d9a2cedbc426deead54a05",
  plan004: "fecc71c5ea240385b3d98f896b1152022a2bbbe8",
  plan005: "9daddbfde073f1f73d806a68dac427b69efc8359",
  evidenceMode: "codex-only",
  humanEvidence: "none",
  label: "NOT HUMAN-USABILITY-TESTED",
  program: "CODEX-ONLY-UIUX-V1",
  schema: "codex-only-uiux-evidence-v2",
  closureSchema: "codex-only-rule-closure-v1",
  receiptSchema: "codex-task-receipt-v1",
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const shaPattern = /^[0-9a-f]{64}$/
const commitPattern = /^[0-9a-f]{40}$/
const validSha = (value) => shaPattern.test(value) && value !== "0".repeat(64)
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)
const unique = (values) => new Set(values).size === values.length
const clone = (value) => structuredClone(value)
const exactKeys = (value, expected, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(label + " must be an object")
  }
  if (!same(Object.keys(value).sort(), [...expected].sort())) {
    fail(label + " key set drift")
  }
}

const assertNoPositiveHumanClaim = (text, label) => {
  const patterns = [
    /\bhumanParticipantCount\s*[:=]\s*[1-9][0-9]*\b/i,
    /\bhumanEvidence\s*[:=]\s*(?!none\b)[a-z][a-z-]*\b/i,
    /\bnotHumanUsabilityTested\s*[:=]\s*false\b/i,
    /\b(?:participants?|people|users?)\s+(?:were\s+)?(?:recruited|interviewed|observed|tested|completed)\b/i,
    /\b(?:we|the\s+team|researchers?|moderators?)\s+(?:have\s+|had\s+)?(?:recruited|interviewed|screened|enrolled|consented|observed|tested)\s+(?:(?:[1-9][0-9]*|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?(?:participants?|volunteers?|people|users?)\b/i,
    /\b(?:recruited|interviewed|screened|enrolled|consented|observed|tested)\s+(?:[1-9][0-9]*|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:participants?|volunteers?|people|users?)\b/i,
    /\b(?:[1-9][0-9]*|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:participants?|volunteers?)\s+(?:were\s+|have\s+|had\s+)?(?:recruited|interviewed|screened|enrolled|consented|observed|tested|completed)\b/i,
    /\bmoderators?\s+(?:has\s+|have\s+|had\s+)?(?:observed|conducted|ran|moderated|completed)\s+(?:(?:[1-9][0-9]*|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?(?:sessions?|interviews?|tests?)\b/i,
    /\b(?:human\s+)?reviewers?\s+(?:has\s+|have\s+|had\s+|was\s+|were\s+)?(?:approved|accepted|validated|endorsed|signed\s+off)\b/i,
    /\bdecision\s+owners?\s+(?:has\s+|have\s+|had\s+|was\s+|were\s+)?(?:approved|accepted|validated|endorsed|signed\s+off)\b/i,
    /\busability\s+testing\s+with\s+(?:participants?|volunteers?|people|humans?|users?)\s+(?:has\s+|have\s+|had\s+|was\s+|were\s+)?(?:validated|confirmed|proved|passed|supported)\b/i,
    /\bhuman\s+(?:approval|review|sign-?off)\s+(?:has\s+been\s+|was\s+|is\s+)?(?:received|completed|approved|accepted|granted)\b/i,
    /"?\bhuman[A-Za-z]*(?:Completed|Approved|Validated|Received|Conducted|Tested|Present)"?\s*:\s*true\b/i,
    /"?(?:participantEvidence|humanParticipantEvidence|humanEvidence)"?\s*:\s*"?(?!none\b)(?:present|collected|available|yes|true)"?\b/i,
    /"?(?:participantCount|moderatorCount|humanReviewerCount|decisionOwnerCount|signOffCount)"?\s*:\s*[1-9][0-9]*\b/i,
    /\bvalidated with users\b/i,
    /\bparticipant-validated\b/i,
    /\bhuman-validated direction\b/i,
    /\bhuman usability testing passed\b/i,
    /\bhuman sign-off received\b/i,
  ]
  const matched = patterns.find((pattern) => pattern.test(text))
  if (matched !== undefined) fail(label + " contains a positive human-research claim: " + matched.source)
}

const assertNoDuplicateJsonKeys = (source, label) => {
  let index = 0
  const syntax = (message) => fail(label + ":" + index + ": " + message)
  const whitespace = () => {
    while (/\s/.test(source[index] ?? "")) index += 1
  }
  const string = () => {
    if (source[index] !== '"') syntax("expected string")
    const start = index
    index += 1
    while (index < source.length) {
      if (source[index] === "\\") {
        index += 2
        continue
      }
      if (source[index] === '"') {
        index += 1
        return JSON.parse(source.slice(start, index))
      }
      index += 1
    }
    syntax("unterminated string")
  }
  const value = (path) => {
    whitespace()
    if (source[index] === "{") return object(path)
    if (source[index] === "[") return array(path)
    if (source[index] === '"') return string()
    const match = source.slice(index).match(/^(?:-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|true|false|null)/)
    if (!match) syntax("invalid value")
    index += match[0].length
  }
  const object = (path) => {
    index += 1
    whitespace()
    const keys = new Set()
    if (source[index] === "}") {
      index += 1
      return
    }
    while (index < source.length) {
      whitespace()
      const key = string()
      if (keys.has(key)) fail(label + ": duplicate key " + path + "." + key)
      keys.add(key)
      whitespace()
      if (source[index] !== ":") syntax("expected colon")
      index += 1
      value(path + "." + key)
      whitespace()
      if (source[index] === "}") {
        index += 1
        return
      }
      if (source[index] !== ",") syntax("expected comma")
      index += 1
    }
    syntax("unterminated object")
  }
  const array = (path) => {
    index += 1
    whitespace()
    if (source[index] === "]") {
      index += 1
      return
    }
    let position = 0
    while (index < source.length) {
      value(path + "[" + position + "]")
      position += 1
      whitespace()
      if (source[index] === "]") {
        index += 1
        return
      }
      if (source[index] !== ",") syntax("expected comma")
      index += 1
    }
    syntax("unterminated array")
  }
  whitespace()
  value("$")
  whitespace()
  if (index !== source.length) syntax("trailing input")
}

const requiredDomains = [
  "accessibility",
  "ai-slop-patterns",
  "cognitive-load",
  "consumer-trust",
  "internal-wording-leakage",
  "learner-task-information-architecture",
  "navigation",
  "plain-language",
]

const requiredTaskIds = [
  "/root/accessibility_lane_v1",
  "/root/free_recruitment",
  "/root/language_lane_v1",
  "/root/navigation_lane_v1",
]

const requiredSourceArtifactCoordinates = {
  "site-generator": `${exact.base}:apps/site/scripts/generate-pages.tsx`,
  "site-styles": `${exact.base}:apps/site/src/styles.css`,
  "site-failure-detail": `${exact.base}:apps/site/src/local-failure-detail.ts`,
  "site-correction-form": `${exact.base}:apps/site/src/corrections/react/correction-form.tsx`,
  "site-question-form": `${exact.base}:apps/site/src/question-player/react/question-form.tsx`,
  "site-question-provider": `${exact.base}:apps/site/src/question-player/react/provider.tsx`,
  "site-question-feedback": `${exact.base}:apps/site/src/question-player/react/feedback.tsx`,
  "site-hazard-results": `${exact.base}:apps/site/src/hazard-player/react/results.tsx`,
  "site-review-queue": `${exact.base}:apps/site/src/review/react/review-queue.tsx`,
  "site-simulation-setup": `${exact.base}:apps/site/src/simulation/react/setup.tsx`,
  "site-simulation-results": `${exact.base}:apps/site/src/simulation/react/results.tsx`,
  "site-offline-manager": `${exact.base}:apps/site/src/offline-packs/react/pack-manager.tsx`,
  "site-settings": `${exact.base}:apps/site/src/settings/react/settings.tsx`,
  "site-marker-controls": `${exact.base}:apps/site/src/hazard-player/react/marker-controls.tsx`,
  "site-scene-viewport": `${exact.base}:apps/site/src/hazard-player/react/scene-viewport.tsx`,
  "site-accessibility-test": `${exact.base}:apps/site/browser-tests/accessibility-and-presentation.pw.ts`,
  "site-offline-fallback": `${exact.base}:apps/site/offline/index.html`,
  "launch-content": `${exact.base}:content/authoring/packs/launch-v1.json`,
  "launch-content-curated": `${exact.base}:content/authoring/packs/launch-v1.curated.mjs`,
  "feature-spec": `${exact.base}:product/FEATURE_SPEC.md`,
  "routes-base": `${exact.base}:product/ROUTES.md`,
  "screen-states": `${exact.base}:product/SCREEN_STATES.md`,
  "design-system": `${exact.base}:product/DESIGN_SYSTEM.md`,
  "visual-authoring-policy": `${exact.base}:illustration/VISUAL_AUTHORING_POLICY.md`,
  "open-register": `${exact.base}:docs/OPEN.md`,
  "recovery-manifest": `${exact.base}:recovery/plan-004-consumer-language-prototypes/recovery-manifest.json`,
  "prototype-home": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/home.html`,
  "prototype-profile": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/profile.html`,
  "prototype-practice": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/practice-start.html`,
  "prototype-question": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/question-feedback.html`,
  "prototype-hazard": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/hazard-feedback.html`,
  "prototype-review": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/review.html`,
  "prototype-offline": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/offline-data.html`,
  "prototype-trust": `${exact.base}:recovery/plan-004-consumer-language-prototypes/prototypes/trust-recovery.html`,
  "plan004-plan": `${exact.plan004}:plans/004-establish-consumer-language-boundary.md`,
  "plan004-report": `${exact.plan004}:research/ui-ux/consumer-language-study-2026-08-26.md`,
  "plan004-record": `${exact.plan004}:research/ui-ux/consumer-language-study-2026-08-26.json`,
  "plan005-plan": `${exact.plan005}:plans/005-rebuild-learner-task-navigation.md`,
  "plan005-report": `${exact.plan005}:research/ui-ux/navigation-task-hierarchy/README.md`,
  "plan005-inventory": `${exact.plan005}:research/ui-ux/navigation-task-hierarchy/route-task-inventory.json`,
  "plan005-record": `${exact.plan005}:research/ui-ux/navigation-task-hierarchy/research-summary.json`,
}

const requiredReviewEvidenceIds = {
  "/root/free_recruitment": [
    "site-generator",
    "site-styles",
    "site-failure-detail",
    "site-correction-form",
    "site-question-feedback",
    "site-hazard-results",
    "recovery-manifest",
    "plan004-report",
    "plan005-inventory",
  ],
  "/root/language_lane_v1": [
    "site-generator",
    "site-question-form",
    "site-question-feedback",
    "site-hazard-results",
    "site-review-queue",
    "site-simulation-setup",
    "site-simulation-results",
    "site-offline-manager",
    "site-settings",
    "site-failure-detail",
    "site-correction-form",
    "site-offline-fallback",
    "feature-spec",
    "routes-base",
    "design-system",
    "visual-authoring-policy",
    "recovery-manifest",
    "prototype-home",
    "prototype-profile",
    "prototype-practice",
    "prototype-question",
    "prototype-hazard",
    "prototype-review",
    "prototype-offline",
    "prototype-trust",
    "plan004-plan",
    "plan004-report",
    "launch-content-curated",
  ],
  "/root/navigation_lane_v1": [
    "site-generator",
    "site-styles",
    "routes-base",
    "screen-states",
    "design-system",
    "plan005-plan",
    "plan005-inventory",
    "plan005-record",
    "plan004-report",
    "site-accessibility-test",
  ],
  "/root/accessibility_lane_v1": [
    "site-generator",
    "site-styles",
    "site-failure-detail",
    "site-question-form",
    "site-question-provider",
    "site-question-feedback",
    "site-hazard-results",
    "site-review-queue",
    "site-offline-manager",
    "site-settings",
    "site-marker-controls",
    "site-scene-viewport",
    "site-correction-form",
    "site-accessibility-test",
    "feature-spec",
    "routes-base",
    "design-system",
    "open-register",
    "prototype-home",
    "prototype-profile",
    "prototype-practice",
    "prototype-question",
    "prototype-hazard",
    "prototype-review",
    "prototype-offline",
    "prototype-trust",
    "plan004-report",
    "plan004-record",
    "plan005-report",
    "plan005-inventory",
    "plan005-record",
    "launch-content",
  ],
}

const requiredReviewContracts = {
  "/root/free_recruitment": {
    reportId: "CODEX-ONLY-UIUX-V1-FREE-RECRUITMENT",
    reportPath: "research/ui-ux/codex-only-v1/free-recruitment-review.md",
    reportSha256: "a275b06ea3d5e51f019abb4b7866b557b58078346b6f571ccafa98502754b887",
    domains: [
      "accessibility",
      "ai-slop-patterns",
      "cognitive-load",
      "consumer-trust",
      "internal-wording-leakage",
      "learner-task-information-architecture",
      "navigation",
      "plain-language",
    ],
  },
  "/root/language_lane_v1": {
    reportId: "CODEX-ONLY-UIUX-V1-LANGUAGE-TRUST",
    reportPath: "research/ui-ux/codex-only-v1/language-trust-review.md",
    reportSha256: "40da3609f6b5b152bc18eb7904b669da7b1a70fd6e45fd27d17400f783b60dcd",
    domains: [
      "ai-slop-patterns",
      "consumer-trust",
      "internal-wording-leakage",
      "navigation",
      "plain-language",
    ],
  },
  "/root/navigation_lane_v1": {
    reportId: "CODEX-ONLY-UIUX-V1-NAVIGATION",
    reportPath: "research/ui-ux/codex-only-v1/navigation-review.md",
    reportSha256: "4aebc020c7888ebd45197229e1c516dcd6655e68b574d08d870cd3155735723d",
    domains: [
      "cognitive-load",
      "learner-task-information-architecture",
      "navigation",
      "plain-language",
    ],
  },
  "/root/accessibility_lane_v1": {
    reportId: "CODEX-ONLY-UIUX-V1-ACCESSIBILITY-COGNITIVE",
    reportPath: "research/ui-ux/codex-only-v1/accessibility-cognitive-review.md",
    reportSha256: "67f43328c6b6c14d616345570cdf63e488ad7d8b8b762efc41220debb9df7ef4",
    domains: [
      "accessibility",
      "ai-slop-patterns",
      "cognitive-load",
      "consumer-trust",
      "internal-wording-leakage",
      "learner-task-information-architecture",
      "navigation",
      "plain-language",
    ],
  },
}

const receiptPayloadKeys = [
  "schemaVersion",
  "taskPath",
  "sessionUuid",
  "parentThreadId",
  "provenanceClass",
  "threadSource",
  "originator",
  "depth",
  "completionState",
  "completionEventTimestamp",
  "completionTurnId",
  "completionMessageSha256",
  "reportPath",
  "reportSha256",
  "repositoryCommit",
]
const receiptKeys = [...receiptPayloadKeys, "safeReceiptSha256"]
const requiredTaskReceipts = [
  {
    schemaVersion: "codex-task-receipt-v1",
    taskPath: "/root/free_recruitment",
    sessionUuid: "01a04919-ab2d-7211-8b17-fc5e38d083db",
    parentThreadId: "01a047c6-af9b-7eb1-b2e7-920c71cba366",
    provenanceClass: "root-orchestrated-supplied-independent-lane",
    threadSource: "subagent",
    originator: "Codex Desktop",
    depth: 1,
    completionState: "completed",
    completionEventTimestamp: "2026-08-28T17:20:30.085Z",
    completionTurnId: "01a0495c-0ee5-7d02-8002-a1dab7b7e340",
    completionMessageSha256: "d2e2ed6ab99e49562cf9eaf701a7af1845407fa2507fdc8017eec4bd6de1eff0",
    reportPath: "research/ui-ux/codex-only-v1/free-recruitment-review.md",
    reportSha256: "a275b06ea3d5e51f019abb4b7866b557b58078346b6f571ccafa98502754b887",
    repositoryCommit: null,
    safeReceiptSha256: "e7da6af72ba575b5483cf2fb81300ce4ef3d9535fa6c518bffb7b467eb2680b2",
  },
  {
    schemaVersion: "codex-task-receipt-v1",
    taskPath: "/root/language_lane_v1",
    sessionUuid: "01a04964-81cf-7721-aaf9-87064743b81c",
    parentThreadId: "01a047e7-6e92-7fd2-afdf-4a7ced144d45",
    provenanceClass: "step-2-child-independent-lane",
    threadSource: "subagent",
    originator: "codex_exec",
    depth: 1,
    completionState: "completed",
    completionEventTimestamp: "2026-08-28T17:33:45.479Z",
    completionTurnId: "01a0496e-f46b-7d00-9cf1-74edd7acb396",
    completionMessageSha256: "6b05c8ed811dd3634db1d3a9c73dfa7102adba8b371eecd8db6776803af75df8",
    reportPath: "research/ui-ux/codex-only-v1/language-trust-review.md",
    reportSha256: "40da3609f6b5b152bc18eb7904b669da7b1a70fd6e45fd27d17400f783b60dcd",
    repositoryCommit: "7e73dfd7e76101bf96d3122c9e3917cf4725251f",
    safeReceiptSha256: "3a024e8b75af4c18e88c8c9a1598d2be9ec482a0f09a06923ed6d9a803ba52f0",
  },
  {
    schemaVersion: "codex-task-receipt-v1",
    taskPath: "/root/navigation_lane_v1",
    sessionUuid: "01a04964-a103-71a1-a051-08e867a5935b",
    parentThreadId: "01a047e7-6e92-7fd2-afdf-4a7ced144d45",
    provenanceClass: "step-2-child-independent-lane",
    threadSource: "subagent",
    originator: "codex_exec",
    depth: 1,
    completionState: "completed",
    completionEventTimestamp: "2026-08-28T17:36:07.347Z",
    completionTurnId: "01a04970-c043-7b62-a469-04d198c18a2c",
    completionMessageSha256: "89b0ea5a18a87a95ab5531ee111b62206010d67a979f90bc42cffb2959127213",
    reportPath: "research/ui-ux/codex-only-v1/navigation-review.md",
    reportSha256: "4aebc020c7888ebd45197229e1c516dcd6655e68b574d08d870cd3155735723d",
    repositoryCommit: "7e73dfd7e76101bf96d3122c9e3917cf4725251f",
    safeReceiptSha256: "209c60baab9ef92c60110821dd5b585f373a8e20b91782235e087d432538f3f3",
  },
  {
    schemaVersion: "codex-task-receipt-v1",
    taskPath: "/root/accessibility_lane_v1",
    sessionUuid: "01a04964-c148-7803-b30d-da107b147348",
    parentThreadId: "01a047e7-6e92-7fd2-afdf-4a7ced144d45",
    provenanceClass: "step-2-child-independent-lane",
    threadSource: "subagent",
    originator: "codex_exec",
    depth: 1,
    completionState: "completed",
    completionEventTimestamp: "2026-08-28T17:38:28.040Z",
    completionTurnId: "01a04973-4544-7b61-9938-5ab53871b976",
    completionMessageSha256: "e3578404a6a226913d53094ab18b97d6d411e0fb44002138ac2fe4504170defa",
    reportPath: "research/ui-ux/codex-only-v1/accessibility-cognitive-review.md",
    reportSha256: "67f43328c6b6c14d616345570cdf63e488ad7d8b8b762efc41220debb9df7ef4",
    repositoryCommit: "7e73dfd7e76101bf96d3122c9e3917cf4725251f",
    safeReceiptSha256: "5491185446239c0fb23abc11bb77bca0fc5626e29c025ccf50964c5261da8182",
  },
]

const finding = (taskPath, findingId) => ({ taskPath, findingId })
const recommendation = (taskPath, recommendationId) => ({ taskPath, recommendationId })

const requiredRuleContracts = {
  "CL-TASK-FIRST": { scope: "language", statement: "At each action or decision, state the learner task, material consequence, and next safe action clearly.", supportReferences: [finding("/root/free_recruitment", "UI-05"), recommendation("/root/language_lane_v1", "CL-H1-PLAIN-TASK-OPEN-PROOF")], status: "promoted" },
  "CL-LAYER-PROOF": { scope: "language", statement: "Keep human-readable proof adjacent or disclosed and move raw identifiers and diagnostics out of the default layer.", supportReferences: [finding("/root/free_recruitment", "UI-07"), recommendation("/root/language_lane_v1", "CL-H1-PLAIN-TASK-OPEN-PROOF"), finding("/root/accessibility_lane_v1", "F-08")], status: "promoted" },
  "CL-TYPED-PUBLIC-ERRORS": { scope: "language", statement: "Map typed failures to stable outcome, preserved-state, and recovery copy while keeping raw exceptions internal.", supportReferences: [finding("/root/free_recruitment", "UI-06"), finding("/root/language_lane_v1", "LT-07"), finding("/root/accessibility_lane_v1", "F-07")], status: "promoted" },
  "CL-FOCUSED-FEEDBACK": { scope: "language", statement: "Use specific outcomes and concise plain rationales, remove internal model labels and canned cadence, and keep required proof reachable.", supportReferences: [finding("/root/free_recruitment", "UI-07"), finding("/root/language_lane_v1", "LT-05"), finding("/root/language_lane_v1", "LT-10"), finding("/root/accessibility_lane_v1", "F-09")], status: "promoted" },
  "CL-DORMANT-CORRECTION": { scope: "language", statement: "State the dormant correction boundary in consumer terms and never imply an unavailable endpoint can receive a report.", supportReferences: [finding("/root/free_recruitment", "UI-09"), finding("/root/language_lane_v1", "LT-09")], status: "promoted" },
  "CL-CL1-QUARANTINE": { scope: "language", statement: "Keep recovered CL-1 bytes unchanged as evidence and author factually current U.S.-English CL-2 copy.", supportReferences: [finding("/root/free_recruitment", "UI-10"), finding("/root/language_lane_v1", "DS-04"), recommendation("/root/language_lane_v1", "CL-H1-PLAIN-TASK-OPEN-PROOF")], status: "promoted" },
  "CL-US-ENGLISH-FACTS": { scope: "language", statement: "Use U.S. English, current derived counts, and bounded factual claims without unsupported universal language.", supportReferences: [finding("/root/free_recruitment", "UI-10"), recommendation("/root/language_lane_v1", "CL-H1-PLAIN-TASK-OPEN-PROOF")], status: "promoted" },
  "CL-NO-UNMEASURED-TIME": { scope: "language", statement: "Do not publish a practice-duration estimate without measured evidence for the exact task and conditions.", supportReferences: [finding("/root/free_recruitment", "UI-02"), finding("/root/language_lane_v1", "HC-04")], status: "promoted" },
  "NAV-TWO-TIER": { scope: "navigation", statement: "Separate learner tasks from utility and trust destinations instead of presenting every destination as a peer.", supportReferences: [finding("/root/free_recruitment", "UI-03"), finding("/root/language_lane_v1", "LT-02"), finding("/root/navigation_lane_v1", "NAV-F01")], status: "promoted" },
  "NAV-NATIVE-COMPACT": { scope: "navigation", statement: "Use a named native no-JavaScript-safe compact disclosure before global links wrap into peer rows.", supportReferences: [finding("/root/free_recruitment", "UI-03"), finding("/root/navigation_lane_v1", "NAV-F01"), recommendation("/root/accessibility_lane_v1", "NI-04")], status: "promoted" },
  "NAV-FOCUSED-PLAYERS": { scope: "navigation", statement: "Give every player a named session landmark, progress, and truthful explicit exit without acquisition or utility navigation.", supportReferences: [finding("/root/free_recruitment", "UI-04"), finding("/root/navigation_lane_v1", "NAV-F02"), recommendation("/root/accessibility_lane_v1", "NI-05")], status: "promoted" },
  "NAV-SHELL-BOUNDARY": { scope: "navigation", statement: "Assign question, hazard, review, and simulation player route IDs to the focused shell and all other fixed routes to standard.", supportReferences: [finding("/root/navigation_lane_v1", "NAV-F02")], status: "unresolved" },
  "NAV-PRACTICE-TASK-HUB": { scope: "navigation", statement: "Lead Practice with concrete task starts and place translated capacity diagnostics after those starts.", supportReferences: [finding("/root/free_recruitment", "UI-02"), finding("/root/navigation_lane_v1", "NAV-F04"), finding("/root/accessibility_lane_v1", "F-02")], status: "promoted" },
  "NAV-STATIC-REVIEW-ENTRY": { scope: "navigation", statement: "Expose Review through a normal static parent entry while retaining local and noindex semantics.", supportReferences: [finding("/root/navigation_lane_v1", "NAV-F04"), finding("/root/accessibility_lane_v1", "F-04")], status: "promoted" },
  "NAV-ROUTE-IDENTITY": { scope: "navigation", statement: "Preserve every fixed route identity, canonical path, and no-JavaScript purpose.", supportReferences: [finding("/root/language_lane_v1", "LT-02"), recommendation("/root/navigation_lane_v1", "NAV-C2-TASK-FIRST-TWO-TIER"), recommendation("/root/accessibility_lane_v1", "NI-01")], status: "promoted" },
  "NAV-NOJS": { scope: "navigation", statement: "Keep primary discovery as static ordinary document navigation with truthful JavaScript-free fallbacks.", supportReferences: [recommendation("/root/navigation_lane_v1", "NAV-C2-TASK-FIRST-TWO-TIER"), recommendation("/root/accessibility_lane_v1", "NI-01")], status: "promoted" },
  "NAV-NONVISUAL-EQUAL-DISCOVERY": { scope: "navigation", statement: "Give visual and text-keyboard hazard tasks equivalent discovery without claiming identical measurement.", supportReferences: [finding("/root/language_lane_v1", "LT-06"), recommendation("/root/accessibility_lane_v1", "NI-06")], status: "promoted" },
  "SHARED-HUMAN-EVIDENCE-BOUNDARY": { scope: "shared", statement: "Keep human evidence none, human participant count zero, and every result labeled not human usability tested.", supportReferences: [finding("/root/language_lane_v1", "HC-06"), finding("/root/navigation_lane_v1", "NAV-D04"), finding("/root/accessibility_lane_v1", "DU-10")], status: "promoted" },
  "SHARED-PRESERVE-LOAD-BEARING-TRUTH": { scope: "shared", statement: "Preserve unofficial status, uncertainty, source support, local-data risk, security boundaries, and commit-before-reveal.", supportReferences: [finding("/root/language_lane_v1", "LT-03"), finding("/root/language_lane_v1", "LT-05"), finding("/root/language_lane_v1", "LT-08"), finding("/root/language_lane_v1", "LT-09"), finding("/root/navigation_lane_v1", "HC-06"), finding("/root/accessibility_lane_v1", "F-08"), finding("/root/accessibility_lane_v1", "F-10")], status: "promoted" },
  "SHARED-EXPLICIT-PROFILE-CONTEXT": { scope: "shared", statement: "Require explicit or visibly neutral profile context and never silently substitute the first jurisdiction.", supportReferences: [finding("/root/free_recruitment", "UI-01"), finding("/root/language_lane_v1", "LT-03"), finding("/root/navigation_lane_v1", "NAV-F03"), recommendation("/root/accessibility_lane_v1", "NI-03")], status: "promoted" },
  "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY": { scope: "shared", statement: "Whether the shortest valid whole-bank question count should be the primary Practice start remains unresolved.", supportReferences: [finding("/root/free_recruitment", "UI-02")], status: "unresolved" },
  "UNRESOLVED-HOME-PRIMARY-CTA": { scope: "shared", statement: "Whether Check my exam or Start practice is the universal primary Home action remains unresolved.", supportReferences: [finding("/root/free_recruitment", "UI-08")], status: "unresolved" },
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING": { scope: "navigation", statement: "Exact global navigation labels, group count, membership, nesting, and order remain unresolved rather than consensus.", supportReferences: [finding("/root/free_recruitment", "UI-03"), finding("/root/navigation_lane_v1", "NAV-D01"), finding("/root/navigation_lane_v1", "NAV-D02")], status: "unresolved" },
  "UNRESOLVED-D1-VS-D2": { scope: "language", statement: "The full choice between CL-D1 and CL-D2, including any hybrid, remains unresolved and no candidate is selected.", supportReferences: [finding("/root/language_lane_v1", "DS-01"), finding("/root/accessibility_lane_v1", "F-08")], status: "unresolved" },
  "UNRESOLVED-PRACTICE-TIMING": { scope: "language", statement: "No practice duration is established; only exact current question counts may be stated.", supportReferences: [finding("/root/free_recruitment", "UI-02"), finding("/root/language_lane_v1", "HC-04")], status: "unresolved" },
  "UNRESOLVED-SOURCE-PROMINENCE": { scope: "language", statement: "The route-specific choice between inline proof and disclosed proof remains unresolved.", supportReferences: [finding("/root/free_recruitment", "UI-07"), finding("/root/language_lane_v1", "DS-01"), finding("/root/navigation_lane_v1", "NAV-D03"), finding("/root/accessibility_lane_v1", "F-08")], status: "unresolved" },
}

const requiredCandidateDispositions = [{
  id: "CL-D3-NOT-SELECTED",
  statement: "Do not select CL-D3 because it has no recovered prototype and sits nearest prohibited urgency, guilt, mastery, and readiness claims.",
  supportReferences: [finding("/root/language_lane_v1", "HC-05"), recommendation("/root/accessibility_lane_v1", "CL-D3")],
  implementationRule: false,
  status: "not-selected-research-disposition",
}]

const ownerLockedUnresolved = [
  "UNRESOLVED-D1-VS-D2",
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING",
  "UNRESOLVED-HOME-PRIMARY-CTA",
  "UNRESOLVED-PRACTICE-TIMING",
  "UNRESOLVED-SOURCE-PROMINENCE",
]

const validateModel = (manifest) => {
  exactKeys(manifest, [
    "schemaVersion",
    "programVersion",
    "programStatus",
    "evidenceMode",
    "humanEvidence",
    "humanParticipantEvidence",
    "humanParticipantCount",
    "notHumanUsabilityTested",
    "statusLabel",
    "humanClaims",
    "humanRoleCounts",
    "sourceCommits",
    "sourceArtifacts",
    "taskReceipts",
    "reviews",
    "synthesis",
    "canonicalPromotions",
  ], "manifest")
  if (manifest.schemaVersion !== exact.schema) fail("schemaVersion drift")
  if (manifest.programVersion !== exact.program) fail("programVersion drift")
  if (manifest.programStatus !== "codex-only-complete") fail("program status drift")
  if (manifest.evidenceMode !== exact.evidenceMode) fail("evidenceMode must remain codex-only")
  if (manifest.humanEvidence !== exact.humanEvidence) fail("humanEvidence must remain none")
  if (manifest.humanParticipantEvidence !== "none") fail("humanParticipantEvidence must remain none")
  if (manifest.humanParticipantCount !== 0) fail("humanParticipantCount must remain zero")
  if (manifest.notHumanUsabilityTested !== true || manifest.statusLabel !== exact.label) {
    fail("non-human-usability status drift")
  }
  exactKeys(manifest.humanClaims, [
    "participantResearchConducted",
    "humanUsabilityTested",
    "humanValidatedDirection",
    "humanSignOffReceived",
  ], "humanClaims")
  if (
    manifest.humanClaims?.participantResearchConducted !== false ||
    manifest.humanClaims?.humanUsabilityTested !== false ||
    manifest.humanClaims?.humanValidatedDirection !== false ||
    manifest.humanClaims?.humanSignOffReceived !== false
  ) {
    fail("a human-research claim became true")
  }
  exactKeys(manifest.humanRoleCounts, [
    "participants",
    "moderators",
    "reviewers",
    "decisionOwners",
    "signOffs",
  ], "humanRoleCounts")
  const roleKeys = Object.keys(manifest.humanRoleCounts ?? {}).sort()
  const roleValues = Object.values(manifest.humanRoleCounts ?? {})
  if (
    !same(roleKeys, ["decisionOwners", "moderators", "participants", "reviewers", "signOffs"]) ||
    roleValues.some((value) => value !== 0)
  ) {
    fail("all five human-role counts must be zero")
  }

  if (
    manifest.sourceCommits?.step1Base !== exact.base ||
    manifest.sourceCommits?.plan004Draft !== exact.plan004 ||
    manifest.sourceCommits?.plan005Draft !== exact.plan005
  ) {
    fail("immutable source commit drift")
  }
  exactKeys(manifest.sourceCommits, ["step1Base", "plan004Draft", "plan005Draft"], "sourceCommits")

  const requiredSourceIds = Object.keys(requiredSourceArtifactCoordinates)
  if (
    !Array.isArray(manifest.sourceArtifacts) ||
    manifest.sourceArtifacts.length !== requiredSourceIds.length
  ) {
    fail("source artifact set must equal the canonical immutable evidence closure")
  }
  const sourceIds = manifest.sourceArtifacts.map((artifact) => artifact.id)
  const sourceCoordinates = manifest.sourceArtifacts.map((artifact) => artifact.commit + ":" + artifact.path)
  if (!unique(sourceIds)) fail("duplicate source artifact id")
  if (!unique(sourceCoordinates)) fail("duplicate source artifact coordinate")
  if (!same([...sourceIds].sort(), [...requiredSourceIds].sort())) {
    fail("source artifact IDs drifted from the canonical immutable evidence closure")
  }
  for (const artifact of manifest.sourceArtifacts) {
    exactKeys(artifact, ["id", "kind", "commit", "path", "sha256"], "source artifact")
    const coordinate = artifact.commit + ":" + artifact.path
    if (
      artifact.kind !== "git-blob" ||
      typeof artifact.id !== "string" ||
      !commitPattern.test(artifact.commit) ||
      ![exact.base, exact.plan004, exact.plan005].includes(artifact.commit) ||
      typeof artifact.path !== "string" ||
      artifact.path.startsWith("/") ||
      artifact.path.split("/").includes("..") ||
      !validSha(artifact.sha256)
    ) {
      fail("invalid source artifact " + String(artifact.id))
    }
    if (requiredSourceArtifactCoordinates[artifact.id] !== coordinate) {
      fail("source artifact coordinate drift for " + String(artifact.id))
    }
  }

  if (!Array.isArray(manifest.taskReceipts) || manifest.taskReceipts.length !== 4) {
    fail("exactly four task receipts are required")
  }
  for (const field of ["taskPath", "sessionUuid", "completionTurnId", "reportPath", "safeReceiptSha256"]) {
    if (!unique(manifest.taskReceipts.map((receipt) => receipt[field]))) {
      fail("task receipt " + field + " values must be unique")
    }
  }
  for (const receipt of manifest.taskReceipts) {
    if (!same(Object.keys(receipt), receiptKeys)) {
      fail("task receipt physical key order or shape drift for " + String(receipt.taskPath))
    }
    const payload = Object.fromEntries(receiptPayloadKeys.map((key) => [key, receipt[key]]))
    const computedDigest = sha256(Buffer.from(JSON.stringify(payload), "utf8"))
    if (computedDigest !== receipt.safeReceiptSha256 || !validSha(receipt.safeReceiptSha256)) {
      fail("task receipt digest mismatch for " + String(receipt.taskPath))
    }
    const requiredReceipt = requiredTaskReceipts.find((candidate) => candidate.taskPath === receipt.taskPath)
    if (requiredReceipt === undefined || !same(receipt, requiredReceipt)) {
      fail("task receipt native lineage or report coordinate drift for " + String(receipt.taskPath))
    }
  }
  if (!same(manifest.taskReceipts, requiredTaskReceipts)) {
    fail("task receipt ledger order or exact native facts drifted")
  }

  if (!Array.isArray(manifest.reviews) || manifest.reviews.length < 4) {
    fail("four independent Codex review lanes are required")
  }
  const taskIds = manifest.reviews.map((review) => review.agentTaskId)
  const reportPaths = manifest.reviews.map((review) => review.reportPath)
  if (!unique(taskIds) || !unique(reportPaths) || !same([...taskIds].sort(), requiredTaskIds)) {
    fail("review task IDs and report paths must retain the exact four-lane set")
  }
  const coveredDomains = new Set()
  const sourceIdSet = new Set(sourceIds)
  for (const review of manifest.reviews) {
    const reviewKeys = [
      "agentTaskId",
      "reportId",
      "actorClass",
      "independent",
      "evidenceMode",
      "humanEvidence",
      "humanParticipantCount",
      "notHumanUsabilityTested",
      "statusLabel",
      "reviewStatus",
      "reportPath",
      "reportSha256",
      "domains",
      "evidenceArtifactIds",
      "rubricScores",
      "findingIds",
      "recommendationIds",
      ...(review.agentTaskId === "/root/free_recruitment" ? ["priorityCounts"] : []),
    ]
    exactKeys(review, reviewKeys, "review " + String(review.agentTaskId))
    if (
      review.actorClass !== "codex-agent" ||
      review.independent !== true ||
      review.evidenceMode !== exact.evidenceMode ||
      review.humanEvidence !== "none" ||
      review.humanParticipantCount !== 0 ||
      review.notHumanUsabilityTested !== true ||
      review.statusLabel !== exact.label ||
      review.reviewStatus !== "complete"
    ) {
      fail("review evidence boundary drift for " + String(review.agentTaskId))
    }
    if (
      typeof review.agentTaskId !== "string" ||
      !review.agentTaskId.startsWith("/root/") ||
      typeof review.reportId !== "string" ||
      typeof review.reportPath !== "string" ||
      !review.reportPath.startsWith("research/ui-ux/codex-only-v1/") ||
      !validSha(review.reportSha256)
    ) {
      fail("invalid review coordinate for " + String(review.agentTaskId))
    }
    const requiredReview = requiredReviewContracts[review.agentTaskId]
    if (
      review.reportId !== requiredReview.reportId ||
      review.reportPath !== requiredReview.reportPath ||
      review.reportSha256 !== requiredReview.reportSha256 ||
      !same([...review.domains].sort(), [...requiredReview.domains].sort())
    ) {
      fail("review ID, path, hash, or domain closure drift for " + review.agentTaskId)
    }
    if (!Array.isArray(review.domains) || review.domains.length === 0 || !unique(review.domains)) {
      fail("invalid review domains for " + review.agentTaskId)
    }
    review.domains.forEach((domain) => coveredDomains.add(domain))
    if (
      !Array.isArray(review.evidenceArtifactIds) ||
      review.evidenceArtifactIds.length < 3 ||
      !unique(review.evidenceArtifactIds) ||
      review.evidenceArtifactIds.some((id) => !sourceIdSet.has(id))
    ) {
      fail("review lacks traceable source artifacts for " + review.agentTaskId)
    }
    if (!same(
      [...review.evidenceArtifactIds].sort(),
      [...requiredReviewEvidenceIds[review.agentTaskId]].sort(),
    )) {
      fail("review evidence join drift for " + review.agentTaskId)
    }
    if (
      !Array.isArray(review.findingIds) ||
      !unique(review.findingIds) ||
      review.findingIds.length === 0 ||
      !Array.isArray(review.recommendationIds) ||
      !unique(review.recommendationIds)
    ) {
      fail("review structured ID inventory invalid for " + review.agentTaskId)
    }
    const receipt = manifest.taskReceipts.find((candidate) => candidate.taskPath === review.agentTaskId)
    if (
      receipt === undefined ||
      receipt.reportPath !== review.reportPath ||
      receipt.reportSha256 !== review.reportSha256
    ) {
      fail("task receipt to review join drift for " + review.agentTaskId)
    }
    if (review.agentTaskId === "/root/free_recruitment") {
      if (review.rubricScores !== null || review.priorityCounts?.P1 !== 8 || review.priorityCounts?.P2 !== 3) {
        fail("supplied lane scores or priority accounting drift")
      }
    } else {
      const scores = Object.values(review.rubricScores ?? {})
      if (scores.length < 4 || scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) {
        fail("review rubric must contain at least four 1-5 scores for " + review.agentTaskId)
      }
    }
  }
  if (requiredDomains.some((domain) => !coveredDomains.has(domain))) {
    fail("independent reviews do not cover every required domain")
  }
  const nonSuppliedDomains = new Set(manifest.reviews
    .filter((review) => review.agentTaskId !== "/root/free_recruitment")
    .flatMap((review) => review.domains))
  if (requiredDomains.some((domain) => !nonSuppliedDomains.has(domain))) {
    fail("the three spawned independent lanes do not cover every required domain")
  }

  exactKeys(manifest.synthesis, [
    "algorithmVersion",
    "minimumIndependentSupport",
    "humanEvidenceWeight",
    "hardConstraintFailuresBlockPromotion",
    "ownerLockedUnresolvedCannotPromote",
    "candidateDispositions",
    "rules",
    "selectedDirections",
    "confidence",
    "limitations",
  ], "synthesis")
  if (
    manifest.synthesis?.algorithmVersion !== "codex-only-consensus-v1" ||
    manifest.synthesis?.minimumIndependentSupport !== 2 ||
    manifest.synthesis?.humanEvidenceWeight !== 0 ||
    manifest.synthesis?.hardConstraintFailuresBlockPromotion !== true ||
    manifest.synthesis?.ownerLockedUnresolvedCannotPromote !== true
  ) {
    fail("deterministic synthesis contract drift")
  }

  const reviewByTask = new Map(manifest.reviews.map((review) => [review.agentTaskId, review]))
  const validateSupportReferences = (references, label) => {
    if (!Array.isArray(references) || references.length === 0) {
      fail(label + " must retain at least one exact support reference")
    }
    if (!unique(references.map((reference) => JSON.stringify(reference)))) {
      fail(label + " contains a duplicate support reference")
    }
    const supportTaskPaths = []
    for (const reference of references) {
      const usesFinding = typeof reference?.findingId === "string"
      const usesRecommendation = typeof reference?.recommendationId === "string"
      if (usesFinding === usesRecommendation) {
        fail(label + " support must name exactly one findingId or recommendationId")
      }
      exactKeys(
        reference,
        usesFinding ? ["taskPath", "findingId"] : ["taskPath", "recommendationId"],
        label + " support reference",
      )
      const review = reviewByTask.get(reference.taskPath)
      if (review === undefined) fail(label + " cites an unknown task path")
      const retainedIds = usesFinding ? review.findingIds : review.recommendationIds
      const retainedId = usesFinding ? reference.findingId : reference.recommendationId
      if (!retainedIds.includes(retainedId)) {
        fail(label + " cites an ID not retained by its report: " + retainedId)
      }
      supportTaskPaths.push(reference.taskPath)
    }
    return [...new Set(supportTaskPaths)]
  }

  if (!same(manifest.synthesis.candidateDispositions, requiredCandidateDispositions)) {
    fail("candidate disposition closure drift")
  }
  for (const disposition of manifest.synthesis.candidateDispositions) {
    exactKeys(disposition, [
      "id",
      "statement",
      "supportReferences",
      "implementationRule",
      "status",
    ], "candidate disposition")
    if (
      disposition.implementationRule !== false ||
      disposition.status !== "not-selected-research-disposition" ||
      validateSupportReferences(disposition.supportReferences, disposition.id).length < 2
    ) {
      fail("invalid candidate disposition " + String(disposition.id))
    }
  }

  if (!Array.isArray(manifest.synthesis.rules) || manifest.synthesis.rules.length === 0) {
    fail("missing synthesis rules")
  }
  const ruleIds = manifest.synthesis.rules.map((rule) => rule.id)
  if (!unique(ruleIds)) fail("duplicate synthesis rule")
  if (!same([...ruleIds].sort(), Object.keys(requiredRuleContracts).sort())) {
    fail("synthesis rule set drift")
  }
  for (const rule of manifest.synthesis.rules) {
    exactKeys(rule, [
      "id",
      "scope",
      "statement",
      "supportReferences",
      "dissentTaskIds",
      "hardConstraintFailures",
      "ownerLockedUnresolved",
      "status",
    ], "synthesis rule " + String(rule.id))
    if (
      typeof rule.id !== "string" ||
      !["language", "navigation", "shared"].includes(rule.scope) ||
      typeof rule.statement !== "string" ||
      rule.statement.length < 20 ||
      rule.statement !== rule.statement.normalize("NFC").trim().replace(/\s+/g, " ") ||
      !Array.isArray(rule.dissentTaskIds) ||
      !unique(rule.dissentTaskIds) ||
      rule.dissentTaskIds.some((id) => !taskIds.includes(id)) ||
      !Array.isArray(rule.hardConstraintFailures)
    ) {
      fail("invalid synthesis rule " + String(rule.id))
    }
    const locked = ownerLockedUnresolved.includes(rule.id)
    if (locked !== (rule.ownerLockedUnresolved === true)) {
      fail("owner-locked unresolved marker drift for " + rule.id)
    }
    const supportTaskPaths = validateSupportReferences(rule.supportReferences, rule.id)
    if (rule.dissentTaskIds.some((id) => supportTaskPaths.includes(id))) {
      fail("support and dissent overlap for " + rule.id)
    }
    const computedStatus =
      locked || supportTaskPaths.length < manifest.synthesis.minimumIndependentSupport
        ? "unresolved"
        : rule.hardConstraintFailures.length > 0
          ? "rejected"
          : "promoted"
    if (rule.status !== computedStatus) {
      fail("non-deterministic synthesis status for " + rule.id)
    }
    const requiredRule = requiredRuleContracts[rule.id]
    if (
      rule.scope !== requiredRule.scope ||
      rule.status !== requiredRule.status ||
      !same(rule.supportReferences, requiredRule.supportReferences) ||
      rule.statement !== requiredRule.statement ||
      !same(rule.dissentTaskIds, []) ||
      !same(rule.hardConstraintFailures, [])
    ) {
      fail("canonical rule statement/support/status drift for " + rule.id)
    }
  }
  if (!same([...ownerLockedUnresolved].sort(), manifest.synthesis.rules
    .filter((rule) => rule.ownerLockedUnresolved === true)
    .map((rule) => rule.id)
    .sort())) {
    fail("owner-locked unresolved set drift")
  }

  for (const [scope, expectedId] of [["language", "CL-CODEX-1"], ["navigation", "NAV-CODEX-1"]]) {
    const direction = manifest.synthesis.selectedDirections?.[scope]
    exactKeys(direction, ["id", "name", "evidenceMode", "ruleIds"], "selected direction " + scope)
    const expectedName = scope === "language"
      ? "Consumer-language safety envelope"
      : "Task and utility separation with focused players"
    if (
      direction?.id !== expectedId ||
      direction.name !== expectedName ||
      direction.evidenceMode !== exact.evidenceMode
    ) {
      fail("selected direction identity drift for " + scope)
    }
    const expectedRules = manifest.synthesis.rules
      .filter((rule) => rule.status === "promoted" && (rule.scope === scope || rule.scope === "shared"))
      .map((rule) => rule.id)
      .sort()
    if (!same(expectedRules, [...(direction.ruleIds ?? [])].sort())) {
      fail("selected direction does not equal deterministic promoted-rule closure for " + scope)
    }
  }
  if (
    manifest.synthesis.confidence !== "moderate-for-codex-inspection-only" ||
    !Array.isArray(manifest.synthesis.limitations) ||
    manifest.synthesis.limitations.length < 5
  ) {
    fail("confidence or limitation contract drift")
  }

  if (!Array.isArray(manifest.canonicalPromotions) || manifest.canonicalPromotions.length !== 2) {
    fail("exactly two maintained product promotions are required")
  }
  const promotionPaths = manifest.canonicalPromotions.map((promotion) => promotion.path).sort()
  if (!same(promotionPaths, [
    "product/CONTENT_DESIGN.md",
    "product/ROUTES.md",
  ])) {
    fail("canonical promotion paths drift")
  }
  for (const promotion of manifest.canonicalPromotions) {
    exactKeys(promotion, ["path", "directionId", "sha256"], "canonical promotion")
    const expectedDirection = promotion.path === "product/CONTENT_DESIGN.md" ? "CL-CODEX-1" : "NAV-CODEX-1"
    if (!validSha(promotion.sha256) || promotion.directionId !== expectedDirection) {
      fail("invalid canonical promotion " + String(promotion.path))
    }
  }
}

const readGitBlob = (commit, path) =>
  execFileSync("git", ["show", commit + ":" + path], {
    cwd: repositoryRoot,
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
  })

const assertAbsent = async (path) => {
  try {
    await access(path)
  } catch {
    return
  }
  fail("superseded volunteer artifact remains: " + path)
}

const parseReportMetadata = (text, label) => {
  const blocks = [...text.matchAll(/```yaml\n([\s\S]*?)\n```/g)]
  if (blocks.length !== 1) fail(label + " must contain exactly one YAML metadata block")
  const metadata = {}
  for (const line of blocks[0][1].split("\n")) {
    const separator = line.indexOf(":")
    if (separator <= 0) fail(label + " has invalid metadata syntax")
    const key = line.slice(0, separator).trim()
    const raw = line.slice(separator + 1).trim()
    if (Object.hasOwn(metadata, key)) fail(label + " has duplicate metadata key " + key)
    if (raw === "true" || raw === "false") metadata[key] = raw === "true"
    else if (/^(?:0|[1-9][0-9]*)$/.test(raw)) metadata[key] = Number(raw)
    else if (raw.startsWith("[") && raw.endsWith("]")) metadata[key] = JSON.parse(raw)
    else metadata[key] = raw
  }
  exactKeys(metadata, [
    "programVersion",
    "agentTaskId",
    "reportId",
    "actorClass",
    "independent",
    "findingIds",
    "recommendationIds",
    "evidenceMode",
    "humanEvidence",
    "humanParticipantCount",
    "notHumanUsabilityTested",
    "statusLabel",
    "reviewStatus",
  ], label + " metadata")
  return { metadata, body: text.replace(blocks[0][0], "") }
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const reportDeclaresId = (body, id) => {
  const escaped = escapeRegex(id)
  return new RegExp("^###\\s+`?" + escaped + "(?:`|\\s|\\s+—)", "m").test(body) ||
    new RegExp("^\\|\\s+`?" + escaped + "(?:`?\\s*\\||\\s+[^|]*\\|)", "m").test(body) ||
    new RegExp("^\\|\\s+`(?:findingId|recommendationId)`\\s*\\|\\s*`" + escaped + "`\\s*\\|", "m").test(body)
}

const validateReportMetadataJoin = (metadata, review, body) => {
  if (
    metadata.programVersion !== exact.program ||
    metadata.agentTaskId !== review.agentTaskId ||
    metadata.reportId !== review.reportId ||
    metadata.actorClass !== review.actorClass ||
    metadata.independent !== true ||
    metadata.evidenceMode !== exact.evidenceMode ||
    metadata.humanEvidence !== "none" ||
    metadata.humanParticipantCount !== 0 ||
    metadata.notHumanUsabilityTested !== true ||
    metadata.statusLabel !== exact.label ||
    metadata.reviewStatus !== "complete" ||
    !same(metadata.findingIds, review.findingIds) ||
    !same(metadata.recommendationIds, review.recommendationIds)
  ) {
    fail("parsed report metadata join drift for " + review.agentTaskId)
  }
  for (const id of [...review.findingIds, ...review.recommendationIds]) {
    if (!reportDeclaresId(body, id)) {
      fail(review.agentTaskId + " metadata cites an undeclared retained ID " + id)
    }
  }
}

const parseRuleClosure = (text, label) => {
  const pattern = /^## Machine-readable selected-direction closure\n\n```json\n([\s\S]*?)\n```/gm
  const blocks = [...text.matchAll(pattern)]
  if (blocks.length !== 1) fail(label + " must contain exactly one machine-readable closure")
  assertNoDuplicateJsonKeys(blocks[0][1], label + " closure")
  return JSON.parse(blocks[0][1])
}

const validateRuleClosure = (closure, scope, manifest) => {
  const directionId = scope === "language" ? "CL-CODEX-1" : "NAV-CODEX-1"
  exactKeys(closure, [
    "schemaVersion",
    "programVersion",
    "directionId",
    "evidenceMode",
    "humanEvidence",
    "humanParticipantCount",
    "notHumanUsabilityTested",
    "rules",
  ], scope + " rule closure")
  if (
    closure.schemaVersion !== exact.closureSchema ||
    closure.programVersion !== exact.program ||
    closure.directionId !== directionId ||
    closure.evidenceMode !== exact.evidenceMode ||
    closure.humanEvidence !== "none" ||
    closure.humanParticipantCount !== 0 ||
    closure.notHumanUsabilityTested !== true
  ) {
    fail(scope + " rule closure identity or evidence boundary drift")
  }
  if (!Array.isArray(closure.rules)) fail(scope + " rule closure must contain rules")
  const ids = closure.rules.map((rule) => rule.id)
  if (!unique(ids) || !same(ids, [...ids].sort())) {
    fail(scope + " rule closure IDs must be unique and sorted")
  }
  for (const rule of closure.rules) {
    exactKeys(rule, ["id", "statement"], scope + " closure rule")
    for (const value of [rule.id, rule.statement]) {
      if (typeof value !== "string" || value !== value.normalize("NFC").trim().replace(/\s+/g, " ")) {
        fail(scope + " closure strings must be normalized")
      }
    }
  }
  const expectedRules = manifest.synthesis.rules
    .filter((rule) => rule.status === "promoted" && (rule.scope === scope || rule.scope === "shared"))
    .map((rule) => ({ id: rule.id, statement: rule.statement }))
    .sort((left, right) => left.id.localeCompare(right.id))
  if (!same(closure.rules, expectedRules)) {
    fail(scope + " product contract does not equal the selected-direction rule closure")
  }
}

const manifestSource = await readFile(manifestPath, "utf8")
assertNoDuplicateJsonKeys(manifestSource, "evidence-manifest")
assertNoPositiveHumanClaim(manifestSource, "evidence manifest")
const manifest = JSON.parse(manifestSource)
validateModel(manifest)
const sourceById = new Map(manifest.sourceArtifacts.map((artifact) => [artifact.id, artifact]))

for (const artifact of manifest.sourceArtifacts) {
  execFileSync("git", ["cat-file", "-e", artifact.commit + "^{commit}"], {
    cwd: repositoryRoot,
    stdio: "ignore",
  })
  const actual = sha256(readGitBlob(artifact.commit, artifact.path))
  if (actual !== artifact.sha256) fail("source hash mismatch for " + artifact.id)
}

const parsedReports = new Map()
for (const review of manifest.reviews) {
  const report = await readFile(resolve(repositoryRoot, review.reportPath))
  if (sha256(report) !== review.reportSha256) fail("review hash mismatch for " + review.agentTaskId)
  const text = report.toString("utf8")
  const { metadata, body } = parseReportMetadata(text, review.agentTaskId)
  validateReportMetadataJoin(metadata, review, body)
  parsedReports.set(review.agentTaskId, { metadata, body })
  for (const required of [
    exact.program,
    "humanEvidence: none",
    "humanParticipantCount: 0",
    "notHumanUsabilityTested: true",
    exact.label,
  ]) {
    if (!text.includes(required)) fail(review.agentTaskId + " report omits " + required)
  }
  for (const sourceId of review.evidenceArtifactIds) {
    const artifact = sourceById.get(sourceId)
    for (const coordinatePart of [artifact.commit, artifact.path, artifact.sha256]) {
      if (!text.includes(coordinatePart)) {
        fail(review.agentTaskId + " report omits joined source coordinate " + sourceId)
      }
    }
  }
  assertNoPositiveHumanClaim(text, review.agentTaskId + " report")
}

for (const path of ["product/DESIGN_SYSTEM.md", "product/COMPONENT_ARCHITECTURE.md"]) {
  const current = await readFile(resolve(repositoryRoot, path))
  if (sha256(current) !== sha256(readGitBlob(exact.base, path))) {
    fail(path + " must remain a noncanonical unchanged projection in this packet")
  }
}

const promotionTexts = []
for (const promotion of manifest.canonicalPromotions) {
  const bytes = await readFile(resolve(repositoryRoot, promotion.path))
  if (sha256(bytes) !== promotion.sha256) fail("promotion hash mismatch for " + promotion.path)
  promotionTexts.push(bytes)
}

const packet = await readFile(packetPath, "utf8")
const contentDesign = await readFile(contentDesignPath, "utf8")
const routes = await readFile(routesPath, "utf8")
const planIndex = await readFile(planIndexPath, "utf8")
const publicTexts = [packet, planIndex, ...promotionTexts]
for (const required of [
  exact.program,
  exact.label,
  "humanParticipantCount: 0",
  "humanEvidence: none",
]) {
  if (!packet.includes(required)) fail("packet omits " + required)
}
for (const required of [
  "codex-task-receipt-v1",
  "audit summary, not a",
  "cannot re-query local Codex JSONL",
  "cryptographically authenticate a session",
]) {
  if (!packet.includes(required)) fail("packet omits receipt limitation: " + required)
}
for (const required of ["CL-CODEX-1", exact.label]) {
  if (!contentDesign.includes(required)) fail("content contract omits " + required)
}
for (const required of ["NAV-CODEX-1", exact.label]) {
  if (!routes.includes(required)) fail("route contract omits " + required)
}
const contentClosure = parseRuleClosure(contentDesign, "CONTENT_DESIGN")
const routeClosure = parseRuleClosure(routes, "ROUTES")
validateRuleClosure(contentClosure, "language", manifest)
validateRuleClosure(routeClosure, "navigation", manifest)
for (const required of [
  "DONE — CODEX-ONLY",
  "human evidence none",
  "human participant count 0",
  exact.label,
]) {
  if (!planIndex.includes(required)) fail("plan index omits " + required)
}

const combinedPublicText = publicTexts.join("\n").toLowerCase()
assertNoPositiveHumanClaim(combinedPublicText, "promoted public contract")
for (const forbidden of [
  "validated with users",
  "participant-validated",
  "human-validated direction",
  "human usability testing passed",
  "human sign-off received",
  "needs attention — external participant resources",
  "zero-budget-unpaid-v1",
]) {
  if (combinedPublicText.includes(forbidden)) fail("forbidden human-research claim/process remains: " + forbidden)
}

for (const path of [
  "plans/004-005-fieldwork-operations-packet.md",
  "plans/004-005-fieldwork-schema-contract.json",
  "plans/004-005-fieldwork-unpaid-terms.v1.tsv",
  "plans/004-005-nonparticipant-evidence.v1.tsv",
  "plans/004-005-zero-cost-fieldwork-kit.md",
  "plans/validate-004-005-fieldwork-packet.mjs",
]) {
  await assertAbsent(resolve(repositoryRoot, path))
}

const recomputeReceiptDigest = (receipt) => {
  const payload = Object.fromEntries(receiptPayloadKeys.map((key) => [key, receipt[key]]))
  receipt.safeReceiptSha256 = sha256(Buffer.from(JSON.stringify(payload), "utf8"))
}

const mutations = [
  ["human count", (value) => { value.humanParticipantCount = 1 }],
  ["human evidence", (value) => { value.humanEvidence = "present" }],
  ["human participant evidence", (value) => { value.humanParticipantEvidence = "present" }],
  ["usability claim", (value) => { value.humanClaims.humanUsabilityTested = true }],
  ["status label", (value) => { value.statusLabel = "tested" }],
  ["human role", (value) => { value.humanRoleCounts.reviewers = 1 }],
  ["unknown positive human field", (value) => { value.humanStudyCompleted = true }],
  ["unknown positive review field", (value) => { value.reviews[0].humanReviewApproved = true }],
  ["duplicate task", (value) => { value.reviews[1].agentTaskId = value.reviews[0].agentTaskId }],
  ["missing supplied lane", (value) => { value.reviews = value.reviews.filter((review) => review.agentTaskId !== "/root/free_recruitment") }],
  ["persona substitution", (value) => { value.reviews[0].actorClass = "persona" }],
  ["non-independent review", (value) => { value.reviews[0].independent = false }],
  ["missing domain", (value) => {
    value.reviews.forEach((review) => {
      review.domains = review.domains.filter((domain) => domain !== "navigation")
    })
  }],
  ["spawned-lane domain loss", (value) => {
    const review = value.reviews.find((candidate) => candidate.agentTaskId === "/root/accessibility_lane_v1")
    review.domains = review.domains.filter((domain) => domain !== "accessibility")
  }],
  ["source hash", (value) => { value.sourceArtifacts[0].sha256 = "0".repeat(64) }],
  ["source coordinate", (value) => { value.sourceArtifacts[0].path = "apps/site/scripts/other.tsx" }],
  ["source evidence closure", (value) => { value.sourceArtifacts.pop() }],
  ["report hash", (value) => { value.reviews[0].reportSha256 = "0".repeat(64) }],
  ["report ID", (value) => { value.reviews[0].reportId = "invented-report" }],
  ["review completion", (value) => { value.reviews[0].reviewStatus = "partial" }],
  ["task report swap", (value) => {
    const first = value.reviews[0]
    const second = value.reviews[1]
    ;[first.reportPath, second.reportPath] = [second.reportPath, first.reportPath]
    ;[first.reportSha256, second.reportSha256] = [second.reportSha256, first.reportSha256]
  }],
  ["review evidence join", (value) => { value.reviews[1].evidenceArtifactIds.pop() }],
  ["receipt lineage", (value) => { value.taskReceipts[0].parentThreadId = "01a047c6-af9b-7eb1-b2e7-920c71cba367" }],
  ["receipt lineage with recomputed digest", (value) => {
    value.taskReceipts[0].parentThreadId = "01a047c6-af9b-7eb1-b2e7-920c71cba367"
    recomputeReceiptDigest(value.taskReceipts[0])
  }],
  ["receipt digest", (value) => { value.taskReceipts[0].safeReceiptSha256 = "f".repeat(64) }],
  ["receipt report swap with recomputed digest", (value) => {
    const first = value.taskReceipts[0]
    const second = value.taskReceipts[1]
    first.reportPath = second.reportPath
    first.reportSha256 = second.reportSha256
    recomputeReceiptDigest(first)
  }],
  ["receipt and review report mismatch", (value) => {
    const replacement = "f".repeat(64)
    value.taskReceipts[0].reportSha256 = replacement
    value.reviews[0].reportSha256 = replacement
    recomputeReceiptDigest(value.taskReceipts[0])
  }],
  ["missing receipt", (value) => { value.taskReceipts.pop() }],
  ["duplicate receipt", (value) => { value.taskReceipts[1] = clone(value.taskReceipts[0]) }],
  ["receipt physical key order", (value) => {
    const original = value.taskReceipts[0]
    value.taskReceipts[0] = { taskPath: original.taskPath, ...original }
  }],
  ["receipt extra field", (value) => { value.taskReceipts[0].authenticated = true }],
  ["under-supported promotion", (value) => {
    const rule = value.synthesis.rules.find((candidate) => candidate.status === "promoted")
    rule.supportReferences = rule.supportReferences.slice(0, 1)
  }],
  ["invented support ID", (value) => { value.synthesis.rules[0].supportReferences[0].findingId = "UI-99" }],
  ["support task mismatch", (value) => { value.synthesis.rules[0].supportReferences[0].taskPath = "/root/navigation_lane_v1" }],
  ["duplicate support reference", (value) => { value.synthesis.rules[0].supportReferences.push(clone(value.synthesis.rules[0].supportReferences[0])) }],
  ["support kind mismatch", (value) => {
    const reference = value.synthesis.rules[0].supportReferences[0]
    reference.recommendationId = reference.findingId
  }],
  ["owner unresolved promotion", (value) => {
    const rule = value.synthesis.rules.find((candidate) => candidate.ownerLockedUnresolved === true)
    rule.status = "promoted"
  }],
  ["one-lane shortest promotion", (value) => {
    const rule = value.synthesis.rules.find((candidate) => candidate.id === "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY")
    rule.supportReferences.push({ taskPath: "/root/navigation_lane_v1", findingId: "NAV-F04" })
    rule.status = "promoted"
  }],
  ["candidate disposition promoted", (value) => { value.synthesis.candidateDispositions[0].implementationRule = true }],
  ["rule statement", (value) => { value.synthesis.rules[0].statement = "Repurposed semantic claim with sufficient string length." }],
  ["direction closure", (value) => { value.synthesis.selectedDirections.language.ruleIds = [] }],
  ["promotion hash", (value) => { value.canonicalPromotions[0].sha256 = "0".repeat(64) }],
]

let mutationChecks = 0
for (const [label, mutate] of mutations) {
  const candidate = clone(manifest)
  mutate(candidate)
  let rejected = false
  try {
    validateModel(candidate)
  } catch {
    rejected = true
  }
  if (!rejected) fail("targeted mutation accepted: " + label)
  mutationChecks += 1
}

const closureMutations = [
  ["closure statement drift", (value) => { value.rules[0].statement = "A different normalized statement that is still structurally valid." }],
  ["closure missing rule", (value) => { value.rules.pop() }],
  ["closure invented rule", (value) => {
    value.rules.push({ id: "ZZ-INVENTED", statement: "An invented rule that is not in the selected direction." })
  }],
  ["closure duplicate rule", (value) => { value.rules.push(clone(value.rules.at(-1))) }],
  ["closure wrong direction", (value) => { value.directionId = "NAV-CODEX-1" }],
]
for (const [label, mutate] of closureMutations) {
  const candidate = clone(contentClosure)
  mutate(candidate)
  let rejected = false
  try {
    validateRuleClosure(candidate, "language", manifest)
  } catch {
    rejected = true
  }
  if (!rejected) fail("targeted semantic mutation accepted: " + label)
  mutationChecks += 1
}

const metadataMutations = [
  ["metadata agent task", (value) => { value.agentTaskId = "/root/invented" }],
  ["metadata report ID", (value) => { value.reportId = "invented-report" }],
  ["metadata completion", (value) => { value.reviewStatus = "partial" }],
  ["metadata invented finding", (value) => { value.findingIds[0] = "UI-99" }],
]
const suppliedReview = manifest.reviews.find((review) => review.agentTaskId === "/root/free_recruitment")
const suppliedParsed = parsedReports.get("/root/free_recruitment")
for (const [label, mutate] of metadataMutations) {
  const candidate = clone(suppliedParsed.metadata)
  mutate(candidate)
  let rejected = false
  try {
    validateReportMetadataJoin(candidate, suppliedReview, suppliedParsed.body)
  } catch {
    rejected = true
  }
  if (!rejected) fail("targeted report metadata mutation accepted: " + label)
  mutationChecks += 1
}

let duplicateRejected = false
try {
  assertNoDuplicateJsonKeys('{"a":1,"a":2}', "duplicate-key-mutation")
} catch {
  duplicateRejected = true
}
if (!duplicateRejected) fail("duplicate-key mutation accepted")
mutationChecks += 1

const positiveHumanClaimMutations = [
  "humanParticipantCount: 2",
  "participants were recruited",
  "We interviewed 6 participants.",
  "A moderator observed five sessions.",
  "The human reviewer approved the direction.",
  "The decision owner signed off.",
  "Usability testing with people validated this direction.",
  '{"humanStudyCompleted":true}',
  '{"participantEvidence":"present"}',
]

for (const claim of positiveHumanClaimMutations) {
  let rejected = false
  try {
    assertNoPositiveHumanClaim(claim, "claim-mutation")
  } catch {
    rejected = true
  }
  if (!rejected) fail("positive human-claim mutation accepted: " + claim)
  mutationChecks += 1
}

for (const claim of [
  "No participant round occurred.",
  "Participant validation remains absent and is not claimed.",
  "There are no moderators, human reviewers, decision owners, or sign-offs.",
]) {
  assertNoPositiveHumanClaim(claim, "negative-claim-fixture")
}

process.stdout.write(JSON.stringify({
  status: "PASS",
  programVersion: exact.program,
  statusLabel: exact.label,
  humanParticipantCount: 0,
  humanEvidence: "none",
  reviews: manifest.reviews.length,
  sourceArtifacts: manifest.sourceArtifacts.length,
  promotedRules: manifest.synthesis.rules.filter((rule) => rule.status === "promoted").length,
  unresolvedRules: manifest.synthesis.rules.filter((rule) => rule.status === "unresolved").length,
  mutationChecks,
}) + "\n")
