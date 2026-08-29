# Plan 008: Run CODEX-only integrated consumer journey validation

## Status

- Priority: P1
- Effort: L
- Risk: MED
- Review model: `CODEX-ONLY-UIUX-V1`
- Depends on: exact accepted CODEX-only outputs from program Steps 2, 3, and 4
- Current state: BLOCKED; Steps 3 and 4 are not accepted on `main`
- Scope boundary: research and validation evidence only; no production migration or deployment

This file is the canonical executable Plan 008 contract. It supersedes the
former moderated-study plan in full. That former procedure is historical Git
data and is not an available fallback, optional phase, later gate, or source of
authority.

## Permanent evidence boundary

<!-- P008-CLAUSE P008-MODE-001 reviewMode=codex-only -->
<!-- P008-CLAUSE P008-MODE-002 humanEvidence=none -->
<!-- P008-CLAUSE P008-MODE-003 humanParticipantCount=0 -->
<!-- P008-CLAUSE P008-MODE-004 participantCount=0 -->
<!-- P008-CLAUSE P008-MODE-005 notHumanUsabilityTested=true -->
<!-- P008-CLAUSE P008-MODE-006 agentsCountAsPeople=false -->
<!-- P008-CLAUSE P008-MODE-007 realDeviceAssistiveTechnologyEvidence=false -->
<!-- P008-CLAUSE P008-MODE-008 humanBehaviorEvidence=false -->
<!-- P008-CLAUSE P008-MODE-009 decisionKind=nonbinding-agent-only-release-recommendation -->
<!-- P008-CLAUSE P008-MODE-010 productionAuthorization=false -->

The permanent counts are zero. Codex agents and automation are technical
evidence producers; neither is a person, participant, proxy person, behavioral
sample, or substitute for a person. No result may be described as observed
learner behavior, a human usability result, a real-device accessibility result,
or assistive-technology speech evidence. A bounded agent-only recommendation
does not authorize production, public release, deployment, or the later
migration.

There is no outreach, recruitment, consent, session, compensation, recording,
private participant-data, moderator, human review, decision-owner, approval, or
sign-off phase. No such machinery may be restored by an executor.

## Dependency gate

<!-- P008-CLAUSE P008-DEP-001 requiredSteps=02,03,04 -->
<!-- P008-CLAUSE P008-DEP-002 dependencyCoordinates=exact-accepted-codex-only-shas -->
<!-- P008-CLAUSE P008-DEP-003 unresolvedDependencyBehavior=stop-before-real-evidence -->
<!-- P008-CLAUSE P008-DEP-004 mustRebaseAndReverify=true -->

Before a real evidence bundle is created, fetch `origin/main` and require one
exact accepted CODEX-only commit and artifact hash for each of Steps 2, 3, and
4. Each commit must exist, be an ancestor of the immutable execution-base SHA,
and contain the named artifact with the recorded SHA-256. The execution base
must equal the fetched `origin/main`. A branch, draft, provisional packet,
unmerged commit, mutable ref, or prose claim cannot satisfy this gate.

Until all three coordinates resolve, only the provisional packet, synthetic
validator attacks, and clearly bounded current-site automation may run. The
final integrated evidence mode must fail closed.

## Critical journey contract

The fixed journey IDs are:

- `J01`: orientation, independence, trust-source, and profile entry
- `J02`: profile fit through selector/checker and ambiguity recovery
- `J03`: begin study and restore or recover session setup
- `J04`: question choice, durable commit, feedback, flagging, and next-item recovery
- `J05`: atlas comparison across index, family, and tool documents
- `J06`: hazard marking or confirmed-zero commit and recovery
- `J07`: review queue plus separately qualified question and hazard review variants
- `J08`: offline packs, import/reset/rebuild, print, and terminal recovery

The following JSON object is executable data. Its arrays are ordered and exact.
Qualified fixture state IDs clarify question and hazard review variants without
changing the maintained product state machine.

