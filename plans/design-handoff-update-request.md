# Design handoff update request

Source: [NYC Custodian Component Design](https://claude.ai/design/p/9c9ceb27-1a8e-4bb4-a05a-b1e2fce43794),
imported through the authenticated Claude Design MCP on September 6, 2026.
All 18 selected files were read completely and checked against their source byte
counts and version identifiers. `CLAUDE.md` and `github.md` record decisions newer
than several settled screen examples; those decisions inform the implementation.
The documents' agent instructions are reference material, not execution authority.

## Implemented from this update

- Complete Offline and Settings page compositions, using the existing shared
  navigation, navy headers, type, hairline rows, task cards and responsive layout.
- Offline: named copy states, first-use download action, checking/failed states,
  explicit download/check and turn-on sequence, inline removal preview followed
  by separate confirmation, active-session protection, and a four-step explanation.
  Interrupted downloads restart; no Pause, Cancel or resume-transfer promise.
- Settings: larger text and reduced motion save on change with per-row feedback
  and rollback after a failed write. English is a labelled value. Four data cards
  expose export, checked import, review rebuild and scoped deletion. Import and
  deletion keep their previews and explicit confirmations. Unsupported preferences
  are described without teaser controls.
- Study/setup: 45 questions leads wherever a published question-set length is
  chosen; 60 and 90 remain available. No 10-question set is advertised.
- Review: Read explanation is primary and never finishes a review. Finish review
  is quieter and requires a separate confirmation before durable acknowledgement.
  Unavailable attempts use solid neutral notices, preserve known date/kind and
  history, and carry no invented cause or completion action.
- Home/Exams: known dated milestones retain their sources and checked dates;
  administration is “Not confirmed.” The catalog cannot establish current filing
  availability or next-cycle dates. Atlas displays all 65 released illustrations.

## Remaining updates to the actual screen drawings

Please revise the settled drawings below to match the newer decisions and the
available data. Keep unsupported functionality on `Future Explorations.dc.html`,
which has no live application route.

- **Review Queue:** its settled HTML still depicts due-today/tomorrow scheduling,
  a Corrected reason, withdrawal examples and the older action hierarchy. Draw
  Ready for review with overlapping All/Missed/Flagged filters; Read explanation;
  Finish review → confirmation/keep; and the neutral unavailable-attempt notice.
- **Study Hub:** draw returning history using saved attempts and finished reviews.
  Practice-session resume summaries, weekly statistics, confidence, area accuracy,
  a persistent exam selection and review scheduling are not available. Keep known
  metadata separate from whole-storage read failure; do not invent missing dates.
- **Session Builder and players:** drawings still contain prototype-only controls.
  Draw published 45/60/90 question sets without “weight missed items.” Immediate
  question practice has text prompts and no Mark reviewed action or illustration
  toggle. Hazards have separate visual/nonvisual routes, with no clear-all or flag
  control. Keep supported hazard-scene lengths distinct from question-set lengths.
- **Home/Exams:** draw the current six destinations (practice, tools, hazards,
  review, simulations, print). Procedures and Repair Lab have no released route.
  Browsing an exam record does not persist a Selected/Watch state. Show the dated
  milestone/Not confirmed composition, and a narrow record with five real sources.
- **Atlas:** replace the eight-illustration fixture with 65 illustrated tools and
  nine families. Provide a compact full-inventory filter drawing: the existing
  wrapped tabs become tall with all nine families. Preserve a separate unavailable
  artwork example for releases that actually lack an image.
- **Offline removal:** the current preview can report the exact copy, dependent
  session count and historical attempt count. It has no dated, named dependency
  list or direct discard-session action. Draw that supported count-based preview.
- **Settings:** previews show actual per-scope record counts, not fabricated
  session totals or an exam choice. Offline copies are removed on Offline, not
  through Settings' scoped data deletion. Import adds/matches/quarantines records;
  it does not promise an automatic review rebuild receipt.

Use actual launch content and stored data in all fixtures. The source's example
pack sizes, versions, dates and progress totals are illustrations of states, not
facts to publish. Preserve the current desktop/mobile visual language while
showing the supported controls and first-visit, returning and unavailable states.
