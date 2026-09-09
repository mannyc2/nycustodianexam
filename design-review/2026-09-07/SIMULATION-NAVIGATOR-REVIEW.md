# Simulation navigator reconciliation

The navigator now leads with current position and recorded/unanswered/flagged
counts, uses fixed 44px item targets, and places the explicit submit confirmation
inside the navigator. The confirmation names both unanswered and flagged items;
the opening action hides while confirmation is open. Cancel returns keyboard
focus to the stable current-item link. Recorded, flagged and current styling
remain separate, and accessible item names retain every applicable state.

Existing simulation identity, immutable release references, save/retry behavior,
submission and timer state machines remain unchanged. Eight Chromium simulation
regressions pass, and the primary lifecycle test additionally verifies canceled
confirmation restores focus before reopening and submitting. Root build/artifact
checks and workspace/browser typechecks pass.

`capture-simulation-navigator.mjs` creates real simulations after downloading and
activating a verified pack. It saves three responses, flags one, moves to item
four and opens confirmation. Captures at 1008 and 384 CSS viewport widths are
indexed under `simulation-navigator-screenshots/`. The desktop navigator is
928 CSS pixels wide, matching reference 28's element width. Real fixture counts
(3 recorded, 42 unanswered, 1 flagged) differ from the reference's 41/4/3.

The separate timing panel remains outside this navigator crop, and full player,
timer/results compositions still require their final visual audit. No prototype
debugging copy about renderer identity is included in the product.
