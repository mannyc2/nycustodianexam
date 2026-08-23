# UI and renderer decision

## First-slice choice

Use semantic static HTML plus a lazy direct-DOM interactive island. Keep one
renderer-neutral state machine/controller and one browser `ManagedRuntime`. Do
not use Effect as a renderer and do not adopt Atom/reactivity in the first slice.

## State ownership

1. immutable content packs and durable IndexedDB state;
2. Effect workflow/lifecycle/failure/cancellation state;
3. immutable renderer-neutral `ScreenSnapshot` and semantic commands;
4. renderer-local high-frequency interaction scratch;
5. DOM/focus/live-region/selection/viewport effects.

Selected-but-uncommitted answer is screen/draft state, not an attempt. Revealed
answer state is impossible until durable commit or same-ID reconciliation.

## Direct DOM discipline

- use native controls, labels, headings, lists, regions, dialogs, and forms;
- centralize bounded patch/render functions;
- attach/dispose listeners and observers under the island owner;
- render first, resolve the current target node, then focus/announce;
- acknowledge semantic focus/live-region requests without replacing the focused
  node;
- never put key/rationale/full naming descriptions in the precommit DOM,
  accessibility tree, asset filenames, manifests, SVG/GLB metadata, or bundles.

High-frequency hazard pointer movement, capture, pan/zoom velocity, and layout
measurement stay local. Stable marker additions/removals become semantic commands.

## Escalation candidate

Run a matched `lit-html` spike if any trigger occurs:

- generic diffing/dependency tracking begins to appear;
- conditional/keyed list reconciliation produces repeated defects;
- listener/focus cleanup is no longer locally obvious;
- a project-owned component lifecycle or event framework emerges;
- accessibility primitives are being reimplemented;
- the same interaction is materially clearer/smaller in the matched candidate.

Compare identical behavior and Vite route closure. Adopt lit only if it reduces
state/defects at acceptable cost. Evaluate Solid next only for demonstrated
fine-grained/high-complexity needs. Preact/React/Vue remain non-default without a
concrete ecosystem/team requirement.

## Atom/reactivity

`effect/unstable/reactivity` and Atom integrations are isolated optional adapters,
not durable state, renderer selection criteria, or a universal store. Introduce
only for a measured multi-consumer projection/query need and contract-test every
Effect cohort update.

## Visual player consequence

The renderer displays the exact accepted immutable image view. Tool images may be
Codex-generated and style-matched to public released samples after the separate
policy reconciliation. Hazard markers use human-authored normalized regions
against final pixels; no runtime computer vision or image generation is needed.
Visual and nonvisual formats report separately while testing the same supported
concepts.
