# Plans 004/005 zero-cost recruitment and fieldwork kit

**Version:** `ZERO-COST-FIELDWORK-KIT-V1`

> **DO NOT COMMIT COMPLETED COPIES OR PRIVATE LOCATORS.** This file contains
> public blank templates only. Names, contact coordinates, permission records,
> consent records, screening answers, schedules, private paths, and raw notes
> belong in the approved access-separated private systems.

This kit operationalizes `FW-004-005-v2` as a zero-budget, pre-business
program. It does not document recruitment or a session. At publication all
participant phase counts and all non-participant lane item counts remain zero.

## 1. Fixed terms

These values apply to all eight phases and may not be replaced in a run sheet:

| Field | Fixed value |
|---|---|
| Participation | Adult, explicitly voluntary |
| Amount | `0` |
| Currency, funder, funding proof | `n/a` |
| Delivery method, payment rail, deadline | `n/a` |
| Withdrawal payment | `n/a-unpaid` |
| No-show charge | `0`; no fee, penalty, or loss of access |
| Cancellation charge | `0`; cancel at any time without fee, penalty, or loss of access |
| Skip/stop | Any task or the whole session, at any time, without reason or penalty |
| Recording | `false`; no audio, video, screen, or keystroke recording |
| Notes | Minimum necessary structured notes only |

The canonical machine-readable matrix is
`004-005-fieldwork-unpaid-terms.v1.tsv`. Outreach, scheduling, consent, and the
closing reminder must accurately describe these terms. There is no payment
rail to provision and no cancellation or no-show debt to collect.

## 2. Permission-based recruitment

Use only one of these zero-cost paths after a real accountable person has
approved it:

1. A personal-network invitation sent privately to adults who may actually use
   the product. Ask permission once; do not pressure friends, relatives,
   employees, students, clients, or anyone over whom the recruiter has power.
2. A community partner's own opt-in channel, after the partner approves the
   exact copy, audience, time window, and reply route.
3. A public job-seeker venue such as an NYPL or Workforce1 location, or a
   similar venue, only after that specific venue grants permission for the
   exact place, time, mode, and approach. Never imply venue, library, employer,
   city, union, or exam-agency sponsorship.

Never scrape member or attendee lists, use public replies for screening,
collect contact details before contact consent, post names or responses in an
issue/PR/chat, or approach a person who is receiving a service from the
recruiter in a way that could make refusal feel consequential. One unanswered
reminder is the maximum unless the volunteer requests another contact.

### Private permission record

```text
channel_code: <opaque code>
channel_type: <personal-network | community-partner | permitted-venue>
permission_status: <pending | approved | denied | expired>
permission_owner: <named accountable human in contact registry>
permission_proof_locator: <private locator>
approved_copy_sha256: <exact outreach-copy hash>
approved_window_utc: <start/end>
approved_mode_and_location_limits: <private operational value>
withdrawal_deletion_contact: <private monitored route>
```

No outreach occurs while any applicable field is pending.

### 30-second intercept

> We are testing an independent, unofficial free study website for adults
> interested in entry-level custodian, janitor, or other public-service work.
> This is an unpaid volunteer study: the amount is zero, with no fee or penalty
> for declining, cancelling, missing, skipping, or stopping. We will not record
> audio, video, your screen, or keystrokes. We never want real exam questions or
> documents. May I ask a short eligibility screener and, if you are eligible,
> contact you only to schedule and handle any withdrawal or deletion request?

If the answer is not an unambiguous yes, thank the person and collect nothing.

### Short outreach/scheduling template

```text
We are inviting adults who are actual or likely users of an independent,
unofficial free NYC custodian-exam study site to help test it. Participation is
unpaid ($0), voluntary, and offers no guaranteed benefit. There is no charge or
penalty for declining, cancelling, missing, skipping a task, or stopping. No
audio, video, screen, or keystroke recording is planned. We do not want any
remembered real exam question, answer, drawing, note, admission document, or
personal account information.

Format: <10-minute one-to-two-task pop-up | scheduled phase session>
Mode/window: <approved private details>
Contact use: scheduling plus any withdrawal/deletion request only.
```

