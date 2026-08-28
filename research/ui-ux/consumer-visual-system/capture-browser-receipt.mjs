import AxeBuilder from "../../../apps/site/node_modules/@axe-core/playwright/dist/index.mjs"
import { chromium, firefox, webkit } from "../../../apps/site/node_modules/@playwright/test/index.mjs"
import { createHash } from "node:crypto"
import { execFileSync, spawn } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  cssCustomPropertyForTokenRole,
  executionCoordinates,
  routeArchetypes,
  sharedFrames,
  territories,
  tokenRoles
} from "./prototype.mjs"

export const evidenceCoordinates = Object.freeze({
  protocolId: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  humanReviewRequired: false,
  notHumanUsabilityTested: true
})

export const axePolicy = Object.freeze({
  tags: Object.freeze(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]),
  allowlist: Object.freeze([]),
  rule: "Every Axe violation at every reported impact is retained. A finding passes only through an exact closed allowlist entry with a nonempty disposition; this receipt has no allowlist entries."
})

export const presentationContracts = Object.freeze({
  default: Object.freeze({ width: 1440, height: 1000, queryPresentation: "default", evidenceKind: "default" }),
  "phone-320": Object.freeze({ width: 320, height: 900, queryPresentation: "default", evidenceKind: "viewport" }),
  "phone-390": Object.freeze({ width: 390, height: 900, queryPresentation: "default", evidenceKind: "viewport" }),
  "tablet-768": Object.freeze({ width: 768, height: 1024, queryPresentation: "default", evidenceKind: "viewport" }),
  "desktop-1440": Object.freeze({ width: 1440, height: 1000, queryPresentation: "default", evidenceKind: "viewport" }),
  "large-text-125": Object.freeze({ width: 320, height: 900, queryPresentation: "large-text", evidenceKind: "large-text-125", scale: 1.25 }),
  "zoom-400": Object.freeze({ width: 320, height: 900, queryPresentation: "default", evidenceKind: "zoom-400-equivalent", physicalViewportWidth: 1280, zoomFactor: 4 }),
  "forced-colors": Object.freeze({ width: 390, height: 900, queryPresentation: "default", evidenceKind: "forced-colors" }),
  "reduced-motion": Object.freeze({ width: 390, height: 900, queryPresentation: "reduced-motion", evidenceKind: "reduced-motion" }),
  print: Object.freeze({ width: 816, height: 1056, queryPresentation: "default", evidenceKind: "print" })
})

export const specialPresentationMatrix = Object.freeze([
  {
    presentation: "phone-320",
    frameId: "orientation-home-check-fixture",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "The narrowest supported CSS viewport exercises compact navigation, full-width actions, and overflow at the 320 CSS-pixel reflow boundary."
  },
  {
    presentation: "phone-390",
    frameId: "study-launcher-ready",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "The wider phone fixture exercises the dense three-action launcher and paired status panels after compact-navigation collapse."
  },
  {
    presentation: "tablet-768",
    frameId: "browse-tool-detail",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "The tablet fixture exercises the accepted tool derivative and the layout immediately below the wide-navigation breakpoint."
  },
  {
    presentation: "desktop-1440",
    frameId: "browse-comparison",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "The large viewport exercises each territory's declared wide maximum, two-column composition, and accepted comparison derivative."
  },
  {
    presentation: "large-text-125",
    frameId: "focused-question-precommit",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "The narrow focused-task fixture combines 125 percent text with choices, commit actions, and the focused shell."
  },
  {
    presentation: "zoom-400",
    frameId: "focused-question-precommit",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "A 1280 physical-pixel viewport at 400 percent zoom is represented by its standards-equivalent 320 CSS-pixel layout viewport; no nonstandard CSS zoom is used."
  },
  {
    presentation: "forced-colors",
    frameId: "utility-correction-draft",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "Playwright's deterministic forced-colors emulation exercises form controls, disabled submission state, actions, and focus without treating emulation as assistive-technology user evidence."
  },
  {
    presentation: "reduced-motion",
    frameId: "focused-hazard-precommit",
    browserProjects: Object.freeze(["chromium"]),
    rationale: "The interactive hazard fixture verifies the reduced-motion media query and fixture presentation against the only animated transition contract."
  },
  {
    presentation: "print",
    frameId: "review-queue-empty",
    browserProjects: Object.freeze(["chromium", "firefox", "webkit"]),
    rationale: "The immutable receipt is intentionally limited to nine review-queue-empty cases: A/B/C in Chromium, Firefox, and WebKit. Broader uncommitted Playwright print output is diagnostic only."
  }
])

export const coverageContract = Object.freeze({
  classification: "representative-visual-comparison-not-exhaustive-legal-state-validation",
  registryRouteIdCount: 36,
  representedRouteIdCount: 10,
  representativeFrameCount: 12,
  defaultCaseCount: 108,
  deferredHazardVariants: Object.freeze([
    "asset-unavailable",
    "region-required",
    "version-mismatch",
    "commit-failure-preservation"
  ]),
  deferredRecoveryVariants: Object.freeze([
    "not-found-404",
    "withdrawn-410",
    "invalid-publication",
    "storage-unavailable",
    "service-failure"
  ]),
  printScope: Object.freeze({
    classification: "immutable-review-queue-empty-only",
    caseCount: 9,
    frameIds: Object.freeze(["review-queue-empty"]),
    territoryIds: Object.freeze(["A", "B", "C"]),
    browserProjects: Object.freeze(["chromium", "firefox", "webkit"])
  })
})

export const keyboardEvidenceContract = Object.freeze({
  classification: "native-document-focus-order-round-trip",
  forwardTraversal: "Native Tab visits every derived enabled rendered logical document focus stop exactly once in forward order and records the exact focused element coordinate.",
  returnTraversal: "Native Shift+Tab visits the exact reverse logical document focus-stop order, records each exact engine-specific focused element coordinate, and returns to the first logical stop.",
  programmaticElementFocusUsed: false,
  firefoxAutomationLimitation: "After the final document stop, Playwright Firefox sends forward focus to browser chrome but exposes document.activeElement as the last link indefinitely; 100 additional native Tab presses in both headless and headed Xvfb runs did not expose or re-enter that chrome path. Therefore this evidence does not claim an observable forward-Tab wrap in Firefox."
})

const researchDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(researchDirectory, "../../..")
const receiptPath = "research/ui-ux/consumer-visual-system/browser-receipt.json"
const prototypeRepositoryPath = "research/ui-ux/consumer-visual-system/prototype.html"
const tokenMappingPath = "research/ui-ux/consumer-visual-system/token-role-css-map.json"
const prototypePaths = [
  "research/ui-ux/consumer-visual-system/prototype.css",
  "research/ui-ux/consumer-visual-system/prototype.html",
  "research/ui-ux/consumer-visual-system/prototype.mjs"
]
const harnessPaths = [
  "research/ui-ux/consumer-visual-system/capture-browser-receipt.mjs",
  "research/ui-ux/consumer-visual-system/playwright.config.ts",
  "research/ui-ux/consumer-visual-system/serve-prototype.mjs",
  "research/ui-ux/consumer-visual-system/visual-system-research.pw.ts"
]
const terminalValidatorPath = "research/ui-ux/consumer-visual-system/verify-research.mjs"
const browserProjects = Object.freeze(["chromium", "firefox", "webkit"])
const browserTypes = { chromium, firefox, webkit }
const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const bytesAt = (path) => readFileSync(resolve(repositoryRoot, path))
const descriptor = (path) => {
  const bytes = bytesAt(path)
  return { path, bytes: bytes.byteLength, sha256: sha256(bytes) }
}
const loadPreReceiptSourceClosure = (sourceSha) => {
  let envelope
  try {
    const output = execFileSync(process.execPath, [
      resolve(repositoryRoot, terminalValidatorPath),
      "--phase=source",
      `--base=${executionCoordinates.acceptedStep2MergeSha}`
    ], {
      cwd: repositoryRoot,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024
    })
    envelope = JSON.parse(output)
  } catch (error) {
    throw new Error(`pre-receipt source closure failed: ${error instanceof Error ? error.message : String(error)}`)
  }
  const expectedEnvelopeKeys = ["algorithm", "baseSha", "files", "pathCount", "receiptType", "schemaVersion", "sha256", "sourceSha"]
  if (JSON.stringify(Object.keys(envelope).sort()) !== JSON.stringify(expectedEnvelopeKeys)) throw new Error("pre-receipt source closure envelope has unexpected keys")
  if (envelope.schemaVersion !== 1 || envelope.receiptType !== "plan-006-pre-receipt-source-closure") throw new Error("pre-receipt source closure envelope identity drift")
  if (envelope.baseSha !== executionCoordinates.acceptedStep2MergeSha || envelope.sourceSha !== sourceSha) throw new Error("pre-receipt source closure SHA join drift")
  return {
    algorithm: envelope.algorithm,
    sourceSha: envelope.sourceSha,
    pathCount: envelope.pathCount,
    files: envelope.files,
    sha256: envelope.sha256
  }
}
const caseKey = ({ territoryId, frameId, presentation, browserProject }) =>
  `${territoryId}\u0000${frameId}\u0000${presentation}\u0000${browserProject}`
const fixtureQueryFor = ({ territoryId, frameId, presentation }) => new URLSearchParams({
  territory: territoryId,
  frame: frameId,
  presentation: presentationContracts[presentation]?.queryPresentation ?? "invalid"
}).toString()
export const fixtureRequestPathFor = (coordinates) => `/?${fixtureQueryFor(coordinates)}`
export const repositoryRelativeUrlFor = (coordinates) => `${prototypeRepositoryPath}?${fixtureQueryFor(coordinates)}`

const semanticSignature = () => {
  const root = document.querySelector("[data-shared-root]")
  const clone = root.cloneNode(true)
  clone.querySelector(".fixture-note")?.remove()
  return JSON.stringify([...clone.querySelectorAll("*")].map((element) => ({
    alt: element.getAttribute("alt"),
    ariaCurrent: element.getAttribute("aria-current"),
    ariaLabel: element.getAttribute("aria-label"),
    assetId: element.getAttribute("data-asset-id"),
    disabled: element.hasAttribute("disabled"),
    href: element.getAttribute("href"),
    src: element.getAttribute("src"),
    tag: element.tagName.toLowerCase(),
    text: [...element.childNodes]
      .filter(({ nodeType }) => nodeType === Node.TEXT_NODE)
      .map(({ textContent }) => textContent?.replace(/\s+/g, " ").trim() ?? "")
      .filter(Boolean)
  })))
}

