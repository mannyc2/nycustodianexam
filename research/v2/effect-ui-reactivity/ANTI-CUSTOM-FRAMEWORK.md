# Anti-custom-framework guardrails

Direct DOM is acceptable only while it remains direct DOM.

## Virtual DOM or diffing warning signs

- creating generic node-description objects;
- comparing previous and next trees;
- maintaining keyed child reconciliation infrastructure;
- generic patch operations such as insert/move/remove/set-prop;
- caching arbitrary DOM subtrees to emulate components.

Use a maintained declarative renderer instead.

## Reactive dependency tracking warning signs

- recording which state fields a render function reads;
- constructing signals/memos/effects as project infrastructure;
- automatically rerunning writers when dependencies change;
- custom batching, transaction, or scheduler semantics.

Do not reimplement Atom, Solid, Vue, or another reactive runtime.

## Component lifecycle warning signs

- generic mount/update/unmount hooks;
- a registry of component instances;
- inherited context/provider mechanics;
- custom error boundaries or suspense behavior;
- hidden ownership of listeners, observers, or timers.

Use explicit island setup/teardown or a maintained renderer.

## Event framework warning signs

- application-wide action strings and generic dispatch tables for DOM events;
- synthetic event normalization;
- a custom event propagation layer;
- listeners retained independently of the island Scope.

A small listener on a bounded root is fine. A reusable event runtime is not.

## Form and accessibility warning signs

- custom radios, checkboxes, buttons, listboxes, dialogs, or keyboard navigation when native semantics fit;
- manually emulating disabled, checked, selected, or required behavior;
- hidden correctness/rationale in ARIA or offscreen DOM before commitment;
- focus movement embedded in domain logic;
- a home-grown live-region queue used across unrelated components.

Prefer native controls and explicit renderer adapters. Use established accessibility primitives only when native semantics are insufficient.

## Review checklist

Reject a direct-DOM change when the answer to any question is yes:

- Does it invent a reusable renderer abstraction rather than update this island?
- Does it derive application truth by reading the DOM?
- Does it make a DOM property authoritative in Ref/Atom?
- Does it create a runtime, Layer, registry, or subscription per event?
- Does it obscure cleanup or survive route disposal unintentionally?
- Could it expose answer data before the durable commit gate?
- Is a maintained renderer already solving the exact infrastructure being added?
