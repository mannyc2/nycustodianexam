# Reconciled design implementation checklist

The active task is the complete handoff in `/mnt/models/dev/nycustodianexam/IMPLEMENTATION-HANDOFF.md`. This file tracks work; partial implementation is not completion. No merge or deployment is authorized by the handoff.

| Area | Current evidence | Remaining work |
|---|---|---|
| Shared navigation | `acd7a88`, 1248/384 captures, reflow/keyboard/no-JS/bottom-bar tests | Final cross-browser check after all changes |
| Home | First-slice comparison gallery and notes | Final visual audit; documented live-content and system-font differences |
| Practice hub and Review | First-slice real-save/failure captures, durable review regression tests | Final visual audit and mixed-inventory wording as builder is added |
| Simulation setup | SETUP-ATLAS-REVIEW.md, effective lengths/timing/format; no exam prerequisite | Final integrated capture/checks |
| Practice/Hazard builder | PRACTICE-BUILDER-REVIEW.md and HAZARD-BUILDER-REVIEW.md: effective builders, custom navigation and exact saved-history receipts | Final page composition and cross-browser verification; custom offline-pack and import flows now pass in Chromium |
| Atlas catalog | Nine-family desktop/compact controls, all 65 images, eligibility/failure states | Individual record/family layouts and final comparison |
| Question player | QUESTION-PLAYER-REVIEW.md: text card/action reconciliation, real-state captures, 14 browser checks | Illustrated question binding is absent from current content schema; complete modality and final visual audit |
| Hazard player | HAZARD-PLAYER-REVIEW.md: responsive workspace, header/save panel, nine real-state captures and nine regression tests | Keyboard zones and three compact recovery states now captured; detailed revealed explanation/overlay composition and final visual comparison remain |
| Simulation player/results | SIMULATION-NAVIGATOR-REVIEW.md: navigator/confirmation layout, cancel focus, desktop/compact captures; 8 regression tests | Full player, timer and results visual reconciliation |
| Print configuration | Ten products and effective controls; reviewed document scope | PRINT-OUTPUT-REVIEW.md: actual Letter/A4 question PDFs and searchable-text fix; remaining preview comparison, large-print/illustration pagination and failure/stale captures |
| Exams / Settings / Offline / report | Existing implementation and prior recovery tests preserved | Compare each accepted page family, fix visual/state discrepancies |
| Final validation/publication | First-slice local commit; next slice in progress | Full relevant checks, evidence index, clean local commits, reviewable publication; never merge/deploy automatically |

Important discovered content difference: simulation metadata has 30 cleaning, 37 maintenance, 5 safety, and 18 mixed/scenario questions, not the prototype's 34/26/30. Preserve real classification and counts. Internal session/profile/version references remain required; global exam selection is removed.
