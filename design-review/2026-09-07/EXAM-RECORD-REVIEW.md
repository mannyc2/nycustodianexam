# Exams record review

`capture-exam-records.mjs` opens all three published entries (statewide study plan and two Nassau announcements), records both Facts and What it tests tabs at 1248/384 CSS pixels, verifies focus and tab visibility, and checks document horizontal reflow. All 12 captures finish without page errors. Reading the entries leaves localStorage unchanged; URL record selection remains reading/navigation state only.

The complete record-level source list now uses a native “Sources for this record” disclosure so the phone view reaches facts sooner. Every source link is retained, as are per-fact technical/source disclosures. The sampled Nassau compact facts capture was visually inspected before the change; the refreshed captures document the final layout. No dates, fees, scope, unknowns or eligibility facts were changed.

Build/artifact invariants and all 16 design-handoff Chromium checks pass, including exam search/tab navigation and no-JavaScript navigation. The script's localStorage comparison does not independently prove absence of every possible persistence effect; the static exam enhancement contains no storage writes and does not set a global active exam.

Remaining: final comparison of the board/hero and action wording against Landing.dc.html, plus cross-browser verification. Live facts and longer source-supported scope descriptions intentionally differ from prototype fixtures.

## Coverage action and cross-browser pass

The primary record action now says “See what practice covers” and links to the existing `/practice/#covers` explanation. The full-profile link remains secondary. Its label stays “Read the full profile,” accurately describing its destination rather than suggesting it opens the visitor’s own announcement. All record/tab captures were refreshed.

Build/artifact checks pass. All 48 `design-handoff.pw.ts` checks pass across Chromium, Firefox and WebKit (16 per browser), including exam search/tab behavior, coverage-link destination, compact Library navigation, no-JavaScript navigation, page reflow and Atlas fallback. Command: `NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 node node_modules/@playwright/test/cli.js test browser-tests/design-handoff.pw.ts --workers=2`. This is functional cross-browser evidence for that file’s scope; full workflows and visual comparison are still separate gates.