<!-- PLAN008-JOURNEY-CONTRACT-START -->
```json
{
  "version": "CODEX-ONLY-UIUX-V1/JOURNEYS-V5",
  "journeyOrder": [
    "J01",
    "J02",
    "J03",
    "J04",
    "J05",
    "J06",
    "J07",
    "J08"
  ],
  "interruptionKinds": [
    "reload",
    "back",
    "forward",
    "exit-resume",
    "online-to-offline",
    "degraded-network",
    "write-failure",
    "unknown-completion-reconciliation",
    "quota-limited",
    "blocked-upgrade",
    "stale-object",
    "missing-object",
    "withdrawn-object",
    "second-tab-invalidation",
    "optional-media-failure",
    "print-transformation"
  ],
  "capabilities": [
    "semantic-html",
    "keyboard-only",
    "focus-and-status-markup",
    "320-and-1440-css-pixel-reflow",
    "forced-colors",
    "reduced-motion",
    "visual-and-nonvisual-answer-boundary",
    "offline-and-degraded-network",
    "interruption-and-durable-recovery",
    "print-and-large-print-transformation",
    "precommit-answer-safety",
    "zero-external-requests"
  ],
  "categories": [
    "accessibility",
    "keyboard",
    "responsive",
    "offline",
    "print",
    "recovery",
    "answer-boundary"
  ],
  "applicability": "all-required",
  "providerRules": {
    "defaultByRequirementKind": {
      "authority-route": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "authority-state": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "authority-route-transition-surface": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "authority-route-accessibility": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "authority-transition": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "journey-state": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "journey-transition": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "interruption": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "capability": {
        "providerKind": "automated-result-manifest",
        "providerId": "browser-matrix"
      },
      "category": {
        "providerKind": "codex-first-pass-artifact",
        "providerId": "owner-lane"
      }
    },
    "capabilityOverrides": {
      "precommit-answer-safety": {
        "providerKind": "automated-result-manifest",
        "providerId": "repository-verify"
      }
    }
  },
  "accessibilitySurface": {
    "version": "CODEX-ONLY-UIUX-V1/ROUTE-ACCESSIBILITY-SURFACE-V1",
    "applicability": "all-required",
    "bindingRule": "each-route-plus-all-containing-state-atoms-and-transition-binding-occurrences",
    "dimensionOrder": [
      "semantic-html",
      "keyboard-only",
      "focus-and-status-markup",
      "320-and-1440-css-pixel-reflow",
      "forced-colors",
      "reduced-motion",
      "print-and-large-print-transformation",
      "nonvisual-operability",
      "cognitive-load"
    ],
    "sourceClauses": [
      {
        "clauseId": "A11Y-SRC-FEATURE-ACCESSIBILITY",
        "sourcePath": "product/FEATURE_SPEC.md",
        "sourceBlobSha": "f7f5cca987eb15c45bb9247229ea9c4dd0977e47",
        "lineStart": 464,
        "lineEnd": 486,
        "sha256": "6f89967d826c8d2e55c45f914af4fd4bdad22fe0a6f7d50a083cfb627e0cf585"
      },
      {
        "clauseId": "A11Y-SRC-FEATURE-QA",
        "sourcePath": "product/FEATURE_SPEC.md",
        "sourceBlobSha": "f7f5cca987eb15c45bb9247229ea9c4dd0977e47",
        "lineStart": 492,
        "lineEnd": 494,
        "sha256": "162ebe1745449b381d9fa1ba74d2ab77dfc9dc60e815a6708359373ec069a346"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-READING-LOAD",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 168,
        "lineEnd": 204,
        "sha256": "18ec95186e8f947c6cde6bb01c1450f82a41f87ae8886d628dc11395e73c0530"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-STATE-RECOVERY",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 312,
        "lineEnd": 327,
        "sha256": "806533b7b51a43c614d540826dd10e78f799ed8a00d7b831ad65232f6159de14"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-QUESTION-NONVISUAL",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 349,
        "lineEnd": 368,
        "sha256": "30952359b77b61d7f41e854910b7fc1fba4915b90c8455004fd59f7bd1c26553"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-HAZARD-NONVISUAL",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 400,
        "lineEnd": 420,
        "sha256": "b004fcd79ffc754166c669d855c9389c11231f259073d15e2a988a7273bc50a3"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-FORCED-COLORS",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 455,
        "lineEnd": 495,
        "sha256": "9812c6fc6c22122d2dff542ca6c51f4c6cd457d0be6f8cc20fcbad3123d27211"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-REDUCED-MOTION",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 496,
        "lineEnd": 524,
        "sha256": "3d67310e27097019fec337ab8d4045cc9d5ddcff1949623189c3ff884ee7ffbc"
      },
      {
        "clauseId": "A11Y-SRC-DESIGN-PRINT",
        "sourcePath": "product/DESIGN_SYSTEM.md",
        "sourceBlobSha": "24119fa451f0bc05fe091acd9a61a6be83441bf7",
        "lineStart": 529,
        "lineEnd": 562,
        "sha256": "d70908cb568b26df280a54d7aa7e857a594c904e3164a9147fc7c9b10c5abde0"
      }
    ],
    "dimensions": [
      {
        "dimensionId": "semantic-html",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-ACCESSIBILITY",
          "A11Y-SRC-DESIGN-READING-LOAD",
          "A11Y-SRC-DESIGN-QUESTION-NONVISUAL"
        ]
      },
      {
        "dimensionId": "keyboard-only",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-ACCESSIBILITY",
          "A11Y-SRC-DESIGN-STATE-RECOVERY"
        ]
      },
      {
        "dimensionId": "focus-and-status-markup",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-ACCESSIBILITY",
          "A11Y-SRC-DESIGN-STATE-RECOVERY"
        ]
      },
      {
        "dimensionId": "320-and-1440-css-pixel-reflow",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-QA",
          "A11Y-SRC-DESIGN-READING-LOAD",
          "A11Y-SRC-DESIGN-QUESTION-NONVISUAL",
          "A11Y-SRC-DESIGN-HAZARD-NONVISUAL"
        ]
      },
      {
        "dimensionId": "forced-colors",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-QA",
          "A11Y-SRC-DESIGN-FORCED-COLORS"
        ]
      },
      {
        "dimensionId": "reduced-motion",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-ACCESSIBILITY",
          "A11Y-SRC-DESIGN-REDUCED-MOTION"
        ]
      },
      {
        "dimensionId": "print-and-large-print-transformation",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-QA",
          "A11Y-SRC-DESIGN-PRINT"
        ]
      },
      {
        "dimensionId": "nonvisual-operability",
        "sourceClauseIds": [
          "A11Y-SRC-FEATURE-ACCESSIBILITY",
          "A11Y-SRC-DESIGN-QUESTION-NONVISUAL",
          "A11Y-SRC-DESIGN-HAZARD-NONVISUAL"
        ]
      },
      {
        "dimensionId": "cognitive-load",
        "sourceClauseIds": [
          "A11Y-SRC-DESIGN-READING-LOAD",
          "A11Y-SRC-DESIGN-STATE-RECOVERY",
          "A11Y-SRC-DESIGN-QUESTION-NONVISUAL",
          "A11Y-SRC-DESIGN-HAZARD-NONVISUAL"
        ]
      }
    ]
  },
  "sourceClauseIdTemplate": "P008-REQ-{globalOrdinal4}",
  "assertionIdTemplate": "P008-AST-{globalOrdinal4}",
  "journeys": [
    {
      "journeyId": "J01",
      "routeIds": [
        "home",
        "profile",
        "transparency-index",
        "about"
      ],
      "stateIds": [
        "home:ready",
        "home:offline-stale",
        "profile:ready",
        "profile:offline-stale",
        "profile:superseded",
        "profile:retired",
        "profile:pending",
        "profile:recoverable-error",
        "transparency-index:ready",
        "transparency-index:offline-stale",
        "about:ready",
        "about:offline-stale"
      ],
      "transitionIds": [
        "profile:pending->profile:ready",
        "profile:pending->profile:recoverable-error",
        "home:ready->profile:ready"
      ]
    },
    {
      "journeyId": "J02",
      "routeIds": [
        "exam-selector",
        "exam-checker",
        "profile"
      ],
      "stateIds": [
        "exam-selector:ready",
        "exam-selector:empty",
        "exam-selector:pending",
        "exam-selector:offline-stale",
        "exam-selector:offline-unavailable",
        "exam-checker:ready",
        "exam-checker:validating",
        "exam-checker:no-match",
        "exam-checker:ambiguous",
        "exam-checker:match",
        "profile:ready",
        "profile:offline-stale",
        "profile:superseded",
        "profile:retired",
        "profile:pending",
        "profile:recoverable-error"
      ],
      "transitionIds": [
        "exam-selector:ready->exam-selector:empty",
        "exam-selector:ready->exam-selector:pending",
        "exam-checker:ready->exam-checker:validating",
        "exam-checker:validating->exam-checker:no-match",
        "exam-checker:validating->exam-checker:ambiguous",
        "exam-checker:validating->exam-checker:match",
        "exam-checker:match->profile:ready"
      ]
    },
    {
      "journeyId": "J03",
      "routeIds": [
        "study-hub",
        "question-player"
      ],
      "stateIds": [
        "study-hub:ready",
        "study-hub:empty",
        "study-hub:offline-stale",
        "study-hub:pending",
        "study-hub:recoverable-error",
        "question-player:restoring",
        "question-player:ready",
        "question-player:content-unavailable",
        "question-player:completed"
      ],
      "transitionIds": [
        "study-hub:ready->study-hub:pending",
        "study-hub:pending->question-player:restoring",
        "question-player:restoring->question-player:ready",
        "question-player:restoring->question-player:content-unavailable"
      ]
    },
    {
      "journeyId": "J04",
      "routeIds": [
        "question-player"
      ],
      "stateIds": [
        "question-player:restoring",
        "question-player:ready",
        "question-player:selected",
        "question-player:committing",
        "question-player:answered-revealed",
        "question-player:reviewed",
        "question-player:completed",
        "question-player:recoverable-error",
        "question-player:content-unavailable"
      ],
      "transitionIds": [
        "question-player:restoring->question-player:ready",
        "question-player:restoring->question-player:content-unavailable",
        "question-player:ready->question-player:selected",
        "question-player:selected->question-player:selected(same-choice-idempotent)",
        "question-player:selected->question-player:selected(change)",
        "question-player:selected->question-player:ready(clear)",
        "question-player:selected->question-player:committing",
        "question-player:committing->question-player:answered-revealed(durable-completion)",
        "question-player:committing->question-player:answered-revealed(same-id-reconciliation)",
        "question-player:committing->question-player:selected+recoverable-error",
        "question-player:answered-revealed->question-player:answered-revealed(flag)",
        "question-player:answered-revealed->question-player:answered-revealed(unflag)",
        "question-player:answered-revealed->question-player:reviewed",
        "question-player:reviewed->question-player:restoring(next)",
        "question-player:reviewed->question-player:completed"
      ]
    },
    {
      "journeyId": "J05",
      "routeIds": [
        "atlas-index",
        "atlas-family",
        "atlas-tool"
      ],
      "stateIds": [
        "atlas-index:ready",
        "atlas-index:empty",
        "atlas-index:loading",
        "atlas-index:recoverable-error",
        "atlas-family:ready",
        "atlas-family:offline-stale",
        "atlas-family:withdrawn",
        "atlas-family:pending",
        "atlas-family:recoverable-error",
        "atlas-tool:ready",
        "atlas-tool:offline-stale",
        "atlas-tool:retired",
        "atlas-tool:corrected",
        "atlas-tool:withdrawn"
      ],
      "transitionIds": [
        "atlas-index:ready->atlas-index:empty",
        "atlas-index:loading->atlas-index:ready",
        "atlas-index:loading->atlas-index:recoverable-error",
        "atlas-index:ready->atlas-family:ready",
        "atlas-family:ready->atlas-tool:ready"
      ]
    },
    {
      "journeyId": "J06",
      "routeIds": [
        "hazards-index",
        "hazard-player"
      ],
      "stateIds": [
        "hazards-index:ready",
        "hazards-index:empty",
        "hazard-player:restoring",
        "hazard-player:ready",
        "hazard-player:marking",
        "hazard-player:confirm-zero",
        "hazard-player:committing",
        "hazard-player:answered-revealed",
        "hazard-player:reviewed",
        "hazard-player:completed",
        "hazard-player:recoverable-error",
        "hazard-player:content-unavailable"
      ],
      "transitionIds": [
        "hazard-player:restoring->hazard-player:ready",
        "hazard-player:restoring->hazard-player:content-unavailable",
        "hazard-player:ready->hazard-player:marking",
        "hazard-player:marking->hazard-player:ready(clear)",
        "hazard-player:ready->hazard-player:confirm-zero(zero-from-ready)",
        "hazard-player:marking->hazard-player:confirm-zero(zero-from-marking)",
        "hazard-player:marking->hazard-player:committing(marked-attempt)",
        "hazard-player:confirm-zero(zero-from-ready)->hazard-player:committing(zero-from-ready)",
        "hazard-player:confirm-zero(zero-from-marking)->hazard-player:committing(zero-from-marking)",
        "hazard-player:committing(marked-attempt)->hazard-player:answered-revealed(durable-completion)",
        "hazard-player:committing(marked-attempt)->hazard-player:answered-revealed(same-id-reconciliation)",
        "hazard-player:committing(zero-from-ready)->hazard-player:answered-revealed(durable-completion)",
        "hazard-player:committing(zero-from-ready)->hazard-player:answered-revealed(same-id-reconciliation)",
        "hazard-player:committing(zero-from-marking)->hazard-player:answered-revealed(durable-completion)",
        "hazard-player:committing(zero-from-marking)->hazard-player:answered-revealed(same-id-reconciliation)",
        "hazard-player:committing(marked-attempt)->hazard-player:marking+recoverable-error",
        "hazard-player:committing(zero-from-ready)->hazard-player:ready+recoverable-error",
        "hazard-player:committing(zero-from-marking)->hazard-player:marking+recoverable-error",
        "hazard-player:answered-revealed->hazard-player:reviewed",
        "hazard-player:reviewed->hazard-player:restoring(next)",
        "hazard-player:reviewed->hazard-player:completed"
      ]
    },
    {
      "journeyId": "J07",
      "routeIds": [
        "review-queue",
        "review-player"
      ],
      "stateIds": [
        "review-queue:loading",
        "review-queue:ready",
        "review-queue:empty",
        "review-queue:pending",
        "review-queue:recoverable-error",
        "review-player:question-restoring",
        "review-player:question-ready",
        "review-player:question-selected",
        "review-player:question-committing",
        "review-player:question-answered-revealed",
        "review-player:question-reviewed",
        "review-player:question-completed",
        "review-player:question-recoverable-error",
        "review-player:hazard-restoring",
        "review-player:hazard-ready",
        "review-player:hazard-marking",
        "review-player:hazard-confirm-zero",
        "review-player:hazard-committing",
        "review-player:hazard-answered-revealed",
        "review-player:hazard-reviewed",
        "review-player:hazard-completed",
        "review-player:hazard-recoverable-error",
        "review-player:content-unavailable"
      ],
      "transitionIds": [
        "review-queue:loading->review-queue:ready",
        "review-queue:loading->review-queue:empty",
        "review-queue:loading->review-queue:recoverable-error",
        "review-queue:ready->review-queue:pending(rebuild)",
        "review-queue:empty->review-queue:pending(rebuild)",
        "review-queue:recoverable-error->review-queue:pending",
        "review-queue:pending->review-queue:ready",
        "review-queue:pending->review-queue:empty",
        "review-queue:pending->review-queue:recoverable-error",
        "review-queue:ready->review-player:question-restoring",
        "review-queue:ready->review-player:hazard-restoring",
        "review-player:question-restoring->review-player:question-ready",
        "review-player:question-restoring->review-player:content-unavailable",
        "review-player:question-ready->review-player:question-selected",
        "review-player:question-selected->review-player:question-selected(same-choice-idempotent)",
        "review-player:question-selected->review-player:question-selected(change)",
        "review-player:question-selected->review-player:question-ready(clear)",
        "review-player:question-selected->review-player:question-committing",
        "review-player:question-committing->review-player:question-answered-revealed(durable-completion)",
        "review-player:question-committing->review-player:question-answered-revealed(same-id-reconciliation)",
        "review-player:question-committing->review-player:question-selected+recoverable-error",
        "review-player:question-answered-revealed->review-player:question-answered-revealed(flag)",
        "review-player:question-answered-revealed->review-player:question-answered-revealed(unflag)",
        "review-player:question-answered-revealed->review-player:question-reviewed",
        "review-player:question-reviewed->review-player:question-restoring(next)",
        "review-player:question-reviewed->review-player:question-completed",
        "review-player:hazard-restoring->review-player:hazard-ready",
        "review-player:hazard-restoring->review-player:content-unavailable",
        "review-player:hazard-ready->review-player:hazard-marking",
        "review-player:hazard-marking->review-player:hazard-ready(clear)",
        "review-player:hazard-ready->review-player:hazard-confirm-zero(zero-from-ready)",
        "review-player:hazard-marking->review-player:hazard-confirm-zero(zero-from-marking)",
        "review-player:hazard-marking->review-player:hazard-committing(marked-attempt)",
        "review-player:hazard-confirm-zero(zero-from-ready)->review-player:hazard-committing(zero-from-ready)",
        "review-player:hazard-confirm-zero(zero-from-marking)->review-player:hazard-committing(zero-from-marking)",
        "review-player:hazard-committing(marked-attempt)->review-player:hazard-answered-revealed(durable-completion)",
        "review-player:hazard-committing(marked-attempt)->review-player:hazard-answered-revealed(same-id-reconciliation)",
        "review-player:hazard-committing(zero-from-ready)->review-player:hazard-answered-revealed(durable-completion)",
        "review-player:hazard-committing(zero-from-ready)->review-player:hazard-answered-revealed(same-id-reconciliation)",
        "review-player:hazard-committing(zero-from-marking)->review-player:hazard-answered-revealed(durable-completion)",
        "review-player:hazard-committing(zero-from-marking)->review-player:hazard-answered-revealed(same-id-reconciliation)",
        "review-player:hazard-committing(marked-attempt)->review-player:hazard-marking+recoverable-error",
        "review-player:hazard-committing(zero-from-ready)->review-player:hazard-ready+recoverable-error",
        "review-player:hazard-committing(zero-from-marking)->review-player:hazard-marking+recoverable-error",
        "review-player:hazard-answered-revealed->review-player:hazard-reviewed",
        "review-player:hazard-reviewed->review-player:hazard-restoring(next)",
        "review-player:hazard-reviewed->review-player:hazard-completed"
      ]
    },
    {
      "journeyId": "J08",
      "routeIds": [
        "offline-packs",
        "settings",
        "print-center",
        "print-preview",
        "status"
      ],
      "stateIds": [
        "offline-packs:absent",
        "offline-packs:downloading",
        "offline-packs:paused-offline",
        "offline-packs:verifying",
        "offline-packs:staged",
        "offline-packs:activating",
        "offline-packs:active",
        "offline-packs:update-available",
        "offline-packs:quarantined",
        "offline-packs:removing",
        "offline-packs:retained",
        "offline-packs:recoverable-error",
        "settings:ready",
        "settings:pending",
        "settings:recoverable-error",
        "settings:import-idle",
        "settings:import-decoding",
        "settings:import-validated-preview",
        "settings:import-committing",
        "settings:import-complete",
        "settings:import-reconciling",
        "settings:import-quarantined",
        "settings:import-recoverable-error",
        "settings:reset-idle",
        "settings:reset-validated-preview",
        "settings:reset-committing",
        "settings:reset-complete",
        "settings:reset-reconciling",
        "settings:reset-recoverable-error",
        "settings:rebuild-idle",
        "settings:rebuild-decoding",
        "settings:rebuild-validated-preview",
        "settings:rebuild-committing",
        "settings:rebuild-complete",
        "settings:rebuild-reconciling",
        "settings:rebuild-quarantined",
        "settings:rebuild-recoverable-error",
        "print-center:configuring",
        "print-center:generating",
        "print-preview:preview-ready",
        "print-preview:stale",
        "print-preview:system-print-requested",
        "print-preview:recoverable-error",
        "status:not-found",
        "status:withdrawn",
        "status:offline-unavailable",
        "status:content-unavailable",
        "status:storage-unavailable",
        "status:service-unavailable",
        "status:terminal-error"
      ],
      "transitionIds": [
        "offline-packs:absent->offline-packs:downloading",
        "offline-packs:downloading->offline-packs:paused-offline",
        "offline-packs:paused-offline->offline-packs:downloading(resume)",
        "offline-packs:downloading->offline-packs:verifying",
        "offline-packs:downloading->offline-packs:recoverable-error",
        "offline-packs:downloading->offline-packs:absent(cancel)",
        "offline-packs:verifying->offline-packs:staged",
        "offline-packs:verifying->offline-packs:recoverable-error",
        "offline-packs:staged->offline-packs:activating",
        "offline-packs:activating->offline-packs:active",
        "offline-packs:verifying->offline-packs:quarantined",
        "offline-packs:activating->offline-packs:quarantined",
        "offline-packs:activating->offline-packs:recoverable-error",
        "offline-packs:active->offline-packs:update-available",
        "offline-packs:update-available->offline-packs:downloading(new-version)+active(old-version-retained)",
        "offline-packs:downloading(new-version)+active(old-version-retained)->offline-packs:verifying(new-version)+active(old-version-retained)",
        "offline-packs:verifying(new-version)+active(old-version-retained)->offline-packs:staged(new-version)+active(old-version-retained)",
        "offline-packs:staged(new-version)+active(old-version-retained)->offline-packs:activating(new-version)+active(old-version-retained)",
        "offline-packs:activating(new-version)+active(old-version-retained)->offline-packs:active(new-version)",
        "offline-packs:downloading(new-version)+active(old-version-retained)->offline-packs:active(old-version-retained)(cancel)",
        "offline-packs:downloading(new-version)+active(old-version-retained)->offline-packs:active(old-version-retained)+recoverable-error",
        "offline-packs:verifying(new-version)+active(old-version-retained)->offline-packs:active(old-version-retained)+recoverable-error",
        "offline-packs:verifying(new-version)+active(old-version-retained)->offline-packs:quarantined(update)+active(old-version-retained)",
        "offline-packs:activating(new-version)+active(old-version-retained)->offline-packs:active(old-version-retained)+recoverable-error",
        "offline-packs:activating(new-version)+active(old-version-retained)->offline-packs:quarantined(update)+active(old-version-retained)",
        "offline-packs:active->offline-packs:removing",
        "offline-packs:removing->offline-packs:absent",
        "offline-packs:active->offline-packs:retained",
        "settings:ready->settings:pending",
        "settings:pending->settings:ready",
        "settings:pending->settings:recoverable-error",
        "settings:import-idle->settings:import-decoding",
        "settings:import-decoding->settings:import-validated-preview",
        "settings:import-decoding->settings:import-quarantined",
        "settings:import-decoding->settings:import-recoverable-error",
        "settings:import-validated-preview->settings:import-committing",
        "settings:import-committing->settings:import-complete",
        "settings:import-committing->settings:import-reconciling",
        "settings:import-committing->settings:import-recoverable-error",
        "settings:import-reconciling->settings:import-complete",
        "settings:import-reconciling->settings:import-recoverable-error",
        "settings:reset-idle->settings:reset-validated-preview",
        "settings:reset-validated-preview->settings:reset-committing",
        "settings:reset-committing->settings:reset-complete",
        "settings:reset-committing->settings:reset-reconciling",
        "settings:reset-committing->settings:reset-recoverable-error",
        "settings:reset-reconciling->settings:reset-complete",
        "settings:reset-reconciling->settings:reset-recoverable-error",
        "settings:rebuild-idle->settings:rebuild-decoding",
        "settings:rebuild-decoding->settings:rebuild-validated-preview",
        "settings:rebuild-decoding->settings:rebuild-quarantined",
        "settings:rebuild-decoding->settings:rebuild-recoverable-error",
        "settings:rebuild-validated-preview->settings:rebuild-committing",
        "settings:rebuild-committing->settings:rebuild-complete",
        "settings:rebuild-committing->settings:rebuild-reconciling",
        "settings:rebuild-committing->settings:rebuild-recoverable-error",
        "settings:rebuild-reconciling->settings:rebuild-complete",
        "settings:rebuild-reconciling->settings:rebuild-recoverable-error",
        "print-center:configuring->print-center:generating",
        "print-center:generating->print-preview:preview-ready",
        "print-center:generating->print-center:configuring+recoverable-error",
        "print-preview:preview-ready->print-center:generating(regenerate)",
        "print-preview:preview-ready->print-preview:stale",
        "print-preview:stale->print-center:generating(regenerate)",
        "print-preview:stale->print-preview:stale(retain-versioned-preview)",
        "print-preview:preview-ready->print-preview:system-print-requested"
      ]
    }
  ],
  "screenStateAuthority": {
    "version": "CODEX-ONLY-UIUX-V1/SCREEN-STATE-AUTHORITY-V1",
    "sourcePath": "product/SCREEN_STATES.md",
    "sourceGitBlobSha": "c2d71d1f786efe99421ee5eb5167cbd3cd426023",
    "sourceSha256": "54b7b18280cbc8a6ec3300c424ee412e4fcb9c4d4cb773ecd4af7adc63c22987",
    "routeOrder": [
      "home",
      "exam-selector",
      "exam-checker",
      "profile",
      "study-hub",
      "atlas-index",
      "atlas-family",
      "atlas-tool",
      "procedures-index",
      "procedure-detail",
      "repair-lab",
      "question-player",
      "hazards-index",
      "hazard-player",
      "review-queue",
      "review-player",
      "simulation-setup",
      "simulation-player",
      "simulation-results",
      "print-center",
      "print-preview",
      "faq",
      "transparency-index",
      "source",
      "corrections",
      "foil",
      "security",
      "privacy",
      "correction-submit",
      "settings",
      "offline-packs",
      "status",
      "scoring-explainer",
      "actual-questions-explainer",
      "about",
      "nyc-disambiguation"
    ],
    "staticSpokeRouteIds": [
      "scoring-explainer",
      "actual-questions-explainer",
      "about",
      "nyc-disambiguation"
    ],
    "sourceClauses": [
      {
        "clauseId": "SS-RF-001",
        "kind": "route-family-row",
        "lineStart": 225,
        "lineEnd": 225,
        "sha256": "5772242652a0e6bb625c1338b1638f965a486ce53b691e40b1da30b1d8e4f319"
      },
      {
        "clauseId": "SS-RF-002",
        "kind": "route-family-row",
        "lineStart": 226,
        "lineEnd": 226,
        "sha256": "de3c3b2e1169d3ed6877afed5a272800b8435fab2f330c84b42e02b42f0fa063"
      },
      {
        "clauseId": "SS-RF-003",
        "kind": "route-family-row",
        "lineStart": 227,
        "lineEnd": 227,
        "sha256": "20fe3395c2df647a9fd4f6866dcecfd6bd6eee9de5281f7df626a614e8cf49a1"
      },
      {
        "clauseId": "SS-RF-004",
        "kind": "route-family-row",
        "lineStart": 228,
        "lineEnd": 228,
        "sha256": "3a6d1aaea10085c39621b1be4a2b2c2e009ba272772cc6f9c9cb4104eb1e1f64"
      },
      {
        "clauseId": "SS-RF-005",
        "kind": "route-family-row",
        "lineStart": 229,
        "lineEnd": 229,
        "sha256": "ca272efb8aac850dda3ca8eb97f481db6b5159a37d9a27f44c4a0504120da876"
      },
      {
        "clauseId": "SS-RF-006",
        "kind": "route-family-row",
        "lineStart": 230,
        "lineEnd": 230,
        "sha256": "03f193949065d5423f8583d94136289e669aaadd78502db1d9dcacd380f6f9d8"
      },
      {
        "clauseId": "SS-RF-007",
        "kind": "route-family-row",
        "lineStart": 231,
        "lineEnd": 231,
        "sha256": "5371eb03a898a60fec00e1ec1a712ab00cef687f664dec5fc14a529efdae195e"
      },
      {
        "clauseId": "SS-RF-008",
        "kind": "route-family-row",
        "lineStart": 232,
        "lineEnd": 232,
        "sha256": "d9922784925f0a1ed27573922690e6611e43e7052e7622b952d7cc6eefec9df6"
      },
      {
        "clauseId": "SS-RF-009",
        "kind": "route-family-row",
        "lineStart": 233,
        "lineEnd": 233,
        "sha256": "393a47841628749a481417441d99cb4700d5c957df7b33d897821b677c56a582"
      },
      {
        "clauseId": "SS-RF-010",
        "kind": "route-family-row",
        "lineStart": 234,
        "lineEnd": 234,
        "sha256": "afa1eb38482b91ca46422d4dc024e9c1f5d376bf61b8fe3af87f7e75db5239fa"
      },
      {
        "clauseId": "SS-RF-011",
        "kind": "route-family-row",
        "lineStart": 235,
        "lineEnd": 235,
        "sha256": "82a34722aa8e7a037f21897a393d282ac389810b61d82dee77768fa9c25ba9a5"
      },
      {
        "clauseId": "SS-RF-012",
        "kind": "route-family-row",
        "lineStart": 236,
        "lineEnd": 236,
        "sha256": "ef5017fac6bfeb484c73475a081bf1106d202bb77f5b68b552dcfac647de6684"
      },
      {
        "clauseId": "SS-RF-013",
        "kind": "route-family-row",
        "lineStart": 237,
        "lineEnd": 237,
        "sha256": "fa4617d787bb324368ae9f15b2e244057f5177071acce697cca2c56d062d1a38"
      },
      {
        "clauseId": "SS-RF-014",
        "kind": "route-family-row",
        "lineStart": 238,
        "lineEnd": 238,
        "sha256": "8c320179dc25c42cfae375f4f537e2073ae36f9873b4000c0628556770425348"
      },
      {
        "clauseId": "SS-RF-015",
        "kind": "route-family-row",
        "lineStart": 239,
        "lineEnd": 239,
        "sha256": "59a2da03c787db75115307ac59f9f9489ec97c0a59bc1dff087010801d7a8d87"
      },
      {
        "clauseId": "SS-RF-016",
        "kind": "route-family-row",
        "lineStart": 240,
        "lineEnd": 240,
        "sha256": "a062fb9aaf951a1b66ec160a239a584f233bfbd9b5477441111f1cb15ac57cc5"
      },
      {
        "clauseId": "SS-RF-017",
        "kind": "route-family-row",
        "lineStart": 241,
        "lineEnd": 241,
        "sha256": "fb9d43c575d10d6d236e965afa80a6202f0c2d3fe903212cdb8ebc617a1bad8c"
      },
      {
        "clauseId": "SS-RF-018",
        "kind": "route-family-row",
        "lineStart": 242,
        "lineEnd": 242,
        "sha256": "34d051f9029da97a14dc03e88240177eb4d7846288ab838fe25afdae1a5539a4"
      },
      {
        "clauseId": "SS-RF-019",
        "kind": "route-family-row",
        "lineStart": 243,
        "lineEnd": 243,
        "sha256": "6530da0ccdbe132855326917d9f680545ff34afd8c210393266312b2a4b3fedc"
      },
      {
        "clauseId": "SS-RF-020",
        "kind": "route-family-row",
        "lineStart": 244,
        "lineEnd": 244,
        "sha256": "70bfed39025ce9aaef7350fd785070e090ec299c6751d257f073876b5e28c90b"
      },
      {
        "clauseId": "SS-RF-021",
        "kind": "route-family-row",
        "lineStart": 245,
        "lineEnd": 245,
        "sha256": "952e85dafe50d1c3d160186e031addbe4db2a25d43bb99d2a8094894d9af03de"
      },
      {
        "clauseId": "SS-STATIC-SPOKES",
        "kind": "static-spoke-binding",
        "lineStart": 218,
        "lineEnd": 221,
        "sha256": "ea781b34bd7b31c84c1a5ce13701c2e7bf07de97cd304061dba66d3bd25747ec"
      },
      {
        "clauseId": "SS-M-REF-BLOCK",
        "kind": "machine-block",
        "lineStart": 80,
        "lineEnd": 87,
        "sha256": "7a4cf9008fd7c159094f21c6389e7b2a687bf734a4b71e8d3c2cf8e61c407fb0"
      },
      {
        "clauseId": "SS-M-REF-01",
        "kind": "machine-transition-clause",
        "lineStart": 81,
        "lineEnd": 81,
        "sha256": "44f546334c93d743dacf360f242b042a2b6acd5fe707cd6301ea4b25fe9bc5dd"
      },
      {
        "clauseId": "SS-M-REF-02",
        "kind": "machine-transition-clause",
        "lineStart": 82,
        "lineEnd": 82,
        "sha256": "08401fab03ef9502ffc71563db4387d0a845af8b576775e395baecbbf35b295f"
      },
      {
        "clauseId": "SS-M-REF-03",
        "kind": "machine-transition-clause",
        "lineStart": 83,
        "lineEnd": 83,
        "sha256": "be512f32536c2453966bff5ea181eb6ad566da841fe29cc2ad6a93e749b34040"
      },
      {
        "clauseId": "SS-M-REF-04",
        "kind": "machine-transition-clause",
        "lineStart": 86,
        "lineEnd": 86,
        "sha256": "376f73de997c40393b863c0c7ff0e251c6e42d88f93d2495915dc4e279437f8f"
      },
      {
        "clauseId": "SS-M-REF-RECOVERY-01",
        "kind": "recovery-action-clause",
        "lineStart": 87,
        "lineEnd": 87,
        "sha256": "6c62831b4b552d6200ed6c76ca1eb335a17257f7496ff731041830fd46b9fe1f"
      },
      {
        "clauseId": "SS-M-Q-BLOCK",
        "kind": "machine-block",
        "lineStart": 97,
        "lineEnd": 112,
        "sha256": "6f1371b96b20c7c0234d53adf614dcec3aaec1cfdc46d6caa709fcdce177786b"
      },
      {
        "clauseId": "SS-M-Q-01",
        "kind": "machine-transition-clause",
        "lineStart": 98,
        "lineEnd": 98,
        "sha256": "15dc598b0541273e20d5acd836b260e536c372432bef7bb54b1ed128720dfa53"
      },
      {
        "clauseId": "SS-M-Q-02",
        "kind": "machine-transition-clause",
        "lineStart": 100,
        "lineEnd": 100,
        "sha256": "1d92d52760a07fded98149e6ed1f833ec40dfacb9894e5b3ab4173c368ddfcff"
      },
      {
        "clauseId": "SS-M-Q-03",
        "kind": "machine-transition-clause",
        "lineStart": 102,
        "lineEnd": 102,
        "sha256": "1d92d52760a07fded98149e6ed1f833ec40dfacb9894e5b3ab4173c368ddfcff"
      },
      {
        "clauseId": "SS-M-Q-04",
        "kind": "machine-transition-clause",
        "lineStart": 103,
        "lineEnd": 103,
        "sha256": "13b65a4b9b4c827c50ded224c861a65edaae78cf099e9ba5e8c5a6b74511c082"
      },
      {
        "clauseId": "SS-M-Q-05",
        "kind": "machine-transition-clause",
        "lineStart": 104,
        "lineEnd": 104,
        "sha256": "1217da66c46c02df52421f616ba4f24f1a2d11306b936f0abbc6f34ed5f8205e"
      },
      {
        "clauseId": "SS-M-Q-06",
        "kind": "machine-transition-clause",
        "lineStart": 106,
        "lineEnd": 106,
        "sha256": "c11a80473507ea9a026f9c978f4c4eebda0de281db7352932f288dc273b33be6"
      },
      {
        "clauseId": "SS-M-Q-07",
        "kind": "machine-transition-clause",
        "lineStart": 107,
        "lineEnd": 107,
        "sha256": "aa0882025b68ecabda13d35a20829da1528dbc7760ce8ca429fd9584fec0f019"
      },
      {
        "clauseId": "SS-M-Q-08",
        "kind": "machine-transition-clause",
        "lineStart": 109,
        "lineEnd": 109,
        "sha256": "b939914839462d7fe67ed6ba75a8b15e96b35ac21fa0b6a0640a7212e8f6d8dc"
      },
      {
        "clauseId": "SS-M-Q-09",
        "kind": "machine-transition-clause",
        "lineStart": 110,
        "lineEnd": 110,
        "sha256": "3aeb7055817d61679fa92059e3ec8ce902ab2266b056507521a256789bcba126"
      },
      {
        "clauseId": "SS-M-Q-10",
        "kind": "machine-transition-clause",
        "lineStart": 112,
        "lineEnd": 112,
        "sha256": "ef1dc885a9aec272de4365f53ef13736870cf949846f6ee4cf2c09893dee1b48"
      },
      {
        "clauseId": "SS-M-H-BLOCK",
        "kind": "machine-block",
        "lineStart": 125,
        "lineEnd": 130,
        "sha256": "a6d355bb06cbda5ab973d6d1e1e63a21e35346020c9946df92a26c951641d395"
      },
      {
        "clauseId": "SS-M-H-01",
        "kind": "machine-transition-clause",
        "lineStart": 125,
        "lineEnd": 125,
        "sha256": "117953ba4a5a4c1fb7ca0e09b5b5beee9236844c20b36434066bbacb90eff251"
      },
      {
        "clauseId": "SS-M-H-02",
        "kind": "machine-transition-clause",
        "lineStart": 126,
        "lineEnd": 126,
        "sha256": "7068c744a236405bb70a8ee139dd378372bc43c4f8bc03a5020e862a77fcbec6"
      },
      {
        "clauseId": "SS-M-H-03",
        "kind": "machine-transition-clause",
        "lineStart": 127,
        "lineEnd": 127,
        "sha256": "4bc5ce18ecacfb8d830fc1f9d7f05388dc5771d03b27b0544a0e3478dfd59b0d"
      },
      {
        "clauseId": "SS-M-H-04",
        "kind": "machine-transition-clause",
        "lineStart": 128,
        "lineEnd": 128,
        "sha256": "7fe078361938c4c074ff793be7bfa0af533a8a37d46e6a8a7f70f1e70c863a8b"
      },
      {
        "clauseId": "SS-M-H-05",
        "kind": "machine-transition-clause",
        "lineStart": 129,
        "lineEnd": 129,
        "sha256": "3301e2e732665ecf43c0c833489f8b2679cc699aa47a01224f41b115d78f9b41"
      },
      {
        "clauseId": "SS-M-H-06",
        "kind": "machine-transition-clause",
        "lineStart": 130,
        "lineEnd": 130,
        "sha256": "25e336e0cfb02294e172dc4c001e2485c84cd3fc0d10acc6c4979056c11402b5"
      },
      {
        "clauseId": "SS-M-SIM-BLOCK",
        "kind": "machine-block",
        "lineStart": 141,
        "lineEnd": 146,
        "sha256": "5b8be7b895a8f2a0643468f70fcd992ebfa80aa2dabc6b485c04371d0d650009"
      },
      {
        "clauseId": "SS-M-SIM-01",
        "kind": "machine-transition-clause",
        "lineStart": 141,
        "lineEnd": 141,
        "sha256": "4c868fd1a418139dda217b9a447126f30a17960fff50331ffa3c0f51c4d2e045"
      },
      {
        "clauseId": "SS-M-SIM-02",
        "kind": "machine-transition-clause",
        "lineStart": 142,
        "lineEnd": 142,
        "sha256": "2fe9b5f613af84c2f526518a7d80149fce89657eefa9e44b7b5aeb3c152159a5"
      },
      {
        "clauseId": "SS-M-SIM-03",
        "kind": "machine-transition-clause",
        "lineStart": 143,
        "lineEnd": 143,
        "sha256": "8376965eac1ba997d092c44364d3a520531edc10bb66a5cb35e0b921e4902226"
      },
      {
        "clauseId": "SS-M-SIM-04",
        "kind": "machine-transition-clause",
        "lineStart": 144,
        "lineEnd": 144,
        "sha256": "f304e35c5a3eb8cbc53b63c2f52b0a5659ce5431efacca175a6eada77db5afd2"
      },
      {
        "clauseId": "SS-M-SIM-05",
        "kind": "machine-transition-clause",
        "lineStart": 145,
        "lineEnd": 145,
        "sha256": "b03089a477aae2258ae8fe86a135e7fb7d22703d06bdde429d5afdfcb86ea4bf"
      },
      {
        "clauseId": "SS-M-SIM-06",
        "kind": "machine-transition-clause",
        "lineStart": 146,
        "lineEnd": 146,
        "sha256": "bbcf776725d537be2191a6c66e8dc63eee0dbe82f7d665b899cdb22701316115"
      },
      {
        "clauseId": "SS-M-PRINT-BLOCK",
        "kind": "machine-block",
        "lineStart": 158,
        "lineEnd": 162,
        "sha256": "bd85c40824c29a594a9b2b67a67655a26036f67e96a8635179f684c38e64f568"
      },
      {
        "clauseId": "SS-M-PRINT-01",
        "kind": "machine-transition-clause",
        "lineStart": 158,
        "lineEnd": 158,
        "sha256": "ac4c38c54295433a2531f2a80cc554d45b6e3538ec1c2752c6a08fa792b195f4"
      },
      {
        "clauseId": "SS-M-PRINT-02",
        "kind": "machine-transition-clause",
        "lineStart": 159,
        "lineEnd": 159,
        "sha256": "5e3b8d7ecf75ce4de89566d71c960e7124cda71bdfed8a0d1e28d2100815d1a1"
      },
      {
        "clauseId": "SS-M-PRINT-03",
        "kind": "machine-transition-clause",
        "lineStart": 160,
        "lineEnd": 160,
        "sha256": "ce0e4a7bf3ba4e668e784c0661952fb8d873bf6d74949df4c9b0177cb3ac7234"
      },
      {
        "clauseId": "SS-M-PRINT-04",
        "kind": "machine-transition-clause",
        "lineStart": 161,
        "lineEnd": 161,
        "sha256": "14a29c874be0b3bb934d98da7b99fcb03f23e45aa3dd9ecb0fa5522a3654ec52"
      },
      {
        "clauseId": "SS-M-PRINT-05",
        "kind": "machine-transition-clause",
        "lineStart": 162,
        "lineEnd": 162,
        "sha256": "85130ace57f16d081b39eb690e335d24e10bd25e706f02938edc594f8a79bce2"
      },
      {
        "clauseId": "SS-M-PACK-BLOCK",
        "kind": "machine-block",
        "lineStart": 172,
        "lineEnd": 177,
        "sha256": "da225c37c50f0b336b54961605a1a9fbbb709cbc5c3c4ec6684fd306ee74c9cd"
      },
      {
        "clauseId": "SS-M-PACK-01",
        "kind": "machine-transition-clause",
        "lineStart": 172,
        "lineEnd": 172,
        "sha256": "d0754535320c32c266b731078554d1bb05751028358c6c9aefa651be0a2dda5f"
      },
      {
        "clauseId": "SS-M-PACK-02",
        "kind": "machine-transition-clause",
        "lineStart": 173,
        "lineEnd": 173,
        "sha256": "6345a59c58dca10472d8aa93fbc445cb14f9880fd24c507f18623c7f8aa1f76a"
      },
      {
        "clauseId": "SS-M-PACK-03",
        "kind": "machine-transition-clause",
        "lineStart": 174,
        "lineEnd": 174,
        "sha256": "c9d164ccd4e4389b5ae3bd1d3e0c1486b4960c8da385e870ddb4367020c2e9c6"
      },
      {
        "clauseId": "SS-M-PACK-04",
        "kind": "machine-transition-clause",
        "lineStart": 175,
        "lineEnd": 175,
        "sha256": "eb43b7d3674a5749f959d6f4a3bc3b1eba6d44df4d985713ab6251459129968a"
      },
      {
        "clauseId": "SS-M-PACK-05",
        "kind": "machine-transition-clause",
        "lineStart": 176,
        "lineEnd": 176,
        "sha256": "b9fbf8e7ed2e2492dec339a4d4ba5914927bb732e45746a060620963203055ca"
      },
      {
        "clauseId": "SS-M-PACK-06",
        "kind": "machine-transition-clause",
        "lineStart": 177,
        "lineEnd": 177,
        "sha256": "84267266bb22b4405a55ff4c3ce29db36c53cb49becd7ba99c2cbbe86bdd9bff"
      },
      {
        "clauseId": "SS-M-CORR-BLOCK",
        "kind": "machine-block",
        "lineStart": 188,
        "lineEnd": 192,
        "sha256": "72272e30fe00e84dd6b6c5ae41243ef3f5d5c745617cf14f00523b7ab7793fd3"
      },
      {
        "clauseId": "SS-M-CORR-01",
        "kind": "machine-transition-clause",
        "lineStart": 188,
        "lineEnd": 188,
        "sha256": "84dd7bd71a5aae25db6aa9f08ed62ca182feac3c58e4ba22cafe7af6c082d036"
      },
      {
        "clauseId": "SS-M-CORR-02",
        "kind": "machine-transition-clause",
        "lineStart": 189,
        "lineEnd": 189,
        "sha256": "5124e9cadb36206a013924c6eecb62af3b8b9d4af093dabb68b44b2317d235ab"
      },
      {
        "clauseId": "SS-M-CORR-03",
        "kind": "machine-transition-clause",
        "lineStart": 190,
        "lineEnd": 190,
        "sha256": "95780d4a50164c1eafe9a427e33996e6e7dc1c59f26217acd04314d1df66a401"
      },
      {
        "clauseId": "SS-M-CORR-04",
        "kind": "machine-transition-clause",
        "lineStart": 191,
        "lineEnd": 191,
        "sha256": "14d6ceba90003e858a5607d18885d02a5f78e7f7d421f19af97014b4ee7ac605"
      },
      {
        "clauseId": "SS-M-CORR-05",
        "kind": "machine-transition-clause",
        "lineStart": 192,
        "lineEnd": 192,
        "sha256": "f5099a6a7ff16c19670a8936b13acf782ab8d3d3ca40b85b502513d062ac8a8f"
      },
      {
        "clauseId": "SS-M-DATA-BLOCK",
        "kind": "machine-block",
        "lineStart": 202,
        "lineEnd": 205,
        "sha256": "5b4721a9970b56b1a95a71ef399dca92003c3166328a5351657078f049c0c887"
      },
      {
        "clauseId": "SS-M-DATA-01",
        "kind": "machine-transition-clause",
        "lineStart": 202,
        "lineEnd": 202,
        "sha256": "d3d4892c0e8294ef11f7122c4c54a2d0311bc69c19b1ae5708a5c06b2306cc55"
      },
      {
        "clauseId": "SS-M-DATA-02",
        "kind": "machine-transition-clause",
        "lineStart": 203,
        "lineEnd": 203,
        "sha256": "e5e4b8b55d014486400086eadbec53964929c1f6b4ace0283c890322d6b6e405"
      },
      {
        "clauseId": "SS-M-DATA-03",
        "kind": "machine-transition-clause",
        "lineStart": 204,
        "lineEnd": 204,
        "sha256": "404c6849c98aac0e608ffacc5e764d4d8cc79692106809f11586db700928bfcf"
      },
      {
        "clauseId": "SS-M-DATA-04",
        "kind": "machine-transition-clause",
        "lineStart": 205,
        "lineEnd": 205,
        "sha256": "8c61c753e85cc49c0f8099c042b0bcd6d755eccf0e8d9926366dc516e8b586c7"
      }
    ],
    "stateAtoms": [
      {
        "stateAtomId": "SS-AUTH-STATE-0001",
        "routeScope": [
          "home"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-001"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0002",
        "routeScope": [
          "home"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-001"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0003",
        "routeScope": [
          "exam-selector"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0004",
        "routeScope": [
          "exam-selector"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0005",
        "routeScope": [
          "exam-selector"
        ],
        "stateId": "pending",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0006",
        "routeScope": [
          "exam-selector"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0007",
        "routeScope": [
          "exam-selector"
        ],
        "stateId": "offline-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0008",
        "routeScope": [
          "exam-checker"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0009",
        "routeScope": [
          "exam-checker"
        ],
        "stateId": "validating",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0010",
        "routeScope": [
          "exam-checker"
        ],
        "stateId": "no-match",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0011",
        "routeScope": [
          "exam-checker"
        ],
        "stateId": "ambiguous",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0012",
        "routeScope": [
          "exam-checker"
        ],
        "stateId": "match",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0013",
        "routeScope": [
          "profile"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0014",
        "routeScope": [
          "profile"
        ],
        "stateId": "superseded",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0015",
        "routeScope": [
          "profile"
        ],
        "stateId": "retired",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0016",
        "routeScope": [
          "profile"
        ],
        "stateId": "pending",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0017",
        "routeScope": [
          "profile"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0018",
        "routeScope": [
          "profile"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0019",
        "routeScope": [
          "study-hub"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0020",
        "routeScope": [
          "study-hub"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0021",
        "routeScope": [
          "study-hub"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0022",
        "routeScope": [
          "study-hub"
        ],
        "stateId": "pending",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0023",
        "routeScope": [
          "study-hub"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0024",
        "routeScope": [
          "atlas-index"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0025",
        "routeScope": [
          "atlas-index"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0026",
        "routeScope": [
          "atlas-index"
        ],
        "stateId": "loading",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0027",
        "routeScope": [
          "atlas-index"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0028",
        "routeScope": [
          "atlas-family"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-007"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0029",
        "routeScope": [
          "atlas-family"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-007"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0030",
        "routeScope": [
          "atlas-family"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-007"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0031",
        "routeScope": [
          "atlas-family"
        ],
        "stateId": "pending",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-007"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0032",
        "routeScope": [
          "atlas-family"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-007"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0033",
        "routeScope": [
          "atlas-tool"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-008"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0034",
        "routeScope": [
          "atlas-tool"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-008"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0035",
        "routeScope": [
          "atlas-tool"
        ],
        "stateId": "retired",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-008"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0036",
        "routeScope": [
          "atlas-tool"
        ],
        "stateId": "corrected",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-008"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0037",
        "routeScope": [
          "atlas-tool"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-008"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0038",
        "routeScope": [
          "procedures-index"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0039",
        "routeScope": [
          "procedures-index"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0040",
        "routeScope": [
          "procedure-detail"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0041",
        "routeScope": [
          "procedure-detail"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0042",
        "routeScope": [
          "procedure-detail"
        ],
        "stateId": "corrected",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0043",
        "routeScope": [
          "procedure-detail"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0044",
        "routeScope": [
          "repair-lab"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-010"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0045",
        "routeScope": [
          "repair-lab"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-010"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0046",
        "routeScope": [
          "repair-lab"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-010"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0047",
        "routeScope": [
          "repair-lab"
        ],
        "stateId": "content-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-010"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0048",
        "routeScope": [
          "question-player"
        ],
        "stateId": "restoring",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0049",
        "routeScope": [
          "question-player"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0050",
        "routeScope": [
          "question-player"
        ],
        "stateId": "selected",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0051",
        "routeScope": [
          "question-player"
        ],
        "stateId": "committing",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0052",
        "routeScope": [
          "question-player"
        ],
        "stateId": "answered-revealed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0053",
        "routeScope": [
          "question-player"
        ],
        "stateId": "reviewed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0054",
        "routeScope": [
          "question-player"
        ],
        "stateId": "completed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0055",
        "routeScope": [
          "question-player"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0056",
        "routeScope": [
          "question-player"
        ],
        "stateId": "content-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0057",
        "routeScope": [
          "hazards-index"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0058",
        "routeScope": [
          "hazards-index"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0059",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "restoring",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0060",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0061",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "marking",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0062",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "confirm-zero",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0063",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "committing",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0064",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "answered-revealed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0065",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "reviewed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0066",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "completed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0067",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0068",
        "routeScope": [
          "review-queue"
        ],
        "stateId": "loading",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0069",
        "routeScope": [
          "review-queue"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0070",
        "routeScope": [
          "review-queue"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0071",
        "routeScope": [
          "review-queue"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0072",
        "routeScope": [
          "review-queue"
        ],
        "stateId": "pending",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0073",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "setup",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0074",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "generating",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0075",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "active",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0076",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "unanswered",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0077",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "recorded",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0078",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "final-confirmation",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0079",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "submitting",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0080",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "reconciling",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0081",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "results",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0082",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0083",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "stateId": "completed",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0084",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "stateId": "configuring",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0085",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "stateId": "generating",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0086",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "stateId": "preview-ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0087",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "stateId": "stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0088",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0089",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "stateId": "system-print-requested",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0090",
        "routeScope": [
          "faq"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-016"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0091",
        "routeScope": [
          "faq"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-016"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0092",
        "routeScope": [
          "transparency-index"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0093",
        "routeScope": [
          "transparency-index"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0094",
        "routeScope": [
          "transparency-index"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0095",
        "routeScope": [
          "transparency-index"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0096",
        "routeScope": [
          "source"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0097",
        "routeScope": [
          "source"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0098",
        "routeScope": [
          "source"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0099",
        "routeScope": [
          "source"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0100",
        "routeScope": [
          "corrections"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0101",
        "routeScope": [
          "corrections"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0102",
        "routeScope": [
          "corrections"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0103",
        "routeScope": [
          "corrections"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0104",
        "routeScope": [
          "foil"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0105",
        "routeScope": [
          "foil"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0106",
        "routeScope": [
          "foil"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0107",
        "routeScope": [
          "foil"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0108",
        "routeScope": [
          "security"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0109",
        "routeScope": [
          "security"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0110",
        "routeScope": [
          "security"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0111",
        "routeScope": [
          "security"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0112",
        "routeScope": [
          "privacy"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0113",
        "routeScope": [
          "privacy"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0114",
        "routeScope": [
          "privacy"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0115",
        "routeScope": [
          "privacy"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0116",
        "routeScope": [
          "source"
        ],
        "stateId": "empty",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0117",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "draft",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0118",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "validating",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0119",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "ready-to-submit",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0120",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "submitting",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0121",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "local-draft-saved",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0122",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "submitted",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0123",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "validation-errors",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0124",
        "routeScope": [
          "correction-submit"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0125",
        "routeScope": [
          "settings"
        ],
        "stateId": "ready",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-019"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0126",
        "routeScope": [
          "settings"
        ],
        "stateId": "pending",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-019"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0127",
        "routeScope": [
          "settings"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-019"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0128",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "absent",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0129",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "downloading",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0130",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "paused-offline",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0131",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "verifying",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0132",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "staged",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0133",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "activating",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0134",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "active",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0135",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "update-available",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0136",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "quarantined",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0137",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "removing",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0138",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "retained",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0139",
        "routeScope": [
          "offline-packs"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0140",
        "routeScope": [
          "status"
        ],
        "stateId": "not-found",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0141",
        "routeScope": [
          "status"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0142",
        "routeScope": [
          "status"
        ],
        "stateId": "offline-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0143",
        "routeScope": [
          "status"
        ],
        "stateId": "content-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0144",
        "routeScope": [
          "status"
        ],
        "stateId": "storage-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0145",
        "routeScope": [
          "status"
        ],
        "stateId": "service-unavailable",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0146",
        "routeScope": [
          "status"
        ],
        "stateId": "terminal-error",
        "normalizationCode": "direct-route-matrix",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0147",
        "routeScope": [
          "scoring-explainer"
        ],
        "stateId": "ready",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0148",
        "routeScope": [
          "scoring-explainer"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0149",
        "routeScope": [
          "scoring-explainer"
        ],
        "stateId": "not-found",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0150",
        "routeScope": [
          "scoring-explainer"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0151",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "stateId": "ready",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0152",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0153",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "stateId": "not-found",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0154",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0155",
        "routeScope": [
          "about"
        ],
        "stateId": "ready",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0156",
        "routeScope": [
          "about"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0157",
        "routeScope": [
          "about"
        ],
        "stateId": "not-found",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0158",
        "routeScope": [
          "about"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0159",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "stateId": "ready",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0160",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "stateId": "offline-stale",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0161",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "stateId": "not-found",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0162",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "stateId": "withdrawn",
        "normalizationCode": "static-reference",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0163",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-restoring",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0164",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-ready",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0165",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-selected",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0166",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-committing",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0167",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-answered-revealed",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0168",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-reviewed",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0169",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-completed",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0170",
        "routeScope": [
          "review-player"
        ],
        "stateId": "question-recoverable-error",
        "normalizationCode": "referenced-review-question",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-Q-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0171",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-restoring",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0172",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-ready",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0173",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-marking",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0174",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-confirm-zero",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0175",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-committing",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0176",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-answered-revealed",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0177",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-reviewed",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0178",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-completed",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0179",
        "routeScope": [
          "review-player"
        ],
        "stateId": "hazard-recoverable-error",
        "normalizationCode": "referenced-review-hazard",
        "sourceClauseIds": [
          "SS-RF-013",
          "SS-M-H-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0180",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-idle",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0181",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-decoding",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0182",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-validated-preview",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0183",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-committing",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0184",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-complete",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0185",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-reconciling",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0186",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-quarantined",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0187",
        "routeScope": [
          "settings"
        ],
        "stateId": "import-recoverable-error",
        "normalizationCode": "referenced-data-import",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0188",
        "routeScope": [
          "settings"
        ],
        "stateId": "reset-idle",
        "normalizationCode": "referenced-data-reset-filtered",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0189",
        "routeScope": [
          "settings"
        ],
        "stateId": "reset-validated-preview",
        "normalizationCode": "referenced-data-reset-filtered",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0190",
        "routeScope": [
          "settings"
        ],
        "stateId": "reset-committing",
        "normalizationCode": "referenced-data-reset-filtered",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0191",
        "routeScope": [
          "settings"
        ],
        "stateId": "reset-complete",
        "normalizationCode": "referenced-data-reset-filtered",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0192",
        "routeScope": [
          "settings"
        ],
        "stateId": "reset-reconciling",
        "normalizationCode": "referenced-data-reset-filtered",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0193",
        "routeScope": [
          "settings"
        ],
        "stateId": "reset-recoverable-error",
        "normalizationCode": "referenced-data-reset-filtered",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0194",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-idle",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0195",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-decoding",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0196",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-validated-preview",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0197",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-committing",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0198",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-complete",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0199",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-reconciling",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0200",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-quarantined",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0201",
        "routeScope": [
          "settings"
        ],
        "stateId": "rebuild-recoverable-error",
        "normalizationCode": "referenced-data-rebuild",
        "sourceClauseIds": [
          "SS-RF-019",
          "SS-M-DATA-BLOCK"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0202",
        "routeScope": [
          "repair-lab"
        ],
        "stateId": "recoverable-error",
        "normalizationCode": "prose-implied-recoverable-enhancement",
        "sourceClauseIds": [
          "SS-RF-010"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0203",
        "routeScope": [
          "hazard-player"
        ],
        "stateId": "content-unavailable",
        "normalizationCode": "prose-implied-missing-closure",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "stateAtomId": "SS-AUTH-STATE-0204",
        "routeScope": [
          "review-player"
        ],
        "stateId": "content-unavailable",
        "normalizationCode": "prose-implied-historical-object-unavailable",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      }
    ],
    "transitionAtoms": [
      {
        "transitionAtomId": "SS-AUTH-TRANS-0001",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "ready(current|stale)",
        "action": "filter/search",
        "to": "ready",
        "sourceClauseId": "SS-M-REF-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0002",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "ready(current|stale)",
        "action": "filter/search",
        "to": "empty",
        "sourceClauseId": "SS-M-REF-01",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0003",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "ready(current|stale)",
        "action": "background refresh",
        "to": "ready(current)",
        "sourceClauseId": "SS-M-REF-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0004",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "ready(current|stale)",
        "action": "background refresh",
        "to": "offline-stale",
        "sourceClauseId": "SS-M-REF-02",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0005",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "ready(current|stale)",
        "action": "background refresh",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-REF-02",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0006",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "ready(current|stale)",
        "action": "resource withdrawn",
        "to": "withdrawn",
        "sourceClauseId": "SS-M-REF-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0007",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "initial-resource-failure",
        "action": "settle",
        "to": "offline-unavailable",
        "sourceClauseId": "SS-M-REF-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0008",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "initial-resource-failure",
        "action": "settle",
        "to": "content-unavailable",
        "sourceClauseId": "SS-M-REF-04",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0009",
        "kind": "machine-template",
        "machineId": "reference",
        "from": "initial-resource-failure",
        "action": "settle",
        "to": "not-found",
        "sourceClauseId": "SS-M-REF-04",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0010",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "restoring",
        "action": "restore",
        "to": "ready",
        "sourceClauseId": "SS-M-Q-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0011",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "ready",
        "action": "selectOption",
        "to": "selected",
        "sourceClauseId": "SS-M-Q-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0012",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "selected",
        "action": "selectOption",
        "to": "selected",
        "sourceClauseId": "SS-M-Q-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0013",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "selected",
        "action": "clearSelection",
        "to": "ready",
        "sourceClauseId": "SS-M-Q-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0014",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "selected",
        "action": "commitSelection",
        "to": "committing",
        "sourceClauseId": "SS-M-Q-05",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0015",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "committing",
        "action": "durable transaction complete",
        "to": "answered-revealed",
        "sourceClauseId": "SS-M-Q-06",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0016",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "committing",
        "action": "same-ID reconciliation found",
        "to": "answered-revealed",
        "sourceClauseId": "SS-M-Q-06",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0017",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "committing",
        "action": "typed failure",
        "to": "selected+recoverable-error",
        "sourceClauseId": "SS-M-Q-07",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0018",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "answered-revealed",
        "action": "flag",
        "to": "answered-revealed",
        "sourceClauseId": "SS-M-Q-08",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0019",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "answered-revealed",
        "action": "unflag",
        "to": "answered-revealed",
        "sourceClauseId": "SS-M-Q-08",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0020",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "answered-revealed",
        "action": "markReviewed",
        "to": "reviewed",
        "sourceClauseId": "SS-M-Q-09",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0021",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "reviewed",
        "action": "next",
        "to": "restoring(next)",
        "sourceClauseId": "SS-M-Q-10",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0022",
        "kind": "machine-template",
        "machineId": "immediate",
        "from": "reviewed",
        "action": "next",
        "to": "completed",
        "sourceClauseId": "SS-M-Q-10",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0023",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "restoring",
        "action": "restore",
        "to": "ready",
        "sourceClauseId": "SS-M-H-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0024",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "ready",
        "action": "mark",
        "to": "marking",
        "sourceClauseId": "SS-M-H-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0025",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "marking",
        "action": "clear",
        "to": "ready",
        "sourceClauseId": "SS-M-H-02",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0026",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "ready",
        "action": "submitZero",
        "to": "confirm-zero",
        "sourceClauseId": "SS-M-H-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0027",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "marking",
        "action": "submitZero",
        "to": "confirm-zero",
        "sourceClauseId": "SS-M-H-03",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0028",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "confirm-zero",
        "action": "confirm",
        "to": "committing",
        "sourceClauseId": "SS-M-H-03",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0029",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "marking",
        "action": "commitMarkers",
        "to": "committing",
        "sourceClauseId": "SS-M-H-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0030",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "committing",
        "action": "durable settle",
        "to": "answered-revealed",
        "sourceClauseId": "SS-M-H-05",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0031",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "committing",
        "action": "typed failure",
        "to": "previous-editable-state+recoverable-error",
        "sourceClauseId": "SS-M-H-05",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0032",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "answered-revealed",
        "action": "markReviewed",
        "to": "reviewed",
        "sourceClauseId": "SS-M-H-06",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0033",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "reviewed",
        "action": "next",
        "to": "next",
        "sourceClauseId": "SS-M-H-06",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0034",
        "kind": "machine-template",
        "machineId": "hazard",
        "from": "reviewed",
        "action": "complete",
        "to": "completed",
        "sourceClauseId": "SS-M-H-06",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0035",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "setup",
        "action": "generate",
        "to": "generating",
        "sourceClauseId": "SS-M-SIM-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0036",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "generating",
        "action": "generated",
        "to": "active",
        "sourceClauseId": "SS-M-SIM-01",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0037",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active:unanswered",
        "action": "record",
        "to": "active:recorded",
        "sourceClauseId": "SS-M-SIM-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0038",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active:recorded",
        "action": "clear",
        "to": "active:unanswered",
        "sourceClauseId": "SS-M-SIM-02",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0039",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active",
        "action": "flag",
        "to": "active",
        "sourceClauseId": "SS-M-SIM-02",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0040",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active",
        "action": "unflag",
        "to": "active",
        "sourceClauseId": "SS-M-SIM-02",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0041",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active",
        "action": "navigate",
        "to": "active",
        "sourceClauseId": "SS-M-SIM-02",
        "sourceOccurrenceOrdinal": 5
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0042",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active",
        "action": "autosave",
        "to": "active",
        "sourceClauseId": "SS-M-SIM-02",
        "sourceOccurrenceOrdinal": 6
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0043",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "active",
        "action": "submit",
        "to": "final-confirmation",
        "sourceClauseId": "SS-M-SIM-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0044",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "final-confirmation",
        "action": "confirm",
        "to": "submitting",
        "sourceClauseId": "SS-M-SIM-03",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0045",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "submitting",
        "action": "durable success",
        "to": "results",
        "sourceClauseId": "SS-M-SIM-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0046",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "submitting",
        "action": "typed failure",
        "to": "active+recoverable-error",
        "sourceClauseId": "SS-M-SIM-04",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0047",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "submitting",
        "action": "unknown completion",
        "to": "reconciling",
        "sourceClauseId": "SS-M-SIM-04",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0048",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "reconciling",
        "action": "found success",
        "to": "results",
        "sourceClauseId": "SS-M-SIM-05",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0049",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "reconciling",
        "action": "found failure",
        "to": "active+recoverable-error",
        "sourceClauseId": "SS-M-SIM-05",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0050",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "results",
        "action": "review",
        "to": "reviewed",
        "sourceClauseId": "SS-M-SIM-06",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0051",
        "kind": "machine-template",
        "machineId": "simulation",
        "from": "results",
        "action": "exit",
        "to": "exit",
        "sourceClauseId": "SS-M-SIM-06",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0052",
        "kind": "machine-template",
        "machineId": "print",
        "from": "configuring",
        "action": "generate",
        "to": "generating",
        "sourceClauseId": "SS-M-PRINT-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0053",
        "kind": "machine-template",
        "machineId": "print",
        "from": "generating",
        "action": "success",
        "to": "preview-ready",
        "sourceClauseId": "SS-M-PRINT-01",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0054",
        "kind": "machine-template",
        "machineId": "print",
        "from": "generating",
        "action": "typed failure",
        "to": "configuring+recoverable-error",
        "sourceClauseId": "SS-M-PRINT-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0055",
        "kind": "machine-template",
        "machineId": "print",
        "from": "preview-ready",
        "action": "regenerate",
        "to": "generating",
        "sourceClauseId": "SS-M-PRINT-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0056",
        "kind": "machine-template",
        "machineId": "print",
        "from": "preview-ready",
        "action": "request system print",
        "to": "system-print-requested",
        "sourceClauseId": "SS-M-PRINT-03",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0057",
        "kind": "machine-template",
        "machineId": "print",
        "from": "preview-ready",
        "action": "referenced content corrected/removed",
        "to": "stale",
        "sourceClauseId": "SS-M-PRINT-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0058",
        "kind": "machine-template",
        "machineId": "print",
        "from": "stale",
        "action": "regenerate",
        "to": "regenerate",
        "sourceClauseId": "SS-M-PRINT-05",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0059",
        "kind": "machine-template",
        "machineId": "print",
        "from": "stale",
        "action": "retain when safely supported",
        "to": "retain-versioned-preview",
        "sourceClauseId": "SS-M-PRINT-05",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0060",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "absent",
        "action": "advance",
        "to": "downloading",
        "sourceClauseId": "SS-M-PACK-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0061",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "downloading",
        "action": "advance",
        "to": "verifying",
        "sourceClauseId": "SS-M-PACK-01",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0062",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "verifying",
        "action": "advance",
        "to": "staged",
        "sourceClauseId": "SS-M-PACK-01",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0063",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "staged",
        "action": "advance",
        "to": "activating",
        "sourceClauseId": "SS-M-PACK-01",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0064",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "activating",
        "action": "advance",
        "to": "active",
        "sourceClauseId": "SS-M-PACK-01",
        "sourceOccurrenceOrdinal": 5
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0065",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "downloading",
        "action": "offline",
        "to": "paused-offline",
        "sourceClauseId": "SS-M-PACK-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0066",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "downloading",
        "action": "typed failure",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-PACK-02",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0067",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "downloading",
        "action": "cancel",
        "to": "absent",
        "sourceClauseId": "SS-M-PACK-02",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0068",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "verifying",
        "action": "failure",
        "to": "quarantined",
        "sourceClauseId": "SS-M-PACK-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0069",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "verifying",
        "action": "failure",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-PACK-03",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0070",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "activating",
        "action": "failure",
        "to": "quarantined",
        "sourceClauseId": "SS-M-PACK-03",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0071",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "activating",
        "action": "failure",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-PACK-03",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0072",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "active",
        "action": "update discovered",
        "to": "update-available",
        "sourceClauseId": "SS-M-PACK-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0073",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "update-available",
        "action": "download new version",
        "to": "downloading(new version)",
        "sourceClauseId": "SS-M-PACK-04",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0074",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "active",
        "action": "remove",
        "to": "removing",
        "sourceClauseId": "SS-M-PACK-05",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0075",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "removing",
        "action": "complete removal",
        "to": "absent",
        "sourceClauseId": "SS-M-PACK-05",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0076",
        "kind": "machine-template",
        "machineId": "offline-pack",
        "from": "active",
        "action": "blocked removal",
        "to": "retained",
        "sourceClauseId": "SS-M-PACK-06",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0077",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "draft",
        "action": "advance",
        "to": "validating",
        "sourceClauseId": "SS-M-CORR-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0078",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "validating",
        "action": "advance",
        "to": "ready-to-submit",
        "sourceClauseId": "SS-M-CORR-01",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0079",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "ready-to-submit",
        "action": "advance",
        "to": "submitting",
        "sourceClauseId": "SS-M-CORR-01",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0080",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "submitting",
        "action": "advance",
        "to": "submitted",
        "sourceClauseId": "SS-M-CORR-01",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0081",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "validating",
        "action": "validation failure",
        "to": "draft+validation-errors",
        "sourceClauseId": "SS-M-CORR-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0082",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "submitting",
        "action": "typed failure",
        "to": "ready-to-submit+recoverable-error",
        "sourceClauseId": "SS-M-CORR-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0083",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "draft+offline",
        "action": "save local draft",
        "to": "local-draft-saved",
        "sourceClauseId": "SS-M-CORR-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0084",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "ready-to-submit+offline",
        "action": "save local draft",
        "to": "local-draft-saved",
        "sourceClauseId": "SS-M-CORR-04",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0085",
        "kind": "machine-template",
        "machineId": "correction",
        "from": "local-draft-saved+online",
        "action": "explicit learner action",
        "to": "ready-to-submit",
        "sourceClauseId": "SS-M-CORR-05",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0086",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "idle",
        "action": "advance",
        "to": "decoding",
        "sourceClauseId": "SS-M-DATA-01",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0087",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "decoding",
        "action": "advance",
        "to": "validated-preview",
        "sourceClauseId": "SS-M-DATA-01",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0088",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "validated-preview",
        "action": "advance",
        "to": "committing",
        "sourceClauseId": "SS-M-DATA-01",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0089",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "committing",
        "action": "commit",
        "to": "complete",
        "sourceClauseId": "SS-M-DATA-01",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0090",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "decoding",
        "action": "failure",
        "to": "quarantined",
        "sourceClauseId": "SS-M-DATA-02",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0091",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "decoding",
        "action": "failure",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-DATA-02",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0092",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "committing",
        "action": "commit",
        "to": "complete",
        "sourceClauseId": "SS-M-DATA-03",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0093",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "committing",
        "action": "commit",
        "to": "reconciling",
        "sourceClauseId": "SS-M-DATA-03",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0094",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "committing",
        "action": "commit",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-DATA-03",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0095",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "reconciling",
        "action": "reconcile",
        "to": "complete",
        "sourceClauseId": "SS-M-DATA-04",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0096",
        "kind": "machine-template",
        "machineId": "import-projection-reset",
        "from": "reconciling",
        "action": "reconcile",
        "to": "recoverable-error",
        "sourceClauseId": "SS-M-DATA-04",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0097",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-selector:ready",
        "action": "filter",
        "to": "exam-selector:empty",
        "sourceClauseId": "SS-RF-002",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0098",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-selector:empty",
        "action": "clear filter",
        "to": "exam-selector:ready",
        "sourceClauseId": "SS-RF-002",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0099",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-selector:ready",
        "action": "select compatible profile",
        "to": "exam-selector:pending",
        "sourceClauseId": "SS-RF-002",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0100",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-selector:pending",
        "action": "settle selection",
        "to": "outcome:selected-confirmation/navigation",
        "sourceClauseId": "SS-RF-002",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0101",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-checker:ready",
        "action": "validate",
        "to": "exam-checker:validating",
        "sourceClauseId": "SS-RF-003",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0102",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-checker:validating",
        "action": "result",
        "to": "exam-checker:no-match",
        "sourceClauseId": "SS-RF-003",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0103",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-checker:validating",
        "action": "result",
        "to": "exam-checker:ambiguous",
        "sourceClauseId": "SS-RF-003",
        "sourceOccurrenceOrdinal": 3
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0104",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-checker:validating",
        "action": "result",
        "to": "exam-checker:match",
        "sourceClauseId": "SS-RF-003",
        "sourceOccurrenceOrdinal": 4
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0105",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "exam-checker:match",
        "action": "select match",
        "to": "outcome:profile-navigation",
        "sourceClauseId": "SS-RF-003",
        "sourceOccurrenceOrdinal": 5
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0106",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "study-hub:pending",
        "action": "settle setup",
        "to": "outcome:player-navigation",
        "sourceClauseId": "SS-RF-005",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0107",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "study-hub:recoverable-error",
        "action": "recover then settle setup",
        "to": "outcome:player-navigation",
        "sourceClauseId": "SS-RF-005",
        "sourceOccurrenceOrdinal": 2
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0108",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "atlas-index:ready",
        "action": "filter",
        "to": "atlas-index:empty",
        "sourceClauseId": "SS-RF-006",
        "sourceOccurrenceOrdinal": 1
      },
      {
        "transitionAtomId": "SS-AUTH-TRANS-0109",
        "kind": "route-matrix",
        "machineId": "route-matrix",
        "from": "atlas-index:empty",
        "action": "clear filter",
        "to": "atlas-index:ready",
        "sourceClauseId": "SS-RF-006",
        "sourceOccurrenceOrdinal": 2
      }
    ],
    "machineBindings": [
      {
        "bindingId": "SS-BIND-01",
        "machineId": "immediate",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "bindingId": "SS-BIND-02",
        "machineId": "immediate",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "bindingId": "SS-BIND-03",
        "machineId": "hazard",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "bindingId": "SS-BIND-04",
        "machineId": "hazard",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "bindingId": "SS-BIND-05",
        "machineId": "simulation",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "bindingId": "SS-BIND-06",
        "machineId": "print",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "bindingId": "SS-BIND-07",
        "machineId": "offline-pack",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "bindingId": "SS-BIND-08",
        "machineId": "correction",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "bindingId": "SS-BIND-09",
        "machineId": "import-projection-reset",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-RF-019"
        ]
      },
      {
        "bindingId": "SS-BIND-10",
        "machineId": "reference",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "bindingId": "SS-BIND-11",
        "machineId": "reference",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "bindingId": "SS-BIND-12",
        "machineId": "reference",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "bindingId": "SS-BIND-13",
        "machineId": "reference",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      }
    ],
    "counts": {
      "routeOccurrenceCount": 36,
      "routeUniqueCount": 36,
      "directStateAtomCount": 162,
      "normalizedStateAtomCount": 42,
      "stateAtomOccurrenceCount": 204,
      "stateAtomUniqueCount": 204,
      "stateLabelUniqueCount": 95,
      "machineTransitionOccurrenceCount": 96,
      "machineTransitionUniqueCount": 95,
      "matrixTransitionOccurrenceCount": 13,
      "matrixTransitionUniqueCount": 13,
      "transitionOccurrenceCount": 109,
      "transitionUniqueCount": 108,
      "lensStateOccurrenceCount": 145,
      "lensStateUniqueCount": 135,
      "lensTransitionOccurrenceCount": 168,
      "lensTransitionUniqueCount": 166,
      "interruptionRowCount": 128,
      "capabilityRowCount": 96,
      "categoryRowCount": 56,
      "requirementCount": 978,
      "routeTransitionSurfaceRowCount": 36,
      "transitionBindingOccurrenceCount": 161,
      "transitionBindingUniqueCount": 161,
      "routeBindingCount": 36
    },
    "roots": {
      "routeIdsSha256": "2ac859959fad1e44e8a862e611e5f51c417f54c334990cdf1be63b587273fa06",
      "sourceClausesSha256": "16a6354d8191787c50a931b47789c9bbffe87430e55dea7852a98e726173433b",
      "stateAtomsSha256": "8c9083c0e01d3430ab67cff763896d197f6e13a5620279982508bdc7068216ac",
      "transitionAtomsSha256": "67f0c5852211902e331ce79207d868ec6f06461563e3ebaa0b28478d0e43f316",
      "machineBindingsSha256": "36838401aa2dde163ec53da4f8ef15ac982422418bff38644d75a4480d882316",
      "transitionBindingOccurrencesSha256": "6ebd913562d45a988006b54c92d1c63dbfb5b8dd2db17fb5abcd98d433b7d2f3",
      "routeBindingsSha256": "62392e67166f2c7ab5ef8e4f53b1a7dad38c2273d635c1bdbbf6c71b489b422a"
    },
    "normalizationRules": [
      "scope-preserving-no-cartesian-expansion",
      "exact-source-clause-plus-frozen-edge-expansion",
      "filter-search-compound-action-preserved",
      "flag-unflag-and-review-exit-split",
      "navigation-outcomes-not-legal-states",
      "settings-reset-rebuild-filtered-no-export-graph",
      "three-prose-implied-recovery-atoms-explicit",
      "route-transition-surfaces-bind-full-source-clauses",
      "transition-proofs-close-every-explicit-binding-occurrence"
    ],
    "authorityLimitations": [
      "simulation-print-member-state-allocation-not-source-specified",
      "settings-export-transition-graph-not-source-specified",
      "normalized-edge-actions-are-contract-owned-not-runtime-observations",
      "route-transition-surfaces-preserve-source-prose-without-inventing-unstated-edges"
    ],
    "transitionBindingOccurrences": [
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0001",
        "transitionAtomId": "SS-AUTH-TRANS-0001",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0002",
        "transitionAtomId": "SS-AUTH-TRANS-0001",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0003",
        "transitionAtomId": "SS-AUTH-TRANS-0001",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0004",
        "transitionAtomId": "SS-AUTH-TRANS-0001",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0005",
        "transitionAtomId": "SS-AUTH-TRANS-0002",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0006",
        "transitionAtomId": "SS-AUTH-TRANS-0002",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0007",
        "transitionAtomId": "SS-AUTH-TRANS-0002",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0008",
        "transitionAtomId": "SS-AUTH-TRANS-0002",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-01",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0009",
        "transitionAtomId": "SS-AUTH-TRANS-0003",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0010",
        "transitionAtomId": "SS-AUTH-TRANS-0003",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0011",
        "transitionAtomId": "SS-AUTH-TRANS-0003",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0012",
        "transitionAtomId": "SS-AUTH-TRANS-0003",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0013",
        "transitionAtomId": "SS-AUTH-TRANS-0004",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0014",
        "transitionAtomId": "SS-AUTH-TRANS-0004",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0015",
        "transitionAtomId": "SS-AUTH-TRANS-0004",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0016",
        "transitionAtomId": "SS-AUTH-TRANS-0004",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0017",
        "transitionAtomId": "SS-AUTH-TRANS-0005",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0018",
        "transitionAtomId": "SS-AUTH-TRANS-0005",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0019",
        "transitionAtomId": "SS-AUTH-TRANS-0005",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0020",
        "transitionAtomId": "SS-AUTH-TRANS-0005",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-02",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0021",
        "transitionAtomId": "SS-AUTH-TRANS-0006",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-03",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0022",
        "transitionAtomId": "SS-AUTH-TRANS-0006",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-03",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0023",
        "transitionAtomId": "SS-AUTH-TRANS-0006",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-03",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0024",
        "transitionAtomId": "SS-AUTH-TRANS-0006",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-03",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0025",
        "transitionAtomId": "SS-AUTH-TRANS-0007",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0026",
        "transitionAtomId": "SS-AUTH-TRANS-0007",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0027",
        "transitionAtomId": "SS-AUTH-TRANS-0007",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0028",
        "transitionAtomId": "SS-AUTH-TRANS-0007",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0029",
        "transitionAtomId": "SS-AUTH-TRANS-0008",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0030",
        "transitionAtomId": "SS-AUTH-TRANS-0008",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0031",
        "transitionAtomId": "SS-AUTH-TRANS-0008",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0032",
        "transitionAtomId": "SS-AUTH-TRANS-0008",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0033",
        "transitionAtomId": "SS-AUTH-TRANS-0009",
        "bindingId": "SS-BIND-10",
        "routeScope": [
          "scoring-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0034",
        "transitionAtomId": "SS-AUTH-TRANS-0009",
        "bindingId": "SS-BIND-11",
        "routeScope": [
          "actual-questions-explainer"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0035",
        "transitionAtomId": "SS-AUTH-TRANS-0009",
        "bindingId": "SS-BIND-12",
        "routeScope": [
          "about"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0036",
        "transitionAtomId": "SS-AUTH-TRANS-0009",
        "bindingId": "SS-BIND-13",
        "routeScope": [
          "nyc-disambiguation"
        ],
        "variant": "explicit-static-intersection",
        "sourceClauseIds": [
          "SS-M-REF-04",
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0037",
        "transitionAtomId": "SS-AUTH-TRANS-0010",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-01",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0038",
        "transitionAtomId": "SS-AUTH-TRANS-0010",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-01",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0039",
        "transitionAtomId": "SS-AUTH-TRANS-0011",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-02",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0040",
        "transitionAtomId": "SS-AUTH-TRANS-0011",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-02",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0041",
        "transitionAtomId": "SS-AUTH-TRANS-0012",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-03",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0042",
        "transitionAtomId": "SS-AUTH-TRANS-0012",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-03",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0043",
        "transitionAtomId": "SS-AUTH-TRANS-0013",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-04",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0044",
        "transitionAtomId": "SS-AUTH-TRANS-0013",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-04",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0045",
        "transitionAtomId": "SS-AUTH-TRANS-0014",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-05",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0046",
        "transitionAtomId": "SS-AUTH-TRANS-0014",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-05",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0047",
        "transitionAtomId": "SS-AUTH-TRANS-0015",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-06",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0048",
        "transitionAtomId": "SS-AUTH-TRANS-0015",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-06",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0049",
        "transitionAtomId": "SS-AUTH-TRANS-0016",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-06",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0050",
        "transitionAtomId": "SS-AUTH-TRANS-0016",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-06",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0051",
        "transitionAtomId": "SS-AUTH-TRANS-0017",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-07",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0052",
        "transitionAtomId": "SS-AUTH-TRANS-0017",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-07",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0053",
        "transitionAtomId": "SS-AUTH-TRANS-0018",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-08",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0054",
        "transitionAtomId": "SS-AUTH-TRANS-0018",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-08",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0055",
        "transitionAtomId": "SS-AUTH-TRANS-0019",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-08",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0056",
        "transitionAtomId": "SS-AUTH-TRANS-0019",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-08",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0057",
        "transitionAtomId": "SS-AUTH-TRANS-0020",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-09",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0058",
        "transitionAtomId": "SS-AUTH-TRANS-0020",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-09",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0059",
        "transitionAtomId": "SS-AUTH-TRANS-0021",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-10",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0060",
        "transitionAtomId": "SS-AUTH-TRANS-0021",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-10",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0061",
        "transitionAtomId": "SS-AUTH-TRANS-0022",
        "bindingId": "SS-BIND-01",
        "routeScope": [
          "question-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-Q-10",
          "SS-RF-011"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0062",
        "transitionAtomId": "SS-AUTH-TRANS-0022",
        "bindingId": "SS-BIND-02",
        "routeScope": [
          "review-player"
        ],
        "variant": "question-qualified",
        "sourceClauseIds": [
          "SS-M-Q-10",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0063",
        "transitionAtomId": "SS-AUTH-TRANS-0023",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-01",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0064",
        "transitionAtomId": "SS-AUTH-TRANS-0023",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-01",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0065",
        "transitionAtomId": "SS-AUTH-TRANS-0024",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-02",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0066",
        "transitionAtomId": "SS-AUTH-TRANS-0024",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-02",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0067",
        "transitionAtomId": "SS-AUTH-TRANS-0025",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-02",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0068",
        "transitionAtomId": "SS-AUTH-TRANS-0025",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-02",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0069",
        "transitionAtomId": "SS-AUTH-TRANS-0026",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-03",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0070",
        "transitionAtomId": "SS-AUTH-TRANS-0026",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-03",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0071",
        "transitionAtomId": "SS-AUTH-TRANS-0027",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-03",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0072",
        "transitionAtomId": "SS-AUTH-TRANS-0027",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-03",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0073",
        "transitionAtomId": "SS-AUTH-TRANS-0028",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-03",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0074",
        "transitionAtomId": "SS-AUTH-TRANS-0028",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-03",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0075",
        "transitionAtomId": "SS-AUTH-TRANS-0029",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-04",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0076",
        "transitionAtomId": "SS-AUTH-TRANS-0029",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-04",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0077",
        "transitionAtomId": "SS-AUTH-TRANS-0030",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-05",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0078",
        "transitionAtomId": "SS-AUTH-TRANS-0030",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-05",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0079",
        "transitionAtomId": "SS-AUTH-TRANS-0031",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-05",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0080",
        "transitionAtomId": "SS-AUTH-TRANS-0031",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-05",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0081",
        "transitionAtomId": "SS-AUTH-TRANS-0032",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-06",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0082",
        "transitionAtomId": "SS-AUTH-TRANS-0032",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-06",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0083",
        "transitionAtomId": "SS-AUTH-TRANS-0033",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-06",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0084",
        "transitionAtomId": "SS-AUTH-TRANS-0033",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-06",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0085",
        "transitionAtomId": "SS-AUTH-TRANS-0034",
        "bindingId": "SS-BIND-03",
        "routeScope": [
          "hazard-player"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-H-06",
          "SS-RF-012"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0086",
        "transitionAtomId": "SS-AUTH-TRANS-0034",
        "bindingId": "SS-BIND-04",
        "routeScope": [
          "review-player"
        ],
        "variant": "hazard-qualified",
        "sourceClauseIds": [
          "SS-M-H-06",
          "SS-RF-013"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0087",
        "transitionAtomId": "SS-AUTH-TRANS-0035",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-01",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0088",
        "transitionAtomId": "SS-AUTH-TRANS-0036",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-01",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0089",
        "transitionAtomId": "SS-AUTH-TRANS-0037",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-02",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0090",
        "transitionAtomId": "SS-AUTH-TRANS-0038",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-02",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0091",
        "transitionAtomId": "SS-AUTH-TRANS-0039",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-02",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0092",
        "transitionAtomId": "SS-AUTH-TRANS-0040",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-02",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0093",
        "transitionAtomId": "SS-AUTH-TRANS-0041",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-02",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0094",
        "transitionAtomId": "SS-AUTH-TRANS-0042",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-02",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0095",
        "transitionAtomId": "SS-AUTH-TRANS-0043",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-03",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0096",
        "transitionAtomId": "SS-AUTH-TRANS-0044",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-03",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0097",
        "transitionAtomId": "SS-AUTH-TRANS-0045",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-04",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0098",
        "transitionAtomId": "SS-AUTH-TRANS-0046",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-04",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0099",
        "transitionAtomId": "SS-AUTH-TRANS-0047",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-04",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0100",
        "transitionAtomId": "SS-AUTH-TRANS-0048",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-05",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0101",
        "transitionAtomId": "SS-AUTH-TRANS-0049",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-05",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0102",
        "transitionAtomId": "SS-AUTH-TRANS-0050",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-06",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0103",
        "transitionAtomId": "SS-AUTH-TRANS-0051",
        "bindingId": "SS-BIND-05",
        "routeScope": [
          "simulation-setup",
          "simulation-player",
          "simulation-results"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-SIM-06",
          "SS-RF-014"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0104",
        "transitionAtomId": "SS-AUTH-TRANS-0052",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-01",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0105",
        "transitionAtomId": "SS-AUTH-TRANS-0053",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-01",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0106",
        "transitionAtomId": "SS-AUTH-TRANS-0054",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-02",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0107",
        "transitionAtomId": "SS-AUTH-TRANS-0055",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-03",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0108",
        "transitionAtomId": "SS-AUTH-TRANS-0056",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-03",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0109",
        "transitionAtomId": "SS-AUTH-TRANS-0057",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-04",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0110",
        "transitionAtomId": "SS-AUTH-TRANS-0058",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-05",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0111",
        "transitionAtomId": "SS-AUTH-TRANS-0059",
        "bindingId": "SS-BIND-06",
        "routeScope": [
          "print-center",
          "print-preview"
        ],
        "variant": "family-scope-unallocated",
        "sourceClauseIds": [
          "SS-M-PRINT-05",
          "SS-RF-015"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0112",
        "transitionAtomId": "SS-AUTH-TRANS-0060",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-01",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0113",
        "transitionAtomId": "SS-AUTH-TRANS-0061",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-01",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0114",
        "transitionAtomId": "SS-AUTH-TRANS-0062",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-01",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0115",
        "transitionAtomId": "SS-AUTH-TRANS-0063",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-01",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0116",
        "transitionAtomId": "SS-AUTH-TRANS-0064",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-01",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0117",
        "transitionAtomId": "SS-AUTH-TRANS-0065",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-02",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0118",
        "transitionAtomId": "SS-AUTH-TRANS-0066",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-02",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0119",
        "transitionAtomId": "SS-AUTH-TRANS-0067",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-02",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0120",
        "transitionAtomId": "SS-AUTH-TRANS-0068",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-03",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0121",
        "transitionAtomId": "SS-AUTH-TRANS-0069",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-03",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0122",
        "transitionAtomId": "SS-AUTH-TRANS-0070",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-03",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0123",
        "transitionAtomId": "SS-AUTH-TRANS-0071",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-03",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0124",
        "transitionAtomId": "SS-AUTH-TRANS-0072",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-04",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0125",
        "transitionAtomId": "SS-AUTH-TRANS-0073",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-04",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0126",
        "transitionAtomId": "SS-AUTH-TRANS-0074",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-05",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0127",
        "transitionAtomId": "SS-AUTH-TRANS-0075",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-05",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0128",
        "transitionAtomId": "SS-AUTH-TRANS-0076",
        "bindingId": "SS-BIND-07",
        "routeScope": [
          "offline-packs"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-PACK-06",
          "SS-RF-020"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0129",
        "transitionAtomId": "SS-AUTH-TRANS-0077",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-01",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0130",
        "transitionAtomId": "SS-AUTH-TRANS-0078",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-01",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0131",
        "transitionAtomId": "SS-AUTH-TRANS-0079",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-01",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0132",
        "transitionAtomId": "SS-AUTH-TRANS-0080",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-01",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0133",
        "transitionAtomId": "SS-AUTH-TRANS-0081",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-02",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0134",
        "transitionAtomId": "SS-AUTH-TRANS-0082",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-03",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0135",
        "transitionAtomId": "SS-AUTH-TRANS-0083",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-04",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0136",
        "transitionAtomId": "SS-AUTH-TRANS-0084",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-04",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0137",
        "transitionAtomId": "SS-AUTH-TRANS-0085",
        "bindingId": "SS-BIND-08",
        "routeScope": [
          "correction-submit"
        ],
        "variant": "direct",
        "sourceClauseIds": [
          "SS-M-CORR-05",
          "SS-RF-018"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0138",
        "transitionAtomId": "SS-AUTH-TRANS-0086",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-01",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0139",
        "transitionAtomId": "SS-AUTH-TRANS-0087",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-01",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0140",
        "transitionAtomId": "SS-AUTH-TRANS-0088",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-01",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0141",
        "transitionAtomId": "SS-AUTH-TRANS-0089",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-01",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0142",
        "transitionAtomId": "SS-AUTH-TRANS-0090",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-02",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0143",
        "transitionAtomId": "SS-AUTH-TRANS-0091",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-02",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0144",
        "transitionAtomId": "SS-AUTH-TRANS-0092",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-03",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0145",
        "transitionAtomId": "SS-AUTH-TRANS-0093",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-03",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0146",
        "transitionAtomId": "SS-AUTH-TRANS-0094",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-03",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0147",
        "transitionAtomId": "SS-AUTH-TRANS-0095",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-04",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0148",
        "transitionAtomId": "SS-AUTH-TRANS-0096",
        "bindingId": "SS-BIND-09",
        "routeScope": [
          "settings"
        ],
        "variant": "import-direct-reset-rebuild-filtered",
        "sourceClauseIds": [
          "SS-M-DATA-04",
          "SS-RF-019"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0149",
        "transitionAtomId": "SS-AUTH-TRANS-0097",
        "bindingId": "SS-MATRIX-BIND-0097",
        "routeScope": [
          "exam-selector"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0150",
        "transitionAtomId": "SS-AUTH-TRANS-0098",
        "bindingId": "SS-MATRIX-BIND-0098",
        "routeScope": [
          "exam-selector"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0151",
        "transitionAtomId": "SS-AUTH-TRANS-0099",
        "bindingId": "SS-MATRIX-BIND-0099",
        "routeScope": [
          "exam-selector"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0152",
        "transitionAtomId": "SS-AUTH-TRANS-0100",
        "bindingId": "SS-MATRIX-BIND-0100",
        "routeScope": [
          "exam-selector"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0153",
        "transitionAtomId": "SS-AUTH-TRANS-0101",
        "bindingId": "SS-MATRIX-BIND-0101",
        "routeScope": [
          "exam-checker"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0154",
        "transitionAtomId": "SS-AUTH-TRANS-0102",
        "bindingId": "SS-MATRIX-BIND-0102",
        "routeScope": [
          "exam-checker"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0155",
        "transitionAtomId": "SS-AUTH-TRANS-0103",
        "bindingId": "SS-MATRIX-BIND-0103",
        "routeScope": [
          "exam-checker"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0156",
        "transitionAtomId": "SS-AUTH-TRANS-0104",
        "bindingId": "SS-MATRIX-BIND-0104",
        "routeScope": [
          "exam-checker"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0157",
        "transitionAtomId": "SS-AUTH-TRANS-0105",
        "bindingId": "SS-MATRIX-BIND-0105",
        "routeScope": [
          "exam-checker"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0158",
        "transitionAtomId": "SS-AUTH-TRANS-0106",
        "bindingId": "SS-MATRIX-BIND-0106",
        "routeScope": [
          "study-hub"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0159",
        "transitionAtomId": "SS-AUTH-TRANS-0107",
        "bindingId": "SS-MATRIX-BIND-0107",
        "routeScope": [
          "study-hub"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0160",
        "transitionAtomId": "SS-AUTH-TRANS-0108",
        "bindingId": "SS-MATRIX-BIND-0108",
        "routeScope": [
          "atlas-index"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      },
      {
        "transitionBindingOccurrenceId": "SS-AUTH-TRANS-BIND-0161",
        "transitionAtomId": "SS-AUTH-TRANS-0109",
        "bindingId": "SS-MATRIX-BIND-0109",
        "routeScope": [
          "atlas-index"
        ],
        "variant": "route-matrix-explicit",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      }
    ],
    "routeBindings": [
      {
        "routeBindingId": "SS-AUTH-ROUTE-0001",
        "routeId": "home",
        "sourceClauseIds": [
          "SS-RF-001"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0002",
        "routeId": "exam-selector",
        "sourceClauseIds": [
          "SS-RF-002"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0003",
        "routeId": "exam-checker",
        "sourceClauseIds": [
          "SS-RF-003"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0004",
        "routeId": "profile",
        "sourceClauseIds": [
          "SS-RF-004"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0005",
        "routeId": "study-hub",
        "sourceClauseIds": [
          "SS-RF-005"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0006",
        "routeId": "atlas-index",
        "sourceClauseIds": [
          "SS-RF-006"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0007",
        "routeId": "atlas-family",
        "sourceClauseIds": [
          "SS-RF-007"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0008",
        "routeId": "atlas-tool",
        "sourceClauseIds": [
          "SS-RF-008"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0009",
        "routeId": "procedures-index",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0010",
        "routeId": "procedure-detail",
        "sourceClauseIds": [
          "SS-RF-009"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0011",
        "routeId": "repair-lab",
        "sourceClauseIds": [
          "SS-RF-010"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0012",
        "routeId": "question-player",
        "sourceClauseIds": [
          "SS-RF-011"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0013",
        "routeId": "hazards-index",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0014",
        "routeId": "hazard-player",
        "sourceClauseIds": [
          "SS-RF-012"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0015",
        "routeId": "review-queue",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0016",
        "routeId": "review-player",
        "sourceClauseIds": [
          "SS-RF-013"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0017",
        "routeId": "simulation-setup",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0018",
        "routeId": "simulation-player",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0019",
        "routeId": "simulation-results",
        "sourceClauseIds": [
          "SS-RF-014"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0020",
        "routeId": "print-center",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0021",
        "routeId": "print-preview",
        "sourceClauseIds": [
          "SS-RF-015"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0022",
        "routeId": "faq",
        "sourceClauseIds": [
          "SS-RF-016"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0023",
        "routeId": "transparency-index",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0024",
        "routeId": "source",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0025",
        "routeId": "corrections",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0026",
        "routeId": "foil",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0027",
        "routeId": "security",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0028",
        "routeId": "privacy",
        "sourceClauseIds": [
          "SS-RF-017"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0029",
        "routeId": "correction-submit",
        "sourceClauseIds": [
          "SS-RF-018"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0030",
        "routeId": "settings",
        "sourceClauseIds": [
          "SS-RF-019"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0031",
        "routeId": "offline-packs",
        "sourceClauseIds": [
          "SS-RF-020"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0032",
        "routeId": "status",
        "sourceClauseIds": [
          "SS-RF-021"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0033",
        "routeId": "scoring-explainer",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0034",
        "routeId": "actual-questions-explainer",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0035",
        "routeId": "about",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      },
      {
        "routeBindingId": "SS-AUTH-ROUTE-0036",
        "routeId": "nyc-disambiguation",
        "sourceClauseIds": [
          "SS-STATIC-SPOKES"
        ]
      }
    ]
  }
}
```
<!-- PLAN008-JOURNEY-CONTRACT-END -->

