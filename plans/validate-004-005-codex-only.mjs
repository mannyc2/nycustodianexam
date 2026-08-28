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
  schema: "codex-only-uiux-evidence-v1",
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
    reportPath: "research/ui-ux/codex-only-v1/free-recruitment-review.md",
    reportSha256: "b5d228297f9d77da85a9d8141aaa41853f4f88cb1c6329bcaba3ca0ff7ef0027",
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
    reportPath: "research/ui-ux/codex-only-v1/language-trust-review.md",
    reportSha256: "5a33d032c7c70fb0dd2a9616b79267385b1fb7f2b19ce8395467b57eee3905db",
    domains: [
      "ai-slop-patterns",
      "consumer-trust",
      "internal-wording-leakage",
      "navigation",
      "plain-language",
    ],
  },
  "/root/navigation_lane_v1": {
    reportPath: "research/ui-ux/codex-only-v1/navigation-review.md",
    reportSha256: "9ec0ada23dec2b6003f1b0e96132e3ef62a9ded0b3f865c4b9a17f3682875956",
    domains: [
      "cognitive-load",
      "learner-task-information-architecture",
      "navigation",
      "plain-language",
    ],
  },
  "/root/accessibility_lane_v1": {
    reportPath: "research/ui-ux/codex-only-v1/accessibility-cognitive-review.md",
    reportSha256: "353a905622a5e472242e84e193601e6beb350c1d6debef432974ecec6bb35b55",
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

const requiredRuleContracts = {
  "CL-TASK-FIRST": { scope: "language", supportTaskIds: requiredTaskIds, status: "promoted" },
  "CL-LAYER-PROOF": { scope: "language", supportTaskIds: requiredTaskIds, status: "promoted" },
  "CL-TYPED-PUBLIC-ERRORS": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "promoted" },
  "CL-FOCUSED-FEEDBACK": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "promoted" },
  "CL-DORMANT-CORRECTION": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "promoted" },
  "CL-CL1-QUARANTINE": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "promoted" },
  "CL-US-ENGLISH-FACTS": { scope: "language", supportTaskIds: ["/root/free_recruitment", "/root/language_lane_v1"], status: "promoted" },
  "CL-NO-UNMEASURED-TIME": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "promoted" },
  "CL-D3-NOT-SELECTED": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/language_lane_v1"], status: "promoted" },
  "NAV-TWO-TIER": { scope: "navigation", supportTaskIds: requiredTaskIds, status: "promoted" },
  "NAV-NATIVE-COMPACT": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/navigation_lane_v1"], status: "promoted" },
  "NAV-FOCUSED-PLAYERS": { scope: "navigation", supportTaskIds: requiredTaskIds, status: "promoted" },
  "NAV-SHELL-BOUNDARY": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/navigation_lane_v1"], status: "promoted" },
  "NAV-PRACTICE-TASK-HUB": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/navigation_lane_v1"], status: "promoted" },
  "NAV-STATIC-REVIEW-ENTRY": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/navigation_lane_v1"], status: "promoted" },
  "NAV-ROUTE-IDENTITY": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/language_lane_v1", "/root/navigation_lane_v1"], status: "promoted" },
  "NAV-NOJS": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/navigation_lane_v1"], status: "promoted" },
  "NAV-NONVISUAL-EQUAL-DISCOVERY": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/navigation_lane_v1"], status: "promoted" },
  "SHARED-HUMAN-EVIDENCE-BOUNDARY": { scope: "shared", supportTaskIds: requiredTaskIds, status: "promoted" },
  "SHARED-PRESERVE-LOAD-BEARING-TRUTH": { scope: "shared", supportTaskIds: ["/root/accessibility_lane_v1", "/root/language_lane_v1", "/root/navigation_lane_v1"], status: "promoted" },
  "SHARED-EXPLICIT-PROFILE-CONTEXT": { scope: "shared", supportTaskIds: requiredTaskIds, status: "promoted" },
  "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY": { scope: "shared", supportTaskIds: ["/root/free_recruitment"], status: "unresolved" },
  "UNRESOLVED-HOME-PRIMARY-CTA": { scope: "shared", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/navigation_lane_v1"], status: "unresolved" },
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING": { scope: "navigation", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/navigation_lane_v1"], status: "unresolved" },
  "UNRESOLVED-D1-VS-D2": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "unresolved" },
  "UNRESOLVED-PRACTICE-TIMING": { scope: "language", supportTaskIds: ["/root/accessibility_lane_v1", "/root/free_recruitment", "/root/language_lane_v1"], status: "unresolved" },
  "UNRESOLVED-SOURCE-PROMINENCE": { scope: "language", supportTaskIds: requiredTaskIds, status: "unresolved" },
}

