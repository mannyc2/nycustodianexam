# Simulation player, timer and results review

Reviewed the production build at implementation commit `622c6bb`, using Chromium
at 1008 and 384 CSS viewport widths. `capture-simulation-flow.mjs` installs and
activates a real verified offline pack, creates a timed 45-question simulation,
records three answers, flags item two and advances to item four. It captures the
player, hidden timer, results introduction, first answer explanation and an
unanswered result. Ten images and the assertion manifest are retained in
`simulation-flow-screenshots/`.

The desktop player has readable bounded question content, full-width answer
controls and a separate navigator/timing panel. At 384px these sections stack;
answer text, navigator states, timer copy and result explanations remain within
the content bounds. The results heading receives focus after submission. The
heading's visible focus outline in the screenshots is intentional. Result cards
retain explicit selected/correct answers, rationales, source disclosure and next
actions; unanswered items say “No answer” and remain distinguishable from
incorrect selections. The mobile results screenshot is a viewport capture, so
the fixed bottom navigation and the continuation below the viewport are expected.

The script additionally verifies hidden timer visibility survives reload, all 45
results survive reload, the summary remains three answered/42 unanswered, result
navigation focuses the selected item heading, and a flag remains attached to its
saved result. Both widths completed without page errors or results document
overflow. The captures show a short automated session; elapsed time is not evidence
of a two-hour timer run.

All 24 non-Cloudflare Simulation browser regressions passed (eight each in
Chromium, Firefox and WebKit). They cover deterministic capacity, restored edits,
commit-before-feedback, pinned release retirement, retained visual and keyboard
hazard results, unavailable offline prerequisites, failed writes with exact retry,
timer visibility/expiration, explicit auto-submit opt-in and length replacement.
Command: `NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 node
node_modules/@playwright/test/cli.js test simulation.pw.ts --workers=2`, from
`apps/site`. The Static Assets-specific test is excluded by the standard preview
configuration and is not certified by this run.

The accepted export supplies a navigator and setup reference, not a dedicated full
Simulation results mockup. Navigator matching remains documented in
`SIMULATION-NAVIGATOR-REVIEW.md`; this review establishes readable composition and
real behavior rather than claiming a nonexistent exact results reference. Full
hazard-simulation visual captures and the final integrated design audit remain.
No product code changed in this verification checkpoint.