## Atomic coverage and assertion rules

<!-- P008-CLAUSE P008-COV-001 interruptionRows=128 -->
<!-- P008-CLAUSE P008-COV-002 capabilityRows=96 -->
<!-- P008-CLAUSE P008-COV-003 categoryRows=56 -->
<!-- P008-CLAUSE P008-COV-004 applicability=contract-owned-all-required -->
<!-- P008-CLAUSE P008-COV-005 perRequirementAssertions=exactly-one -->
<!-- P008-CLAUSE P008-COV-006 assertionDigestReuse=prohibited -->
<!-- P008-CLAUSE P008-COV-007 failedCellDisposition=open-release-blocking-finding -->
<!-- P008-CLAUSE P008-COV-008 assertionProviders=contract-owned-result-manifests-or-first-pass-artifacts -->
<!-- P008-CLAUSE P008-COV-009 canonicalRouteRows=36 -->
<!-- P008-CLAUSE P008-COV-010 authorityStateAtoms=204 -->
<!-- P008-CLAUSE P008-COV-011 authorityTransitionOccurrences=109 -->
<!-- P008-CLAUSE P008-COV-012 journeyLensStateOccurrences=145 -->
<!-- P008-CLAUSE P008-COV-013 journeyLensTransitionOccurrences=168 -->
<!-- P008-CLAUSE P008-COV-014 totalRequirements=978 -->
<!-- P008-CLAUSE P008-COV-015 routeTransitionSurfaceRows=36 -->

