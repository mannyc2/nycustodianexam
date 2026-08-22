# False Portability

## Definition

False portability occurs when two runtimes expose values with similar names or TypeScript shapes, and the application wraps them behind one interface that promises semantics neither provider shares.

A useful project service normalizes a product capability. It does not erase provider lifetime, atomicity, ordering, consistency, cancellation, quota, or security differences.

## Cases that must remain distinct

| Similar surface | Why it is not one portable capability | Safe shared layer |
|---|---|---|
| Browser Cache Storage vs Cloudflare Cache API | Browser origin storage, Service Worker lifetime and eviction differ from Cloudflare edge cache placement, replication, keys and limits | Product cache-key rules and immutable object metadata only |
| Browser IndexedDB vs D1 | Client transaction/autocommit/upgrade/multi-tab semantics differ from server SQL and request lifetime | Product store/use-case contract and Schema models |
| Browser IndexedDB vs KV | IndexedDB supports structured transactions; KV is usually eventually consistent key/value storage with different limits | Read-through cache contract only if consistency is explicit |
| Service Worker `fetch` vs Cloudflare `fetch` | Browser event uses `respondWith` and can be terminated; Cloudflare module handler receives `env`/`ctx` in an isolate | Pure request routing rules and response schemas |
| Browser dedicated Worker vs Service Worker vs Cloudflare Worker | Thread/process, message protocol, lifecycle and authority are unrelated despite the word Worker | Pure message data or use-case protocol where real |
| Bun filesystem vs browser File System Access | Host filesystem paths/permissions/atomic rename differ from user-mediated browser handles | Content object model and pure path-independent transformations |
| `URL` vs filesystem path | Both are strings/segments but encoding, root, separators and resolution differ | Explicit conversion at a reviewed boundary only |
| Browser WebSocket client vs Cloudflare upgrade/server WebSocket | Connection establishment, upgrade, close, hibernation and server ownership differ | Typed application message schema |
| Browser `navigator.onLine` vs origin reachability | Browser heuristic can be true while the origin is unreachable | UI hint only; actual operation remains authority |
| AbortSignal across providers | Signal notification shape may be shared, but underlying fetch/storage/queue cancellation and rollback differ | Request-scoped interruption request plus idempotent reconciliation |
| Crypto across runtimes | Algorithm names may match, but key handling, entropy provider, FIPS/policy and error behavior can differ | Explicit checksum/ID policy with provider tests |
| Streams across runtimes | Web stream shape is shared, but execution context, backpressure limits and resource lifetime differ | Byte/chunk protocol and boundary conversions |
| Clock/time | Wall clock, monotonic clock, test clock and platform suspension have different semantics | Effect Clock/DateTime for domain time; native performance clock for measurement |

## Cases where a project service adds real value

### `ContentIntegrity`

Adds:

- canonical byte representation;
- allowed digest algorithm;
- typed mismatch error;
- source/object identity in diagnostics;
- injectable test provider.

It does not pretend browser and Bun crypto providers are identical internally.

### `ProgressStore`

Adds:

- append-attempt plus materialized progress transaction;
- idempotency key;
- commit-before-reveal result;
- typed recoverable/ambiguous failures;
- reconciliation operation.

It does not expose generic `get`, `put`, or provider query builders.

### `ContentPackStore`

Adds:

- quarantine;
- checksum verification state;
- atomic activation;
- active-session version pinning;
- recovery to previous valid version.

It may use IndexedDB plus Cache Storage, preserving the difference between authoritative metadata and cached bytes.

### `CorrectionRepository`

Adds:

- idempotent correction identity;
- validated envelope;
- duplicate/conflict semantics;
- moderation status if later required.

A D1/KV/queue implementation retains its provider-specific consistency and error detail.

## Cases where a service merely renames a value

Avoid services such as:

```text
UrlService.make(string)
HeadersService.set(headers, name, value)
BlobService.make(parts)
RequestService.method(request)
OnlineService.currentBoolean()
DomClickService.addListener(element, handler)
```

These add no meaningful failure, lifecycle, resource, substitution, or policy semantics. They increase indirection and bundle/type surface while hiding the platform contract.

## Cancellation language

Allowed:

- "interruption requested AbortController.abort";
- "the active IndexedDB transaction was aborted";
- "the caller stopped waiting";
- "the provider reported completion";
- "the outcome is ambiguous and was reconciled by idempotency key."

Rejected:

- "Effect cancellation rolled back the request" without provider proof;
- "the server stopped" because the client disconnected;
- "the database write was canceled" when completion was not observed;
- "portable cancellation" as a blanket capability.

## Portability decision rule

Create a shared service only if at least one is true:

- the product contract has stable domain semantics across providers;
- callers need typed failure translation;
- resource ownership and Scope are meaningful;
- tests need substitution of one cohesive dependency;
- runtime implementations can honor the same minimum guarantee without lying.

Otherwise use the native API at the owning runtime boundary.
