# Integrated validation checkpoint — September 9, 2026

The complete root `bun run verify` command passed after the corrections below.
Toolchain: Bun 1.4.0, Node 22.22.0. The command required an unrestricted subprocess
for read-only historical Git blob access; the sandboxed first attempt failed
with EPERM in that final validator.

- Maintained layout: 283 files checked.
- Module boundaries: 143 modules checked.
- Production certification record: valid and explicitly blocked, not certified.
- Illustration release: 65 tools, 14 comparisons, 18 scenes, 396 hash-verified artifacts.
- All five workspace typechecks and browser typecheck passed.
- Tests: content 103, correction intake 3, content compiler 15, correction Worker 8,
  site 333; total 462 passed.
- Production build: 1,352 canonical documents and 59 safe shell URLs.
- Artifact invariants: 224 item-scoped artifacts, 291 byte-identical assets,
  answer-free shell, and all island budgets pass.
- Historical Codex UI/UX packet: four reviews, 41 source artifacts, 19 promoted
  rules, seven unresolved rules, 61 mutation checks; no human-testing claim.

The first layout run found five React files outside a `react` directory and one
browser helper lacking the required `-fixtures` suffix. Practice builder/render
entry points now live in `practice/react`; the shared question illustration lives
in `question-player/react`; imports and the generated Hazard entry URL were
updated. The offline-origin browser fixture was renamed. All 42 relevant
Practice/Hazard builder and question-illustration browser checks passed across
Chromium/Firefox/WebKit after the moves.

The site registry test expected an older two-release total. It now verifies the
exact coordinate set for all retained v3/v4/v5 question and visual/nonvisual hazard
receipts (380 entries), preserving the pre-answer leakage checks.

The old Codex-only evaluation validator required current product projections to
remain byte-identical to its earlier packet, conflicting with the later accepted
design handoff. It now accepts an explicit `--packet-commit <full SHA>` option;
the root command uses the completed packet at
`4130693dee6caaa804a116f490b2192861f53e6e`. All packet reads, source hashes, rule
closures and mutation checks run against that immutable snapshot. Default CLI
behavior still validates the working packet. Output explicitly says this is
historical evidence, not verification of the current implementation. The original
packet's source and immutable bytes were not edited.

Remaining: full-family browser sweep, remaining print-product PDF refresh,
terminal/correction workerd gates, evidence-index reconciliation, and reviewable
publication. Manual AT/device/physical-printer checks remain uncertified. A green
root command alone does not close these separate requirements.