The canonical universe comes from the exact bound `product/SCREEN_STATES.md`
bytes, not from the eight journey lenses. Its 21 matrix rows provide 32 route
IDs and its static-spoke clause provides four more. The authority projection
therefore exact-sets 36 unique route IDs, 204 ordered route/scope state atoms,
and 109 transition occurrences representing 108 unique normalized edges. The
state total contains 162 direct source atoms and 42 explicitly labeled
normalizations. Grouped simulation and print scopes are not expanded into
invented per-route state combinations. The exact raw source clauses remain
bound beside every frozen normalization.

The journey arrays remain critical lenses. They contain 145 state occurrences
(135 unique) and 168 transition occurrences (166 unique), including the
qualified J04/J06/J07/J08 recovery edges. They are additional trace
requirements, never the canonical state/transition universe. Derive the 36
route rows, 204 authority-state rows, 36 authority-route-transition-surface
rows, 109 authority-transition rows, 145 lens state rows, 168 lens transition
rows, and the complete journey cross-products with all 16 interruptions, all
12 capabilities, and all seven categories, in that order. This yields exactly
978 requirements. Every derived row is
applicable. Assign one stable source clause ID and one assertion ID using the
declared templates. A bundle cannot change applicability, insert `N/A`, omit or
duplicate a source/occurrence row, invent an authority atom, or cite a generic
run in place of the unique assertion.

