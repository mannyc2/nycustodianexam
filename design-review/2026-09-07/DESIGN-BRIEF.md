# Design reconciliation request

Continue Navigation and Exam Scope Redesign using this repository revision and
the accompanying reference export and current-page screenshots. This is a design
pass: update screen layouts, components, copy, responsive behavior, and interaction
states. Return an exported ZIP; Git access is for reading and no commits are needed
from the design agent.

## What to compare

- `reference/project/` contains the latest received editable design files. Keep
  the accepted visual direction. Older explorations in those files are historical.
- `current-screenshots/` shows what the implementation actually renders at 1280
  and 390 pixels wide, including first visit, saved work, review confirmation,
  and storage failure. These images document the current implementation; they are
  **not approved visual targets**.
- The application source is available in this same revision for understanding
  which activities and data exist. Implementation limitations should inform a
  deliberate design adjustment. An accidental layout difference in the app does
  not supersede the accepted design.

Start with the shared navigation and Practice page, then carry the result through
Home, Exams, Settings, Offline, Review, and the builder/player designs. For example,
the accepted mobile navigation uses a bottom tab bar and a Library sheet; the
implementation screenshots instead show header navigation and a popover. Identify
that as an implementation difference and preserve the accepted design.

## Confirmed product decision

There is no saved, site-wide active exam. This feature has been removed from the
requirements, not deferred. Exam pages are reference reading. Practice starts
without choosing an exam, and no global selection badge or prerequisite appears.
The current statewide and Nassau profiles use the same question bank. A setup
choice is useful only when it changes that particular activity or output.

Keep each started activity consistent when resumed, without introducing a
learner-facing exam-pinning feature.

## Remaining corrections in the received drawings

1. **Settings:** remove “your exam choice” from export, deletion-preview, and
   deletion-complete copy.
2. **Component Library:** replace the first-visit dashboard's “Start by choosing
   the exam” and “Choose your exam” action with direct practice entry. Check other
   current examples for selected-exam badges.
3. **Offline:** replace “Your exam is on this device” with “Your practice material
   is available offline.”
4. **Practice and Session Builder:** describe 45 questions as our shortest
   available practice set. Do not say the official test guide publishes that set.
5. **Home and compact copy:** name the New York Entry-Level Custodians and Janitors
   series. Do not imply that every New York or NYC custodian announcement has the
   same subjects or that the next unannounced cycle is already covered.

Use the current activity and inventory when drawing supported controls and states.
Do not invent progress statistics, scheduled reviews, or personalized question
mixes to fill space. Keep any separately proposed future functionality out of the
current screen set; global active-exam selection is removed entirely.

## Deliverable

Return one ZIP containing:

- One clearly identified current design per page, with older explorations placed
  separately so they cannot be mistaken for implementation references.
- Editable prototypes with their shared styles and exact image/icon assets.
- Desktop and mobile screenshots for the current screens, labelled with viewport
  dimensions and state. Include first visit, returning learner, unavailable saved
  work, Library open, and relevant confirmation states. Use consistent example data
  between each prototype and its screenshot.
- A short index mapping page, state, prototype, and screenshot, plus a concise list
  of visible changes and intentional differences from the current implementation.

If the design tool cannot export screenshots or a requested asset, identify that
explicitly in the return summary. Do not claim that an incomplete verification ran.

The coding agent will handle application changes, testing, Git commits, and visual
comparison after the revised design export is returned.
