# Reconciled design implementation checklist

The active task is the complete handoff in `/mnt/models/dev/nycustodianexam/IMPLEMENTATION-HANDOFF.md`. This file tracks work; partial implementation is not completion. No merge or deployment is authorized by the handoff.

| Area | Current evidence | Remaining work |
|---|---|---|
| Shared navigation | `acd7a88`, 1248/384 captures, reflow/keyboard/no-JS/bottom-bar tests | Final cross-browser check after all changes |
| Home | First-slice comparison gallery and notes | Final visual audit; documented live-content and system-font differences |
| Practice hub and Review | First-slice real-save/failure captures, durable review regression tests | Final visual audit and mixed-inventory wording as builder is added |
| Simulation setup | SETUP-ATLAS-REVIEW.md, effective lengths/timing/format; no exam prerequisite | Final integrated capture/checks |
| Practice/Hazard builder | PRACTICE-BUILDER-REVIEW.md: effective question builder, custom navigation and exact saved-history receipts | Hazard builder, final page composition and cross-browser/offline verification |
| Atlas catalog | Nine-family desktop/compact controls, all 65 images, eligibility/failure states | Individual record/family layouts and final comparison |
| Question player | Existing durable commit-before-reveal preserved | Match unanswered/answered reference captures |
| Hazard player | Existing real marker/zone state machine preserved | Match controls, feedback, failures and compact adaptation |
| Simulation player/results | Existing resumable sessions and strict submit behavior preserved | Navigator/layout comparison, recovery and compact states |
| Print configuration | Ten products and effective controls; reviewed document scope | Print preview layout, failure/stale states, paginated output evidence |
| Exams / Settings / Offline / report | Existing implementation and prior recovery tests preserved | Compare each accepted page family, fix visual/state discrepancies |
| Final validation/publication | First-slice local commit; next slice in progress | Full relevant checks, evidence index, clean local commits, reviewable publication; never merge/deploy automatically |

Important discovered content difference: simulation metadata has 30 cleaning, 37 maintenance, 5 safety, and 18 mixed/scenario questions, not the prototype's 34/26/30. Preserve real classification and counts. Internal session/profile/version references remain required; global exam selection is removed.
