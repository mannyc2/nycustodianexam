# Plan 008 integrated validation provisional prework

---
status: provisional-prework
participantEvidence: none
decisionStatus: pending
requiredDependencyShas: null
mustRebaseAndReverify: true
---

Prepared on 2026-08-28 against `origin/main` at
`9fc7dcacfc961752e5d9a2cedbc426deead54a05`. Plan 008 remains `BLOCKED`.
This packet is protocol, schema, and current-site baseline prework only. It does
not start or complete a Plan 008 step and cannot approve an operation, artifact,
design, component system, prototype, finding, canonical promotion, or final
direction.

Participant count, session count, and participant-derived observation count are
all exactly zero. No person has been recruited, contacted, screened, scheduled,
consented, exposed, observed, compensated, or recorded through this packet.
Automation, agents, personas, role-play, expert review, and current-site tests
cannot substitute for an adult volunteer.

The schema authority for this packet is
`plans/008-integrated-validation-schema-contract.json`. The fail-closed checker
is `plans/validate-008-integrated-validation-prework.mjs`. Both carry the same
five provisional metadata values as this document.

## Status and boundary

This packet distinguishes five kinds of material:

1. Maintained product contracts describe intended behavior.
2. Recovered or draft Plan 004/005 artifacts are unaccepted evidence and
   hypotheses.
3. Current-site automation can provide non-participant runtime baseline
   evidence only.
4. Future private records may contain coded observations from real adult
   volunteers only after the dependencies and approvals exist.
5. Future owner-authored approvals and decisions must use the real Plan 008
   workflow; this branch and draft PR are not that approval channel.

The eight recovered `CL-1` files under
`recovery/plan-004-consumer-language-prototypes/` are preserved unpiloted,
unfrozen working evidence. They must not be served to volunteers, used as an
accepted language direction, or placed into a dependency slot.

The provisional protocol is zero budget:

- adults only;
- voluntary and unpaid;
- no payment, gift, reimbursement, benefit, or priority access;
- no audio, video, screen, keystroke, screen-reader-speech, photograph, or
  automated-transcript recording;
- no analytics or participant telemetry;
- no public participant-level data; and
- no secure, remembered, recalled, purchased, or reconstructed exam content.

Recruitment, outreach, private retention, and exact artifact exposure would
still require explicit future authorization. Proposing unpaid/no-recording
operation settings is not an approval or denial.

## Dependency slots

All dependency SHA values are `null`, all acceptance states are `unaccepted`,
and `requiredDependencyShas` must remain `null` in this provisional packet.

| Slot | Required future accepted input | Current value |
|---|---|---|
| Plan 004 | DONE-transition SHA, accepted consumer-language contract and synthesis | `null` |
| Plan 005 | DONE-transition SHA, accepted learner-task navigation artifact and route contract | `null` |
| Plan 006 | DONE-transition SHA, accepted consumer visual system and route archetypes | `null` |
| Plan 007 | DONE-transition SHA, accepted component/foundation and responsive contract | `null` |

A future operational packet must derive each DONE-transition SHA mechanically,
prove each accepted head is an ancestor of its new execution base, hash the
accepted artifacts, and map each decision to the eight journeys and their legal
states. This document must be rebased and reverified first; it cannot be edited
in place to declare the dependencies accepted.

## Research questions and non-questions

Future real-volunteer questions, if separately released, are:

1. Can a first-time adult explain the product, audience, unofficial status, and
   first useful action?
2. Can the person find an applicable profile and begin the shortest currently
   supported appropriate study activity?
3. Do commitment, persistence, feedback, sources, review, offline availability,
   export, import, removal, and reset consequences match expectations?
4. Can the person recover after network loss, durable-write failure, reload,
   Back/Forward, stale or missing content, a second-tab change, and an input
   mistake without losing work or seeing an answer early?
5. Are all eight journeys usable at constrained and ample widths with keyboard,
   text enlargement, and the person's own access strategy where practical?
6. Do visual and nonvisual hazard paths communicate their different constructs,
   outcomes, and recovery actions clearly?