const normalizeAxeFindings = (violations) => violations.map(({ id, impact, help, helpUrl, tags, nodes }) => ({
  id,
  impact: impact ?? "unknown",
  help,
  helpUrl,
  tags: [...tags].sort(),
  nodeCount: nodes.length,
  targets: nodes.map(({ target }) => target.map(String).join(" ")).sort()
})).sort((left, right) => `${left.id}\u0000${left.impact}`.localeCompare(`${right.id}\u0000${right.impact}`))

const matchingAxeDisposition = (finding, allowlist = axePolicy.allowlist) => allowlist.find((entry) =>
  entry.id === finding.id &&
  entry.impact === finding.impact &&
  typeof entry.disposition === "string" &&
  entry.disposition.trim().length > 0
)

export const validateBrowserCase = (browserCase, allowlist = axePolicy.allowlist) => {
  const errors = []
  const presentationContract = presentationContracts[browserCase.presentation]
  const frame = sharedFrames.find(({ frameId }) => frameId === browserCase.frameId)
  if (presentationContract === undefined) errors.push("unknown-presentation")
  if (frame === undefined) errors.push("unknown-frame")
  if (frame !== undefined) {
    if (browserCase.archetypeId !== frame.archetypeId) errors.push("archetype-join")
    if (browserCase.routePath !== frame.routePath) errors.push("route-path-join")
  }
  if (browserCase.fixtureRequestPath !== fixtureRequestPathFor(browserCase)) errors.push("fixture-request-path-join")
  if (browserCase.repositoryRelativeUrl !== repositoryRelativeUrlFor(browserCase)) errors.push("repository-relative-url-join")
  if (presentationContract !== undefined) {
    if (browserCase.requestedViewportWidth !== presentationContract.width || browserCase.requestedViewportHeight !== presentationContract.height) errors.push("requested-viewport-contract")
    if (browserCase.observedWindowInnerWidth !== presentationContract.width || browserCase.clientWidth !== presentationContract.width) errors.push("observed-viewport-width")
    if (browserCase.observedWindowInnerHeight !== presentationContract.height) errors.push("observed-viewport-height")
    if (browserCase.presentationEvidence?.kind !== presentationContract.evidenceKind) errors.push("presentation-evidence-kind")
    if (browserCase.presentationEvidence?.rootPresentationDataset !== presentationContract.queryPresentation) errors.push("root-presentation-dataset")
  }
  if (browserCase.httpResult !== 200) errors.push("http-result")
  if (browserCase.externalOriginCount !== 0) errors.push("external-origin")
  if (browserCase.scrollWidth > browserCase.clientWidth) errors.push("horizontal-overflow")
  if (!Number.isInteger(browserCase.semanticDirectTextEntryCount) || browserCase.semanticDirectTextEntryCount < 1) errors.push("semantic-direct-text-empty")
  if (!Array.isArray(browserCase.axeFindings)) errors.push("axe-findings-missing")
  else if (browserCase.axeFindings.some((finding) => matchingAxeDisposition(finding, allowlist) === undefined)) errors.push("unallowlisted-axe-finding")

  if (browserCase.presentation === "print") {
    if (browserCase.keyboardTraversal?.performed !== false) errors.push("print-keyboard-evidence-must-be-not-applicable")
    if (browserCase.printToolbarSuppressed !== true) errors.push("print-toolbar-not-suppressed")
    if (browserCase.printActionRowSuppressed !== true) errors.push("print-action-row-not-suppressed")
    if (browserCase.printActionsSuppressed !== true) errors.push("print-actions-not-suppressed")
    if (!Number.isInteger(browserCase.printToolbarElementCount) || browserCase.printToolbarElementCount < 1) errors.push("print-toolbar-count")
    if (!Number.isInteger(browserCase.printActionRowElementCount) || browserCase.printActionRowElementCount < 1) errors.push("print-action-row-count")
    if (!Number.isInteger(browserCase.printActionElementCount) || browserCase.printActionElementCount < 1) errors.push("print-action-count")
    if (browserCase.presentationEvidence?.toolbarElementCount !== browserCase.printToolbarElementCount ||
      browserCase.presentationEvidence?.actionRowElementCount !== browserCase.printActionRowElementCount ||
      browserCase.presentationEvidence?.actionElementCount !== browserCase.printActionElementCount) errors.push("print-presentation-count-join")
    if (browserCase.actionTargetMinimumCssPx !== null) errors.push("print-action-target-must-be-null")
  } else {
    const keyboard = browserCase.keyboardTraversal
    const exactShape = (value, keys) => value !== null && typeof value === "object" && !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort())
    const canonicalLogicalStop = ({ logicalStopId, coordinate }) => {
      if (typeof logicalStopId !== "string" || typeof coordinate !== "string" || logicalStopId.length === 0 || coordinate.length === 0) return false
      if (logicalStopId.startsWith("element:")) return logicalStopId === `element:${coordinate}`
      if (!logicalStopId.startsWith("radio-group:")) return false
      const encoded = logicalStopId.slice("radio-group:".length)
      let tuple
      try { tuple = JSON.parse(encoded) } catch { return false }
      return Array.isArray(tuple) && tuple.length === 2 && tuple.every((value) => typeof value === "string" && value.length > 0) && tuple[1].length > 0 && JSON.stringify(tuple) === encoded
    }
    const expectedStopShape = (value) => exactShape(value, ["logicalStopId", "coordinate"]) &&
      typeof value.logicalStopId === "string" && value.logicalStopId.length > 0 &&
      typeof value.coordinate === "string" && value.coordinate.length > 0 &&
      canonicalLogicalStop(value)
    const visitedStopShape = (value) => exactShape(value, ["logicalStopId", "coordinate", "focusVisible"]) &&
      expectedStopShape({ logicalStopId: value.logicalStopId, coordinate: value.coordinate }) &&
      value.focusVisible === true
    if (keyboard?.performed !== true) errors.push("keyboard-traversal-missing")
    if (keyboard?.mode !== "native-Tab-forward-and-Shift-Tab-return-cycle") errors.push("keyboard-traversal-not-native-tab-cycle")
    if (!Number.isInteger(keyboard?.expectedFocusableCount) || keyboard.expectedFocusableCount < 1) errors.push("keyboard-focusable-count")
    if (!Array.isArray(keyboard?.expectedOrder) || keyboard.expectedOrder.length !== keyboard.expectedFocusableCount || !keyboard.expectedOrder.every(expectedStopShape)) errors.push("keyboard-expected-order-count-or-shape")
    if (!Array.isArray(keyboard?.returnExpectedOrder) ||
      keyboard.returnExpectedOrder.length !== keyboard.expectedFocusableCount - 1 ||
      !keyboard.returnExpectedOrder.every(expectedStopShape)) errors.push("keyboard-return-expected-order-count-or-shape")
    if (!Array.isArray(keyboard?.visited) || keyboard.visited.length !== keyboard.expectedFocusableCount || !keyboard.visited.every(visitedStopShape)) errors.push("keyboard-visited-count-or-shape")
    if (!Array.isArray(keyboard?.returnVisited) || keyboard.returnVisited.length !== keyboard.expectedFocusableCount - 1 || !keyboard.returnVisited.every(visitedStopShape)) errors.push("keyboard-return-visited-count-or-shape")
    if (!Number.isInteger(keyboard?.stepCount) || keyboard.stepCount !== keyboard.expectedFocusableCount) errors.push("keyboard-step-count")
    if (!Number.isInteger(keyboard?.tabPressCount) || keyboard.tabPressCount !== 2 * keyboard.expectedFocusableCount - 1) errors.push("keyboard-tab-press-count")
    const expectedLogicalOrder = Array.isArray(keyboard?.expectedOrder) ? keyboard.expectedOrder.map(({ logicalStopId }) => logicalStopId) : []
    const expectedCoordinateOrder = Array.isArray(keyboard?.expectedOrder) ? keyboard.expectedOrder.map(({ coordinate }) => coordinate) : []
    const returnExpectedLogicalOrder = Array.isArray(keyboard?.returnExpectedOrder) ? keyboard.returnExpectedOrder.map(({ logicalStopId }) => logicalStopId) : []
    const returnExpectedCoordinateOrder = Array.isArray(keyboard?.returnExpectedOrder) ? keyboard.returnExpectedOrder.map(({ coordinate }) => coordinate) : []
    const visitedOrder = Array.isArray(keyboard?.visited) ? keyboard.visited.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate })) : []
    const returnVisitedOrder = Array.isArray(keyboard?.returnVisited) ? keyboard.returnVisited.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate })) : []
    const uniqueExpectedStops = new Set(expectedLogicalOrder).size === expectedLogicalOrder.length && new Set(expectedCoordinateOrder).size === expectedCoordinateOrder.length
    const uniqueReturnStops = new Set(returnExpectedLogicalOrder).size === returnExpectedLogicalOrder.length && new Set(returnExpectedCoordinateOrder).size === returnExpectedCoordinateOrder.length
    const uniqueVisitedStops = new Set(visitedOrder.map(({ logicalStopId }) => logicalStopId)).size === visitedOrder.length && new Set(visitedOrder.map(({ coordinate }) => coordinate)).size === visitedOrder.length
    const uniqueReturnVisitedStops = new Set(returnVisitedOrder.map(({ logicalStopId }) => logicalStopId)).size === returnVisitedOrder.length && new Set(returnVisitedOrder.map(({ coordinate }) => coordinate)).size === returnVisitedOrder.length
    if (!uniqueExpectedStops || !uniqueReturnStops) errors.push("keyboard-expected-order-duplicate")
    if (JSON.stringify(returnExpectedLogicalOrder) !== JSON.stringify(expectedLogicalOrder.slice(0, -1).reverse())) errors.push("keyboard-return-logical-order-mismatch")
    if (Array.isArray(keyboard?.returnExpectedOrder) && Array.isArray(keyboard?.expectedOrder)) {
      for (const returnStop of keyboard.returnExpectedOrder) {
        const forwardStop = keyboard.expectedOrder.find(({ logicalStopId }) => logicalStopId === returnStop.logicalStopId)
        if (forwardStop !== undefined && forwardStop.coordinate !== returnStop.coordinate && !(browserCase.browserProject === "webkit" && returnStop.logicalStopId.startsWith("radio-group:"))) errors.push("keyboard-directional-coordinate-drift")
      }
    }
    if (!uniqueVisitedStops || !uniqueReturnVisitedStops || keyboard?.allStopsUnique !== true) errors.push("keyboard-observed-duplicate-or-trap")
    if (Array.isArray(keyboard?.expectedOrder) && JSON.stringify(visitedOrder) !== JSON.stringify(keyboard.expectedOrder)) errors.push("keyboard-observed-order-mismatch")
    if (Array.isArray(keyboard?.returnExpectedOrder) && JSON.stringify(returnVisitedOrder) !== JSON.stringify(keyboard.returnExpectedOrder)) errors.push("keyboard-return-order-mismatch")
    if (keyboard?.exactOrder !== true) errors.push("keyboard-exact-order-false")
    if (keyboard?.returnOrderExact !== true) errors.push("keyboard-return-order-exact-false")
    if (keyboard?.returnedToFirst !== true ||
      keyboard?.cycleReturnLogicalStopId !== keyboard?.expectedOrder?.[0]?.logicalStopId ||
      keyboard?.cycleReturnCoordinate !== keyboard?.returnExpectedOrder?.at(-1)?.coordinate) errors.push("keyboard-cycle-return")
    if (keyboard?.cycleReturnFocusVisible !== true) errors.push("keyboard-cycle-return-focus-invisible")
    if (keyboard?.noTrap !== true) errors.push("keyboard-trap")
    if (keyboard?.allVisitedFocusVisible !== true ||
      keyboard?.visited?.some(({ focusVisible }) => focusVisible !== true) ||
      keyboard?.returnVisited?.some(({ focusVisible }) => focusVisible !== true)) errors.push("keyboard-focus-not-visible")
    if (!Number.isFinite(browserCase.actionTargetMinimumCssPx) || browserCase.actionTargetMinimumCssPx < 44) errors.push("action-target")
    if (browserCase.printToolbarSuppressed !== null || browserCase.printActionRowSuppressed !== null || browserCase.printActionsSuppressed !== null) errors.push("screen-print-observation-must-be-null")
    if (browserCase.printToolbarElementCount !== null || browserCase.printActionRowElementCount !== null || browserCase.printActionElementCount !== null) errors.push("screen-print-count-must-be-null")
  }

  if (browserCase.presentation === "large-text-125") {
    const keys = ["root", "h1", "lead", "eyebrow"]
    for (const key of keys) {
      const baseline = browserCase.presentationEvidence?.baselinePx?.[key]
      const scaled = browserCase.presentationEvidence?.scaledPx?.[key]
      const ratio = browserCase.presentationEvidence?.ratios?.[key]
      if (![baseline, scaled, ratio].every(Number.isFinite) || baseline <= 0 || scaled <= 0) errors.push(`large-text-${key}-measurement`)
      else if (Math.abs(ratio - 1.25) > 0.01 || Math.abs((scaled / baseline) - ratio) > 0.001) errors.push(`large-text-${key}-ratio`)
    }
  } else if (browserCase.presentation === "reduced-motion") {
    if (browserCase.presentationEvidence?.mediaMatches !== true) errors.push("reduced-motion-media")
    if (typeof browserCase.presentationEvidence?.computedTransitionDuration !== "string" || !Number.isFinite(browserCase.presentationEvidence?.durationMs)) errors.push("reduced-motion-duration-missing")
    else if (browserCase.presentationEvidence.durationMs > 0.001) errors.push("reduced-motion-duration")
  } else if (browserCase.presentation === "forced-colors") {
    const adaptation = browserCase.presentationEvidence?.adaptation
    if (browserCase.presentationEvidence?.mediaMatches !== true) errors.push("forced-colors-media")
    if (browserCase.presentationEvidence?.nativeFocusObserved !== true) errors.push("forced-colors-native-focus")
    if (adaptation === null || typeof adaptation !== "object" || Object.values(adaptation).some((value) => typeof value !== "string" || value === "")) errors.push("forced-colors-adaptation")
    else if (browserCase.presentationEvidence?.stableAdaptationSha256 !== sha256(JSON.stringify(adaptation))) errors.push("forced-colors-adaptation-hash")
    if (adaptation?.actionForcedColorAdjust !== "auto") errors.push("forced-colors-adjustment")
  } else if (browserCase.presentation === "zoom-400") {
    if (browserCase.presentationEvidence?.physicalViewportWidth !== 1280 || browserCase.presentationEvidence?.zoomFactor !== 4 || browserCase.presentationEvidence?.expectedCssViewportWidth !== 320) errors.push("zoom-contract")
    if (browserCase.presentationEvidence?.observedCssViewportWidth !== 320 || browserCase.presentationEvidence?.equivalenceExact !== true) errors.push("zoom-equivalence")
  }
  return errors
}

