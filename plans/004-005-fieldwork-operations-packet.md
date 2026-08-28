# Plans 004/005 unified fieldwork operations packet

**Status:** complete operations protocol; fieldwork execution blocked. **No
outreach, pilot, participant exposure, or product decision is authorized by
this record alone.** Step 1 has not been released by the coordinator, material
fieldwork resources are absent, and the preserved Plan 004/005 execution
artifacts need the preflight repairs below.

This packet reconciles the consumer-language protocol in Plan 004 with the
learner-task/navigation protocol in Plan 005. It is an execution overlay, not a
replacement for either reviewed plan and not participant evidence. Exam truth
and scope remain controlled by `docs/`; product behavior and implementation
constraints remain controlled by `product/`. A conflict with those authorities
is a stop, not a research hypothesis.

## 1. Immutable coordinates and truthful starting state

Observed 2026-08-28:

| Coordinate | Value |
|---|---|
| Planning coordinate | `e6f911901f7f18f6716204309fee8b103419a5e0` |
| Current remote `main` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| Merged preservation/status PR | [#40](https://github.com/mannyc2/nycustodianexam/pull/40) |
| This preparation branch | `codex/uiux-orchestration-02-fieldwork` |
| Plan 004 draft PR/head | [#37](https://github.com/mannyc2/nycustodianexam/pull/37), `fecc71c5ea240385b3d98f896b1152022a2bbbe8` |
| Plan 005 draft PR/head | [#38](https://github.com/mannyc2/nycustodianexam/pull/38), `9daddbfde073f1f73d806a68dac427b69efc8359` |
| Decision owner recorded by both charters | `mannyc2` |

PR #40 merged while this packet was being verified. Its immutable merge commit
preserves the eight Plan 004 drafts and corrects the 004/005 status accounting.
This checkout began at its parent `e84f28e34549688bea6fab4c7fc574f812d72f46`.
No coordinator release message was available when this packet was prepared, so
the merge is recorded as strong gate evidence but not treated as the required
coordinator release of Step 1.

The user's approval authorizes in-scope repository work, research operations,
branches, pushes, PRs, and verification. It does not create a participant pool,
a way to contact that pool, money or a payment rail, a private research-data
system, research devices, or a prototype exposure endpoint. It also does not
turn executor prose into the structured approval comments required by the
existing retained verifiers.

### Evidence and sample accounting

| Workstream | Preserved work | Human evidence | Decision state |
|---|---|---|---|
| Plan 004 | 526-document/27-route baseline; 120 copy families; 79 proposed rewrite families; 24 keep; 9 move to details; 5 internal only; 2 content re-review; 1 support relocation; 847 dynamic-message anchors; 13 dated benchmark records; eight editable `CL-1` prototype files | Pilot `n=0`; R1 `n=0`; R2 `n=0`; observations `n=0`; issue rows `n=0` | No direction selected; `product/CONTENT_DESIGN.md` correctly absent |
| Plan 005 | 21 destination families; 32 unique core route IDs; four acquisition spokes; 21 learner-task statements | Open sort `n=0`; threshold pilot `n=0`; tree test `n=0`; first-click R1 `n=0`; first-click R2 `n=0`; access-strategy participants `n=0` | No candidates, thresholds, locks, selected model, or product-contract promotion |

The eight Plan 004 working files observed in the unapproved, ephemeral scratch
root `/tmp/nycustodian-content-004.VLmjKt/prototypes/` are now durably preserved
byte-for-byte under
`recovery/plan-004-consumer-language-prototypes/prototypes/` by PR #40. Their
observed raw-byte SHA-256 values are:

| Prototype | SHA-256 |
|---|---|
| `hazard-feedback.html` | `c9441b28584f1453b8afe982f61c906a9d5f98e352fcc886b1e135e64b3e495b` |
| `home.html` | `05df1d5bdc797137d0b35e0a30eaf1b2781351e542b0b4d7a2c68da42d8231b2` |
| `offline-data.html` | `0eede6bbc7d6c7f2a2b1434eb7f2ad1fa3929c0ecf3bc9fe823151a558d42a8f` |
| `practice-start.html` | `cfe277890d2c6ef9490c74055c6ba94a5921a0a6c465aaf34b3b960a07a4e06e` |
| `profile.html` | `e672f50871d80572cdc2e6f13e3fe85e04a8c5ac186f0228093ce85e8fd79ca6` |
| `question-feedback.html` | `10336e7ce3d85b587b0eea5f8e8eb6d717e1a595775e11256201f62b45c676db` |
| `review.html` | `207ff61103d67bdd5dd5be8d4ef154cb804aa767f2583ea57698525f664c2c67` |
| `trust-recovery.html` | `36f1cec7646ccddf7e5cd525b88517cf7372cfc5eb187beae7332bac4eafa2f4` |

The complete preserved set digest is
`f1ef0a2dec44ae04c8c2b3e8f94fe9e59b3c38a54d3310ae50b4b7dde10ecf14`.
These hashes identify reusable draft inputs, not approved exposure artifacts.
At observation, both snapshot directories were empty and writable and no
prototype manifest existed. `/tmp` is not approved participant-data storage.

## 2. Hard go/no-go ledger

Every row must be `READY` before the first recruitment contact. A later phase
must also satisfy its artifact-specific row before exposure.

| Gate | Current state | Required evidence |
|---|---|---|
| Step 1 preservation/status commit | `MERGED` | PR #40 / `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| Coordinator Step 1 release | `WAITING` | Coordinator message naming that landed immutable `main` SHA |
| Plan 004 preservation | `RECOVERY LANDED; RESEARCH DRAFT` | PR #40 recovery plus #37 findings, with zero samples and pending decision unchanged |
| Plan 005 preservation | `STATUS LANDED; RESEARCH DRAFT` | PR #40 status plus #38 inventory, without promoting hypotheses |
| Plan 004 artifact safety | `FAIL` | Authority repair, isolated variants/states, real controls, pilot, immutable snapshot, manifest |
| Plan 004 evidence verifier | `FAIL` | Consent, withdrawal, direction/order, access coverage, decision eligibility, and exclusion gates implemented and tamper-tested |
| Plan 005 evidence verifier | `FAIL` | Current result schema, three private-matrix flags, all remaining phase gates, artifact joins, and tamper tests implemented |
| Recruitment/contact channel | `ABSENT` | Named real channel, authorized operator, contact workflow, and availability window |
| Participant access | `ABSENT` | Enough screened real target users for the approved effective sample |
| Compensation | `ABSENT` | Amount by session, funding owner, verified funds, delivery method, and timing |
| Private research store | `ABSENT` | Named system/URI without secrets, data custodian, access list, encryption/account controls, retention, and deletion procedure |
| Prototype exposure | `ABSENT` | Named device/host/access boundary and separate manifest-bound approval per round |
| Recording | `POLICY SET; APPROVAL ABSENT` | Default `used=false`; any change requires tool, viewers, separate consent, storage, and deletion approval |
| Incident owner | `ABSENT` | Named human contact and response path for privacy, safety, accessibility, and protocol incidents |
| Analysis reviewer | `ABSENT` | Second authorized human for de-identified critical/high coding review |
| Structured PR approvals | `ABSENT` | Owner-authored, unedited, exact-body comments required by #37/#38 validators |

No one may be contacted while a row is not ready. A draft PR URL is an approval
channel, not a recruitment channel. A directory path is not a private-data
system unless the operator has named its custodian, controls, access list, and
deletion process.

## 3. Preflight repair without restarting completed inventory work

### 3.1 Preserve, do not repeat

- Retain Plan 004's 120-family classification, benchmark ledger, and dynamic
  message trace. Do not rerun them to create a new count.
- Retain Plan 005's exact 21-family/32-route/four-spoke inventory. Its priority,
  archetype, and shell fields remain explicitly unvalidated hypotheses.
- Preserve the current zero-sample aggregates. Never create placeholder
  participants or synthetic result rows.
- Work from the two draft heads named above after the Step 1 release is given;
  reconcile shared files without force-pushing or losing either status row.

### 3.2 Repair Plan 004 prototypes before the uncounted pilot

Copy the eight identified draft inputs from the durable recovery package into a
fresh Plan 004 work root. Do not edit the preserved recovery bytes or call the
copied bytes R1. Apply all of these authority repairs before a human sees them:

1. Remove invented 10/20/40-question choices and five-minute estimates. Do not
   turn the implemented, site-designed 45/60/90 simulation lengths into claims
   about official exam length or timing.
2. Describe accepted hazard assets as original monochrome line illustrations,
   not photographs.
3. Use the correct fact state at the correct profile layer. Statewide series
   facts that do not apply are not `not_published`; do not claim all New York
   administrations are compatible or that the corpus completely covers an
   exam.
4. Replace the fabricated pipe-wrench guide citation with the exact maintained
   source/claim binding. No prototype may invent a publisher, page, section, or
   verification coordinate.
5. Use a reviewed, source-backed hazard scene and reviewed claims. Do not
   improvise compliance rules or a new scene for research convenience.
6. Remove the invented 12 MB pack size and any hard-coded source count that can
   drift from the mixed source registry.
7. Narrow privacy copy to the maintained local-first contract. Do not promise
   that every action always stays on-device.
8. Replace the unsupported claim that nobody outside the state has real exam
   questions with the project truth: this project does not possess, solicit,
   or publish secure or recalled exam material.
9. Make every editable working file writable by its owner. Freeze permissions
   only on a complete post-pilot snapshot.
10. Reconcile the working benchmark/ledger so successful later observations do
    not remain listed as unretrieved and the execution-base history is exact.

Each prototype must then expose exactly one assigned direction and one assigned
state at a time, with usable native controls for the task being observed. A
participant must be able to take a first action, open source detail, acknowledge
review, inspect a failed offline update, inspect an import preview, and reach a
reset confirmation. Rendering current, CL-D1, CL-D2, every state, and all
advanced detail together is not a valid exposure method.

CL-D3 has no surviving prototype. It is not an eligible tested direction unless
an amended protocol gives it the same pilot, manifest, exposure, sample, task,
and retest coverage as CL-D1 and CL-D2. Its existence in desk hypotheses is not
participant evidence.

### 3.3 Complete the retained verifiers before recruitment

For Plan 004:

- add consent and withdrawal/deletion status to the operations and participant
  gates rather than inferring consent from a completed observation;
- bind each observation to `direction_id`, variant/state, exposure order,
  access strategy, exact artifact bytes, and an exclusion status;
- exclude withdrawal, security interruption, technical invalidation, and
  protocol deviation from scored denominators while retaining aggregate reason
  counts;
- reject untested direction IDs and require the eligibility rules in section 15;
- preserve coarse segment/access accounting without participant-level data in
  Git; and
- tamper-test every gate with disposable nonparticipant fixtures.

For Plan 005, the current verifier recognizes phase names but only its inventory,
structural-candidate, and minimal selected paths can succeed. Before contact:

- align `research-summary.json` with the current Plan 005 schema;
- accept and validate `--participants`, `--task-evidence`, and
  `--critical-issues`;
- implement `sample-plan`, `operations`, `open-sort`, `thresholds`, both
  exposure phases, `tree`, `first-click-round-one`, `language-dependency`,
  `first-click`, `decision`, `promotion`, and `final`;
- recompute and join private rows, aggregate rows, candidate bytes, hierarchy
  signatures, selected-candidate progression, and content-contract hashes; and
- prove fail-closed behavior with disposable nonparticipant fixtures. Those
  fixtures are code tests, never research evidence.

## 4. Operator resource manifest

The operator supplies this completed manifest outside Git. The repository may
retain only non-sensitive decisions and approval coordinates. Never commit
credentials, contact lists, names, payment details, consent forms, or private
store paths that reveal a person's identity.

```text
step_1_landed_sha: <40 lowercase hexadecimal characters>
coordinator_release_message: <durable message locator>
recruitment_operator: <named accountable person or organization>
recruitment_channel: <specific existing channel>
channel_authority: <who can use it and proof of permission>
participant_contact_owner: <named person>
contact_window: <dates/times/time zone>
session_mode: <in-person | remote | mixed>
research_devices: <provided device inventory or participant-device policy>
compensation_amount_by_phase: <exact values>
compensation_mechanism: <exact payment rail; no account secret>
funds_verified_by_and_on: <identity and date>
private_store_system: <named system and non-secret URI/path>
data_custodian: <named person>
private_store_access_list: <roles or identities>
encryption_and_account_controls: <MFA/encryption/access policy>
incident_contact: <named person and private contact method>
analysis_reviewer: <named authorized person>
prototype_exposure_method: <exact device, local method, or approved private URL>
prototype_exposure_boundary: <who can access it and for how long>
recording_used: false
observer_roles: <moderator; optional disclosed note-taker>
withdrawal_window: <exact participant-facing rule and computed cutoff>
no_show_and_cancellation_terms: <exact participant-facing terms>
```

If `recording_used` changes to `true`, the operator must also supply the exact
tool, recording types, viewers, storage location, separate opt-in language,
retention deadline, and deletion confirmation process. Declining recording may
not make an otherwise eligible person ineligible; structured notes are the
fallback.

The approval sequence remains machine-bound to the existing draft PRs. On #37,
post the exact shared-operations comment and a separate manifest-bound exposure
comment for each round. On #38, post the exact operations and sample-plan
comments before contact, then separate candidate-exposure, progression/decision,
and canonical-promotion comments at their gates. Use the exact comment grammars
in Plans 004 and 005; do not paraphrase them in executor prose. The operator
resource manifest supplies the real values, while the PR comments retain only
the non-sensitive decision and artifact coordinates.

## 5. Target segments and sample plan

### Counted primary participants

- age 18 or older;
- active, recent, or likely entry-level civil-service custodial/janitorial
  candidates for Plan 004;
- active or likely civil-service applicants or adjacent public-service job
  seekers for Plan 005, with primary candidates remaining the majority in every
  counted phase;
- able to use the canonical English product, including limited-English readers;
- a real prospective learner, not a generated persona, role-played friend,
  agent, project contributor, or professional proxy; and
- willing to avoid all remembered or secure exam content.

Librarians and workforce-development staff may be interviewed separately as
support users. They do not satisfy a learner minimum and their evidence is
reported separately.

Recruit for phone-primary use, varied reading and digital confidence, and
access strategies without asking for a diagnosis. Plan 005 must include at
least four completed participants across its program who regularly use one or
more of keyboard-only navigation, screen reader, magnification/text
enlargement, motor adaptation, or cognitive/literacy support. Record the
strategy category, not medical information.

### Phase seats

| Phase | Effective target | Scheduled length | Reuse rule |
|---|---:|---:|---|
| Plan 004 guide/prototype pilot | 1 | 75 min | Never counted in R1/R2 |
| Plan 004 R1 | 6–8 | 60 min | Candidate-only; not reused in R2 |
| Plan 004 R2 | 6–8 new | 60 min | Retests all R1 criticals |
| Plan 005 open sort | 6–8 | 45 min | No candidate IA or Plan 004 label exposure beforehand |
| Plan 005 threshold pilot | 2–3 | 45 min | Excluded from all formal scored phases |
| Plan 005 tree test | 15–20 | 45 min | Not all may have joined open sort; fresh is preferred |
| Plan 005 first-click R1 | 5–8 | 45 min | Never reused in R2 |
| Plan 005 first-click R2 | 5–8 new | 45 min; 60 with an approved access accommodation | Uses only language-reconciled selected structure |

The Plan 004 minimum is raised from five to six for an even CL-D1/CL-D2
allocation while staying inside the reviewed 5–8 range. Plan 005 retains its
recommended ranges and non-waivable floors. Count phase seats and unique people
separately; a person who lawfully participates in more than one non-conflicting
phase is not two unique people. Any feasibility deviation must be approved
before contact and may not be lowered after results are visible.

Replacement participants receive a new study ID. Never recycle an excluded or
withdrawn ID. Attrition is reported as invited, screened, scheduled, started,
completed, excluded, and withdrawn counts without names.

## 6. Screener — exact script and routing

Recruitment copy must say the project is independent/unofficial, is testing a
study site rather than the person, never wants remembered exam material, and
states exact duration and compensation. The recruiter asks:

1. **Are you 18 or older?** `No` ends screening.
2. **Which best describes you?** `preparing/recently prepared for an
   entry-level custodian or janitor civil-service exam`; `considering that kind
   of job`; `applying for another entry-level public-service job`; `helping job
   seekers`; `none`. The first two are Plan 004 primary; the first three may be
   Plan 005 learners; helpers are secondary only.
3. **Is your interest entry-level, higher-level/supervisory, or not sure?**
   Higher-level-only applicants are excluded from counted entry-level evidence.
4. **What device do you normally use first for websites?** `phone`; `tablet`;
   `computer`; `other`. This is a quota field, not an exclusion.
5. **How comfortable are you finding information or changing settings on a
   website?** `not very`; `somewhat`; `very`. Recruit a mix.
6. **When using a free study website, do you normally expect to use it without
   making an account?** `yes`; `no`; `not sure`. This is a segment field, not an
   exclusion.
7. **Do you regularly use any of these when browsing?** `keyboard without a
   mouse`; `screen reader`; `zoom/larger text/magnifier`; `voice or motor
   adaptation`; `help reading/understanding`; `none`; `prefer not to say`.
   Record only the chosen category.
8. **Can you read and respond to an English-language prototype, even if English
   is not your first language?** `No` is excluded because reviewed translation
   support is not available in this protocol.
9. **Have you already joined any phase of this project?** Record study phase/ID
   if known without asking for exam details; apply the reuse rules above.
10. **Do you work on this repository, design this site, or conduct this study?**
   `Yes` excludes the person from target-user counts.
11. **During the session, can you avoid sharing anything remembered from a real
    exam—questions, choices, drawings, answers, review notes, or admission
    documents?** `No` ends screening without collecting the material.
12. **Are you available for the stated session length and mode?** Use the
    operator's real schedule.
13. **May the research operator contact you only about scheduling and payment?**
    `No` ends recruitment. Contact details go into the separate contact system,
    never the research matrix or Git.

Do not ask for an employer, applicant/admission number, exact location,
disability diagnosis, exam recollection, or proof of candidacy. A public exam
category may be used for quotaing; exact personal application documents may not.

## 7. Consent, compensation, recording, and withdrawal

### Consent script

The moderator reads this after replacing every bracketed operator field in the
private run sheet:

> We are testing an independent practice website for New York entry-level
> custodian and janitor exams. The site is not run by a government agency. We
> are testing the website, not you, and there are no performance rewards or
> penalties.
>
> This session takes about [MINUTES] minutes. I will ask you to group study
> tasks, find information, or explain what words on a prototype mean. You may
> skip any question, take a break, or stop at any time without giving a reason.
> If the session starts and you stop, you still receive [AMOUNT AND METHOD].
>
> Please do not share anything remembered from a real exam: no questions,
> answer choices, drawings, answers, review-session notes, admission documents,
> or photographs. If that starts to happen, I will interrupt and move on. We
> will not write down or repeat the material.
>
> We will take structured notes about what you do and say about the prototype.
> [NO RECORDING WILL BE MADE / EXACT SEPARATE RECORDING STATEMENT]. Your contact
> and payment information is kept separately from study notes. Raw notes are in
> [PRIVATE SYSTEM NAME], available only to [ROLES], and follow the deletion
> schedule I will give you. GitHub receives only de-identified totals and
> themes.
>
> You can ask us to delete your identifiable notes until [WITHDRAWAL CUTOFF] by
> contacting [OPERATOR CONTACT]. After results have been de-identified and
> combined, we may no longer be able to separate your contribution. The main
> risks are ordinary frustration with a prototype and accidental disclosure of
> personal or exam information; we will stop and remove that material if it
> occurs. There is no guaranteed personal benefit.

The moderator then asks, separately:

1. “Can you stop or skip a task and still receive the promised compensation?”
2. “Should you tell us a question or answer you remember from a real exam?”
3. “Do you agree to take part and to the note-taking just described?”
4. If recording is approved: “Do you separately agree to [audio/screen] recording?”

Consent is complete only after answers `yes`, `no`, `yes`, and—when used—an
independent recording `yes`. Correct misunderstandings once and ask again.
Otherwise stop without issuing a scored participant row.

### Compensation policy

- Compensation is for time, not performance, agreement, or completion.
- The operator sets an exact amount per phase before recruitment and verifies
  the funds/payment rail.
- Pay the full promised session amount when a participant withdraws after the
  session starts or the researcher stops for security, privacy, accessibility,
  distress, or technical reasons.
- Recruitment copy states payment timing. The default operational target is
  delivery within two business days; a different timing must be disclosed and
  approved before contact.
- No-show and advance-cancellation terms must be stated before scheduling.
- A no-pay design is valid only as an explicit operator decision stated in the
  recruitment and consent materials; silence is not a no-pay decision.

### Recording policy

Default: no audio, video, screen, or keystroke recording. One moderator and,
when disclosed, one note-taker use structured notes. If recording is later
approved, consent to research and consent to recording remain separate;
declining recording cannot exclude a participant, and the no-recording session
path remains available.

### Withdrawal and deletion

- Stop immediately; do not ask why.
- Mark the private phase row `withdrawn`, exclude all of that participant's
  task rows from denominators, and retain only aggregate withdrawal reason
  `participant-request` unless an incident category is needed.
- Pay according to the full-session withdrawal rule.
- Before the stated cutoff, delete raw notes and any recording, remove the
  study-ID/contact link, decrement unpublished aggregates, and log only who
  confirmed deletion and when.
- If already irreversibly de-identified and aggregated, explain the limit that
  was stated during consent; do not pretend a row can be recovered.

## 8. Private data, retention, and Git boundary

The operator provisions two access-separated locations:

1. **Contact/consent/payment registry** — names and contact/payment status,
   accessible only to the recruitment/payment operator.
2. **Research store** — study IDs, structured observations, code-keyed notes,
   prototype coordinates, and incident codes, accessible only to authorized
   research roles.

The ID link stays with the contact operator, not in the research store. Both
locations require authenticated accounts, least-privilege access, encryption
in transit and at rest, and a named data custodian. Shared public links,
personal unencrypted folders, issue attachments, chat uploads, and `/tmp` are
not private stores.

Retention schedule:

- the study-ID/contact link is deleted seven days after the later of payment
  resolution and the participant's withdrawal cutoff;
- raw notes, private matrices, and any approved recording are deleted at the
  earlier of 30 days after the final accepted findings PR merges and 180 days
  after the last session; if the study stops, the 180-day ceiling still applies;
- the data custodian records a deletion confirmation outside Git. Git retains
  only de-identified aggregate counts, findings, artifact hashes, limitations,
  and decisions.

Consent/financial records that an operator must retain under a separate legal
policy are outside this research corpus and must be disclosed by that operator;
this packet does not invent a legal retention duty.

## 9. Prototype exposure method

Before each round, the operator approves one exact method:

- a facilitator-controlled research device serving the immutable snapshot only
  on loopback for an in-person/lab session; or
- an operator-controlled private static host whose URL, access boundary, and
  expiry are recorded without credentials.

A phone-first or access-strategy participant must interact on a device and
browser that supports the method being studied; watching a facilitator click
is not first-click or assistive-technology evidence. No public search indexing,
analytics, third-party behavioral tracking, production modules, live learner
data, or answer-bearing precommit material is allowed.

Every exposure uses the immutable bytes named by the current round's approval.
The facilitator checks the manifest before the session and records the exact
artifact and direction/order code as the session begins. Editable files,
mixed-version files, and an unapproved URL invalidate the session.

## 10. Common session opening, roles, and rescue rules

Roles: one moderator; optionally one disclosed note-taker. Observers stay
silent, do not message the moderator during tasks, and never contact a
participant directly. The moderator:

1. verifies the readiness ledger, participant ID, consent, artifact hash, and
   assigned counterbalance row;
2. says, “Please think aloud. I may stay quiet because I want to see what the
   page communicates on its own”;
3. never asks “Do you understand?”, teaches a label, names the expected route,
   or praises a choice;
4. uses only neutral probes: “What are you looking for?”, “What would you do
   next?”, “What makes you say that?”, and “What do you expect to happen?”;
5. after 30 seconds of no first action, repeats the task once; after the locked
   phase timeout or a request for help, records failure before offering a rescue;
6. takes a break at the participant's request and offers one at 30 minutes; and
7. closes by restating deletion/contact information and payment timing without
   disclosing a correct research answer.

Facilitator rescue never counts as success. A technical restart may continue
only if the same immutable artifact, state, order, and task remain intact; else
the session is technically invalid and may be rescheduled under a new ID.

## 11. Plan 004 sessions

### Pilot (one real person; not evidence)

Run the complete guide and repaired prototypes. Test timing, isolation of the
assigned direction/state, task ambiguity, control behavior, screen-reader or
zoom behavior where applicable, and note codes. Do not enter the pilot into R1
or aggregate findings. Revise editable files and script; only then freeze R1,
make it non-writable, compute its manifest, obtain the R1 exposure approval,
and rerun the verifier.

### R1 and R2 task order

Use the same natural-journey order in both rounds. R2 uses new participants and
must retest every R1 critical issue.

1. `proposition-recall` — show assigned Home for ten seconds, hide it, and ask:
   “What is this site, who is it for, is it run by government, and what would
   you do first?”
2. `profile-fit` — use this synthetic scenario: “A school district in upstate
   New York sent you a public exam notice for a custodian job, but this card
   does not include an exam number.” Ask: “Does this site cover that exam, and
   how can you tell?”
3. `practice-commitment` — ask the participant to start practice and, before
   acting, explain what happens to a chosen answer.
4. `feedback-evidence` — from post-answer feedback ask what was right, why, and
   where the support can be checked.
5. `hazard-feedback` — ask the participant to distinguish one missed hazard
   from one safe detail marked by mistake.
6. `review-meaning` — ask what the list means and what acknowledging an item
   will do.
7. `offline-failure` — show a failed update and ask what happened and what still
   works.
8. `import-reset` — show import and reset previews and ask exactly what changes
   and what stays.
9. `advanced-evidence` — ask where to find the exact source and version without
   putting those details in the default path.

Use an independently reviewed synthetic scenario; never use a participant's
announcement, application, or remembered material.

### Plan 004 direction allocation

R1 and R2 effective samples are 6–8. In R1, assign odd-numbered valid IDs to
CL-D1 and even-numbered valid IDs to CL-D2. In R2, assign odd IDs to CL-D2 and
even IDs to CL-D1. Each participant completes all nine tasks on the assigned
direction. The allocation must leave at least three completed participants per
direction per round.

Current wording is a diagnostic control, not a third selectable direction. On
the feedback, offline, and destructive-action prototypes only, show the current
wording after the scored candidate task and ask for a comparative teach-back.
If the two versions are then shown side by side, alternate left/right placement
by participant parity and record it. Current wording is never shown before the
scored candidate task. Do not overwrite the scored outcome after the control is
shown.

Store these private allocation fields before exposure:

```text
round  study_id  direction_id  task_order_code  control_order_code  artifact_version  manifest_sha256  access_strategy_code
```

No finding may be attributed to a direction without this join. CL-D3 and
`current` are rejected as decision IDs unless a separately reviewed protocol
gives them equivalent participant coverage.

## 12. Plan 005 open sort and candidate formation

### Open-sort cards

Use these 24 learner-goal cards. They intentionally omit route IDs and current
navigation labels:

1. Work out what this site is and whether to trust it.
2. Find out whether this site covers my exam.
3. Choose an exam when I am not sure which one applies.
4. Confirm an exam profile and see what is still unknown.
5. Start a short practice or continue a saved one.
6. Answer a question and find out why the answer is right.
7. Learn what a tool is used for and how to recognize it.
8. Compare tools that are easy to mix up.
9. Learn how a cleaning task is done.
10. Learn basic repair work expected of an entry-level custodian.
11. Practise spotting unsafe details in a workplace.
12. Go back over things I got wrong.
13. Set up a longer practice run and review the result.
14. Print a study packet for paper use.
15. Get a straight answer to a common exam or site question.
16. Check why an answer is supported and who is behind the site.
17. Report a correction or security concern.
18. Change reading or data preferences, export data, or preview a reset.
19. Make study material available without an internet connection.
20. Recover when a page or content is unavailable.
21. Understand why practice accuracy is not an official score.
22. Find out whether real exam questions can lawfully be provided.
23. Find out who runs and funds the independent site.
24. Tell New York City custodian exams apart from the statewide entry-level series.

For study ID number `p`, rotate the card stack by `(p - 1) mod 24`; reverse it
for even IDs. The participant groups and labels cards, identifies the first
place they would go, identifies what belongs everywhere, identifies what should
disappear in a question/hazard task, and places profile, offline, settings,
sources, and correction goals. Do not show the current header, candidate IA,
Plan 004 directions, route IDs, or internal vocabulary first.

Aggregate co-occurrence counts, repeated labels, disputed placements, mobile
expectations, player-exit expectations, and two materially different grouping/
priority models. Raw arrangements and quotations stay private. A candidate
difference must alter hierarchy/grouping, not only wording.

## 13. Plan 005 pilot, tree test, and first-click rounds

### Locked task destinations and scenarios

The 13 formal task IDs remain unchanged. Candidate-specific first-click targets
and labels are locked only after the open sort and threshold pilot, but the
destination intent is fixed:

The moderator reads each prompt verbatim. Candidate-specific destination and
first-click mappings are then locked during the pilot without changing the
prompt.

| Task ID | Exact prompt | Destination intent |
|---|---|---|
| `profile-fit` | “A public notice says New York Entry-Level Custodians and Janitors. Show where you would check whether this site covers that notice.” | Published exam/profile chooser and truthful profile fit |
| `quick-practice` | “You want to answer some practice questions now. Show where you would start.” | Available practice start without assuming an official length |
| `review-misses` | “You want to go back over things you missed earlier. Show where you would do that.” | Local review queue |
| `tool-lookup` | “You want to recognize a pipe wrench and learn what it is used for. Show where you would look.” | Accepted tool reference |
| `tool-comparison` | “You keep mixing up a pipe wrench and an adjustable wrench. Show where you would compare them.” | Accepted tool-family comparison |
| `hazard-practice` | “You want to practise finding unsafe details in a workplace, using pictures or the text version you normally use. Show where you would start.” | Visual or nonvisual hazard practice |
| `simulation` | “You want a longer site-designed practice run. Show where you would set it up.” | Practice-simulation setup, not an official test claim |
| `print` | “You want a study packet you can use on paper. Show where you would make it.” | Print center |
| `offline-download` | “You expect to study without internet later. Show where you would prepare the material now.” | Compatible offline content |
| `settings-data-control` | “You want to save a copy of your study data and see what a reset would remove, without resetting anything. Show where you would go.” | Export and reset preview |
| `source-support` | “You want to check the public document behind an answer. Show where you would look.” | Source/transparency support |
| `correction-report` | “You found a possible mistake and want to see how to report it without sharing personal or exam material. Show where you would go.” | Correction-report guidance/form boundary |
| `unavailable-recovery` | “The study page you wanted is unavailable. Show what you would use to get back to something that works.” | Truthful status/recovery path, not an empty state |

The threshold pilot runs both low-fidelity candidate trees and representative
page starts with 2–3 excluded participants. Alternate A/B first by ID, measure
ambiguity, rescue, direct/indirect paths, and plausible success ranges, then
repair task wording and declare the eight numeric method-by-priority thresholds
before formal IDs exist. The declaration commit locks task wording, scoring,
priorities, denominators, exclusions, critical definitions, and rounding.

### Tree-test counterbalancing

Start with the 13 task IDs in the order above and number their canonical
positions `t = 1..13`. For participant number `p`, rotate by `(p - 1) mod 13`;
reverse the presentation order for even `p`. Assign a task to candidate A when
`(p + t)` is even and B otherwise, using the task's canonical `t`, not its
rotated presentation position. Reset the tree between tasks. This gives each
candidate/task cell denominators differing by at most one and at least half the
completed sample rounded down.

Tree timeout: 90 seconds. Score:

- `direct` — reaches the locked destination without entering a wrong branch;
- `indirect` — reaches it without rescue after one or more wrong branches or
  backtracks; or
- `failed` — does not reach it by timeout, requests rescue, or reaches a wrong
  terminal destination.

### First-click R1 counterbalancing

Use the same rotation and A/B formula, with the candidate-specific plausible
entry page locked during the pilot. Each participant gets one candidate for a
given task, so every candidate/task cell has at least two observations at the
minimum sample. Reset between tasks and never teach the alternate model.

First-click timeout: 30 seconds. `correct-first-click` means the first
actionable destination chosen matches the predeclared target. No action,
facilitator rescue, browser chrome, or a wrong destination is
`incorrect-first-click`. Record the full eventual path separately; it cannot
change the first-click score.

After matrix-backed tree and R1 results, progress at most one candidate under
the section 15 gates. Freeze its evidence commit before Plan 004 vocabulary is
incorporated.

### First-click R2

Only after Plan 004 is accepted on `main`, copy the progressed candidate into a
new R2 scratch directory, replace provisional labels with the accepted content
contract, and prove that the normalized hierarchy is byte-for-byte unchanged
at the hierarchy-signature level. Obtain a new exposure approval. Every new R2
participant tests all 13 tasks on this one reconciled artifact. Rotate task
order as above; rotate plausible entry pages using the predeclared schedule.

Run participant sessions with keyboard, screen reader, text enlargement/reflow,
and no-JavaScript coverage across the recruited access-strategy sample. Test at
320 CSS pixels and real 400% zoom where supported. A blocked access method is a
failure and possible critical issue, not a missing value to average away.

## 14. Coding, severity, exclusions, and adjudication

### Plan 004 task anchors

Code teach-back as `accurate`, `partial`, or `incorrect` against these anchors:

| Task | `accurate` requires |
|---|---|
| Proposition | independent/unofficial original practice, intended audience, and a plausible first action |
| Profile fit | uses compatible public profile facts and preserves unknown/not-applicable states without guessing |
| Commitment | answer is editable before explicit submission; reveal follows successful durable commitment |
| Feedback/source | identifies outcome, rationale, and how to reach supporting public evidence |
| Hazard feedback | distinguishes a missed unsafe detail from a safe detail marked in error |
| Review | understands due/reviewed as local study workflow, not mastery or an official schedule |
| Offline failure | knows the prior usable version/data remain and what is currently unavailable |
| Import/reset | names the exact scope changed and retained before any destructive action |
| Advanced evidence | can find source/version detail without needing it in the default task path |

`partial` preserves the core consequence but misses a noncritical element;
`incorrect` states the wrong consequence, needs rescue, or cannot complete the
teach-back. Record first action, time to first action, wrong-turn code,
clarification count, repeated/replaced term codes, direction/order, and access
barrier separately.

### Severity

Critical—one occurrence is enough—includes:

- belief that the site is official or that a site result predicts an official
  score, pass, count, weighting, or readiness;
- confusion between editable/unsaved and committed/saved state or the scope of
  a destructive local-data action;
- precommit answer leakage or raw internal diagnostics;
- inability to reach required explanation/source content with the participant's
  access method;
- navigation that loses material profile context, requires JavaScript for a
  required public/reference path, traps a focused player, or creates a
  reasonable risk of unintended data loss; or
- any unresolved exam-security or privacy breach.

High: a noncritical task failure, materially wrong consequence, or access block
that requires facilitator rescue. Medium: an unaided recovery after a wrong
turn, repeated hesitation, or clarification that materially delays the task.
Low: a wording preference or brief hesitation with no wrong action or
misunderstood consequence.

For navigation, retain the failure taxonomy: wrong category, unclear label,
missed profile context, utility/trust detour, player-exit failure, compact-menu
failure, no-JavaScript failure, accessibility failure, and no action.

### Exclusions and protocol deviations

Exclude from scored denominators, while retaining aggregate counts and reason:

- consent incomplete;
- participant withdrawal;
- secure-material interruption that contaminates the task;
- wrong, changed, or unapproved artifact/order;
- technical failure that prevents the locked task;
- facilitator teaching/rescue before the score is recorded; or
- duplicate/ineligible participant.

Do not delete an unfavorable valid session. A protocol defect discovered after
formal results are visible requires a new versioned round; it never licenses a
changed threshold or overwritten candidate.

The moderator codes within 24 hours against the locked codebook. Every critical
and high issue is independently checked by a second authorized reviewer who
sees only the minimum de-identified excerpt/event code. Disagreement is resolved
against observed behavior, with an adjudication code; unresolved disagreement
uses the more severe code and is reported as a limitation. No invented reviewer
or agent persona may fill this role.

## 15. Decision thresholds

### Plan 004 direction eligibility

No percentage or population claim is made. A direction may be presented for
owner selection only when:

1. at least three completed participants saw it in each of R1 and R2;
2. every R1 critical issue for it was explicitly retested in R2;
3. it has zero unresolved critical issues in R2;
4. no high-severity issue repeats for two participants in R2 without an
   evidence-based revision and new retest;
5. every nine-task observation is joined to the exact direction, state, order,
   and artifact coordinates;
6. preserved product/exam/security facts pass the authority review; and
7. access-strategy failures and missing cohorts are reported rather than
   averaged away.

If neither CL-D1 nor CL-D2 is eligible, stop for a new versioned iteration. If
both are eligible, the owner may select one only with a manifest-bound rationale
that cites exact observations and limitations. Executor preference, desk-audit
severity, benchmark imitation, or a nonempty direction ID is insufficient.

### Plan 005 threshold declaration and selection

The eight numeric thresholds remain genuinely unknown until the real 2–3
person threshold pilot. Immediately after that pilot and before formal IDs:

1. record observed direct tree and first-click ranges for each locked priority;
2. declare one tree-direct and one first-click threshold for each of `top`,
   `supporting`, `utility`, and `trust-recovery`;
3. explain why each is decision-useful but not a population estimate;
4. encode displayed rates to six decimal places using decimal half-up rounding;
   derive `thresholdMet` from the unrounded rational numerator/denominator; and
5. commit/push the values and never tune them after formal results are visible.

Regardless of numeric values:

- the progressed candidate must meet all 13 predeclared tree task gates and
  have zero unresolved tree criticals;
- both A and B must have complete R1 first-click evidence before progression;
- the selected R2 candidate must meet all 13 predeclared R2 first-click gates,
  resolve every carried critical issue, retain its passing tree invariant, and
  satisfy the minimum four access-strategy participants across the program;
- no accessibility or no-JavaScript blocker can be averaged into a pass; and
- if neither candidate qualifies, stop. Do not select the less-bad model or
  revise a locked hierarchy under the old ID.

Only then may the owner approve the exact tested candidate. The selection,
canonical-promotion approval, and four maintained product-contract changes must
all bind the same candidate, artifact, hierarchy, and accepted language hashes.

## 16. Incident and adverse-event handling

| Event | Immediate action | Evidence/data action |
|---|---|---|
| Remembered/secure exam content | Interrupt: “Let's stop there—I cannot collect or repeat that.” Move on or end | Do not record content; remove any accidental capture; retain only `security-interruption`; compensate fully |
| Accidental PII/document exposure | Stop viewing/recording, close the material, notify data custodian | Quarantine and delete the capture; retain only incident category/date; never commit it |
| Distress or fatigue | Pause, offer break/skip/stop, do not probe | Withdrawal/skip rules; compensate fully if stopped |
| Accessibility barrier | Stop forcing the inaccessible path; offer reschedule only after repair | Score the locked task as blocked/failed where valid; open critical review; do not substitute observer clicks |
| Technical failure | Allow one restart only when artifact/state/order remain exact | Otherwise invalidate technically, retain aggregate reason, and reschedule under a new ID |
| Facilitator conflict or leading | Pause; replace facilitator if possible | Exclude contaminated task/session and record protocol deviation |
| Participant withdrawal | Stop immediately, no reason required | Apply section 7 deletion and compensation rules |
| Suspected privacy/security incident | Stop collection and access to affected data | Notify named incident owner within 24 hours; preserve no prohibited content in the incident note |

The moderator does not confirm whether offered exam content is genuine, provide
medical/legal advice, or promise confidentiality beyond the approved storage
and incident process.

## 17. Analysis, synthesis, and promotion sequence

After each valid phase:

1. hash and verify the private matrices without copying them into Git;
2. derive exact aggregate numerators/denominators and attrition/exclusion counts;
3. separate observation, inference, recommendation, owner decision, and
   unresolved fact;
4. report coarse segment/device/access coverage and missing cohorts without
   identifying combinations;
5. report contradictions and all valid negative evidence;
6. retain only safe aggregate findings, task/card labels, artifact hashes,
   limitations, and approval coordinates in Git; and
7. commit and push incrementally without force.

Plan 004 must reach its evidence and owner gate first. Only then may its
accepted rules enter `product/CONTENT_DESIGN.md` and only then may Plan 005
reconcile R2 labels. Plan 005 changes `product/ROUTES.md`,
`product/SCREEN_STATES.md`, `product/COMPONENT_ARCHITECTURE.md`, and
`product/DESIGN_SYSTEM.md` only after all formal thresholds and the exact owner
decision pass. Production UI code remains out of scope. `plans/README.md` may
say `DONE` only after the corresponding final verifier, product promotion,
validation, remote-head, and draft-PR gates pass.

## 18. Resume checklist

The next executor must stop unless all are true:

- [ ] coordinator supplied the exact landed Step 1 `main` SHA;
- [ ] #37/#38 artifacts were reconciled without changing their truthful zeros;
- [ ] Plan 004 factual/interaction repairs passed pilot preflight;
- [ ] both retained verifiers implement the packet's real-evidence gates;
- [ ] the operator resource manifest is complete;
- [ ] the exact screener, consent, compensation, storage, deletion, and
      incident materials are instantiated privately;
- [ ] sample/operations approvals resolve live on the correct draft PRs;
- [ ] the current round's immutable artifact and exposure approval match; and
- [ ] no secure material, participant identity, raw note, or credential is in
      Git.

The smallest current resume action is not a simulated session. It is a
coordinator release naming the landed Step 1 SHA; after that, the operator must
supply the real channel, compensation mechanism, and named private store before
any participant contact.
