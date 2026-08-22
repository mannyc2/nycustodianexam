# R2.6 — Effect v4 Schema content compiler

This lane is the durable recovery and current-source validation of the previously
chat-only content-compiler research. It is research evidence, not application
implementation and not maintained product authority.

## Result

Adopt the boundary:

```text
Effect Schema-valid record
  !=
publication-valid corpus
```

Effect v4 Schema owns encoded/decoded record models, local invariants,
migrations, output schemas, and JSON Schema derivation. Named pure registry
passes own reference closure, provenance, audience separation, review freshness,
history, leak, and pack-closure rules. Only a `ValidatedCorpus` may reach
generators; publication promotes a manifest last.

The prior rc.110 recommendation was refreshed to the current exact coordinate,
`effect@4.0.0-rc.111` at official tag commit
`648f566dd259898e7697c7fcb796183ccbc474ab`, and was exercised under Bun
`1.3.14` in the committed private fixture.

## Navigation

- [REPORT.md](REPORT.md) — findings, evidence, limits, and recommendation
- [ENTITY-MODEL.md](ENTITY-MODEL.md) — authoring/publication entity coverage
- [SCHEMA-API-MAP.md](SCHEMA-API-MAP.md) — verified current Effect APIs
- [COMPILER-PHASES.md](COMPILER-PHASES.md) — phase boundaries and failure model
- [RELATIONAL-GATES.csv](RELATIONAL-GATES.csv) — publication gates
- [DIAGNOSTIC-CATALOG.csv](DIAGNOSTIC-CATALOG.csv) — stable diagnostic namespace
- [DETERMINISM-CONTRACT.md](DETERMINISM-CONTRACT.md) — canonical bytes and roots
- [WORKSPACE-PLACEMENT.md](WORKSPACE-PLACEMENT.md) — recommended initial placement
- [fixtures/current-v4-compiler](fixtures/current-v4-compiler) — executable proof
- [raw-results/current-v4-compiler](raw-results/current-v4-compiler) — generated evidence

## Evidence labels

`CONFIRMED` is current official declaration/source; `OBSERVED` is reproduced by
the fixture; `INFERRED` is project architecture; `UNKNOWN` and `BLOCKED` are
retained rather than converted to recommendations.