export const validateRequiredCaseSet = (cases, expectedCases) => {
  const expectedKeys = expectedCases.map(caseKey)
  const actualKeys = cases.map(caseKey)
  const errors = []
  if (new Set(expectedKeys).size !== expectedKeys.length) errors.push("expected-case-contract-has-duplicates")
  if (new Set(actualKeys).size !== actualKeys.length) errors.push("captured-case-set-has-duplicates")
  const expected = new Set(expectedKeys)
  const actual = new Set(actualKeys)
  for (const key of expected) if (!actual.has(key)) errors.push(`missing:${key}`)
  for (const key of actual) if (!expected.has(key)) errors.push(`extra:${key}`)
  return errors
}

export const validateCoverageContract = (contract = coverageContract) => {
  const errors = []
  const registryRouteIds = routeArchetypes.flatMap(({ routeIds }) => routeIds)
  const representedRouteIds = [...new Set(sharedFrames.map(({ routeId }) => routeId))]
  const expectedDefaultCaseCount = territories.length * sharedFrames.length * browserProjects.length
  if (contract.classification !== "representative-visual-comparison-not-exhaustive-legal-state-validation") errors.push("coverage-classification")
  if (new Set(registryRouteIds).size !== registryRouteIds.length || contract.registryRouteIdCount !== registryRouteIds.length) errors.push("coverage-registry-route-count")
  if (contract.representedRouteIdCount !== representedRouteIds.length) errors.push("coverage-represented-route-count")
  if (contract.representativeFrameCount !== sharedFrames.length) errors.push("coverage-representative-frame-count")
  if (contract.defaultCaseCount !== expectedDefaultCaseCount) errors.push("coverage-default-case-count")
  if (JSON.stringify(contract.deferredHazardVariants) !== JSON.stringify(["asset-unavailable", "region-required", "version-mismatch", "commit-failure-preservation"])) errors.push("coverage-deferred-hazard-variants")
  if (JSON.stringify(contract.deferredRecoveryVariants) !== JSON.stringify(["not-found-404", "withdrawn-410", "invalid-publication", "storage-unavailable", "service-failure"])) errors.push("coverage-deferred-recovery-variants")
  const printSpecial = specialPresentationMatrix.find(({ presentation }) => presentation === "print")
  if (contract.printScope?.classification !== "immutable-review-queue-empty-only" ||
    contract.printScope?.caseCount !== territories.length * (printSpecial?.browserProjects.length ?? 0) ||
    JSON.stringify(contract.printScope?.frameIds) !== JSON.stringify(["review-queue-empty"]) ||
    JSON.stringify(contract.printScope?.territoryIds) !== JSON.stringify(territories.map(({ territoryId }) => territoryId)) ||
    JSON.stringify(contract.printScope?.browserProjects) !== JSON.stringify(browserProjects)) errors.push("coverage-print-scope")
  return errors
}

const passingCaseFixture = (overrides = {}) => ({
  territoryId: "A",
  frameId: "orientation-home-check-fixture",
  archetypeId: "orientation",
  presentation: "default",
  browserProject: "firefox",
  routePath: "/",
  repositoryRelativeUrl: "research/ui-ux/consumer-visual-system/prototype.html?territory=A&frame=orientation-home-check-fixture&presentation=default",
  fixtureRequestPath: "/?territory=A&frame=orientation-home-check-fixture&presentation=default",
  requestedViewportWidth: 1440,
  requestedViewportHeight: 1000,
  observedWindowInnerWidth: 1440,
  observedWindowInnerHeight: 1000,
  httpResult: 200,
  externalOriginCount: 0,
  scrollWidth: 1440,
  clientWidth: 1440,
  axeFindings: [],
  keyboardTraversal: {
    performed: true,
    mode: "native-Tab-forward-and-Shift-Tab-return-cycle",
    expectedFocusableCount: 4,
    expectedOrder: [
      { logicalStopId: "element:#first", coordinate: "#first" },
      { logicalStopId: "element:#second", coordinate: "#second" },
      { logicalStopId: "element:#third", coordinate: "#third" },
      { logicalStopId: "element:#late-control", coordinate: "#late-control" }
    ],
    returnExpectedOrder: [
      { logicalStopId: "element:#third", coordinate: "#third" },
      { logicalStopId: "element:#second", coordinate: "#second" },
      { logicalStopId: "element:#first", coordinate: "#first" }
    ],
    stepCount: 4,
    tabPressCount: 7,
    cycleReturnLogicalStopId: "element:#first",
    cycleReturnCoordinate: "#first",
    cycleReturnFocusVisible: true,
    returnedToFirst: true,
    allStopsUnique: true,
    exactOrder: true,
    returnOrderExact: true,
    noTrap: true,
    allVisitedFocusVisible: true,
    visited: [
      { logicalStopId: "element:#first", coordinate: "#first", focusVisible: true },
      { logicalStopId: "element:#second", coordinate: "#second", focusVisible: true },
      { logicalStopId: "element:#third", coordinate: "#third", focusVisible: true },
      { logicalStopId: "element:#late-control", coordinate: "#late-control", focusVisible: true }
    ],
    returnVisited: [
      { logicalStopId: "element:#third", coordinate: "#third", focusVisible: true },
      { logicalStopId: "element:#second", coordinate: "#second", focusVisible: true },
      { logicalStopId: "element:#first", coordinate: "#first", focusVisible: true }
    ]
  },
  actionTargetMinimumCssPx: 44,
  presentationEvidence: { kind: "default", rootPresentationDataset: "default" },
  printToolbarSuppressed: null,
  printActionRowSuppressed: null,
  printActionsSuppressed: null,
  printToolbarElementCount: null,
  printActionRowElementCount: null,
  printActionElementCount: null,
  semanticDirectTextEntryCount: 12,
  ...overrides
})