7. Is relevant printed material understandable, separated correctly, and
   truthful about original practice and sources?

This prework does not:

- choose language, navigation, visual, component, or responsive direction;
- research or change exam facts, official scoring, weights, or item counts;
- collect or reconstruct examination material;
- establish population prevalence or statistical significance;
- certify WCAG conformance, devices, browsers, assistive technologies, or print;
- treat automation, screenshots, agents, or simulated users as comprehension
  evidence; or
- authorize production migration or Plan 008 status changes.

## Adult-volunteer protocol

The future proposed method is two moderated rounds of 6–8 completed primary
adult volunteers. It remains pending and cannot begin from this packet.

Eligibility:

- confirm 18 or older without collecting birth date or exact age;
- actually be preparing for, recently prepared for, or reasonably resemble the
  intended entry-level civil-service/custodial study audience;
- be able to evaluate the English launch experience without being told a
  reviewed translation exists;
- accept voluntary unpaid participation and the no-recording method; and
- agree to use only fictional scenarios and not disclose secure or remembered
  examination content.

Friends role-playing candidates, project staff acting as test users, experts,
agents, generated or synthetic personas, bots, automation, and internal review
do not qualify. A support professional may later participate only in a
separately accounted secondary interview and never substitutes for a primary
learner.

Across both future rounds, recruitment should deliberately include phone-first,
lower-digital-confidence, intermittent/low-bandwidth, limited-English, and
relevant-access-strategy contexts. Round two must include at least two people
who actually use a relevant access strategy. Coverage characteristics may
overlap, may be declined, and cannot be inferred.

Offer the person's own device and familiar assistive technology when practical.
Do not request diagnosis or proof. Do not recruit from a relationship where
declining could reasonably affect work, benefits, grades, public services, or
site access.

Before a future session can begin, the exact approved protocol version,
artifact manifest and commit, access method, private storage root, access list,
retention deadline, withdrawal route, and deletion deadline must all be
present. A blank field stops the session.

## Privacy-minimal screener

Use controlled answers only. Scheduling contact, if later approved, belongs in
a separate ephemeral roster and never enters research, environment, observation,
aggregate, or Git data.

| Field | Allowed values | Purpose |
|---|---|---|
| `adult_confirmation` | `yes`, `no` | Adult gate without birth date |
| `audience_fit` | `preparing`, `recently-prepared`, `resembles-audience`, `support-user`, `none`, `not-stated` | Primary/secondary classification without proof |
| `phone_first` | `yes`, `no`, `not-stated` | Coverage planning |
| `digital_confidence` | `lower`, `mixed`, `higher`, `not-stated` | Coverage planning |
| `connectivity_context` | `stable`, `intermittent`, `limited`, `not-stated` | Coverage planning |
| `english_launch_fit` | `can-evaluate`, `cannot-evaluate`, `not-stated` | English launch only |
| `english_context` | `english-is-easiest`, `another-language-is-easier`, `not-stated` | Limited-English coverage planning without collecting a language or proficiency score |
| `session_access_strategy` | `none`, `keyboard`, `zoom-text`, `screen-reader`, `voice-input`, `switch-or-motor`, `other-declared`, `not-stated` | Strategy, never diagnosis |
| `own_setup_preference` | `own-device`, `provided-device`, `either`, `not-stated` | Environment planning |
| `accepts_unpaid_session` | `yes`, `no` | Zero-budget gate |
| `accepts_no_recording` | `yes`, `no` | Method gate |
| `agrees_no_secure_content` | `yes`, `no` | Exam-security gate |

A `no` response to the adult, unpaid, no-recording, or security gates excludes
the person. `not-stated` never becomes `no`, `none`, or a represented coverage
characteristic.

Never request or retain a name, postal address, email, phone number, employer,
exact location, diagnosis, applicant ID, admission notice, exam proof, official
document, remembered question, answer choice, drawing, answer, key, or
review-session detail in study data.

## Consent script

Read verbatim only after the future operation and artifact gates are satisfied:

