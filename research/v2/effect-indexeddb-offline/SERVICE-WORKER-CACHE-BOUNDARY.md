# Service Worker / Cache Storage boundary

## Ownership rule

There is one logical authority for application state: page-side persistence in
IndexedDB. Cache Storage owns HTTP response availability, not logical pack
activation. Service Worker memory owns nothing durable.

## Service Worker responsibilities

Keep the worker small and event-scoped:
- install minimum app shell;
- activate/cache-format cleanup;
- static/immutable asset fetch policy;
- offline route fallback;
- optional message command for explicit immutable asset prefetch;
- optional cache inventory response.

Native `event.waitUntil()` and `event.respondWith()` remain lifetime authority.

## Page-side responsibilities

Effect application services own:
- manifest discovery;
- downloads/orchestration;
- digest verification;
- Schema decode;
- relational validation;
- `packInstallations`;
- content/manifests;
- active generation;
- attempts/progress/sessions;
- import/export;
- corrections.

## Cache model

Prefer content-addressed immutable asset URLs, e.g.:

```text
/assets/sha256/{hash}.svg
/assets/sha256/{hash}.webp
```

Cache names are format/version namespaces, not the logical source of active pack
state.

IndexedDB stores:
- expected asset hash;
- immutable URL;
- pack references;
- closure/verification metadata.

A pack becomes ready only after required asset closure is verified according to
manifest policy.

## No dual authority

Avoid:
- Service Worker choosing `pack-v2` while IndexedDB says `pack-v1`;
- cache presence alone meaning a pack is active;
- progress stored in Cache Storage;
- worker memory retaining installation truth across events.

If cached assets are evicted but IndexedDB remains, classify pack closure as
incomplete and restore/reinstall assets without deleting learner progress.

## Should the worker use Effect?

Default: **no** for initial implementation.

Effect in the worker becomes reasonable only if the worker itself gains
non-trivial typed routing/message/cache workflows and a measured bundle/lifecycle
tradeoff is favorable. Even then:
- construct per-event effects;
- bridge them through native event lifetime APIs;
- do not depend on forever-running fibers or module-scope mutable authority.