const passingPresentationFixture = (presentation, overrides = {}) => {
  const contract = presentationContracts[presentation]
  const coordinates = { territoryId: "A", frameId: "orientation-home-check-fixture", presentation }
  let presentationEvidence = {
    kind: contract.evidenceKind,
    rootPresentationDataset: contract.queryPresentation,
    expectedViewportWidth: contract.width,
    expectedViewportHeight: contract.height
  }
  if (presentation === "large-text-125") {
    presentationEvidence = {
      kind: contract.evidenceKind,
      rootPresentationDataset: contract.queryPresentation,
      baselinePx: { root: 16, h1: 32, lead: 19.2, eyebrow: 12 },
      scaledPx: { root: 20, h1: 40, lead: 24, eyebrow: 15 },
      ratios: { root: 1.25, h1: 1.25, lead: 1.25, eyebrow: 1.25 }
    }
  } else if (presentation === "reduced-motion") {
    presentationEvidence = {
      kind: contract.evidenceKind,
      rootPresentationDataset: contract.queryPresentation,
      mediaMatches: true,
      computedTransitionDuration: "0.001ms",
      durationMs: 0.001
    }
  } else if (presentation === "forced-colors") {
    const adaptation = {
      bodyColor: "rgb(0, 0, 0)",
      bodyBackgroundColor: "rgb(255, 255, 255)",
      actionColor: "rgb(0, 0, 0)",
      actionBackgroundColor: "rgb(255, 255, 255)",
      actionOutlineColor: "rgb(0, 0, 0)",
      actionOutlineStyle: "solid",
      actionOutlineWidth: "3px",
      actionForcedColorAdjust: "auto"
    }
    presentationEvidence = {
      kind: contract.evidenceKind,
      rootPresentationDataset: contract.queryPresentation,
      mediaMatches: true,
      adaptation,
      stableAdaptationSha256: sha256(JSON.stringify(adaptation)),
      nativeFocusObserved: true
    }
  } else if (presentation === "zoom-400") {
    presentationEvidence = {
      kind: contract.evidenceKind,
      rootPresentationDataset: contract.queryPresentation,
      physicalViewportWidth: 1280,
      zoomFactor: 4,
      expectedCssViewportWidth: 320,
      observedCssViewportWidth: 320,
      equivalenceExact: true
    }
  } else if (presentation === "print") {
    presentationEvidence = {
      kind: contract.evidenceKind,
      rootPresentationDataset: contract.queryPresentation,
      toolbarElementCount: 1,
      actionRowElementCount: 1,
      actionElementCount: 2
    }
  }
  return passingCaseFixture({
    ...coordinates,
    repositoryRelativeUrl: repositoryRelativeUrlFor(coordinates),
    fixtureRequestPath: fixtureRequestPathFor(coordinates),
    requestedViewportWidth: contract.width,
    requestedViewportHeight: contract.height,
    observedWindowInnerWidth: contract.width,
    observedWindowInnerHeight: contract.height,
    scrollWidth: contract.width,
    clientWidth: contract.width,
    presentationEvidence,
    ...(presentation === "print" ? {
      keyboardTraversal: { performed: false, mode: "not-applicable-print" },
      actionTargetMinimumCssPx: null,
      printToolbarSuppressed: true,
      printActionRowSuppressed: true,
      printActionsSuppressed: true,
      printToolbarElementCount: 1,
      printActionRowElementCount: 1,
      printActionElementCount: 2
    } : {}),
    ...overrides
  })
}

export const runBrowserContractAdversarialTests = () => {
  const attacks = []
  const expectRejected = (attackId, operation) => {
    let rejected = false
    try {
      rejected = operation().length > 0
    } catch {
      rejected = true
    }
    if (!rejected) throw new Error(`${attackId}: mutation was accepted`)
    attacks.push(attackId)
  }
  const requireAccepted = (fixtureId, browserCase) => {
    const errors = validateBrowserCase(browserCase)
    if (errors.length > 0) throw new Error(`${fixtureId}: passing fixture rejected: ${errors.join(", ")}`)
  }

  const requiredFirefoxCase = passingCaseFixture()
  requireAccepted("default", requiredFirefoxCase)
  expectRejected("missing-nonfocused-firefox-default-frame", () => validateRequiredCaseSet([], [requiredFirefoxCase]))
  expectRejected("broken-nonfocused-firefox-default-frame", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      returnedToFirst: false,
      noTrap: false,
      allVisitedFocusVisible: false
    }
  }))

  expectRejected("keyboard-skipped-late-control", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      visited: requiredFirefoxCase.keyboardTraversal.visited.slice(0, -1),
      stepCount: requiredFirefoxCase.keyboardTraversal.stepCount - 1
    }
  }))
  expectRejected("keyboard-duplicate-or-trap", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      visited: [
        ...requiredFirefoxCase.keyboardTraversal.visited.slice(0, -1),
        requiredFirefoxCase.keyboardTraversal.visited[1]
      ],
      allStopsUnique: false,
      returnedToFirst: false,
      noTrap: false,
      cycleReturnCoordinate: "#second"
    }
  }))
  expectRejected("keyboard-late-invisible-focus", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      visited: requiredFirefoxCase.keyboardTraversal.visited.map((entry, index, entries) => index === entries.length - 1
        ? { ...entry, focusVisible: false }
        : entry),
      allVisitedFocusVisible: false
    }
  }))
  expectRejected("keyboard-wrong-order", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      visited: [
        requiredFirefoxCase.keyboardTraversal.visited[1],
        requiredFirefoxCase.keyboardTraversal.visited[0],
        ...requiredFirefoxCase.keyboardTraversal.visited.slice(2)
      ],
      exactOrder: false
    }
  }))
  const radioLogicalStopId = 'radio-group:["no-form","fixture-choice"]'
  const directionalRadioCase = passingCaseFixture({
    browserProject: "webkit",
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      expectedOrder: requiredFirefoxCase.keyboardTraversal.expectedOrder.map((entry, index) => index === 1
        ? { logicalStopId: radioLogicalStopId, coordinate: "#radio-first" }
        : entry),
      returnExpectedOrder: requiredFirefoxCase.keyboardTraversal.returnExpectedOrder.map((entry, index) => index === 1
        ? { logicalStopId: radioLogicalStopId, coordinate: "#radio-last" }
        : entry),
      visited: requiredFirefoxCase.keyboardTraversal.visited.map((entry, index) => index === 1
        ? { logicalStopId: radioLogicalStopId, coordinate: "#radio-first", focusVisible: true }
        : entry),
      returnVisited: requiredFirefoxCase.keyboardTraversal.returnVisited.map((entry, index) => index === 1
        ? { logicalStopId: radioLogicalStopId, coordinate: "#radio-last", focusVisible: true }
        : entry)
    }
  })
  requireAccepted("direction-specific-radio-member", directionalRadioCase)
  expectRejected("keyboard-retargeted-radio-member", () => validateBrowserCase({
    ...directionalRadioCase,
    keyboardTraversal: {
      ...directionalRadioCase.keyboardTraversal,
      returnVisited: directionalRadioCase.keyboardTraversal.returnVisited.map((entry, index) => index === 1
        ? { ...entry, coordinate: "#radio-first" }
        : entry)
    }
  }))
  expectRejected("keyboard-logical-stop-drift", () => validateBrowserCase({
    ...directionalRadioCase,
    keyboardTraversal: {
      ...directionalRadioCase.keyboardTraversal,
      returnVisited: directionalRadioCase.keyboardTraversal.returnVisited.map((entry, index) => index === 1
        ? { ...entry, logicalStopId: 'radio-group:["no-form","different-choice"]' }
        : entry)
    }
  }))
  expectRejected("keyboard-coherent-return-order-drift", () => validateBrowserCase({
    ...directionalRadioCase,
    keyboardTraversal: {
      ...directionalRadioCase.keyboardTraversal,
      returnExpectedOrder: [
        directionalRadioCase.keyboardTraversal.returnExpectedOrder[1],
        directionalRadioCase.keyboardTraversal.returnExpectedOrder[0],
        ...directionalRadioCase.keyboardTraversal.returnExpectedOrder.slice(2)
      ],
      returnVisited: [
        directionalRadioCase.keyboardTraversal.returnVisited[1],
        directionalRadioCase.keyboardTraversal.returnVisited[0],
        ...directionalRadioCase.keyboardTraversal.returnVisited.slice(2)
      ]
    }
  }))
  expectRejected("keyboard-element-coordinate-identity-drift", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      expectedOrder: requiredFirefoxCase.keyboardTraversal.expectedOrder.map((entry, index) => index === 0 ? { ...entry, coordinate: "#retargeted-first" } : entry),
      visited: requiredFirefoxCase.keyboardTraversal.visited.map((entry, index) => index === 0 ? { ...entry, coordinate: "#retargeted-first" } : entry)
    }
  }))
  expectRejected("keyboard-nonwebkit-radio-direction-drift", () => validateBrowserCase({ ...directionalRadioCase, browserProject: "firefox" }))
  expectRejected("keyboard-duplicate-logical-stop", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: {
      ...requiredFirefoxCase.keyboardTraversal,
      expectedOrder: requiredFirefoxCase.keyboardTraversal.expectedOrder.map((entry, index) => index === 2 ? { ...entry, logicalStopId: requiredFirefoxCase.keyboardTraversal.expectedOrder[1].logicalStopId } : entry),
      visited: requiredFirefoxCase.keyboardTraversal.visited.map((entry, index) => index === 2 ? { ...entry, logicalStopId: requiredFirefoxCase.keyboardTraversal.visited[1].logicalStopId } : entry)
    }
  }))
  expectRejected("keyboard-cycle-logical-stop-drift", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: { ...requiredFirefoxCase.keyboardTraversal, cycleReturnLogicalStopId: "element:#second" }
  }))
  expectRejected("keyboard-cycle-coordinate-drift", () => validateBrowserCase({
    ...requiredFirefoxCase,
    keyboardTraversal: { ...requiredFirefoxCase.keyboardTraversal, cycleReturnCoordinate: "#second" }
  }))

  const printCase = passingPresentationFixture("print", { browserProject: "chromium" })
  requireAccepted("print", printCase)
  expectRejected("unsuppressed-print-action", () => validateBrowserCase({ ...printCase, printActionsSuppressed: false }))
  expectRejected("zero-count-suppressed-print-action", () => validateBrowserCase({
    ...printCase,
    printActionElementCount: 0,
    presentationEvidence: { ...printCase.presentationEvidence, actionElementCount: 0 }
  }))

  expectRejected("route-path-frame-drift", () => validateBrowserCase({ ...requiredFirefoxCase, routePath: "/fake/" }))
  expectRejected("repository-relative-url-drift", () => validateBrowserCase({ ...requiredFirefoxCase, repositoryRelativeUrl: "no-such-file" }))
  expectRejected("fixture-request-path-drift", () => validateBrowserCase({ ...requiredFirefoxCase, fixtureRequestPath: "/?fake=true" }))
  expectRejected("viewport-width-drift", () => validateBrowserCase({ ...requiredFirefoxCase, observedWindowInnerWidth: 1439 }))
  expectRejected("semantic-signature-direct-text-erased", () => validateBrowserCase({ ...requiredFirefoxCase, semanticDirectTextEntryCount: 0 }))

  const largeTextCase = passingPresentationFixture("large-text-125")
  requireAccepted("large-text", largeTextCase)
  expectRejected("large-text-root-ratio", () => validateBrowserCase({
    ...largeTextCase,
    presentationEvidence: { ...largeTextCase.presentationEvidence, ratios: { ...largeTextCase.presentationEvidence.ratios, root: 1 } }
  }))

  const reducedMotionCase = passingPresentationFixture("reduced-motion")
  requireAccepted("reduced-motion", reducedMotionCase)
  expectRejected("reduced-motion-not-matched", () => validateBrowserCase({
    ...reducedMotionCase,
    presentationEvidence: { ...reducedMotionCase.presentationEvidence, mediaMatches: false }
  }))

  const forcedColorsCase = passingPresentationFixture("forced-colors")
  requireAccepted("forced-colors", forcedColorsCase)
  expectRejected("forced-colors-adaptation-drift", () => validateBrowserCase({
    ...forcedColorsCase,
    presentationEvidence: {
      ...forcedColorsCase.presentationEvidence,
      adaptation: { ...forcedColorsCase.presentationEvidence.adaptation, actionColor: "rgb(1, 1, 1)" }
    }
  }))

  const zoomCase = passingPresentationFixture("zoom-400")
  requireAccepted("zoom-400", zoomCase)
  expectRejected("zoom-equivalence-drift", () => validateBrowserCase({
    ...zoomCase,
    presentationEvidence: { ...zoomCase.presentationEvidence, observedCssViewportWidth: 321, equivalenceExact: false }
  }))

  const moderateFinding = {
    id: "mutation-moderate",
    impact: "moderate",
    help: "Mutation fixture",
    helpUrl: "https://example.invalid/mutation",
    tags: ["wcag2aa"],
    nodeCount: 1,
    targets: ["main"]
  }
  expectRejected("moderate-axe-finding", () => validateBrowserCase({ ...requiredFirefoxCase, axeFindings: [moderateFinding] }))
  return attacks
}

