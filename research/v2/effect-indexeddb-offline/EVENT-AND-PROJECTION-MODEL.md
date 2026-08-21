# Event and projection model

## Durable authority

`attemptEvents` is append-only authority for learner history. Materialized
progress is never more authoritative than its source events.

A minimum event records:
- `attemptId`;
- `eventSchemaVersion`;
- `sessionId`;
- item/scene identity and immutable content version;
- profile/pack version;
- mode;
- deterministic order/seed inputs;
- committed response;
- scored outcome;
- authorized timing/help state;
- concept/confusion tags used at commit time;
- `committedAt`.

Published content itself remains versioned and immutable; the event pins the
version required to interpret the historical answer.

## Projection families

`progressViews` may contain separate keys/generations for:
- question mastery;
- concept mastery;
- confusion-pair directional errors;
- next-review due state;
- review queue priority;
- session summary;
- profile-scoped aggregates.

Each projection record includes:
- `materializerVersion`;
- source event watermark/count where useful;
- projection generation;
- derived state.

## Rebuild

On materializer change:

```text
create migration job
-> scan attemptEvents in bounded key/cursor chunks
-> write new projection generation
-> checkpoint last key
-> validate aggregate/event counts
-> short transaction flips active materializer generation
-> old generation removed later
```

A crash resumes from the durable migration job. The currently active projection
generation remains usable until the new generation validates.

## Corrections

Do not rewrite old attempts to change current pedagogical interpretation.

- content/source correction => publish a new immutable content version;
- progress algorithm correction => new materializer version and rebuild;
- import repair that changes historical facts => quarantine/conflict or explicit
  corrective event, never silent overwrite.

## Import/export

Export authority:
- format version;
- app/version metadata;
- append-only attempt events;
- settings;
- optional sessions;
- required profile/content references or manifest identities;
- archive checksum.

Projection records can be included only as disposable acceleration data.

Import:
1. verify archive checksum outside transaction;
2. Schema-decode records;
3. validate version/reference graph;
4. classify duplicate attempt IDs;
5. insert valid immutable events in bounded transactions;
6. quarantine conflicting/unknown-reference rows;
7. rebuild projections;
8. atomically activate imported settings/session state when appropriate.

Same ID + same canonical payload is idempotent. Same ID + different payload is
an integrity conflict.