## 3. Eligibility, contact consent, and accommodations

Use the exact 13-question screener in section 6 of the operations packet. A
countable participant must be an adult actual or likely user, not an owner,
project contributor, agent, synthetic persona, heuristic reviewer, support-only
proxy, or automated result. Screening does not create participant evidence.

Ask, without requesting a diagnosis:

```text
Which format can you use: a 10-minute pop-up, a scheduled remote session, or a
scheduled in-person session? Which device do you normally use? Would any of
these help: breaks; keyboard-only use; screen reader; zoom or reflow; voice or
motor support; help reading or understanding; another adjustment; or prefer
not to say?
```

Contact consent covers only screening follow-up, scheduling, and receiving and
closing withdrawal/deletion requests. It is not research consent. Store contact
coordinates only in the contact registry; send only the opaque recruitment key
and de-identified routing fields to the research store.

## 4. Consent script — unpaid and no recording

Replace only the bracketed operational fields:

> We are testing an independent practice website for New York entry-level
> custodian and janitor exams. It is not run by a government agency. We are
> testing the website, not you.
>
> This takes about [MINUTES] minutes. Participation is unpaid and voluntary.
> The amount is zero; no payment or other incentive is offered. You may skip
> any task, take a break, cancel, or stop at any time without giving a reason,
> charge, or penalty. Declining or stopping does not affect any job, exam,
> library, workforce, community, or other service.
>
> Please do not share anything remembered from a real exam: no questions,
> answer choices, drawings, answers, review notes, admission documents, or
> photographs. If that starts to happen, I will interrupt and move on without
> recording or repeating it.
>
> We will take minimum necessary structured notes about the prototype. We will
> not record audio, video, your screen, or keystrokes. Your contact details are
> kept in [CONTACT SYSTEM], separate from coded research notes in [RESEARCH
> SYSTEM]. Only [DISCLOSED ROLES] can access the applicable system. GitHub gets
> only safe de-identified totals, themes, and artifact hashes.
>
> You may request deletion of separable notes until [WITHDRAWAL CUTOFF] by
> contacting [MONITORED CONTACT]. After the disclosed cutoff and irreversible
> aggregation, a contribution may no longer be separable. The main risks are
> ordinary prototype frustration and accidental disclosure of personal or exam
> information; we will stop and remove such material. There is no guaranteed
> personal benefit.

Ask and record separately:

1. “Is it clear that this is unpaid, offers no payment, and that you may skip or
   stop without penalty?”
2. “Should you share a question or answer remembered from a real exam?” The
   valid answer is no.
3. “Do you voluntarily agree to take part and to the structured note-taking
   just described?”

Correct a misunderstanding once and ask again. Continue only with correct
answers to all three. Append `recording-not-used` before any task exposure;
never request recording consent under this protocol version.

## 5. Session formats and moderator quick guide

### Ten-minute pop-up

The pop-up is a real-user option, not a shortcut around a maintained phase:

- pass the same permission, adult screener, consent, privacy, security,
  artifact-hash, and attrition gates;
- show exactly one or two preselected tasks and stop at 10 minutes;
- label the private wrapper `session_format=popup-10m`;
- use findings as defects or hypotheses only when the maintained phase requires
  the full 9+3 Plan 004 schedule, 24-card sort, 16-trial threshold pilot, or
  13-task Plan 005 schedule; and
- never count a partial pop-up as a completed phase or a selection-gate row
  without a prospective, owner-approved protocol amendment.

### Remote option

Use a private, time-bounded exposure link or approved local screen-sharing path.
Camera is optional and off by default; recording remains off. Ask the volunteer
to close personal tabs and notifications. Do not require software installation
or an account. A remote formal session still needs an actually provisioned way
to observe the required first action on the declared device/browser/access
strategy without recording.

### Moderator checklist