const configurePresentation = async (page, presentation) => {
  const contract = presentationContracts[presentation]
  if (contract === undefined) throw new Error(`Unknown presentation: ${presentation}`)
  await page.setViewportSize({ width: contract.width, height: contract.height })
  await page.emulateMedia({
    forcedColors: presentation === "forced-colors" ? "active" : "none",
    media: presentation === "print" ? "print" : "screen",
    reducedMotion: presentation === "reduced-motion" ? "reduce" : "no-preference"
  })
  return contract
}

const observedTypographyPx = (page) => page.evaluate(() => {
  const size = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize)
  return {
    root: size("html"),
    h1: size("h1"),
    lead: size(".lead"),
    eyebrow: size(".eyebrow")
  }
})

const cssDurationMilliseconds = (value) => Math.max(...value.split(",").map((part) => {
  const normalized = part.trim()
  if (normalized.endsWith("ms")) return Number.parseFloat(normalized)
  if (normalized.endsWith("s")) return Number.parseFloat(normalized) * 1000
  return Number.NaN
}))

const focusableSnapshot = ({ direction, browserProject }) => {
  const selector = [
    "a[href]",
    "area[href]",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "iframe",
    "object",
    "embed",
    "[contenteditable]:not([contenteditable='false'])",
    "[tabindex]"
  ].join(",")
  const rendered = (element) => {
    const style = getComputedStyle(element)
    const closedDetails = element.closest("details:not([open])")
    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.visibility !== "collapse" &&
      element.getClientRects().length > 0 &&
      !element.closest("[inert]") &&
      (closedDetails === null || element === closedDetails.querySelector(":scope > summary"))
  }
  const coordinateFor = (element) => {
    if (element.id !== "") return `#${CSS.escape(element.id)}`
    const segments = []
    let current = element
    while (current instanceof Element && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase()
      const sameTag = current.parentElement === null
        ? []
        : [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName)
      const suffix = sameTag.length > 1 ? `:nth-of-type(${sameTag.indexOf(current) + 1})` : ""
      segments.unshift(`${tag}${suffix}`)
      current = current.parentElement
    }
    return `html>${segments.join(">")}`
  }
  const logicalStopIdFor = (element) => {
    if (element instanceof HTMLInputElement && element.type === "radio" && element.name !== "") {
      const formCoordinate = element.form === null ? "no-form" : coordinateFor(element.form)
      return `radio-group:${JSON.stringify([formCoordinate, element.name])}`
    }
    return `element:${coordinateFor(element)}`
  }
  const candidates = [...document.querySelectorAll(selector)].filter((element) => {
    if (!(element instanceof HTMLElement)) return false
    if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") return false
    if (element instanceof HTMLInputElement && element.type === "hidden") return false
    return element.tabIndex >= 0 && rendered(element)
  })
  const radioGroups = new Map()
  for (const element of candidates) {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio" || element.name === "") continue
    const formCoordinate = element.form === null ? "no-form" : coordinateFor(element.form)
    const key = `${formCoordinate}\u0000${element.name}`
    if (!radioGroups.has(key)) radioGroups.set(key, [])
    radioGroups.get(key).push(element)
  }
  const eligible = candidates.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio" || element.name === "") return true
    const formCoordinate = element.form === null ? "no-form" : coordinateFor(element.form)
    const group = radioGroups.get(`${formCoordinate}\u0000${element.name}`)
    const checked = group.find((candidate) => candidate.checked)
    const directionalFallback = direction === "backward" && browserProject === "webkit" ? group.at(-1) : group[0]
    return element === (checked ?? directionalFallback)
  })
  const documentOrder = new Map(eligible.map((element, index) => [element, index]))
  eligible.sort((left, right) => {
    const leftPositive = left.tabIndex > 0
    const rightPositive = right.tabIndex > 0
    if (leftPositive !== rightPositive) return leftPositive ? -1 : 1
    if (leftPositive && left.tabIndex !== right.tabIndex) return left.tabIndex - right.tabIndex
    return documentOrder.get(left) - documentOrder.get(right)
  })
  return eligible.map((element) => ({
    logicalStopId: logicalStopIdFor(element),
    coordinate: coordinateFor(element)
  }))
}

const activeFocusObservation = () => {
  const coordinateFor = (element) => {
    if (element.id !== "") return `#${CSS.escape(element.id)}`
    const segments = []
    let current = element
    while (current instanceof Element && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase()
      const sameTag = current.parentElement === null
        ? []
        : [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName)
      const suffix = sameTag.length > 1 ? `:nth-of-type(${sameTag.indexOf(current) + 1})` : ""
      segments.unshift(`${tag}${suffix}`)
      current = current.parentElement
    }
    return `html>${segments.join(">")}`
  }
  const logicalStopIdFor = (element) => {
    if (element instanceof HTMLInputElement && element.type === "radio" && element.name !== "") {
      const formCoordinate = element.form === null ? "no-form" : coordinateFor(element.form)
      return `radio-group:${JSON.stringify([formCoordinate, element.name])}`
    }
    return `element:${coordinateFor(element)}`
  }
  const element = document.activeElement
  if (!(element instanceof HTMLElement) || element === document.body || element === document.documentElement) return null
  const style = getComputedStyle(element)
  const transparentOutline = style.outlineColor === "transparent" || style.outlineColor === "rgba(0, 0, 0, 0)"
  return {
    logicalStopId: logicalStopIdFor(element),
    coordinate: coordinateFor(element),
    focusVisible: element.matches(":focus-visible") &&
      style.outlineStyle !== "none" &&
      style.outlineStyle !== "hidden" &&
      Number.parseFloat(style.outlineWidth) >= 3 &&
      Number.parseFloat(style.outlineOffset) >= 2 &&
      !transparentOutline
  }
}

