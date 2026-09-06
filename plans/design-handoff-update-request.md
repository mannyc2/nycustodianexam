# Design handoff update request

Please update the supplied NYC Custodian handoff for the capabilities below.
Keep its established navigation, navy headers, typography, flat cards, and
component patterns. The existing main-screen designs remain the visual reference;
these requests concern specific missing states or prototype assumptions.

## Offline and Settings — priority

The Component Library includes `OfflinePackManager` and `SettingsForm` specimens,
but the bundle has no complete Offline or Settings page. Please provide desktop
and narrow-screen compositions using those components, including:

- Offline: checking saved downloads, no saved pack, available download, staged
  copy awaiting activation, active copy, retained older copy, failed verification,
  failed update with an older active copy, unavailable storage, and removal
  blocked by a session that still needs that exact copy.
- Offline controls must reflect the current sequence: download and verify,
  explicitly turn on, preview removal, then confirm removal. The current manager
  has no user-controlled pause/cancel or byte-level resumable download. Please
  revise the prototype's Pause/Cancel and automatic resume claims accordingly.
- Settings: language availability, larger text, reduced motion, export with
  optional correction drafts, import preview and confirmation, review-queue
  rebuild, and scoped deletion preview and confirmation. Startup destination and
  automatic text-equivalent preference are not currently supported. Low-data mode
  and Spanish content are unavailable.

The implementation now uses the supplied flat utility cards, compact headings,
grouped pack facts, status colors, and dashed empty state. Please settle their
page composition and the above control differences.

## Study, Review, and session setup

- Replace the prototype's 10-question default with designs for the published
  45/60/90-question practice sets, or explicitly specify a separate future
  10-question feature. Simulation timing and length are user choices; do not
  imply an official exam length.
- Show real saved attempts and finished reviews. The current dashboard has no
  scheduled review dates, confidence ratings, official-area accuracy rollups, or
  saved practice-session summary/resume model matching the prototype. Please
  provide first-visit and returning layouts using the available activity, with
  separate future designs for unsupported metrics or session controls.
- Review supports explanation links and an explicit Finish review action. Please
  settle the row containing both actions; the implementation preserves both.
  Use Ready for review with All/Missed/Flagged filters that can overlap. There is
  no due-today/tomorrow schedule or Corrected reason; unreadable saved attempts
  need a separate holdout state without invented correction or withdrawal facts.
- Session generation has no “weight missed items” option. Please supply the
  setup variant with the available area mix, length, and timing controls.

## Home, Exams, Atlas, and players

- Home's Procedures and Repair Lab destinations have no released equivalents.
  Please settle the current six-card mapping, which uses Review and printable
  study materials alongside practice, tools, hazard drills, and simulations.
- Exams has searchable reviewed announcements and study profiles. Browsing a
  record is not a durable exam pin. Please supply the variant without persistent
  Selected/Watch actions, and define how dated timeline/filing states should look
  when the catalog cannot establish current or next-cycle status.
- Atlas now contains 65 illustrated tools. Update the fixture that shows eight
  illustrations and 57 missing, retaining an unavailable-artwork variant for
  future incomplete releases.
- Current question items use text prompts; there is no per-question switch between
  illustrated and equivalent items. Hazard drills provide separate visual and
  nonvisual routes but no clear-all or flag control. Please provide these player
  variants and keep unsupported controls in explicitly future designs. Immediate
  question practice has no Mark reviewed action; Finish review belongs to the
  Review queue.

Deliver complete page/state variants at desktop and mobile widths, identify the
settled variant, and separate future functionality from the current release.
