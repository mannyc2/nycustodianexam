# Plan 008 typed authority projection — portable executable closure

Status: LOCAL VALIDATION PASS — AUDIT CANDIDATE. This is not an independent acceptance. Review mode is CODEX-only; human evidence is none; human participant count is 0; not-human-usability-tested is true.

## Path-independent invocation

Program `node`; working directory `discovered-git-root`; arguments `<validator> suite --authority <authority> --fixture <accepted-fixture> --oracle <validator-oracle> --proof-out <proof> --report-out <report> --bundle-out <bundle>`.

Observed result: `accept`; exit `0`. Baseline accepted; 21/21 positives accepted; 69/69 mutations, 13/13 spawned CLI attacks, and 3/3 safe-path attacks rejected as expected. Atomic staged writes reopened with matching hashes.

## Immutable bindings

- Authority SHA-256: `fd86e3d2687445a826ce3f024d36de1d7817c651abb1c6ef5d4915bf42d69382`.
- Accepted fixture SHA-256: `edf49a4c22bd0ed2944b52998c4e130fb253b3396f60860a256f2eb1aa5f6a68`.
- Validator-owned oracle SHA-256: `3fdf16b2dce61a22405415237b95aeec9013660d9ae699a867c81af126907fbe`.
- Validation proof SHA-256: `ae45f042c50d84d8bbff4f1fb1f66aa905300270b5c72aad36b3c0bfbfdba916`.
- The canonical parent manifest binds the standalone validator independently, avoiding a validator/proof hash cycle.

## Derived typed closure

Routes 36 (32+4); dimensions 6; constraints 18 (9+9); machines 10; states 92; actions 55; events 58; outcomes 22; edges 165; interpretations 30. Counts were derived during validation.

## Repaired trust and semantic closure

- Sources contain Git-root-relative paths only. The validator discovers the Git root, rejects traversal/absolute/symlink escape, and derives every clause range, slice, text, hash, kind, and route-family compatibility from exact source bytes.
- Validator-owned pins prevent a co-edited fixture/hash/root/count from blessing changed authority. All authority objects are fail-closed by an immutable structural-shape root, with explicit tagged-union and transition-channel checks.
- Superseded, retired, and corrected reference states remain availability-ready and distinct from withdrawn, with exact route-specific construction edges.
- Question, hazard, and simulation failures/retries retain the required neutral draft/session identities and fields. Confirmation presentation/dismissal has deterministic state resolution.
- Every invalid-combination operand resolves through the canonical snapshot schema; all nine constraints execute against legal/forbidden witnesses, states, and transition targets.
- Post-render focus and announcement effects use a closed semantic-target union with effect IDs, after-render ordering, hidden-answer suppression, and exactly-once acknowledgement.
- Offline pack update, verify, quarantine, failure, and activation retain distinct prior-active and candidate generations until atomic promotion.
- The selected navigation program preserves all 11 ordered rules and evidence qualifications; M0-M5 and every route assignment are source-derived.
- Plain state targets are legal on every emitting route, navigation outcomes cover every emitter domain, journey count derives from unique J01-J08, and implementation drift derives from exact live registry bytes.

## Remaining limitations

- Several source arrows omit provider-level action names or guard predicates; curated names remain interpretation records rather than quoted source wording.
- The retained stale-print safety predicate remains unspecified and therefore guarded/disabled without implementation evidence.
- Review-queue rebuild delegates ownership to Settings; exact UI composition remains an implementation choice.

No human session, deployment, network write, or repository edit was performed.