> This is voluntary research for a free, independent, unofficial study site.
> You must be 18 or older. The session is unpaid: there is no payment, gift,
> reimbursement, exam benefit, employment benefit, or effect on your access to
> the site. We are testing the site, not you.
>
> We will not record audio, video, your screen, photographs, keystrokes, browser
> history, screen-reader speech, or an automated transcript. A moderator and
> note-taker may enter only controlled observation codes and brief
> non-identifying notes in the approved private study location. Nothing is sent
> to site analytics, and participant-level records are never placed in Git.
>
> Please use only the fictional scenarios we provide. Do not share an applicant
> ID, admission notice, employer information, diagnosis, or any real or
> remembered exam question, answer choice, drawing, answer, or review-session
> detail.
>
> You may skip a question, pause, take a break, or stop at any time without
> giving a reason or losing anything. Using your withdrawal token, you may ask
> for deletion through **[approved deadline]**. The data location, people with
> access, retention date, and deletion date are **[read from the approved
> session sheet]**. If any field is blank, we will not begin.
>
> Do you confirm that you are 18 or older, understand that this is unpaid and
> not recorded, and voluntarily agree to participate?

Record only `completed` or `declined`, UTC time, opaque study ID, protocol
version, and moderator/note-taker attestations in the approved private location.
No signature, consent record, or contact information goes in Git.

## Withdrawal and deletion scripts

Give a future volunteer a random withdrawal token stored separately from
contact details.

During-session withdrawal:

> We will stop now. You do not need to explain why. No recording exists. Would
> you like us to delete the coded information from this session? If you do not
> choose, we will default to deletion.

Deletion request:

> I matched your withdrawal token. We will delete the private consent/session,
> observation, context, environment, and temporary-note records, remove any
> remaining scheduling contact, recompute affected aggregates and pattern
> counts, and rerun validation. We will confirm when that is complete. No
> recording existed, and participant-level rows were never committed to Git.

Deletion confirmation:

> Deletion for withdrawal token **[suffix only]** completed on **[UTC date]**.
> Affected aggregates were recomputed and validated. No participant row,
> recording, transcript, screenshot, contact detail, or secure exam content
> remains.

Proposed retention, still pending future approval:

- delete scheduling contact immediately after attendance/cancellation handling;
- delete free-form temporary notes the same day after controlled coding;
- delete participant-level matrices after aggregate verification and no later
  than 30 calendar days after the session, whichever is earlier; and
- retain only de-identified aggregates, integrity hashes, and non-participant
  artifact coordinates.

If individual deletion cannot be guaranteed after an aggregation deadline,
state the exact deadline before consent. Never promise deletion that cannot be
performed.

## Moderator guide

Pre-session fail-closed checklist:

- exact released protocol, dependency, artifact, access, and retention
  coordinates are populated and verified;
- adult eligibility and accessible consent are ready;
- recording, automated transcription, analytics, and telemetry are off;
- private storage root, access list, retention date, and deletion date exist;
- fictional tasks and exact environment record are ready;
- the person's preferred access strategy and break/accommodation choices are
  confirmed without requesting a diagnosis;
- no recovered editable `CL-1` file is served; and
- any missing field stops the session.

Neutral prompts:

- “Please show me how you would…”
- “What would you expect to happen next?”
- “What tells you that?”
- “What would you do if this failed?”
- “Please explain that in your own words.”
- “You can continue however you normally would.”

Do not name the expected destination, teach labels before observation, praise or
correct choices, force thinking aloud, solve a product access barrier, or count
moderator assistance as independent completion. Record assistance as a
controlled code.

The moderator reads consent/tasks, introduces only authorized interruptions,
and protects privacy/security. The note-taker records controlled codes, focus,
announcements, and recovery without transcribing protected content. If one
person fills both roles, record the limitation; do not lower the evidence gate.

## Interruption guide

Secure-content interruption:

> Please stop there. We cannot collect or discuss any real or remembered exam
> question, answer choice, drawing, answer, admission notice, or review-session
> detail. I will not write that content down. We will return to the fictional
> scenario.