const nativeKeyboardTraversal = async (page, browserProject) => {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  })
  const expectedOrder = await page.evaluate(focusableSnapshot, { direction: "forward", browserProject })
  if (expectedOrder.length === 0) throw new Error("rendered fixture has no enabled sequential focus stops")
  if (new Set(expectedOrder.map(({ logicalStopId }) => logicalStopId)).size !== expectedOrder.length) throw new Error("derived sequential focus order contains duplicate logical stops")
  if (new Set(expectedOrder.map(({ coordinate }) => coordinate)).size !== expectedOrder.length) throw new Error("derived sequential focus order contains duplicate element coordinates")
  const visited = []
  let tabPressCount = 0
  for (let step = 0; step < expectedOrder.length; step += 1) {
    await page.keyboard.press("Tab")
    tabPressCount += 1
    const observation = await page.evaluate(activeFocusObservation)
    if (observation === null) break
    visited.push(observation)
  }
  // Firefox headless correctly transfers forward Tab focus to browser chrome
  // after the final document stop but does not expose that native-chrome path
  // to page automation. A native Shift+Tab return traversal is therefore the
  // only cross-engine, DOM-observable proof of a complete no-trap round trip.
  // No document control is focused programmatically.
  const backwardDocumentOrder = await page.evaluate(focusableSnapshot, { direction: "backward", browserProject })
  const forwardLogicalOrder = expectedOrder.map(({ logicalStopId }) => logicalStopId)
  const backwardLogicalOrder = backwardDocumentOrder.map(({ logicalStopId }) => logicalStopId)
  if (JSON.stringify(backwardLogicalOrder) !== JSON.stringify(forwardLogicalOrder)) throw new Error("forward/backward derived logical focus-stop closure differs")
  for (const backwardStop of backwardDocumentOrder) {
    const forwardStop = expectedOrder.find(({ logicalStopId }) => logicalStopId === backwardStop.logicalStopId)
    if (forwardStop === undefined) throw new Error("backward logical focus stop absent from forward closure")
    if (forwardStop.coordinate !== backwardStop.coordinate && !(browserProject === "webkit" && backwardStop.logicalStopId.startsWith("radio-group:"))) throw new Error("direction-specific element coordinate is allowed only for a WebKit radio group")
  }
  const returnExpectedOrder = backwardDocumentOrder.slice(0, -1).reverse()
  const returnVisited = []
  for (let step = 0; step < returnExpectedOrder.length; step += 1) {
    await page.keyboard.press("Shift+Tab")
    tabPressCount += 1
    const observation = await page.evaluate(activeFocusObservation)
    if (observation === null) break
    returnVisited.push(observation)
  }
  const visitedOrder = visited.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate }))
  const returnVisitedOrder = returnVisited.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate }))
  const returnExpectedLogicalOrder = returnExpectedOrder.map(({ logicalStopId }) => logicalStopId)
  if (JSON.stringify(returnExpectedLogicalOrder) !== JSON.stringify(forwardLogicalOrder.slice(0, -1).reverse())) throw new Error("return traversal does not reverse the logical focus-stop order")
  const allStopsUnique =
    new Set(visitedOrder.map(({ logicalStopId }) => logicalStopId)).size === visitedOrder.length &&
    new Set(visitedOrder.map(({ coordinate }) => coordinate)).size === visitedOrder.length &&
    new Set(returnVisitedOrder.map(({ logicalStopId }) => logicalStopId)).size === returnVisitedOrder.length &&
    new Set(returnVisitedOrder.map(({ coordinate }) => coordinate)).size === returnVisitedOrder.length
  const exactOrder = JSON.stringify(visitedOrder) === JSON.stringify(expectedOrder)
  const returnOrderExact = JSON.stringify(returnVisitedOrder) === JSON.stringify(returnExpectedOrder)
  const cycleReturn = returnVisited.at(-1) ?? null
  const returnedToFirst = cycleReturn?.logicalStopId === expectedOrder[0].logicalStopId &&
    cycleReturn?.coordinate === returnExpectedOrder.at(-1)?.coordinate
  return {
    performed: true,
    mode: "native-Tab-forward-and-Shift-Tab-return-cycle",
    expectedFocusableCount: expectedOrder.length,
    expectedOrder,
    returnExpectedOrder,
    stepCount: visited.length,
    tabPressCount,
    cycleReturnLogicalStopId: cycleReturn?.logicalStopId ?? null,
    cycleReturnCoordinate: cycleReturn?.coordinate ?? null,
    cycleReturnFocusVisible: cycleReturn?.focusVisible ?? false,
    returnedToFirst,
    allStopsUnique,
    exactOrder,
    returnOrderExact,
    noTrap: exactOrder && returnOrderExact && allStopsUnique && returnedToFirst,
    allVisitedFocusVisible: visited.length > 0 &&
      visited.every(({ focusVisible }) => focusVisible) &&
      returnVisited.every(({ focusVisible }) => focusVisible),
    visited,
    returnVisited
  }
}

const actionTargetMinimum = async (page) => {
  const actions = page.locator(".action:visible:not(:disabled)")
  const sizes = []
  for (let index = 0; index < await actions.count(); index += 1) {
    const box = await actions.nth(index).boundingBox()
    if (box !== null) sizes.push(Math.min(box.width, box.height))
  }
  return sizes.length === 0 ? 0 : Math.floor(Math.min(...sizes))
}

export const captureCase = async ({ browser, requested, baseURL, caseId }) => {
  const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block", timezoneId: "UTC" })
  const page = await context.newPage()
  const externalOrigins = new Set()
  page.on("request", (request) => {
    const url = new URL(request.url())
    if (["http:", "https:"].includes(url.protocol) && url.origin !== baseURL) externalOrigins.add(url.origin)
  })
  try {
    let largeTextBaselinePx = null
    if (requested.presentation === "large-text-125") {
      await configurePresentation(page, "phone-320")
      const baselineCoordinates = { ...requested, presentation: "phone-320" }
      await page.goto(`${baseURL}${fixtureRequestPathFor(baselineCoordinates)}`, { timeout: 30_000, waitUntil: "domcontentloaded" })
      await page.locator(`[data-shared-root][data-territory-id="${requested.territoryId}"][data-frame-id="${requested.frameId}"]`).waitFor({ state: "attached" })
      largeTextBaselinePx = await observedTypographyPx(page)
    }
    const presentationContract = await configurePresentation(page, requested.presentation)
    const fixtureRequestPath = fixtureRequestPathFor(requested)
    const response = await page.goto(`${baseURL}${fixtureRequestPath}`, {
      timeout: 30_000,
      waitUntil: "domcontentloaded"
    })
    await page.locator(`[data-shared-root][data-territory-id="${requested.territoryId}"][data-frame-id="${requested.frameId}"]`).waitFor({ state: "attached" })
    // Reapply media after navigation: Firefox may reset emulation while a new
    // document is committed even though Chromium retains it.
    await configurePresentation(page, requested.presentation)
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight
    }))
    const axeResults = await new AxeBuilder({ page }).withTags(axePolicy.tags).analyze()
    const axeFindings = normalizeAxeFindings(axeResults.violations)
    const isPrint = requested.presentation === "print"
    const printObservation = isPrint
      ? await page.evaluate(() => {
          const observe = (selector) => {
            const elements = [...document.querySelectorAll(selector)]
            return {
              count: elements.length,
              suppressed: elements.every((element) => {
                const style = getComputedStyle(element)
                return style.display === "none" || style.visibility === "hidden" || element.getClientRects().length === 0
              })
            }
          }
          return {
            toolbar: observe(".research-toolbar"),
            actionRow: observe(".action-row"),
            actions: observe(".action")
          }
        })
      : null
    const keyboardTraversal = isPrint
      ? { performed: false, mode: "not-applicable-print", reason: "Interactive controls are suppressed in the observed print presentation." }
      : await nativeKeyboardTraversal(page, requested.browserProject)
    const frame = sharedFrames.find(({ frameId }) => frameId === requested.frameId)
    const rootPresentationDataset = await page.locator("html").getAttribute("data-presentation")
    let presentationEvidence
    if (requested.presentation === "large-text-125") {
      const scaledPx = await observedTypographyPx(page)
      presentationEvidence = {
        kind: presentationContract.evidenceKind,
        rootPresentationDataset,
        baselinePx: largeTextBaselinePx,
        scaledPx,
        ratios: Object.fromEntries(Object.keys(scaledPx).map((key) => [key, scaledPx[key] / largeTextBaselinePx[key]]))
      }
    } else if (requested.presentation === "reduced-motion") {
      const motion = await page.locator(".action").first().evaluate((element) => ({
        mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
        computedTransitionDuration: getComputedStyle(element).transitionDuration
      }))
      presentationEvidence = {
        kind: presentationContract.evidenceKind,
        rootPresentationDataset,
        ...motion,
        durationMs: cssDurationMilliseconds(motion.computedTransitionDuration)
      }
    } else if (requested.presentation === "forced-colors") {
      const forced = await page.evaluate(() => {
        const action = document.activeElement?.matches?.(".action") ? document.activeElement : document.querySelector(".action:not(:disabled)")
        const actionStyle = getComputedStyle(action)
        const bodyStyle = getComputedStyle(document.body)
        return {
          mediaMatches: matchMedia("(forced-colors: active)").matches,
          adaptation: {
            bodyColor: bodyStyle.color,
            bodyBackgroundColor: bodyStyle.backgroundColor,
            actionColor: actionStyle.color,
            actionBackgroundColor: actionStyle.backgroundColor,
            actionOutlineColor: actionStyle.outlineColor,
            actionOutlineStyle: actionStyle.outlineStyle,
            actionOutlineWidth: actionStyle.outlineWidth,
            actionForcedColorAdjust: actionStyle.forcedColorAdjust
          }
        }
      })
      presentationEvidence = {
        kind: presentationContract.evidenceKind,
        rootPresentationDataset,
        mediaMatches: forced.mediaMatches,
        adaptation: forced.adaptation,
        stableAdaptationSha256: sha256(JSON.stringify(forced.adaptation)),
        nativeFocusObserved: keyboardTraversal.returnedToFirst === true &&
          keyboardTraversal.exactOrder === true &&
          keyboardTraversal.allVisitedFocusVisible === true &&
          keyboardTraversal.cycleReturnFocusVisible === true
      }
    } else if (requested.presentation === "zoom-400") {
      presentationEvidence = {
        kind: presentationContract.evidenceKind,
        rootPresentationDataset,
        physicalViewportWidth: presentationContract.physicalViewportWidth,
        zoomFactor: presentationContract.zoomFactor,
        expectedCssViewportWidth: presentationContract.physicalViewportWidth / presentationContract.zoomFactor,
        observedCssViewportWidth: dimensions.windowInnerWidth,
        equivalenceExact: dimensions.windowInnerWidth === presentationContract.physicalViewportWidth / presentationContract.zoomFactor
      }
    } else if (isPrint) {
      presentationEvidence = {
        kind: presentationContract.evidenceKind,
        rootPresentationDataset,
        toolbarElementCount: printObservation.toolbar.count,
        actionRowElementCount: printObservation.actionRow.count,
        actionElementCount: printObservation.actions.count
      }
    } else {
      presentationEvidence = {
        kind: presentationContract.evidenceKind,
        rootPresentationDataset,
        expectedViewportWidth: presentationContract.width,
        expectedViewportHeight: presentationContract.height
      }
    }
    const semanticSignatureJson = await page.evaluate(semanticSignature)
    const semanticDirectTextEntryCount = JSON.parse(semanticSignatureJson).filter(({ text }) => Array.isArray(text) && text.length > 0).length
    return {
      caseId,
      territoryId: requested.territoryId,
      frameId: requested.frameId,
      archetypeId: frame.archetypeId,
      routePath: frame.routePath,
      repositoryRelativeUrl: repositoryRelativeUrlFor(requested),
      fixtureRequestPath,
      presentation: requested.presentation,
      browserProject: requested.browserProject,
      requestedViewportWidth: presentationContract.width,
      requestedViewportHeight: presentationContract.height,
      observedWindowInnerWidth: Math.round(dimensions.windowInnerWidth),
      observedWindowInnerHeight: Math.round(dimensions.windowInnerHeight),
      httpResult: response?.status() ?? 0,
      externalOriginCount: externalOrigins.size,
      scrollWidth: Math.round(dimensions.scrollWidth),
      clientWidth: Math.round(dimensions.clientWidth),
      axeFindings,
      unexpectedAxeFindingCount: axeFindings.filter((finding) => matchingAxeDisposition(finding) === undefined).length,
      keyboardTraversal,
      actionTargetMinimumCssPx: isPrint ? null : await actionTargetMinimum(page),
      presentationEvidence,
      printToolbarSuppressed: isPrint ? printObservation.toolbar.suppressed : null,
      printActionRowSuppressed: isPrint ? printObservation.actionRow.suppressed : null,
      printActionsSuppressed: isPrint ? printObservation.actions.suppressed : null,
      printToolbarElementCount: isPrint ? printObservation.toolbar.count : null,
      printActionRowElementCount: isPrint ? printObservation.actionRow.count : null,
      printActionElementCount: isPrint ? printObservation.actions.count : null,
      semanticSha256: sha256(semanticSignatureJson),
      semanticDirectTextEntryCount,
      capturedAt: new Date().toISOString()
    }
  } finally {
    await context.close()
  }
}