1. Verify channel/venue permission, phase gate, volunteer eligibility, cohort
   independence, artifact/protocol/schedule hashes, device, and accommodation.
2. Re-read the unpaid/no-recording terms; collect affirmative research consent;
   append `recording-not-used` before exposure.
3. Use the exact neutral prompt. Do not coach, rescue, reinterpret labels, or
   expose another candidate or condition outside the frozen schedule.
4. Offer skip, break, or stop at any time. Interrupt personal data, secure exam
   recollection, distress, or unsafe conditions.
5. Record only code-keyed minimum data in the research store. Do not place names,
   contacts, screenshots, recordings, or personal combinations in notes.
6. Close with the withdrawal cutoff and monitored contact. Do not ask why a
   volunteer stops.

## 6. Free local two-store operating model

This is a deployable design, not proof of deployment. Both systems remain
`PENDING` until named people provision and test them.

| Boundary | Free local implementation | Allowed data | Forbidden data |
|---|---|---|---|
| Contact/consent registry | Existing-device encrypted local vault under the contact custodian's OS account | identity/contact; channel permission; contact consent; scheduling; `recruitment_key` to opaque person/study resolution; reuse/suppression token; withdrawal/deletion intake | raw tasks, observations, notes, scores, issue evidence |
| Research evidence store | A different custodian/account/device or independently permissioned encrypted local volume | opaque keys; de-identified screener; consent/attrition ledger; artifacts/schedules; raw structured notes; derived aggregates | names, contact coordinates, payment data, reuse token, identity-resolving map |

Use an available full-disk/encrypted-volume facility chosen by the actual
operator, such as BitLocker, FileVault, LUKS, or a reviewed equivalent. A
single account, shared folder, renamed directory, public link, or repository
template is not access separation. Exchange only the opaque key, plan/phase,
and minimum scheduling/request status through a narrow handoff.

### Provisioning record — private

```text
system_role: <contact-registry | research-evidence-store>
system_name_version_and_private_locator: <actual value>
named_custodian: <actual person>
named_access_list: <minimum necessary identities>
encryption_and_authentication: <actual controls>
backup_location_and_access: <actual separate control>
retention_trigger_and_deadline: <Plan 004 or Plan 005 exact rule>
primary_and_backup_deletion_method: <actual method>
withdrawal_handler_and_handoff: <actual people/path>
cross_access_denial_test_at_utc: <actual test>
restore_and_deletion_test_at_utc: <actual test>
withdrawal_dry_run_at_utc: <actual test>
status: <pending | ready>
```

Do not mark either system ready because this template exists.

## 7. Withdrawal and deletion runbook

1. The contact owner authenticates the request with minimum necessary contact
   data and maps it to an opaque key; no reason is required.
2. The contact owner relays only opaque key, scope, and request time to the
   research custodian.
3. The research custodian appends the applicable attrition event, restricts and
   deletes separable scoped raw data, invalidates and re-derives unpublished
   aggregates, and records primary/backup deletion status.
4. The contact owner confirms closure through the private contact route, stops
   future contact, and retains only the disclosed tombstone or suppression
   token for its stated period.
5. Neither custodian commits the request, identity, mapping, or private locator.

## 8. Reusable private run wrapper and safe result template

The wrapper indexes the canonical schemas; it does not replace them.

```text
packet_and_phase_version:
study_id/session_id:
research_consent_event_id:
session_format: <popup-10m | scheduled-full>
mode/device/browser/access_strategy:
terms_version: ZERO-BUDGET-UNPAID-V1
amount_currency_minor: 0
currency/funder/funding/delivery/payment_rail/deadline: n/a
no_show_and_cancellation_charge: 0
recording_used: false
recording_event: recording-not-used
phase_input_manifest/artifact/schedule/task_registry_hashes:
task_ids_and_order:
canonical raw-schema row locators:
task outcome/exclusion codes:
attrition event if any:
moderator close and withdrawal cutoff reminder:
```

Repository-safe synthesized result:

```text
phase/version/hash coordinates:
target_seats:
invited/screened/scheduled/started/completed/excluded/withdrawn:
eligible_unique_people:
task numerators/denominators:
access coverage as non-identifying unique-person counts:
confirmed defects/themes and evidence links:
contradictions/negative evidence:
limitations and missing cohorts:
generalizability: directional-not-statistically-generalizable
decision gate: <not-met | met with exact evidence manifest and owner decision>
```

A target or scheduled seat is never reported as completed recruitment or
participant evidence.

## 9. Non-participant evidence result template

> **NON-PARTICIPANT EVIDENCE — DOES NOT COUNT TOWARD RECRUITMENT, SAMPLE, THRESHOLDS, OR SELECTION**

The exact empty canonical TSV is
`004-005-nonparticipant-evidence.v1.tsv`. Copy it only into the approved
research workspace, append canonical rows there, and validate before deriving a
repository-safe result. The field list below is the same exact schema rendered
vertically for a run sheet; it is not a second or looser data format.

Use only these exact lane/actor pairs:

| `lane_code` | `actor_class` |
|---|---|
| `expert-heuristic-review` | `expert-reviewer` |
| `automated-accessibility-check` | `automated-tool` |
| `manual-accessibility-check` | `manual-accessibility-reviewer` |
| `public-language-corpus-analysis` | `corpus-analyst` |
| `deterministic-task-route-simulation` | `deterministic-runner` |
| `structured-owner-dogfooding` | `project-owner` |

```text
schema_version: fieldwork-nonparticipant-evidence-v1
evidence_item_id:
target_plan_id:
lane_code:
actor_class:
method_version:
input_set_sha256:
procedure_sha256:
result_file_sha256:
observed_at_utc:
output_class: <hypothesis | defect | question-priority>
evidence_class: non-participant
participant_sample_count: 0
participant_threshold_use: prohibited
final_selection_use: prohibited
safe_observation_and_reproduction:
affected_artifact_or_route_sha256:
proposed_real_participant_follow_up:
disposition: <open | resolved | deferred | invalidated>
```

Do not include names, contact information, participant IDs, private paths, raw
participant data, or secure/recalled exam content. Classify the activity at the
time it occurs and never dual-register or later relabel it as a participant
session.

## 10. Guidance basis

This kit paraphrases the following public guidance and applies the stricter
repository and exam-security boundaries above:

- [W3C, Involving Users in Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/involving-users/): include people with disabilities and combine user involvement with standards-based evaluation; a small study improves understanding but does not establish conformance or generalizability.
- [W3C, Understanding Conformance](https://www.w3.org/WAI/WCAG21/Understanding/conformance): accessibility conformance needs both automated and human evaluation; usability observations supplement rather than replace it.
- [GOV.UK, Finding participants for user research](https://www.gov.uk/service-manual/user-research/find-user-research-participants): recruit actual or likely users, seek a range of access needs, use permission-based approaches, and treat 4–8 as a typical small-round target rather than a completed sample.
- [GOV.UK, Doing pop-up research](https://www.gov.uk/service-manual/user-research/doing-pop-up-research): explain the approach quickly, use a clear objective and consent, and keep a pop-up to roughly 10 minutes and one or two tasks.
- [GOV.UK, Getting informed consent for user research](https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research): disclose purpose, activity, data use, recording, retention, observers, voluntary participation, withdrawal, and rights in an accessible form.
- [GOV.UK, Managing user research data and participant privacy](https://www.gov.uk/service-manual/user-research/managing-user-research-data-participant-privacy): collect the minimum, restrict access by need, separate contact administration from evidence, and make deletion requests operationally possible.
- [HHS OHRP, Informed Consent FAQs](https://www.hhs.gov/ohrp/regulations-and-policy/guidance/faq/informed-consent/index.html) and [The Belmont Report](https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/read-the-belmont-report/index.html): give adequate opportunity to decide and avoid coercion or undue influence; refusal must not cause loss of services or other penalty.