Record only `security-interruption=interrupted-excluded`. Delete accidentally
typed protected material immediately without copying it elsewhere. Continue
only if the discussion can remain fictional; otherwise end safely.

Personal-data interruption:

> Please stop and use the fictional details instead. I will not record that
> personal information.

Access, discomfort, or withdrawal:

> We can pause, change the setup, skip this task, or stop. You do not need to
> continue to help the study.

Prototype/correctness confounder:

> The test artifact appears to have failed. This is a problem with the artifact,
> not your task. I will record it separately and either restore the same
> scenario or move on.

Deliberate connection/interruption introduction:

> I am going to change only this test environment to simulate an interruption.
> It will not change your other apps or personal data. You may ask me to stop at
> any time. Please continue as you normally would.

Any precommit answer leak, false saved/reveal claim, loss-of-work implication,
official-affiliation misunderstanding, destructive-action misunderstanding,
unrecoverable error, or access-strategy blocker is critical after one real
occurrence. It cannot be waived by sample size.

## Recovery journey guide

Every future journey card uses a fictional scenario, neutral prompt, legal
starting state, interruption, expected recovery, measures, critical failures,
and exact environment record.

| Task ID | Route/state path | Required recovery evidence |
|---|---|---|
| `orientation` | Home `ready` or truthful `offline-stale` | Purpose, audience, unofficial status, first action; cached page remains useful |
| `profile-fit` | selector/checker/profile through `ready`, `empty`, `validating`, `no-match`, `ambiguous`, `match`, `offline-stale` | Input retained; no silent selection; clear retry/profile/pack path |
| `begin-study` | Study `ready/empty/offline-stale` → setup `pending/error` → player `restoring/ready` | Shortest supported activity only; durable session before navigation; missing closure blocks start truthfully |
| `question-feedback` | `restoring → ready → selected → committing → answered-revealed → reviewed/completed` | Write failure returns editable choice, focuses error, reveals nothing; retry/reconcile is idempotent; reload/Back/second-tab agree with durable truth |
| `tool-comparison` | Atlas `ready/empty` → family/tool `ready/offline-stale/withdrawn` | Text/nonvisual comparison survives optional media failure; filters and parent recovery remain clear |
| `hazard-practice` | `ready ↔ marking → confirm-zero/committing → answered-revealed → reviewed/completed` | Undo input, explicit pan/zoom/non-drag path, preserved neutral marks after failure, no target leak, miss/false-positive comprehension |
| `review` | queue `loading/ready/empty/error`, rebuild, question/hazard review | Understand due reason; missing object quarantined; explicit acknowledgement required; opening/scrolling is not review completion |
| `offline-data-control` | pack lifecycle plus export/import/reset preview and commit | Paused download, failed update retains valid pack, pinned removal block, exact destructive scope, no write before confirmation |

Cross-cutting interruption set:

- reload, Back, Forward, safe exit/resume, and second-tab invalidation;
- online to offline and degraded-network transitions;
- durable write failure, quota limitation, blocked database upgrade, and unknown
  completion requiring same-ID reconciliation;
- stale pack, missing object, withdrawn content, and unavailable source;
- focus to error summary, outcome, next heading, or restored dialog trigger;
- concise non-answer-bearing save/offline/error announcements;
- no duplicate attempt, review, session, draft, reset, or pack activation; and
- optional print comprehension where relevant, with question/key and
  blank/annotated hazard products separated.

## Environment accounting

Future exact environment rows remain private and link to an opaque study/task ID.
Record only what is necessary to interpret the task:

- device class and own/provided status;
- OS family and observed version or `unknown`;
- browser family and observed version or `unknown`;
- CSS viewport dimensions and orientation;
- primary input method;
- declared session access strategy;
- assistive technology name/version or `none|unknown`;
- browser zoom or text enlargement;
- network condition and whether self-reported or moderator-controlled; and
- print condition where applicable.

Never store serial number, IP address, precise location, account name,
advertising ID, diagnosis, extensions, browser fingerprint, unrelated device
data, or a rare characteristic linked to a quotation in committed aggregates.

