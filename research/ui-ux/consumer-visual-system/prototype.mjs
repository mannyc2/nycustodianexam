const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

export const executionCoordinates = deepFreeze({
  programVersion: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  humanReviewRequired: false,
  notHumanUsabilityTested: true,
  acceptedStep2SubjectSha: "4130693dee6caaa804a116f490b2192861f53e6e",
  acceptedStep2MergeSha: "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1",
  contentDesignPath: "product/CONTENT_DESIGN.md",
  contentDesignSha256: "91061006ffd60984b30bc9f7e7413d32ce3e57541260c71c932979eb7e4cd390",
  routesPath: "product/ROUTES.md",
  routesSha256: "501230759f15e6ccd13e1a49d24db1e3ee94d7a52e80634490c7ff7b08c24e98"
})

export const unresolvedDecisionIds = deepFreeze([
  "NAV-SHELL-BOUNDARY",
  "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY",
  "UNRESOLVED-HOME-PRIMARY-CTA",
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING",
  "UNRESOLVED-D1-VS-D2",
  "UNRESOLVED-PRACTICE-TIMING",
  "UNRESOLVED-SOURCE-PROMINENCE"
])

export const routeArchetypes = deepFreeze([
  {
    archetypeId: "orientation",
    routeIds: ["home", "exam-selector", "exam-checker", "profile", "scoring-explainer", "actual-questions-explainer", "about", "nyc-disambiguation"],
    terminalDocuments: []
  },
  {
    archetypeId: "study-launcher",
    routeIds: ["study-hub", "hazards-index", "simulation-setup", "print-center"],
    terminalDocuments: []
  },
  {
    archetypeId: "browse-reference",
    routeIds: ["atlas-index", "atlas-family", "atlas-tool", "procedures-index", "procedure-detail", "repair-lab", "faq", "transparency-index", "source", "corrections", "foil", "security", "privacy"],
    terminalDocuments: []
  },
  {
    archetypeId: "focused-task",
    routeIds: ["question-player", "hazard-player", "review-player", "simulation-player"],
    terminalDocuments: []
  },
  {
    archetypeId: "review-results",
    routeIds: ["review-queue", "simulation-results", "print-preview"],
    terminalDocuments: []
  },
  {
    archetypeId: "utility",
    routeIds: ["settings", "offline-packs", "correction-submit"],
    terminalDocuments: []
  },
  {
    archetypeId: "recovery",
    routeIds: ["status"],
    terminalDocuments: ["404", "410", "5xx"]
  }
])

export const sharedNavigationFixture = deepFreeze({
  status: "noncanonical-comparison-fixture",
  unresolvedDecisionId: "UNRESOLVED-EXACT-NAV-LABELS-GROUPING",
  explanation: "The task-versus-utility/trust separation is accepted. These visible labels, membership, and order exist only to hold one fixture constant across A/B/C and are not promoted as navigation consensus.",
  taskRegionLabel: "Study tasks — prototype fixture",
  utilityRegionLabel: "Information — prototype fixture",
  taskLinks: [
    { routeId: "study-hub", label: "Practice", href: "/practice/" },
    { routeId: "atlas-index", label: "Tool atlas", href: "/atlas/" },
    { routeId: "hazards-index", label: "Hazards", href: "/hazards/" },
    { routeId: "review-queue", label: "Review", href: "/review/" }
  ],
  utilityLinks: [
    { routeId: "offline-packs", label: "Offline", href: "/offline/" },
    { routeId: "transparency-index", label: "Sources", href: "/transparency/" },
    { routeId: "settings", label: "Settings", href: "/settings/" }
  ]
})

const proof = {
  publisher: "New York State Department of Civil Service",
  title: "Test Guide for the Entry-Level Custodians and Janitors Series",
  date: "Content last updated 2023; corpus record reviewed 2026-08-25",
  technicalLocator: "content/releases/vertical-slice/catalog.json#sources/nys.dcs.entry-level-guide"
}