const applyConsumerState = async (page, consumer) => {
  const { selector, state } = consumer
  if (state === "default" || state === "meta-content") return
  if (state === "open-support") {
    await page.locator(".support-details").evaluate((element) => { element.open = true })
    return
  }
  if (state === "checked-choice") {
    await page.locator(".choice-option input").first().check()
    return
  }
  if (state === "open-compact") {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.locator(".compact-navigation").evaluate((element) => { element.open = true })
    return
  }
  if (state === "hover") {
    await page.locator(".action:not(.secondary):not(:disabled)").first().hover()
    await page.waitForTimeout(250)
    return
  }
  if (state === "focus-by-tab") {
    const traversal = await nativeKeyboardTraversal(page, "chromium")
    if (!traversal.noTrap || !traversal.allVisitedFocusVisible || !traversal.cycleReturnFocusVisible) throw new Error("token focus observation could not complete an exact visibly focused Tab cycle")
    for (let step = 0; step < traversal.expectedFocusableCount; step += 1) {
      if (await page.evaluate((candidate) => document.activeElement?.matches(candidate) === true, selector)) return
      await page.keyboard.press("Tab")
    }
    throw new Error(`token focus observation could not reach ${selector} through native Tab order`)
  }
  throw new Error(`Unknown token consumer state: ${state}`)
}

export const observeTokenContract = async ({ browser, baseURL, tokenMapping }) => {
  const observations = []
  const computedAxes = []
  for (const territory of territories) {
    const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block", timezoneId: "UTC" })
    const page = await context.newPage()
    try {
      const territoryObservations = []
      for (const entry of tokenMapping.entries) {
        await configurePresentation(page, "desktop-1440")
        await page.goto(`${baseURL}/?territory=${territory.territoryId}&frame=${entry.consumer.frameId}&presentation=default`, { timeout: 30_000, waitUntil: "domcontentloaded" })
        await page.locator(`[data-shared-root][data-territory-id="${territory.territoryId}"][data-frame-id="${entry.consumer.frameId}"]`).waitFor({ state: "attached" })
        await applyConsumerState(page, entry.consumer)
        const readValues = () => page.evaluate(({ selector, property, cssCustomProperty, state }) => {
          const customPropertyValue = getComputedStyle(document.documentElement).getPropertyValue(cssCustomProperty).trim()
          const consumer = document.querySelector(selector)
          if (consumer === null) return { customPropertyValue, consumerExists: false, consumerComputedValue: null }
          const consumerComputedValue = state === "meta-content"
            ? consumer.getAttribute(property)
            : getComputedStyle(consumer).getPropertyValue(property).trim()
          return { customPropertyValue, consumerExists: true, consumerComputedValue }
        }, { ...entry.consumer, cssCustomProperty: entry.cssCustomProperty })
        const values = await readValues()
        const declaredValue = territory.tokens[entry.role]
        const promotable = tokenMapping.promotableRoles.includes(entry.role)
        if (values.customPropertyValue !== declaredValue) throw new Error(`${territory.territoryId}/${entry.role}: computed custom property does not equal declared territory token`)
        if (!values.consumerExists || values.consumerComputedValue === null || values.consumerComputedValue === "") throw new Error(`${territory.territoryId}/${entry.role}: consumer coordinate did not resolve`)
        if (entry.consumer.state === "meta-content" && values.consumerComputedValue !== declaredValue) throw new Error(`${territory.territoryId}/${entry.role}: meta consumer does not equal declared token`)
        let dependencyProof = null
        if (promotable && entry.role === "manifest.themeColor") {
          dependencyProof = {
            proofType: "explicit-dom-attribute-binding",
            expectedAttributeValue: declaredValue,
            observedAttributeValue: values.consumerComputedValue,
            exact: values.consumerComputedValue === declaredValue
          }
        } else if (promotable) {
          const alternateTerritory = territories.find((candidate) => candidate.tokens[entry.role] !== declaredValue)
          if (alternateTerritory === undefined) throw new Error(`${entry.role}: promotable role has no alternate territory value`)
          const alternateDeclaredValue = alternateTerritory.tokens[entry.role]
          await page.evaluate(({ cssCustomProperty, alternateDeclaredValue }) => {
            document.documentElement.style.setProperty(cssCustomProperty, alternateDeclaredValue)
          }, { cssCustomProperty: entry.cssCustomProperty, alternateDeclaredValue })
          await page.waitForTimeout(250)
          const alternateValues = await readValues()
          await page.evaluate(({ cssCustomProperty, declaredValue }) => {
            document.documentElement.style.setProperty(cssCustomProperty, declaredValue)
          }, { cssCustomProperty: entry.cssCustomProperty, declaredValue })
          await page.waitForTimeout(250)
          const restoredValues = await readValues()
          if (alternateValues.customPropertyValue !== alternateDeclaredValue) throw new Error(`${territory.territoryId}/${entry.role}: dependency mutation did not change the computed custom property`)
          if (alternateValues.consumerComputedValue === values.consumerComputedValue) throw new Error(`${territory.territoryId}/${entry.role}: mapped consumer does not depend on the promotable token`)
          if (restoredValues.customPropertyValue !== declaredValue || restoredValues.consumerComputedValue !== values.consumerComputedValue) throw new Error(`${territory.territoryId}/${entry.role}: dependency mutation did not restore exactly`)
          dependencyProof = {
            proofType: "browser-custom-property-dependency-mutation",
            alternateTerritoryId: alternateTerritory.territoryId,
            alternateDeclaredValue,
            beforeConsumerComputedValue: values.consumerComputedValue,
            alternateConsumerComputedValue: alternateValues.consumerComputedValue,
            restoredConsumerComputedValue: restoredValues.consumerComputedValue,
            changed: true,
            restored: true
          }
        }
        territoryObservations.push({
          role: entry.role,
          promotable,
          cssCustomProperty: entry.cssCustomProperty,
          declaredValue,
          computedCustomPropertyValue: values.customPropertyValue,
          consumer: entry.consumer,
          consumerComputedValue: values.consumerComputedValue,
          dependencyProof
        })
      }
      observations.push({ territoryId: territory.territoryId, roles: territoryObservations })

      await configurePresentation(page, "desktop-1440")
      await page.goto(`${baseURL}/?territory=${territory.territoryId}&frame=orientation-home-check-fixture&presentation=default`, { timeout: 30_000, waitUntil: "domcontentloaded" })
      await page.locator(`[data-shared-root][data-territory-id="${territory.territoryId}"]`).waitFor({ state: "attached" })
      const axes = []
      for (const axis of tokenMapping.materialAxes) {
        const value = await page.locator(axis.selector).first().evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), axis.property)
        if (value === "") throw new Error(`${territory.territoryId}/${axis.axisId}: material-axis coordinate did not resolve`)
        axes.push({ axisId: axis.axisId, selector: axis.selector, property: axis.property, computedValue: value })
      }
      computedAxes.push({ territoryId: territory.territoryId, axes })
    } finally {
      await context.close()
    }
  }

  const differentiation = tokenMapping.materialAxes.map((axis) => {
    const values = computedAxes.map(({ territoryId, axes }) => ({
      territoryId,
      computedValue: axes.find(({ axisId }) => axisId === axis.axisId).computedValue
    }))
    return {
      axisId: axis.axisId,
      values,
      pairwiseDistinct: new Set(values.map(({ computedValue }) => computedValue)).size === territories.length
    }
  })
  const materialDifferentiationCount = differentiation.filter(({ pairwiseDistinct }) => pairwiseDistinct).length
  if (materialDifferentiationCount < 5) throw new Error(`only ${materialDifferentiationCount} material computed-style axes are pairwise distinct; at least 5 are required`)
  if (differentiation.some(({ pairwiseDistinct }) => !pairwiseDistinct)) throw new Error(`declared material axis is not pairwise distinct: ${differentiation.filter(({ pairwiseDistinct }) => !pairwiseDistinct).map(({ axisId }) => axisId).join(", ")}`)
  return { observations, computedAxes, differentiation, materialDifferentiationCount }
}

const expectedCases = () => {
  const requests = []
  for (const territory of territories) {
    for (const frame of sharedFrames) {
      for (const browserProject of browserProjects) {
        requests.push({ territoryId: territory.territoryId, frameId: frame.frameId, presentation: "default", browserProject })
      }
    }
    for (const special of specialPresentationMatrix) {
      for (const browserProject of special.browserProjects) {
        requests.push({ territoryId: territory.territoryId, frameId: special.frameId, presentation: special.presentation, browserProject })
      }
    }
  }
  return requests
}

const git = (arguments_, encoding = "utf8") => execFileSync("git", arguments_, {
  cwd: repositoryRoot,
  encoding,
  maxBuffer: 20 * 1024 * 1024
})

