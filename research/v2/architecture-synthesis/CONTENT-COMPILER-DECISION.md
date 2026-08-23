# Content compiler decision

## Adopted boundary

Use the recovered R2.6 design at draft PR #22/head `3ac1626`:

```text
location-aware authoring unknown
  -> Effect Schema structural decode/migrate/current encode
  -> duplicate-preserving registry
  -> explicit relational/publication gates
  -> opaque ValidatedCorpus
  -> generated page/index/pack artifacts
  -> output Schema validation
  -> canonical bytes and SHA-256
  -> stage and verify closure
  -> publish manifest last
```

`Schema-valid != publication-valid` is an architectural invariant.

## Placement

`packages/content` owns encoded/current/historical schemas, migrations,
diagnostics, pure registry gates, canonical types, and deterministic generators.
`apps/content-compiler` owns JSONC parsing/source locations, filesystem/history
access, hashing/staging/promotion, and the Bun process root.

The site consumes only generated content and narrow portable decoders. No Bun
file API or compiler publication service enters its graph.

## First implementation formats

- Human authoring candidate: JSONC parsed with exact locations.
- Generated/interchange: strict current-version JSON.
- Identity: current Schema encoded value → formal canonical JSON profile → UTF-8
  → SHA-256.
- JSON Schema: generated Draft 2020-12 authoring/interchange aid, never the
  publication authority.

Two early spikes are blocking before content scale:

1. select a location-preserving JSONC parser under Bun 1.4.0 and prove duplicate
   keys, comments, malformed input, ranges, and deterministic discovery;
2. adopt RFC 8785 or freeze a fully specified project canonical JSON profile and
   run cross-runtime number/Unicode/escaping vectors.

## Gate set

Publication runs, in stable order:

1. identity and immutable tuple uniqueness;
2. reference kind/closure;
3. retained source revision/line/digest integrity;
4. claim/fact/explanation provenance;
5. conflict/supersession history;
6. question key/options/every-option rationale coherence;
7. taxonomy/confusion direction;
8. audience/test-plan/profile/pack compatibility;
9. image/geometry/scene accessibility and nonvisual equivalence;
10. mechanical/content/rights/security/translation review freshness;
11. precommit answer-leak closure;
12. mutable-fact reference rules;
13. historical immutability/stable URL rules;
14. generated count and pack object closure;
15. final publication closure.

Diagnostics are project Schema/data with stable codes, normalized ranges,
related-record locations, safe messages, deterministic sort, and input reporting
disabled. Independent authoring errors accumulate. File/hash/history/write/publish
failures remain typed Effect failures.

## Visual inputs under proposed maintainer direction

The compiler is production-method agnostic. For Codex-generated tool or hazard
art, authoring stores:

- final accepted bytes and digest;
- asset identity/revision and generation provenance available from the tool;
- public style-reference record (released samples only);
- mechanical/content and scene semantic review;
- rights, accessibility, and security/leak reviews bound to the exact basis;
- neutral pre-answer and full post-answer descriptions;
- nonvisual equivalent;
- for hazards, exact zones/targets/decoys against final pixels.

The accepted bytes, not model regeneration, are build authority. Changing any
meaningful pixels creates a new asset/item basis and invalidates dependent
reviews/hotspots as defined by policy.

## Launch content scope

All Tier A/B concepts remain in the launch editorial universe. Compiler batches,
asset pilots, and the vertical slice order work without declaring concepts
“later.” High-level/watchlist admission remains explicit. The model supports
variable bank sizes and any independently sourced item formats without treating
one site-designed assembly as an official exam form.