export const sharedFrames = deepFreeze([
  {
    frameId: "orientation-home-check-fixture",
    archetypeId: "orientation",
    routeId: "home",
    routePath: "/",
    legalState: "neutral-no-profile",
    focused: false,
    currentRouteId: "home",
    eyebrow: "Free · independent · unofficial",
    title: "Study for the New York Custodian and Janitor exam",
    lead: "Original visual practice, tool reference, and local study features. No account is required.",
    state: { label: "Profile", value: "Choose or confirm an exam before profile-specific study" },
    actions: [
      { label: "Check my exam", href: "/exams/", kind: "primary" },
      { label: "Start practice", href: "/practice/", kind: "secondary" }
    ],
    sections: [
      { heading: "Learn the tools", body: "Use the accepted tool atlas and comparisons to study visible distinctions without claiming these are actual exam questions." },
      { heading: "Practice safely", body: "Choose original question or hazard practice. Submit an answer before any explanation is revealed." },
      { heading: "Keep studying offline", body: "Download compatible material to this device and keep the current profile visible." }
    ],
    side: [
      { tone: "information", heading: "Home action fixture", body: "Both Home tasks remain findable. This frame exercises Check my exam as the visual primary; the paired frame reverses that choice. Neither choice is canonical." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "orientation-home-practice-fixture",
    archetypeId: "orientation",
    routeId: "home",
    routePath: "/",
    legalState: "explicit-profile-ready",
    focused: false,
    currentRouteId: "home",
    eyebrow: "Free · independent · unofficial",
    title: "Study for the New York Custodian and Janitor exam",
    lead: "Original visual practice, tool reference, and local study features. No account is required.",
    state: { label: "Profile", value: "New York State · Custodians and Janitors · reviewed version" },
    actions: [
      { label: "Start practice", href: "/practice/", kind: "primary" },
      { label: "Check my exam", href: "/exams/", kind: "secondary" }
    ],
    sections: [
      { heading: "Continue a task", body: "Choose exact-count practice, review due material, or return to the tool atlas." },
      { heading: "Know the boundary", body: "This independent site does not issue an official score, predict a pass, or reproduce secure examination content." },
      { heading: "Keep the source reachable", body: "Human-readable publisher, title, and date information stays available without leading with internal identifiers." }
    ],
    side: [
      { tone: "success", heading: "Profile ready", body: "Profile context is explicit and visible outside navigation." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "study-launcher-ready",
    archetypeId: "study-launcher",
    routeId: "study-hub",
    routePath: "/practice/",
    legalState: "profile-ready-compatible-pack",
    focused: false,
    currentRouteId: "study-hub",
    eyebrow: "Practice",
    title: "Choose a study task",
    lead: "Your profile and downloaded material control which exact-count starts are available.",
    state: { label: "Profile", value: "New York State · Custodians and Janitors · launch-v1 available" },
    actions: [
      { label: "Start 45 questions", href: "/practice/session/new/?count=45", kind: "primary" },
      { label: "Start 60 questions", href: "/practice/session/new/?count=60", kind: "secondary" },
      { label: "Start 90 questions", href: "/practice/session/new/?count=90", kind: "secondary" }
    ],
    sections: [
      { heading: "Visual hazards", body: "Mark conditions in an accepted scene, or choose the equally discoverable text and keyboard hazard task." },
      { heading: "Review", body: "Open the due queue or return to a retained session. An empty queue is a successful state." },
      { heading: "Other study formats", body: "Browse tools, procedures, repairs, simulations, longer sets, and print preparation." }
    ],
    side: [
      { tone: "information", heading: "Count, not duration", body: "Starts state exact available question counts. No completion-time estimate is published." },
      { tone: "success", heading: "Available offline", body: "The active study material is verified on this device." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "study-launcher-no-profile",
    archetypeId: "study-launcher",
    routeId: "study-hub",
    routePath: "/practice/",
    legalState: "recoverable-profile-prerequisite",
    focused: false,
    currentRouteId: "study-hub",
    eyebrow: "Practice",
    title: "Choose an exam profile first",
    lead: "Practice will not silently select the first jurisdiction or use incompatible material.",
    state: { label: "Preserved", value: "Downloaded reference pages and any retained sessions remain unchanged" },
    actions: [
      { label: "Check my exam", href: "/exams/", kind: "primary" },
      { label: "Browse the tool atlas", href: "/atlas/", kind: "secondary" }
    ],
    sections: [
      { heading: "What happened", body: "No compatible profile is selected for a new practice session." },
      { heading: "What stays available", body: "Static reference material and retained local records remain readable." },
      { heading: "What to do", body: "Choose a reviewed profile, then download any required compatible study pack." }
    ],
    side: [
      { tone: "warning", heading: "No silent substitution", body: "New York State, Nassau County, and any future jurisdiction remain distinct until compatibility is established." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "browse-tool-detail",
    archetypeId: "browse-reference",
    routeId: "atlas-tool",
    routePath: "/atlas/tool/pipe-wrench/",
    legalState: "published-reviewed-reference",
    focused: false,
    currentRouteId: "atlas-index",
    eyebrow: "Tool atlas · articulated hand tools",
    title: "Pipe wrench",
    lead: "Study the accepted representative geometry and compare it with a smooth-jaw adjustable wrench.",
    state: { label: "Reference", value: "Reviewed entry-level tool record" },
    actions: [
      { label: "Compare wrench types", href: "/atlas/family/articulated-hand-tools/#comparison-pipe-adjustable-wrench", kind: "primary" },
      { label: "Back to the atlas", href: "/atlas/", kind: "secondary" }
    ],
    sections: [
      { heading: "What to notice", body: "Look for the serrated offset hook and heel jaws used to grip round pipe." },
      { heading: "Do not generalize the silhouette", body: "Manufacturers and sizes vary. Use the named decisive features, not a memorized outline." },
      { heading: "Practice boundary", body: "This is original study material, not an actual or remembered examination drawing." }
    ],
    side: [
      { tone: "information", heading: "Image framing", body: "The accepted phone derivative is shown whole with contain sizing. It is not cropped, filtered, recolored, or blended." }
    ],
    asset: {
      kind: "tool",
      stableId: "tool.pipe-wrench",
      opaqueAssetId: "t037",
      path: "/content/assets/derivatives/tools/t037-phone.png",
      alt: "Representative pipe wrench with serrated offset hook and heel jaws",
      caption: "Accepted phone derivative · representative geometry"
    },
    proof
  },
  {
    frameId: "browse-comparison",
    archetypeId: "browse-reference",
    routeId: "atlas-family",
    routePath: "/atlas/family/articulated-hand-tools/#comparison-pipe-adjustable-wrench",
    legalState: "published-reviewed-comparison",
    focused: false,
    currentRouteId: "atlas-index",
    eyebrow: "Tool comparison",
    title: "Pipe wrench and adjustable wrench",
    lead: "Compare the accepted image as one whole plate, then use the text distinction below.",
    state: { label: "Decisive distinction", value: "Serrated offset hook and heel jaws versus smooth parallel jaws with a visible worm gear" },
    actions: [
      { label: "Open pipe wrench", href: "/atlas/tool/pipe-wrench/", kind: "primary" },
      { label: "Back to the atlas", href: "/atlas/", kind: "secondary" }
    ],
    sections: [
      { heading: "Pipe wrench", body: "The representative jaws are serrated and offset for gripping round pipe." },
      { heading: "Adjustable wrench", body: "The representative jaws are smooth and parallel, adjusted by a visible worm gear." },
      { heading: "Comparison limit", body: "The plate supports feature comparison; it does not imply a universal size, brand, or outline." }
    ],
    side: [
      { tone: "success", heading: "Eligible comparison", body: "The p002 release row has no unresolved scored-use gate and uses accepted master inputs." }
    ],
    asset: {
      kind: "comparison",
      stableId: "comparison.pipe-adjustable-wrench",
      opaqueAssetId: "p002",
      path: "/content/assets/derivatives/comparisons/p002-phone.png",
      alt: "Representative pipe wrench beside an adjustable wrench for feature comparison",
      caption: "Accepted comparison phone derivative · no feature borrowing"
    },
    proof
  },
  {
    frameId: "focused-question-precommit",
    archetypeId: "focused-task",
    routeId: "question-player",
    routePath: "/practice/session/visual-system/question/1/",
    legalState: "precommit-selection-editable",
    focused: true,
    currentRouteId: "question-player",
    sessionLabel: "Question practice · item 1 of 5",
    eyebrow: "Question 1 of 5",
    title: "Which tool uses a bristled head to scrub or wash an appropriate surface?",
    lead: "Choose one answer. Submitting locks this answer; no explanation is available before a durable commit.",
    state: { label: "Answer state", value: "Not submitted · selection may still change" },
    actions: [
      { label: "Submit answer", href: "#submit-fixture", kind: "primary" },
      { label: "Save and exit", href: "/practice/", kind: "secondary" }
    ],
    interaction: {
      kind: "single-choice",
      label: "Choose one answer",
      name: "question-q001",
      options: [
        { value: "a", label: "Staple gun" },
        { value: "b", label: "Scrub brush" },
        { value: "c", label: "Protective gloves (generic)" },
        { value: "d", label: "Dustpan" }
      ]
    },
    sections: [
      { heading: "Before submitting", body: "The choice remains editable. No rationale, correctness state, or review schedule is present in the initial document." },
      { heading: "If saving fails", body: "Return to the same editable choice and explain what was preserved and how to retry." }
    ],
    side: [
      { tone: "warning", heading: "Commit before reveal", body: "A persistence failure keeps the selection editable and reveals nothing." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "focused-hazard-precommit",
    archetypeId: "focused-task",
    routeId: "hazard-player",
    routePath: "/hazards/session/visual-system/scene/1/",
    legalState: "precommit-neutral-markers",
    focused: true,
    currentRouteId: "hazard-player",
    sessionLabel: "Visual hazard practice · scene 1 of 3",
    eyebrow: "Scene 1 of 3",
    title: "Mark every condition that needs correction",
    lead: "Use neutral numbered markers. Zero markers is a valid choice until you submit.",
    state: { label: "Marker state", value: "0 markers · not submitted" },
    actions: [
      { label: "Submit markers", href: "#submit-markers-fixture", kind: "primary" },
      { label: "Save and exit", href: "/hazards/", kind: "secondary" }
    ],
    interaction: {
      kind: "hazard-marker",
      label: "Hazard scene controls",
      controls: [
        { label: "Add neutral marker", action: "fixture-add-marker" },
        { label: "Use the text and keyboard task", href: "/hazards/session/visual-system/scene/1/text/" }
      ]
    },
    sections: [
      { heading: "Keyboard alternative", body: "Use the equally available text task to identify conditions by listed location." },
      { heading: "Before submission", body: "The initial page contains no target count, answer region, correction, or explanation." }
    ],
    side: [
      { tone: "information", heading: "Scene integrity", body: "The accepted scene derivative appears only inside this hazard-task frame and is shown whole." }
    ],
    asset: {
      kind: "scene",
      stableId: "scene.slip.hallway-wet-floor",
      opaqueAssetId: "s001",
      path: "/content/assets/derivatives/scenes/s001-phone.png",
      alt: "Hallway scene for a pre-answer hazard-marking task",
      caption: "Accepted phone derivative · no answer overlay or region data"
    },
    proof
  },
  {
    frameId: "review-queue-empty",
    archetypeId: "review-results",
    routeId: "review-queue",
    routePath: "/review/",
    legalState: "successful-empty-local-queue",
    focused: false,
    currentRouteId: "review-queue",
    eyebrow: "Review",
    title: "Nothing is due for review",
    lead: "The due queue is empty on this non-production fixture. This is a successful state, not an error or a claim about a learner.",
    state: { label: "Due queue", value: "0 items in this deterministic fixture" },
    actions: [
      { label: "Choose a practice set", href: "/practice/", kind: "primary" },
      { label: "Browse the tool atlas", href: "/atlas/", kind: "secondary" }
    ],
    sections: [
      { heading: "What this means", body: "No retained review entry is due in the fixture state." },
      { heading: "What stays available", body: "Saved sessions and completed original-practice attempts remain local to the device." },
      { heading: "Next safe action", body: "Choose another exact-count set or continue with reference study." }
    ],
    side: [
      { tone: "success", heading: "Empty is complete", body: "The interface does not manufacture a score, attempt, missed answer, or pass prediction to fill this state." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "utility-offline-pack",
    archetypeId: "utility",
    routeId: "offline-packs",
    routePath: "/offline/",
    legalState: "compatible-pack-absent",
    focused: false,
    currentRouteId: "offline-packs",
    eyebrow: "Offline material",
    title: "Keep study material on this device",
    lead: "Download, verify, and activate compatible material before relying on it offline.",
    state: { label: "launch-v1", value: "Available · not downloaded in this deterministic fixture" },
    actions: [
      { label: "Download for offline use", href: "#download-pack-fixture", kind: "primary" },
      { label: "Manage storage", href: "/settings/", kind: "secondary" }
    ],
    sections: [
      { heading: "Download", body: "The update is staged separately and checked before activation." },
      { heading: "Preserve", body: "The current valid pack and active sessions remain pinned while the update is incomplete." },
      { heading: "Recover", body: "A partial or invalid download is quarantined and can be retried idempotently." }
    ],
    side: [
      { tone: "information", heading: "No download implied", body: "This comparison does not start a transfer. A real progress state must name download, verification, staging, and activation separately." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "utility-correction-draft",
    archetypeId: "utility",
    routeId: "correction-submit",
    routePath: "/report/",
    legalState: "network-submit-disabled-local-draft",
    focused: false,
    currentRouteId: "correction-submit",
    eyebrow: "Report a correction",
    title: "Save a correction draft on this device",
    lead: "Network submission is not available. Saving here does not send a report.",
    state: { label: "Submission", value: "Unavailable · draft not yet saved" },
    actions: [
      { label: "Save draft locally", href: "#save-draft-fixture", kind: "primary" },
      { label: "Read the correction process", href: "/transparency/corrections/", kind: "secondary" },
      { label: "Submit when online", href: "#submit-when-online-fixture", kind: "disabled", disabled: true }
    ],
    interaction: {
      kind: "draft-field",
      label: "Correction detail",
      hint: "Do not include secure or remembered exam content. This fixture stores and sends nothing."
    },
    sections: [
      { heading: "What is saved", body: "Safe correction details and a local client receipt ID." },
      { heading: "What is not sent", body: "This dormant boundary cannot receive a report and must not imply submission." },
      { heading: "Security", body: "Do not include remembered, reconstructed, or secure examination content." }
    ],
    side: [
      { tone: "warning", heading: "Draft only", body: "A later implemented submission action would require an explicit separate step." }
    ],
    asset: null,
    proof
  },
  {
    frameId: "recovery-offline-unavailable",
    archetypeId: "recovery",
    routeId: "status",
    routePath: "/status/",
    legalState: "synthetic-offline-requested-page-not-cached",
    focused: false,
    currentRouteId: "status",
    eyebrow: "Page unavailable offline",
    title: "This page is not stored on this device",
    lead: "Your selected profile and saved study records were preserved. The requested page needs a connection or a compatible offline pack.",
    state: { label: "Preserved", value: "Profile, active pack, saved sessions, and correction drafts" },
    actions: [
      { label: "Open Offline material", href: "/offline/", kind: "primary" },
      { label: "Return home", href: "/", kind: "secondary" }
    ],
    sections: [
      { heading: "What happened", body: "The requested document is not in the current safe cache." },
      { heading: "What was preserved", body: "No local study data or active compatible material was changed." },
      { heading: "What to do", body: "Reconnect, download the required pack, or use an already cached destination." }
    ],
    side: [
      { tone: "danger", heading: "Synthetic recovery fixture", body: "This non-production route simulation is not runtime evidence. Offline unavailable is not presented as not found, withdrawn, storage failure, or service failure." }
    ],
    asset: null,
    proof
  }
])

export const tokenRoles = deepFreeze([
  "fonts.heading", "fonts.body", "fonts.mono",
  "typeScale.xs", "typeScale.sm", "typeScale.body", "typeScale.lead", "typeScale.h4", "typeScale.h3", "typeScale.h2", "typeScale.h1",
  "weights.normal", "weights.medium", "weights.bold",
  "lineHeights.tight", "lineHeights.body", "lineHeights.loose",
  "spacing.0", "spacing.1", "spacing.2", "spacing.3", "spacing.4", "spacing.5", "spacing.6", "spacing.7", "spacing.8", "spacing.9",
  "layout.copyMeasure", "layout.narrowMeasure", "layout.wideMax", "layout.fullMax", "layout.fluidGutter",
  "surfaces.canvas", "surfaces.surface", "surfaces.surfaceSubtle", "text.default", "text.muted",
  "identity.accent", "identity.onAccent",
  "actions.action", "actions.actionHover", "actions.onAction", "actions.link", "actions.focus", "actions.selectedSurface", "actions.selectedBorder", "actions.disabledSurface", "actions.disabledText",
  "status.success", "status.successSurface", "status.warning", "status.warningSurface", "status.danger", "status.dangerSurface", "status.information", "status.informationSurface",
  "borders.default", "borders.control", "borders.thin", "borders.strong",
  "shape.sm", "shape.md", "shape.lg", "shape.pill", "elevation.low", "elevation.high",
  "figure.background", "figure.border", "motion.fast", "motion.normal", "motion.easing",
  "zIndex.header", "zIndex.stickyActions", "zIndex.dialog", "zIndex.skipLink",
  "manifest.backgroundColor", "manifest.themeColor"
])

export const cssCustomPropertyForTokenRole = (role) => `--token-${role.replaceAll(".", "-")}`

const sharedTokenValues = {
  "fonts.mono": "Courier New, Courier, monospace",
  "typeScale.xs": "0.75rem",
  "typeScale.sm": "0.875rem",
  "typeScale.body": "1rem",
  "typeScale.lead": "1.2rem",
  "typeScale.h4": "1.125rem",
  "typeScale.h3": "1.35rem",
  "typeScale.h2": "2rem",
  "typeScale.h1": "clamp(2.15rem, 6vw, 4.6rem)",
  "weights.normal": "400",
  "weights.medium": "600",
  "weights.bold": "800",
  "lineHeights.tight": "1.15",
  "lineHeights.body": "1.55",
  "lineHeights.loose": "1.7",
  "spacing.0": "0",
  "spacing.1": "0.25rem",
  "spacing.2": "0.5rem",
  "spacing.3": "0.75rem",
  "spacing.4": "1rem",
  "spacing.5": "1.25rem",
  "spacing.6": "1.5rem",
  "spacing.7": "2rem",
  "spacing.8": "3rem",
  "spacing.9": "4.5rem",
  "layout.narrowMeasure": "48ch",
  "layout.fullMax": "96rem",
  "layout.fluidGutter": "max(1rem, calc((100vw - 76rem) / 2))",
  "actions.selectedSurface": "#dcecef",
  "actions.selectedBorder": "#005d62",
  "actions.disabledSurface": "#d9dedb",
  "actions.disabledText": "#59615d",
  "status.success": "#17633b",
  "status.successSurface": "#e3f2e7",
  "status.warning": "#7a4b00",
  "status.warningSurface": "#fff0c7",
  "status.danger": "#982c2c",
  "status.dangerSurface": "#fbe6e3",
  "status.information": "#245d75",
  "status.informationSurface": "#e4f0f5",
  "borders.control": "#4f5b54",
  "borders.thin": "1px",
  "shape.pill": "999px",
  "elevation.high": "0 6px 20px rgb(0 0 0 / 0.2)",
  "motion.fast": "120ms",
  "motion.normal": "180ms",
  "motion.easing": "cubic-bezier(0.2, 0, 0, 1)",
  "zIndex.header": "20",
  "zIndex.stickyActions": "30",
  "zIndex.dialog": "100",
  "zIndex.skipLink": "1000"
}

const completeTokens = (overrides) => {
  const tokens = { ...sharedTokenValues, ...overrides }
  const missing = tokenRoles.filter((role) => !(role in tokens))
  if (missing.length > 0) throw new Error(`Incomplete territory tokens: ${missing.join(", ")}`)
  return Object.fromEntries(tokenRoles.map((role) => [role, tokens[role]]))
}

export const territories = deepFreeze([
  {
    territoryId: "A",
    name: "Editorial Field Guide",
    hypothesis: "A restrained field-guide system can make accepted instructional art and source proof feel specific without imitating an agency or turning every section into a card.",
    differentiationAxes: {
      typography: "serif editorial headings with plain sans body",
      colorDistribution: "ink-and-paper canvas with brown identity and teal action",
      spacing: "tight figure-caption rhythm",
      surfaces: "open paper with ruled sections",
      borderElevation: "hairline rules and no default shadow",
      composition: "asymmetric figure-led columns",
      imageFraming: "captioned reference plates",
      actions: "text-led hierarchy with one solid action",
      navigationPresence: "noncanonical shared navigation fixture—not a territory differentiator",
      dataDensity: "compact reference density"
    },
    tokens: completeTokens({
      "fonts.heading": "Georgia, Times New Roman, serif",
      "fonts.body": "Arial, Helvetica, sans-serif",
      "typeScale.h1": "clamp(2.15rem, 6vw, 4.6rem)",
      "spacing.7": "1.75rem",
      "spacing.8": "2.75rem",
      "spacing.9": "4rem",
      "layout.copyMeasure": "67ch",
      "layout.wideMax": "76rem",
      "surfaces.canvas": "#f4f0e5",
      "surfaces.surface": "#fffdf7",
      "surfaces.surfaceSubtle": "#ece6d8",
      "text.default": "#1d2420",
      "text.muted": "#4f5b54",
      "identity.accent": "#75461f",
      "identity.onAccent": "#ffffff",
      "actions.action": "#005d62",
      "actions.actionHover": "#00484c",
      "actions.onAction": "#ffffff",
      "actions.link": "#00545a",
      "actions.focus": "#a54200",
      "borders.default": "#6f776f",
      "borders.control": "#4f5b54",
      "borders.strong": "#28332d",
      "shape.sm": "0",
      "shape.md": "0",
      "shape.lg": "0",
      "elevation.low": "none",
      "figure.background": "#f7f1e5",
      "figure.border": "#6e604d",
      "manifest.backgroundColor": "#f4f0e5",
      "manifest.themeColor": "#75461f"
    })
  },
  {
    territoryId: "B",
    name: "Practical Workshop Manual",
    hypothesis: "A sturdy work-manual system can support dense task scanning and explicit state boundaries without commercial dashboard chrome or safety-cosplay ornament.",
    differentiationAxes: {
      typography: "condensed system sans headings with sturdy sans body",
      colorDistribution: "functional neutral canvas with orange identity and blue action",
      spacing: "compact modular spacing",
      surfaces: "bounded work areas",
      borderElevation: "strong rules with at most one offset lift",
      composition: "structured grid and task rail",
      imageFraming: "diagram workbench frame",
      actions: "explicit boxed primary",
      navigationPresence: "noncanonical shared navigation fixture—not a territory differentiator",
      dataDensity: "dense scannable"
    },
    tokens: completeTokens({
      "fonts.heading": "Arial Narrow, Roboto Condensed, Arial, sans-serif",
      "fonts.body": "Arial, Helvetica, sans-serif",
      "typeScale.h1": "clamp(2rem, 5vw, 4.1rem)",
      "spacing.5": "1rem",
      "spacing.6": "1.25rem",
      "spacing.7": "1.5rem",
      "spacing.8": "2.25rem",
      "spacing.9": "3.5rem",
      "layout.copyMeasure": "72ch",
      "layout.wideMax": "80rem",
      "surfaces.canvas": "#e8ece9",
      "surfaces.surface": "#ffffff",
      "surfaces.surfaceSubtle": "#dce4df",
      "text.default": "#121917",
      "text.muted": "#3f4e49",
      "identity.accent": "#9a4d00",
      "identity.onAccent": "#ffffff",
      "actions.action": "#005ea8",
      "actions.actionHover": "#00477f",
      "actions.onAction": "#ffffff",
      "actions.link": "#004f8f",
      "actions.focus": "#7b3f00",
      "borders.default": "#50615a",
      "borders.control": "#3f4e49",
      "borders.strong": "#17251f",
      "shape.sm": "0.2rem",
      "shape.md": "0.25rem",
      "shape.lg": "0.35rem",
      "elevation.low": "4px 4px 0 #24372f",
      "elevation.high": "6px 6px 0 #17251f",
      "figure.background": "#eef2ef",
      "figure.border": "#24372f",
      "manifest.backgroundColor": "#e8ece9",
      "manifest.themeColor": "#9a4d00"
    })
  },
  {
    territoryId: "C",
    name: "Calm Study Companion",
    hypothesis: "A warm, measured study system can reduce cognitive load while retaining evidence, exact state language, and a distinct non-government identity.",
    differentiationAxes: {
      typography: "approachable humanist system sans",
      colorDistribution: "warm low-chroma canvas with violet identity and green action",
      spacing: "measured generous spacing",
      surfaces: "selective soft grouping",
      borderElevation: "soft lines without a card wall",
      composition: "sequential study flow",
      imageFraming: "inline study anchor",
      actions: "calm high-clarity action",
      navigationPresence: "noncanonical shared navigation fixture—not a territory differentiator",
      dataDensity: "moderate breathing room"
    },
    tokens: completeTokens({
      "fonts.heading": "Trebuchet MS, Segoe UI, sans-serif",
      "fonts.body": "Verdana, Segoe UI, sans-serif",
      "typeScale.h1": "clamp(2rem, 5.5vw, 4.25rem)",
      "spacing.5": "1.5rem",
      "spacing.6": "2rem",
      "spacing.7": "2.5rem",
      "spacing.8": "3.5rem",
      "spacing.9": "5rem",
      "layout.copyMeasure": "64ch",
      "layout.wideMax": "74rem",
      "surfaces.canvas": "#f7f5ef",
      "surfaces.surface": "#ffffff",
      "surfaces.surfaceSubtle": "#ece9f2",
      "text.default": "#20202a",
      "text.muted": "#555362",
      "identity.accent": "#6c3975",
      "identity.onAccent": "#ffffff",
      "actions.action": "#17653e",
      "actions.actionHover": "#104b2e",
      "actions.onAction": "#ffffff",
      "actions.link": "#4e2d69",
      "actions.focus": "#8a3d00",
      "borders.default": "#777381",
      "borders.control": "#555362",
      "borders.strong": "#37333f",
      "shape.sm": "0.65rem",
      "shape.md": "1rem",
      "shape.lg": "1.25rem",
      "elevation.low": "0 1px 0 rgb(32 32 42 / 0.14)",
      "elevation.high": "0 8px 24px rgb(32 32 42 / 0.18)",
      "figure.background": "#f3f0f6",
      "figure.border": "#797080",
      "manifest.backgroundColor": "#f7f5ef",
      "manifest.themeColor": "#6c3975"
    })
  }
])

export const semanticFingerprintInput = deepFreeze({
  navigation: sharedNavigationFixture,
  frames: sharedFrames.map(({ frameId, archetypeId, routeId, routePath, legalState, focused, currentRouteId, sessionLabel = null, eyebrow, title, lead, state, actions, interaction = null, sections, side, asset, proof: frameProof }) => ({
    frameId,
    archetypeId,
    routeId,
    routePath,
    legalState,
    focused,
    currentRouteId,
    sessionLabel,
    eyebrow,
    title,
    lead,
    state,
    actions,
    interaction,
    sections,
    side,
    asset,
    proof: frameProof
  }))
})

export const territoryFrameMatrix = deepFreeze(territories.flatMap(({ territoryId }) =>
  sharedFrames.map(({ frameId, archetypeId, routeId }) => ({ territoryId, frameId, archetypeId, routeId }))
))

// Patched only after all three independent review receipts bind the comparison
// bundle. Keeping the candidates here preserves the exact reviewed bytes.
export const selectedTerritoryId = null
export const selectedContract = null

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;")

const renderLinks = (links, currentRouteId) => links.map((link) =>
  `<li><a href="${escapeHtml(link.href)}"${link.routeId === currentRouteId ? ' aria-current="page"' : ""}>${escapeHtml(link.label)}</a></li>`
).join("")

const renderNavigation = (frame) => {
  const task = `<nav class="nav-region" aria-label="${escapeHtml(sharedNavigationFixture.taskRegionLabel)}"><span class="nav-label">${escapeHtml(sharedNavigationFixture.taskRegionLabel)}</span><ul>${renderLinks(sharedNavigationFixture.taskLinks, frame.currentRouteId)}</ul></nav>`
  const utility = `<nav class="nav-region" aria-label="${escapeHtml(sharedNavigationFixture.utilityRegionLabel)}"><span class="nav-label">${escapeHtml(sharedNavigationFixture.utilityRegionLabel)}</span><ul>${renderLinks(sharedNavigationFixture.utilityLinks, frame.currentRouteId)}</ul></nav>`
  return {
    wide: `<div class="wide-navigation">${task}${utility}</div>`,
    compact: `<details class="compact-navigation"><summary>Prototype links</summary><div class="compact-panel">${task}${utility}</div></details>`
  }
}

const renderInteraction = (interaction) => {
  if (interaction === undefined) return ""
  if (interaction.kind === "single-choice") {
    const options = interaction.options.map((option) => `<label class="choice-option"><input type="radio" name="${escapeHtml(interaction.name)}" value="${escapeHtml(option.value)}" /><span><strong>${escapeHtml(option.value.toUpperCase())}</strong>${escapeHtml(option.label)}</span></label>`).join("")
    return `<fieldset class="choice-fieldset"><legend>${escapeHtml(interaction.label)}</legend><div class="choice-list">${options}</div></fieldset>`
  }
  if (interaction.kind === "hazard-marker") {
    const controls = interaction.controls.map((control) => control.href === undefined
      ? `<button class="inline-control" type="button" data-fixture-action="${escapeHtml(control.action)}">${escapeHtml(control.label)}</button>`
      : `<a class="inline-control" href="${escapeHtml(control.href)}">${escapeHtml(control.label)}</a>`).join("")
    return `<section class="interaction-panel" aria-label="${escapeHtml(interaction.label)}"><div class="inline-controls">${controls}</div></section>`
  }
  if (interaction.kind === "draft-field") {
    return `<div class="draft-field"><label for="correction-detail">${escapeHtml(interaction.label)}</label><textarea id="correction-detail" rows="5" aria-describedby="correction-detail-hint"></textarea><p id="correction-detail-hint">${escapeHtml(interaction.hint)}</p></div>`
  }
  throw new Error(`Unknown interaction kind: ${interaction.kind}`)
}

const renderFrame = (territoryId, frameId, presentation = "default") => {
  const territory = territories.find((entry) => entry.territoryId === territoryId) ?? territories[0]
  const frame = sharedFrames.find((entry) => entry.frameId === frameId) ?? sharedFrames[0]
  document.documentElement.dataset.territory = territory.territoryId
  document.documentElement.dataset.tokenMappingVersion = "1"
  document.documentElement.dataset.presentation = presentation
  for (const role of tokenRoles) {
    document.documentElement.style.setProperty(cssCustomPropertyForTokenRole(role), territory.tokens[role])
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", territory.tokens["manifest.themeColor"])
  document.title = `${territory.territoryId} · ${territory.name} · ${frame.title}`
  const navigation = renderNavigation(frame)
  const profile = `<a class="profile-chip" href="/ny/"><span>Current profile</span><strong>${frame.legalState.includes("no-profile") || frame.legalState.includes("prerequisite") ? "No profile selected" : "New York State · reviewed"}</strong></a>`
  const session = frame.focused ? `<div class="session-landmark" role="region" aria-label="Current session">${escapeHtml(frame.sessionLabel)}</div>` : ""
  const headerNavigation = frame.focused ? "" : `${navigation.wide}${navigation.compact}`
  const actions = frame.actions.map((action) => action.href.startsWith("#")
    ? `<button class="action ${action.kind === "primary" ? "" : action.kind}" type="button" data-fixture-action="${escapeHtml(action.href.slice(1))}"${action.disabled === true ? " disabled" : ""}>${escapeHtml(action.label)}</button>`
    : `<a class="action ${action.kind === "primary" ? "" : action.kind}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`).join("")
  const interaction = renderInteraction(frame.interaction)
  const sections = frame.sections.map((section) => `<section class="content-section"><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`).join("")
  const sidePanels = frame.side.map((panel) => `<section class="status-panel" data-tone="${escapeHtml(panel.tone)}"><strong>${escapeHtml(panel.heading)}</strong><span>${escapeHtml(panel.body)}</span></section>`).join("")
  const figure = frame.asset ? `<figure class="figure-frame" data-asset-kind="${escapeHtml(frame.asset.kind)}" data-asset-id="${escapeHtml(frame.asset.opaqueAssetId)}"><img src="${escapeHtml(frame.asset.path)}" alt="${escapeHtml(frame.asset.alt)}" /><figcaption>${escapeHtml(frame.asset.caption)}</figcaption></figure>` : ""
  const proofDetails = `<details class="support-details"><summary>Where this comes from</summary><div><p><strong>Publisher:</strong> ${escapeHtml(frame.proof.publisher)}</p><p><strong>Title:</strong> ${escapeHtml(frame.proof.title)}</p><p><strong>Date:</strong> ${escapeHtml(frame.proof.date)}</p><p><strong>Technical details:</strong> <code>${escapeHtml(frame.proof.technicalLocator)}</code></p></div></details>`
  const root = document.querySelector("#prototype-root")
  root.innerHTML = `<div class="site-shell ${frame.focused ? "focused-shell" : ""}" data-shared-root data-territory-id="${territory.territoryId}" data-frame-id="${frame.frameId}" data-archetype-id="${frame.archetypeId}" data-route-id="${frame.routeId}" data-legal-state="${frame.legalState}">
    <div class="unofficial-strip">Independent study site · not affiliated with New York State, NYC, Nassau County, or a testing agency</div>
    <header class="site-header"><div class="header-inner">
      <a class="site-mark" href="/"><strong>Custodian Study</strong><span>Original visual preparation</span></a>
      ${headerNavigation}${session}${profile}
    </div></header>
    <main id="prototype-main" class="page-grid" tabindex="-1">
      <article class="content-column">
        <p class="eyebrow">${escapeHtml(frame.eyebrow)}</p>
        <h1>${escapeHtml(frame.title)}</h1>
        <p class="lead">${escapeHtml(frame.lead)}</p>
        <div class="state-line"><span class="state-label">${escapeHtml(frame.state.label)}:</span><span class="state-value">${escapeHtml(frame.state.value)}</span></div>
        ${interaction}
        <div class="action-row">${actions}</div>
        <div class="content-sections">${sections}</div>
        ${proofDetails}
      </article>
      <aside class="side-column" aria-label="Supporting information">${figure}${sidePanels}</aside>
    </main>
    <footer class="site-footer"><div class="site-footer-inner"><span>Free · independent · unofficial · no account required</span><a href="/transparency/">Sources, corrections, security, and privacy</a></div></footer>
    <p class="fixture-note">Shared content and navigation fixture · unresolved Step 2 decisions remain noncanonical.</p>
  </div>`
  window.dispatchEvent(new CustomEvent("prototype:rendered", { detail: { territoryId: territory.territoryId, frameId: frame.frameId, presentation } }))
}

const initializeBrowser = () => {
  const territorySelect = document.querySelector("#territory-select")
  const frameSelect = document.querySelector("#frame-select")
  const presentationSelect = document.querySelector("#presentation-select")
  for (const territory of territories) territorySelect.add(new Option(`${territory.territoryId} · ${territory.name}`, territory.territoryId))
  for (const frame of sharedFrames) frameSelect.add(new Option(`${frame.archetypeId} · ${frame.frameId}`, frame.frameId))
  const params = new URLSearchParams(window.location.search)
  territorySelect.value = territories.some(({ territoryId }) => territoryId === params.get("territory")) ? params.get("territory") : "A"
  frameSelect.value = sharedFrames.some(({ frameId }) => frameId === params.get("frame")) ? params.get("frame") : sharedFrames[0].frameId
  presentationSelect.value = ["default", "large-text", "reduced-motion"].includes(params.get("presentation")) ? params.get("presentation") : "default"
  const renderCurrent = () => {
    const next = new URL(window.location.href)
    next.searchParams.set("territory", territorySelect.value)
    next.searchParams.set("frame", frameSelect.value)
    next.searchParams.set("presentation", presentationSelect.value)
    window.history.replaceState(null, "", next)
    renderFrame(territorySelect.value, frameSelect.value, presentationSelect.value)
  }
  territorySelect.addEventListener("change", renderCurrent)
  frameSelect.addEventListener("change", renderCurrent)
  presentationSelect.addEventListener("change", renderCurrent)
  renderCurrent()
}

if (typeof document !== "undefined") initializeBrowser()
