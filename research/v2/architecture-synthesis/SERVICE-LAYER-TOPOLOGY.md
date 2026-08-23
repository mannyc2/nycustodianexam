# Service and Layer topology

## Service rule

A service must represent a capability with meaningful dependency, failure,
lifetime, host ownership, concurrency, or substitution semantics. Pure schemas,
state transitions, scoring, scheduling, registry gates, canonicalization, pack
closure calculation, and screen reducers remain ordinary TypeScript functions.

## Compiler capabilities

| Capability | Cohesive operations | Failure family | Implementation owner |
|---|---|---|---|
| `AuthoringFiles` | deterministic discover/read with locations | `AuthoringReadError`, `PathEscapeError`, `ParseInputError` | `apps/content-compiler` Bun adapter |
| `PublicationHistory` | load prior manifests/immutable identity tuples | `HistoryReadError`, `HistoryDecodeError` | compiler app |
| `ReleasePublisher` | stage objects, verify bytes/closure, promote manifest last | `ArtifactWriteError`, `HashError`, `PromotionError` | compiler app |

Do not create services for each compiler phase. The finite program obtains these
capabilities once, calls pure `packages/content` functions, and publishes only a
successful release candidate.

## Browser capabilities

| Capability | Cohesive operations | Failure family | Notes |
|---|---|---|---|
| private `AppDatabase` | provider-open/migration/strict transaction primitives | provider-private translated failures | never imported by screen/controller code |
| `StudyPersistence` | `commitAttempt`, load/reconcile attempt, session checkpoint, projections, export/import | `StudyStorageError` with reason variants | owns one atomic business transaction |
| `ContentRepository` | read active/pinned manifests and immutable content objects | `ContentUnavailable`, `ContentDecodeFailed` | does not activate packs |
| `PackManager` | stage/checkpoint/validate/activate/rollback/remove | `PackInstallError` reason variants | network work outside transactions |
| `SettingsRepository` | small typed preferences | `SettingsStorageError` | may be folded into persistence if no separate semantics |
| optional `CorrectionClient` | idempotent submit/status | `CorrectionSubmissionError` | absent until endpoint authorized |

The player `commitSelection` is a named Effect use case requiring
`StudyPersistence` and pure scoring inputs. It is not itself a service. Content
assembly/session algorithms take explicit data, seed, and time inputs and remain
pure.

## Renderer boundary

The renderer consumes immutable `ScreenSnapshot` and emits semantic commands:

```text
select option | commit | retry | flag | next | restore | add/remove marker
```

After render it executes explicit `FocusRequest` and `AnnouncementRequest`
effects and acknowledges them without replacing the focused node. The renderer
does not own storage, scoring, pack compatibility, or reveal permission.

High-frequency pointer/pan/zoom scratch stays renderer-local and emits a semantic
marker only at a stable interaction boundary.

## Layer roots

### `CompilerLive`

```text
AuthoringFilesBun
PublicationHistoryBun
ReleasePublisherBun
focused Bun filesystem/path/crypto capabilities
```

Executed once with `BunRuntime.runMain`. Avoid aggregate `BunServices.layer` and
its unneeded child-process authority.

### `BrowserLive`

```text
AppDatabaseProvider (private)
  -> StudyPersistenceLive
  -> ContentRepositoryLive
  -> PackManagerLive
  -> SettingsRepositoryLive
```

Construct once in one `ManagedRuntime` per application/island owner. Browser
callbacks enter this runtime; child scopes own route/island listeners and are
closed on disposal. No Layer is constructed per event/transaction.

### Service worker

No Effect root initially. Native `install`, `activate`, `fetch`, and `message`
listeners attach actual promises to `waitUntil`/`respondWith`. Introduce a small
event-bounded Effect only after complexity/bundle evidence justifies it.

### Tests

Compose small deterministic test Layers at the test boundary. Use in-memory
implementations for service/use-case unit tests, but never treat them as browser
transaction certification.

## Error architecture

- Schema issues become safe project diagnostics with stable codes and locations.
- Expected operational/domain failures use Schema-tagged errors, normally with a
  stable `reason` variant and safe public message.
- Host/provider exceptions are translated once at adapter boundaries while the
  underlying cause remains available to local restricted diagnostics.
- Expected absence uses Option or an explicit state, not an exception.
- Interruption is preserved; it is not mapped to “rollback succeeded.”
- Impossible invariant violations are defects and fail tests/builds loudly.
- Error responses/telemetry never include question text, choices, rationales,
  source excerpts, free-form correction text, or secure leaked values.