const capture = async ({ sourceSha, port }) => {
  if (!/^[0-9a-f]{40}$/.test(sourceSha)) throw new Error("--source-sha must be a full commit SHA")
  if (!Number.isSafeInteger(port) || port < 1024 || port > 65_535) throw new Error("--port must be an integer from 1024 through 65535")
  const headSha = git(["rev-parse", "HEAD"]).trim()
  if (headSha !== sourceSha) throw new Error(`--source-sha must equal the current clean subject HEAD (${headSha})`)
  if (existsSync(resolve(repositoryRoot, receiptPath))) throw new Error(`${receiptPath} must be absent before browser capture; rejected or prior receipt bytes cannot be overwritten`)
  const dirtyWorktree = git(["status", "--porcelain=v1", "--untracked-files=all"]).trim()
  if (dirtyWorktree !== "") throw new Error(`browser capture requires a globally clean worktree:\n${dirtyWorktree}`)
  const coverageErrors = validateCoverageContract()
  if (coverageErrors.length > 0) throw new Error(`browser coverage contract failed: ${coverageErrors.join(", ")}`)
  const sourceClosure = loadPreReceiptSourceClosure(sourceSha)
  const prototypeFiles = prototypePaths.map(descriptor)
  const tokenMappingFile = descriptor(tokenMappingPath)
  const harnessFiles = harnessPaths.map(descriptor)
  for (const file of [...prototypeFiles, tokenMappingFile, ...harnessFiles]) {
    const committed = git(["show", `${sourceSha}:${file.path}`], null)
    if (committed.byteLength !== file.bytes || sha256(committed) !== file.sha256) throw new Error(`${file.path}: source commit does not contain current bytes`)
  }

  const tokenMapping = JSON.parse(bytesAt(tokenMappingPath).toString("utf8"))
  for (const [key, expected] of Object.entries(evidenceCoordinates)) {
    if (tokenMapping[key] !== expected) throw new Error(`${tokenMappingPath}: ${key} must be ${JSON.stringify(expected)}`)
  }
  if (tokenMapping.entries.length !== tokenRoles.length || new Set(tokenMapping.entries.map(({ role }) => role)).size !== tokenRoles.length) throw new Error("token mapping must contain each token role exactly once")
  const computedPromotableRoles = tokenRoles.filter((role) => new Set(territories.map((territory) => territory.tokens[role])).size > 1)
  if (!Array.isArray(tokenMapping.promotableRoles) ||
    tokenMapping.promotableRoles.length !== computedPromotableRoles.length ||
    tokenMapping.promotableRoles.some((role, index) => role !== computedPromotableRoles[index])) {
    throw new Error("token mapping promotableRoles must exactly equal the ordered A/B/C value-difference closure")
  }
  for (const role of tokenRoles) {
    const entry = tokenMapping.entries.find((candidate) => candidate.role === role)
    if (entry === undefined || entry.cssCustomProperty !== cssCustomPropertyForTokenRole(role)) throw new Error(`${role}: invalid or missing token mapping`)
  }
  const cssText = bytesAt(prototypePaths[0]).toString("utf8")
  for (const entry of tokenMapping.entries) {
    if (entry.consumer.state !== "meta-content" && !cssText.includes(`var(${entry.cssCustomProperty})`)) throw new Error(`${entry.role}: CSS does not consume mapped custom property`)
  }

  const prototypeFilesSorted = [...prototypeFiles].sort((left, right) => left.path.localeCompare(right.path))
  const bundleHash = createHash("sha256")
  for (const file of prototypeFilesSorted) {
    bundleHash.update(file.path)
    bundleHash.update("\0")
    bundleHash.update(bytesAt(file.path))
    bundleHash.update("\0")
  }
  const prototypeBundleSha256 = bundleHash.digest("hex")
  const baseURL = `http://127.0.0.1:${port}`
  const startedAt = new Date().toISOString()
  const server = spawn(process.execPath, ["serve-prototype.mjs"], {
    cwd: researchDirectory,
    env: { ...process.env, NYCUSTODIAN_VISUAL_PROTOTYPE_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  })
  let serverError = ""
  server.stderr.on("data", (chunk) => { serverError += chunk.toString() })
  const waitForServer = async () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (server.exitCode !== null) throw new Error(`prototype server exited: ${serverError}`)
      try {
        const response = await fetch(`${baseURL}/prototype.html`)
        if (response.status === 200) return
      } catch {}
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 50))
    }
    throw new Error("prototype server did not become ready")
  }

  const launched = {}
  const cases = []
  try {
    await waitForServer()
    for (const project of browserProjects.filter((candidate) => candidate !== "firefox")) {
      launched[project] = await browserTypes[project].launch(project === "chromium" ? { channel: "chromium" } : {})
    }
    const requests = expectedCases()
    for (const [index, requested] of requests.entries()) {
      const ownedFirefox = requested.browserProject === "firefox" ? await firefox.launch() : null
      const browserCase = await captureCase({
        browser: ownedFirefox ?? launched[requested.browserProject],
        requested,
        baseURL,
        caseId: `BRC${String(index + 1).padStart(3, "0")}`
      }).finally(async () => ownedFirefox?.close())
      const errors = validateBrowserCase(browserCase)
      if (errors.length > 0) throw new Error(`${browserCase.caseId}: ${errors.join(", ")}`)
      cases.push(browserCase)
    }
    const caseSetErrors = validateRequiredCaseSet(cases, requests)
    if (caseSetErrors.length > 0) throw new Error(`browser case-set contract failed: ${caseSetErrors.join(", ")}`)
    for (const frame of sharedFrames) {
      for (const browserProject of browserProjects) {
        const semanticDigests = territories.map(({ territoryId }) => cases.find((browserCase) =>
          browserCase.territoryId === territoryId &&
          browserCase.frameId === frame.frameId &&
          browserCase.presentation === "default" &&
          browserCase.browserProject === browserProject
        )?.semanticSha256)
        if (semanticDigests.some((digest) => digest === undefined) || new Set(semanticDigests).size !== 1) throw new Error(`semantic parity failed for ${frame.frameId}/${browserProject}`)
      }
    }
    const forcedColorCases = cases.filter(({ presentation }) => presentation === "forced-colors")
    const forcedColorAdaptationHashes = forcedColorCases.map(({ presentationEvidence }) => presentationEvidence.stableAdaptationSha256)
    if (forcedColorCases.length !== territories.length || new Set(forcedColorAdaptationHashes).size !== 1) {
      throw new Error("forced-colors computed adaptation must be present and stable across A/B/C")
    }
    const forcedColorsStableAdaptationSha256 = forcedColorAdaptationHashes[0]
    const tokenEvidence = await observeTokenContract({ browser: launched.chromium, baseURL, tokenMapping })
    const completedAt = new Date().toISOString()
    const deterministicCases = cases.map(({ capturedAt: _capturedAt, ...browserCase }) => browserCase)
    const caseEvidenceSha256 = sha256(JSON.stringify(deterministicCases))
    const defaultCaseCount = cases.filter(({ presentation }) => presentation === "default").length
    const specialCaseCount = cases.length - defaultCaseCount
    const printCaseCount = cases.filter(({ presentation }) => presentation === "print").length
    if (printCaseCount !== coverageContract.printScope.caseCount) throw new Error(`immutable print scope expected ${coverageContract.printScope.caseCount} cases; captured ${printCaseCount}`)
    const receipt = {
      schemaVersion: 4,
      receiptId: "plan-006-browser-evidence",
      ...evidenceCoordinates,
      status: "passed",
      sourceSha,
      sourceClosure,
      prototypeBundleSha256,
      prototypeFiles,
      tokenMappingFile,
      harnessFiles,
      startedAt,
      completedAt,
      browserProjects,
      presentationContracts,
      defaultFrameCoverage: {
        contract: "all-territories-all-representative-frames-all-browsers",
        territoryCount: territories.length,
        frameCount: sharedFrames.length,
        browserCount: browserProjects.length,
        expectedCaseCount: territories.length * sharedFrames.length * browserProjects.length,
        actualCaseCount: defaultCaseCount
      },
      coverageContract,
      keyboardEvidenceContract,
      specialPresentationMatrix,
      axePolicy,
      suiteResult: {
        status: "passed",
        expectedCaseCount: expectedCases().length,
        actualCaseCount: cases.length,
        defaultCaseCount,
        specialCaseCount,
        printCaseCount,
        caseEvidenceSha256,
        totalAxeFindingCount: cases.reduce((count, browserCase) => count + browserCase.axeFindings.length, 0),
        unexpectedAxeFindingCount: cases.reduce((count, browserCase) => count + browserCase.unexpectedAxeFindingCount, 0),
        forcedColorsStableAdaptationSha256,
        harnessAdversarialTests: runBrowserContractAdversarialTests()
      },
      tokenEvidence,
      cases,
      screenshotBytesRetained: false
    }
    writeFileSync(resolve(repositoryRoot, receiptPath), `${JSON.stringify(receipt, null, 2)}\n`, { flag: "w" })
    process.stdout.write(`Browser receipt captured: ${cases.length} cases (${defaultCaseCount} representative defaults, ${specialCaseCount} specials, ${printCaseCount} immutable print), ${territories.length} territories, ${coverageContract.representativeFrameCount} representative frames, ${coverageContract.representedRouteIdCount}/${coverageContract.registryRouteIdCount} route IDs represented, bundle ${prototypeBundleSha256}.\n`)
  } finally {
    await Promise.all(Object.values(launched).map((browser) => browser.close()))
    server.kill("SIGTERM")
  }
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  if (process.argv.length === 3 && process.argv[2] === "--self-test") {
    const attacks = runBrowserContractAdversarialTests()
    process.stdout.write(`Browser evidence contract adversarial tests passed: ${attacks.join(", ")}.\n`)
  } else {
    const sourceArguments = process.argv.filter((argument) => argument.startsWith("--source-sha="))
    const portArguments = process.argv.filter((argument) => argument.startsWith("--port="))
    if (sourceArguments.length !== 1 || portArguments.length > 1 || process.argv.length !== 3 + portArguments.length) {
      throw new Error("usage: node capture-browser-receipt.mjs --source-sha=FULL_SHA [--port=PORT] | --self-test")
    }
    const rawPort = portArguments[0]?.slice("--port=".length) ?? "4197"
    if (!/^\d+$/.test(rawPort)) throw new Error("--port must be an integer from 1024 through 65535")
    await capture({ sourceSha: sourceArguments[0].slice("--source-sha=".length), port: Number(rawPort) })
  }
}