Required future manual coverage remains NVDA with Firefox on Windows; VoiceOver
with Safari on macOS and iOS; TalkBack with Chrome on Android; JAWS smoke when
licensed; true 400% zoom in Chrome, Firefox, and Safari; physical US Letter and
A4 normal/large print; and grayscale inspection. Missing hardware remains an
explicit gap, never an inferred pass.

## Aggregate schemas and codebooks

The JSON contract contains the machine-readable codebooks and empty fixture.
All participant-level schemas are future private-only interfaces. No current row
exists.

Locked task IDs are exactly the eight in the journey table. Controlled domains:

- completion: `complete | partial | failed`;
- first action: `expected-primary | expected-secondary |
  wrong-study-destination | utility-trust-detour | no-action`;
- comprehension: `accurate | partial | incorrect | not-applicable`;
- access blocker: `none | resolved | unresolved`;
- access strategy: `none | keyboard | zoom-text | screen-reader | voice-input |
  switch-or-motor | other-declared`;
- severity: `critical | high | medium | low`; and
- retest: `not-applicable | resolved | persists | inconclusive`.

The committed pending fixture contains empty arrays for participants,
environments, observations, issues, withdrawals/deletions, and all approval
types. Every participant-derived count is zero. Automated baseline test counts
may be nonzero only in separately typed `non-participant-automation` records
whose participant contribution remains zero.

The provisional aggregate interface defines round summaries, task-specific
numerators and denominators, context coverage, pattern/retest summaries, and
SHA-256 evidence bindings. It forbids participant IDs and participant rows,
requires every numerator to be no greater than its matching denominator,
excludes automation from every participant denominator, keeps a one-person
critical occurrence blocking, and requires recomputation after withdrawal.
The pending fixture carries no evidence hash: all three matrix hashes and the
verification time are `null`.

Known schema decisions that the future operational contract must resolve before
it can accept a row:

- how to represent declined/not-stated context without silently converting it;
- multiple access strategies rather than one lossy value;
- time to meaningful start;
- wrong-turn and recovery path;
- hesitation labels and trust rating/reason; and
- exact per-task environment coordinates.

The provisional validator intentionally rejects all participant rows, even a
plausible real-looking row. Real evidence requires a successor operational
contract with private-record and live-approval verification.

## Current-site automated baseline

Automation here is current-site, non-participant baseline evidence. It cannot
validate an unaccepted integrated direction, comprehension, emitted assistive-
technology output, or any Plan 008 human/decision gate.

| Area | Feasible current-site check | Cannot prove |
|---|---|---|
| Accessibility | Axe A/AA rules, semantics, accessible names | WCAG certification or emitted speech |
| Keyboard/focus | selection/submit, error/outcome focus, live-region DOM mutation | screen-reader navigation quality |
| Responsive | 320 CSS-pixel overflow/target checks in question and hazard fixtures | true 400% zoom, complete route-family reflow, real mobile behavior |
| Offline | Chromium service-worker lifecycle and cross-browser IndexedDB behavior | Firefox/WebKit service-worker behavior or field connectivity |
| Persistence/recovery | injected write failure, reload, blocked upgrade, import/quarantine, pack lifecycle | real quota exhaustion, eviction, and every multi-tab/disposal race |
| Print | print media, deterministic packets, separation, page-break rules | physical Letter/A4, grayscale, clipping, pagination, Save as PDF |
| Color/motion | forced-colors and reduced-motion mechanics | every personal configuration |
| Security | current precommit DOM/closure checks | a future accepted integrated artifact |

Automated baseline run ledger:

| Evidence ID | Source SHA | Command | Result | Participant contribution |
|---|---|---|---|---:|
| `BASE-AUTOMATED-001` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | exact Bun 1.4.0 `bun run verify` | passed: 352 unit tests plus layout/type/build/artifact gates | 0 |
| `BASE-AUTOMATED-002` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | isolated `127.0.0.1:4175`, CI-mode `bun run test:browser` | passed: 172; intentional project skips: 26 | 0 |