const requiredRuleStatements = {
  "CL-TASK-FIRST": "At each action or decision, state the learner task, material consequence, and next safe action clearly.",
  "CL-LAYER-PROOF": "Keep human-readable proof adjacent or disclosed and move raw identifiers and diagnostics out of the default layer.",
  "CL-TYPED-PUBLIC-ERRORS": "Map typed failures to stable outcome, preserved-state, and recovery copy while keeping raw exceptions internal.",
  "CL-FOCUSED-FEEDBACK": "Use specific outcomes and concise plain rationales, remove internal model labels and canned cadence, and keep required proof reachable.",
  "CL-DORMANT-CORRECTION": "State the dormant correction boundary in consumer terms and never imply an unavailable endpoint can receive a report.",
  "CL-CL1-QUARANTINE": "Keep recovered CL-1 bytes unchanged as evidence and author factually current U.S.-English CL-2 copy.",
  "CL-US-ENGLISH-FACTS": "Use U.S. English, current derived counts, and bounded factual claims without unsupported universal language.",
  "CL-NO-UNMEASURED-TIME": "Do not publish a practice-duration estimate without measured evidence for the exact task and conditions.",
  "CL-D3-NOT-SELECTED": "Do not select CL-D3 because it has no recovered prototype and sits nearest prohibited urgency, guilt, mastery, and readiness claims.",
  "NAV-TWO-TIER": "Separate learner tasks from utility and trust destinations instead of presenting every destination as a peer.",
  "NAV-NATIVE-COMPACT": "Use a named native no-JavaScript-safe compact disclosure before global links wrap into peer rows.",
  "NAV-FOCUSED-PLAYERS": "Give every player a named session landmark, progress, and truthful explicit exit without acquisition or utility navigation.",
  "NAV-SHELL-BOUNDARY": "Assign question, hazard, review, and simulation player route IDs to the focused shell and all other fixed routes to standard.",
  "NAV-PRACTICE-TASK-HUB": "Lead Practice with concrete task starts and place translated capacity diagnostics after those starts.",
  "NAV-STATIC-REVIEW-ENTRY": "Expose Review through a normal static parent entry while retaining local and noindex semantics.",
  "NAV-ROUTE-IDENTITY": "Preserve every fixed route identity, path, owner, indexability value, offline rule, and no-JavaScript purpose.",
  "NAV-NOJS": "Keep primary discovery as static ordinary document navigation with truthful JavaScript-free fallbacks.",
  "NAV-NONVISUAL-EQUAL-DISCOVERY": "Give visual and text-keyboard hazard tasks equivalent discovery without claiming identical measurement.",
  "SHARED-HUMAN-EVIDENCE-BOUNDARY": "Keep human evidence none, human participant count zero, and every result labeled not human usability tested.",
  "SHARED-PRESERVE-LOAD-BEARING-TRUTH": "Preserve unofficial status, uncertainty, source support, local-data risk, security boundaries, and commit-before-reveal.",
  "SHARED-EXPLICIT-PROFILE-CONTEXT": "Require explicit or visibly neutral profile context and never silently substitute the first jurisdiction.",
  "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY": "Whether the shortest valid whole-bank question count should be the primary Practice start remains unresolved.",
  "UNRESOLVED-HOME-PRIMARY-CTA": "Whether Check my exam or Start practice is the universal primary Home action remains unresolved.",
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING": "Exact global navigation labels, group count, membership, nesting, and order remain unresolved rather than consensus.",
  "UNRESOLVED-D1-VS-D2": "The full choice between CL-D1 and CL-D2, including any hybrid, remains unresolved and no candidate is selected.",
  "UNRESOLVED-PRACTICE-TIMING": "No practice duration is established; only exact current question counts may be stated.",
  "UNRESOLVED-SOURCE-PROMINENCE": "The route-specific choice between inline proof and disclosed proof remains unresolved.",
}

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

  if (!Array.isArray(manifest.reviews) || manifest.reviews.length < 4) {
    fail("four independent Codex review lanes are required")
  }
  const taskIds = manifest.reviews.map((review) => review.taskId)
  const reportPaths = manifest.reviews.map((review) => review.reportPath)
  if (!unique(taskIds) || !unique(reportPaths) || !same([...taskIds].sort(), requiredTaskIds)) {
    fail("review task IDs and report paths must retain the exact four-lane set")
  }
  const coveredDomains = new Set()
  const sourceIdSet = new Set(sourceIds)
  for (const review of manifest.reviews) {
    const reviewKeys = [
      "taskId",
      "actorClass",
      "independent",
      "evidenceMode",
      "humanEvidence",
      "humanParticipantCount",
      "notHumanUsabilityTested",
      "statusLabel",
      "reportPath",
      "reportSha256",
      "domains",
      "evidenceArtifactIds",
      "rubricScores",
      "recommendationIds",
      ...(review.taskId === "/root/free_recruitment" ? ["priorityCounts"] : []),
    ]
    exactKeys(review, reviewKeys, "review " + String(review.taskId))
    if (
      review.actorClass !== "codex-agent" ||
      review.independent !== true ||
      review.evidenceMode !== exact.evidenceMode ||
      review.humanEvidence !== "none" ||
      review.humanParticipantCount !== 0 ||
      review.notHumanUsabilityTested !== true ||
      review.statusLabel !== exact.label
    ) {
      fail("review evidence boundary drift for " + String(review.taskId))
    }
    if (
      typeof review.taskId !== "string" ||
      !review.taskId.startsWith("/root/") ||
      typeof review.reportPath !== "string" ||
      !review.reportPath.startsWith("research/ui-ux/codex-only-v1/") ||
      !validSha(review.reportSha256)
    ) {
      fail("invalid review coordinate for " + String(review.taskId))
    }
    const requiredReview = requiredReviewContracts[review.taskId]
    if (
      review.reportPath !== requiredReview.reportPath ||
      review.reportSha256 !== requiredReview.reportSha256 ||
      !same([...review.domains].sort(), [...requiredReview.domains].sort())
    ) {
      fail("review path, hash, or domain closure drift for " + review.taskId)
    }
    if (!Array.isArray(review.domains) || review.domains.length === 0 || !unique(review.domains)) {
      fail("invalid review domains for " + review.taskId)
    }
    review.domains.forEach((domain) => coveredDomains.add(domain))
    if (
      !Array.isArray(review.evidenceArtifactIds) ||
      review.evidenceArtifactIds.length < 3 ||
      !unique(review.evidenceArtifactIds) ||
      review.evidenceArtifactIds.some((id) => !sourceIdSet.has(id))
    ) {
      fail("review lacks traceable source artifacts for " + review.taskId)
    }
    if (!same(
      [...review.evidenceArtifactIds].sort(),
      [...requiredReviewEvidenceIds[review.taskId]].sort(),
    )) {
      fail("review evidence join drift for " + review.taskId)
    }
    if (!Array.isArray(review.recommendationIds) || review.recommendationIds.length === 0) {
      fail("review lacks structured recommendations for " + review.taskId)
    }
    if (review.taskId === "/root/free_recruitment") {
      if (review.rubricScores !== null || review.priorityCounts?.P1 !== 8 || review.priorityCounts?.P2 !== 3) {
        fail("supplied lane scores or priority accounting drift")
      }
    } else {
      const scores = Object.values(review.rubricScores ?? {})
      if (scores.length < 4 || scores.some((score) => !Number.isInteger(score) || score < 1 || score > 5)) {
        fail("review rubric must contain at least four 1-5 scores for " + review.taskId)
      }
    }
  }
  if (requiredDomains.some((domain) => !coveredDomains.has(domain))) {
    fail("independent reviews do not cover every required domain")
  }
  const nonSuppliedDomains = new Set(manifest.reviews
    .filter((review) => review.taskId !== "/root/free_recruitment")
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
      "supportTaskIds",
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
      !Array.isArray(rule.supportTaskIds) ||
      !unique(rule.supportTaskIds) ||
      rule.supportTaskIds.some((id) => !taskIds.includes(id)) ||
      !Array.isArray(rule.dissentTaskIds) ||
      !unique(rule.dissentTaskIds) ||
      rule.dissentTaskIds.some((id) => !taskIds.includes(id)) ||
      rule.dissentTaskIds.some((id) => rule.supportTaskIds.includes(id)) ||
      !Array.isArray(rule.hardConstraintFailures)
    ) {
      fail("invalid synthesis rule " + String(rule.id))
    }
    const locked = ownerLockedUnresolved.includes(rule.id)
    if (locked !== (rule.ownerLockedUnresolved === true)) {
      fail("owner-locked unresolved marker drift for " + rule.id)
    }
    const computedStatus =
      locked || rule.supportTaskIds.length < manifest.synthesis.minimumIndependentSupport
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
      !same([...rule.supportTaskIds].sort(), [...requiredRule.supportTaskIds].sort()) ||
      rule.statement !== requiredRuleStatements[rule.id] ||
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

  if (!Array.isArray(manifest.canonicalPromotions) || manifest.canonicalPromotions.length !== 4) {
    fail("exactly four maintained product promotions are required")
  }
  const promotionPaths = manifest.canonicalPromotions.map((promotion) => promotion.path).sort()
  if (!same(promotionPaths, [
    "product/COMPONENT_ARCHITECTURE.md",
    "product/CONTENT_DESIGN.md",
    "product/DESIGN_SYSTEM.md",
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

for (const review of manifest.reviews) {
  const report = await readFile(resolve(repositoryRoot, review.reportPath))
  if (sha256(report) !== review.reportSha256) fail("review hash mismatch for " + review.taskId)
  const text = report.toString("utf8")
  for (const required of [
    exact.program,
    "humanEvidence: none",
    "humanParticipantCount: 0",
    "notHumanUsabilityTested: true",
    exact.label,
  ]) {
    if (!text.includes(required)) fail(review.taskId + " report omits " + required)
  }
  for (const sourceId of review.evidenceArtifactIds) {
    const artifact = sourceById.get(sourceId)
    for (const coordinatePart of [artifact.commit, artifact.path, artifact.sha256]) {
      if (!text.includes(coordinatePart)) {
        fail(review.taskId + " report omits joined source coordinate " + sourceId)
      }
    }
  }
  assertNoPositiveHumanClaim(text, review.taskId + " report")
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
for (const required of ["CL-CODEX-1", exact.label]) {
  if (!contentDesign.includes(required)) fail("content contract omits " + required)
}
for (const required of ["NAV-CODEX-1", exact.label]) {
  if (!routes.includes(required)) fail("route contract omits " + required)
}
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

const mutations = [
  ["human count", (value) => { value.humanParticipantCount = 1 }],
  ["human evidence", (value) => { value.humanEvidence = "present" }],
  ["human participant evidence", (value) => { value.humanParticipantEvidence = "present" }],
  ["usability claim", (value) => { value.humanClaims.humanUsabilityTested = true }],
  ["status label", (value) => { value.statusLabel = "tested" }],
  ["human role", (value) => { value.humanRoleCounts.reviewers = 1 }],
  ["unknown positive human field", (value) => { value.humanStudyCompleted = true }],
  ["unknown positive review field", (value) => { value.reviews[0].humanReviewApproved = true }],
  ["duplicate task", (value) => { value.reviews[1].taskId = value.reviews[0].taskId }],
  ["missing supplied lane", (value) => { value.reviews = value.reviews.filter((review) => review.taskId !== "/root/free_recruitment") }],
  ["persona substitution", (value) => { value.reviews[0].actorClass = "persona" }],
  ["non-independent review", (value) => { value.reviews[0].independent = false }],
  ["missing domain", (value) => {
    value.reviews.forEach((review) => {
      review.domains = review.domains.filter((domain) => domain !== "navigation")
    })
  }],
  ["spawned-lane domain loss", (value) => {
    const review = value.reviews.find((candidate) => candidate.taskId === "/root/accessibility_lane_v1")
    review.domains = review.domains.filter((domain) => domain !== "accessibility")
  }],
  ["source hash", (value) => { value.sourceArtifacts[0].sha256 = "0".repeat(64) }],
  ["source coordinate", (value) => { value.sourceArtifacts[0].path = "apps/site/scripts/other.tsx" }],
  ["source evidence closure", (value) => { value.sourceArtifacts.pop() }],
  ["report hash", (value) => { value.reviews[0].reportSha256 = "0".repeat(64) }],
  ["task report swap", (value) => {
    const first = value.reviews[0]
    const second = value.reviews[1]
    ;[first.reportPath, second.reportPath] = [second.reportPath, first.reportPath]
    ;[first.reportSha256, second.reportSha256] = [second.reportSha256, first.reportSha256]
  }],
  ["review evidence join", (value) => { value.reviews[1].evidenceArtifactIds.pop() }],
  ["under-supported promotion", (value) => {
    const rule = value.synthesis.rules.find((candidate) => candidate.status === "promoted")
    rule.supportTaskIds = rule.supportTaskIds.slice(0, 1)
  }],
  ["owner unresolved promotion", (value) => {
    const rule = value.synthesis.rules.find((candidate) => candidate.ownerLockedUnresolved === true)
    rule.status = "promoted"
  }],
  ["one-lane shortest promotion", (value) => {
    const rule = value.synthesis.rules.find((candidate) => candidate.id === "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY")
    rule.supportTaskIds.push("/root/navigation_lane_v1")
    rule.status = "promoted"
  }],
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