Each assertion records its exact requirement ID, result, executable assertion
contract ID, contract-owned provider kind and ID, committed provider artifact
and result-entry digests, deterministic observation digest, source path, source
blob, and record digest. Authority route/state/transition, journey lens,
interruption, and most capability rows derive from exact machine-readable
automation manifests. Precommit answer
safety derives from the repository verifier. Category rows derive from the
immutable first-pass artifact of their owner lane. Assertion IDs, provider
entries, and observation digests are one-to-one with requirements and cannot be
reused. A generic run record or unconstrained hash cannot satisfy a cell.

Every failed applicable cell must point to exactly one matching finding whose
requirement ID and coverage-cell ID point back to that cell. The finding must
be open, release-blocking, assigned to the contract-owned lane, and force that
lane and consensus to `do-not-recommend`. A resolved, unrelated, missing, or
other-lane finding cannot discharge the failure.

## Integrated evidence procedure

### 1. Bind the immutable execution inputs

Create an execution manifest only after the dependency gate passes. Bind the
execution base; Step 2-4 commit, path, Git blob, and SHA-256 coordinates; this
plan and `plans/README.md`; maintained route/state inputs; exact prototype or
site artifact manifest; command contracts; journey-row digest; and zero-human
metadata. Serve only on `127.0.0.1` and reject every external request.