Both rows were recorded at `2026-08-28T16:32:15Z`. The browser matrix used
Playwright 1.62.1 with Chromium 151.0.7922.34, Firefox 153.0, and WebKit 26.5 on
Ubuntu 24.04.3 / Linux 6.8.0-101-generic x86_64. The JSON contract preserves the
exact commands and limitations.

An earlier non-CI attempt was discarded because port 4173 was already owned by
an unrelated worktree preview and Playwright's local setting reused that server.
Its failure was not evidence about this worktree. The counted run used this
worktree's build on isolated port 4175, the CI cap of two workers, and exited 0.
Configured or historical coverage is never presented as a new execution result.

## Future loopback harness interface

Interface only: no integrated prototype or harness exists.

The future harness refuses to start until all four dependency slots and exact
owner approvals are populated in a successor contract. It accepts:

- the new immutable execution base and accepted dependency map;
- exactly eight task IDs and declared legal state IDs;
- fictional/public-precommit-safe data;
- an approved public-safe asset allowlist; and
- exact manifest/version/hash/commit and approved access boundary.

Required controls, kept outside participant UI, are task reset; online/offline;
degraded network; persistence available/write-failure/quota/unknown-completion;
content current/stale/missing/withdrawn; reload; Back/Forward; second-tab
invalidation; and print mode.

The future server is loopback-only on `127.0.0.1`, uses an ephemeral port and an
exact file allowlist, permits no external requests, and writes screenshots,
traces, and dumps only beneath a fresh SHA-scoped `/tmp` directory. It does not
import production controllers or storage, implement analytics, log participant
behavior, select a design, or emulate a volunteer.

Verification must cover semantic DOM, keyboard, focus, announcements, targets,
320/1440 reflow, large text, real 400% pilot zoom, forced colors, reduced
motion, print, visual/nonvisual hazard behavior, durable recovery, answer
boundaries, asset/hash closure, and zero external requests. Every automated
result remains `current-site-baseline-only` or future
`integrated-artifact-non-participant-baseline`, with participant contribution
zero.

## Decision rules and remaining gates

This packet's only valid structured state is provisional prework, participant
evidence none, decision pending, dependency SHAs null, and mandatory rebase/
reverification true.

The validator rejects:

- accepted, approved, complete, or DONE structured states;
- any participant/session/context/environment/observation/issue row;
- any nonzero participant-derived count;
- any approval record, approver identity, body hash, or plausible PR comment
  reference;
- any dependency SHA or accepted dependency state;
- any selected design, built/accepted integrated prototype, or promotion;
- agent, AI/LLM, automation, bot, persona, role-play, staff proxy, or expert
  review as a volunteer source; and
- automated baseline evidence that contributes to participant counts or claims
  human validation.

Future release checklist:

1. Plans 004–007 genuinely become DONE and merge.
2. Fetch and rebase on the then-current `origin/main`.
3. Derive and verify every dependency DONE-transition and accepted-head SHA.
4. Resolve the private schema gaps and create a separately versioned operational
   contract.
5. Create the real Plan 008 execution branch and early draft PR.
6. Obtain owner-authored operation approvals.
7. Build, verify, hash, and obtain approval for the exact integrated artifact.
8. Run two rounds of 6–8 real adult volunteers with required contexts.
9. Resolve and retest every critical issue.
10. Obtain the final decision-owner acceptance.
11. Promote accepted conclusions once to their canonical homes.
12. Only then change Plan 008 status.

Until every applicable gate passes, the result remains provisional prework only.

## Validation commands

Use exact Bun 1.4.0 and Node 22.22.0 where repository commands require them.

```sh
node plans/validate-008-integrated-validation-prework.mjs
node plans/validate-008-integrated-validation-prework.mjs --self-test
bun run check:toolchain
bun run verify
bun run test:browser
git diff --check
```

The validator uses Node built-ins and performs in-memory adversarial mutations.
It creates no fake participant row, approval, session, or evidence artifact on
disk.
