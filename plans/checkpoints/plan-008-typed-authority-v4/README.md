# Plan 008 typed-authority V4 quarantine checkpoint

Status: **IN PROGRESS / REJECTED AS ACCEPTANCE EVIDENCE / NON-FINAL**

This directory preserves the exact local V4 draft bytes that existed when the
Step 5 Codex worker was stopped on 2026-08-29. It is a recovery checkpoint, not
part of the canonical Plan 008 contract, not a reviewed subject, and not an
authorization to run final integrated validation, migrate UI, deploy, or change
any plan status.

At checkpoint time, the exact authority, fixture, oracle, and validator pass the
validator's baseline `validate` mode. The frozen bundle does not pass the same
validator's `verify-bundle` mode: it rejects with `PINNED_PROOF`. Accordingly,
`plan008-typed-authority-v4-validation-proof.json`,
`plan008-typed-authority-v4-suite-report.md`, and
`plan008-typed-authority-v4-bundle.json` are transient earlier-run outputs. Their
passing counts do not prove a valid current proof tuple.

Independent Codex audits also rejected the preceding typed-authority subject for
unresolved constraint/effect semantics, incomplete transition preservation,
insufficient two-generation offline-pack modeling, incomplete correction draft
retention, and missing typed navigation/milestone closure. Those findings remain
open until a fresh immutable subject passes the canonical validator, its
mutation suite, and new independent Codex-only review lanes.

## Captured files and SHA-256

| File | SHA-256 |
| --- | --- |
| `rebuild-plan008-v4.mjs` | `20c89a9b5c672f7b3a48c8a97ebb0da33ea21c52cdf004cca56cf130daf03559` |
| `validate-plan008-typed-authority.mjs` | `4640661ec1cf058d99630de104cec3b3385771de6aba6306c80c7229b9beec26` |
| `plan008-typed-authority-v4.json` | `6d9357567b3e2f504c3cb1a9dc9e252cdd86339c6b6e0a36bc19ce0d72c05d47` |
| `plan008-typed-authority-v4-fixture.accepted.json` | `a54a3c4ea5f81a2a291b8d9180baf18260e8cfc6cb141e42065caf80abd8320c` |
| `plan008-typed-authority-v4-validator-oracle.json` | `10b7bb7ab9685d2532c49a23ec6e278b97f32009d17958427c1f8471ae63d851` |
| `plan008-typed-authority-v4-model-report.md` | `90f8caae8a66bd823fdc2fa791c0afd762e75c6947e7d485111fdc9b502ab2de` |
| `plan008-typed-authority-v4-validation-proof.json` | `ae45f042c50d84d8bbff4f1fb1f66aa905300270b5c72aad36b3c0bfbfdba916` |
| `plan008-typed-authority-v4-suite-report.md` | `eec7489d224bc0762e085469b5209564a75888feb5c06d1492c15abc12c6d27b` |
| `plan008-typed-authority-v4-bundle.json` | `f434a9f7bdfc41e6b0132d538f530b346ad966ec05d21fb49e626cb22c82285f` |

## Resume gate

Resume only from the accepted Step 2 main coordinate
`d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1`. First regenerate every derived
file from the frozen authority/validator pair without weakening the contract;
then rerun the complete negative/mutation suite and obtain fresh
independent Codex-only reviews. Steps 3 and 4 must still be accepted on `main`
before Plan 008 can leave `BLOCKED`.

No humans or human evidence were used. This is not human usability testing.