### 2. Run deterministic automation

Run the locked repository verifier and loopback Chromium, Firefox, and WebKit
matrix. Exercise semantic HTML, keyboard order and focus/status behavior, 320
and 1440 CSS-pixel layouts, forced colors, reduced motion, answer boundaries,
offline/degraded-network behavior, interruption and durable recovery, print and
large-print transformation, precommit safety, and zero external requests.

Each exact run writes canonical machine-readable result-manifest bytes. Commit
those bytes after the immutable execution base and before first-pass and final
seals. The run record binds the commit, safe path, SHA-256, Git blob, exact
assertion-result sequence, toolchain manifest, and execution base. Every result
entry binds one contract assertion and a source-present unique implementation
ID, implementation blob, structured observation kind/digest, and result. The
validator reads the committed bytes and derives bundle assertions from them; it
does not trust a submitted result hash. The external seal binds the ordered
result-manifest coordinate root.

Automation records technical outcomes only. It never establishes comprehension,
preference, behavior, or real-device accessibility.

### 3. Seal three independent Codex first passes

Run these lanes independently from the same manifest and automation roots:

1. `journey-recovery-semantics`
2. `accessibility-cognitive-load`
3. `consumer-trust-internal-wording-ai-slop`

Each lane receives a reproducible task contract, emits source coordinates and
structured findings without hidden reasoning, and retains native task and
first-pass receipt bytes with `peerOutputsVisible=false` before any peer output
is provided. Exact prompt/rubric/source/contract hashes, real native task IDs,
valid UTC intervals, immutable receipt paths/blobs, and Git ordering are
verified. Those retained bytes do not independently observe platform-internal
cross-output non-observability; this remains an explicit limitation. Later
consensus records agent IDs, exact finding hashes and sequences, lane outputs,
structured dissent positions/groups/matrix, and the shared coverage and
automation roots.

Each first-pass receipt names a safe artifact path, SHA-256, and Git blob in the
earlier immutable receipt-seal commit. The validator reads the canonical lane
artifact bytes from that commit. Category assertion results come only from the
owner lane artifact and must match its exact result entries; a bare digest is
insufficient.

### 4. Seal final evidence

Build one transitive final evidence record over the manifest, first-pass
receipts, environments, automation, per-requirement assertions, coverage,
findings by lane, lane outputs, dissent groups and positions, consensus, exact
record counts, and dependency/source coordinates. Hash that record, then emit
the externally publishable final evidence root. Any semantic mutation remains
invalid even when every descendant digest and the final root are coherently
recomputed.

## Claim and privacy boundary

Every string leaf and object key in a real bundle is validated. Reject release,
deployment, selected-design, final-approval, nonzero person/session, observed
human behavior, real-device or emitted assistive-technology claims, and any
claim that agents, personas, or automation replace people. Reject contact data,
personal identifiers, non-loopback network addresses, user/home paths, precise
location data, and bidirectional or zero-width control characters. Validation
errors identify only the structural path and rule; they never echo a rejected
value.

The Git-safe bundle contains no raw prompts with secrets, hidden reasoning,
transcripts, free-form notes, contact details, or device-owner data. It retains
only reproducible task contracts, structured results, stable source coordinates,
and cryptographic digests.

## Exit criteria

Plan 008 can leave BLOCKED only when all of the following are true:

<!-- P008-CLAUSE P008-EXIT-001 allRequirementResults=passed -->
<!-- P008-CLAUSE P008-EXIT-002 openBlockingFindingCount=0 -->
<!-- P008-CLAUSE P008-EXIT-003 laneAndConsensusRecommendation=agent-only-recommend -->
<!-- P008-CLAUSE P008-EXIT-004 failedBundlePlanStatus=BLOCKED -->

- exact accepted CODEX-only Step 2-4 dependency coordinates are on the immutable execution base;
- the real evidence mode validates nonempty records and the complete exact requirement set;
- every requirement, assertion, and coverage cell passes;
- findings and `consensus.openBlockingFindingIds` are empty;
- all three lane recommendations, every dissent position, and consensus are `agent-only-recommend`, with no dissent groups;
- first-pass receipt bytes and Git order satisfy the exact retained
  orchestration contract, with cross-output non-observability still stated as
  an independently unverified limitation;
- the transitive final evidence root verifies after a cold rerun;
- permanent zero-human and `notHumanUsabilityTested=true` metadata remain unchanged;
- locked repository and browser verification pass; and
- no production source, deployment, or later migration is changed by this plan.

A valid evidence root may support a nonbinding agent-only release
recommendation. It never changes the permanent evidence label and never acts as
production authorization. If any criterion fails, keep Plan 008 BLOCKED and
publish the exact technical blocker on its draft PR.

A structurally valid failed bundle with exact reciprocal blocker findings is
valid failure evidence only. It always keeps Plan 008 BLOCKED and cannot satisfy
the exit criteria or support an agent-only release recommendation.

## Current prework stop

Steps 3 and 4 are still pending. Therefore this branch may update only the
portable provisional packet, this canonical contract, the plan index, and
objective current-site baseline evidence. It must not create final evidence,
select a design, change Plan 008 status, run a migration, deploy, or mark its
draft PR ready.
