# R2.6 recovery final receipt

## Publication identity

- Repository: `mannyc2/nycustodianexam`
- Recovery base: `main` at
  `d94981c62e3834177f0db9bc387b2c601c40636b`
- Output branch: `research/v2-effect-schema-compiler`
- Draft PR: <https://github.com/mannyc2/nycustodianexam/pull/22>
- Allowed root: `research/v2/effect-schema-compiler/**`
- Initial receipt commit:
  `f6f1f691adf0eaef63d0ba22b0737847e7e1aeaf`
- Substantive recovery/fixture commit:
  `61a8936`
- Final receipt/manifest commit: the PR head containing this receipt and
  `MANIFEST.sha256`; a commit cannot embed its own SHA.
- Force push: none
- Merge: none

## Historical scope

This is a current-main recovery of completed-but-chat-only R2.6 research. The
original prompt's immutable SHA placeholder was never populated, so this receipt
does not assert retroactive compliance with that historical launch contract. It
does establish a durable, current-source-checked R2.6 input for R2.90.

## Exact coordinates

- Effect: `4.0.0-rc.111`
- `@effect/vitest`: `4.0.0-rc.111`
- Effect official tag commit:
  `648f566dd259898e7697c7fcb796183ccbc474ab`
- Bun: `1.3.14` (`0d9b296a`)
- TypeScript: `5.9.2`
- Vitest: `4.1.10`
- `@types/bun`: `1.3.14`

## Verification

Executed in the committed private fixture:

```text
bun install                 PASS; real bun.lock generated
bun run typecheck           PASS
bun run test                PASS; 4 tests
bun run probe               PASS; 4 fixture corpora
repeat probe/hash compare   PASS; every generated JSON file identical
```

The complete installed `node_modules/effect/AGENTS.md` (394 lines), the official
source mirror guidance, relevant Schema guide sections, implementation source,
and tests were read before final code-level conclusions.

Observed valid-corpus identities:

- content object:
  `sha256:9a429bd1716ce9d95bc856a29015f2305db53a303aa107595fe7d4080e0aae3f`
- release root:
  `sha256:200597dfa7beb682608a882fc438d0165311c473770971e8fcf3d1f873e5d15f`

Fixtures cover valid content, all-error structural invalidity, multiple
independent relational failures, not-published facts, conflicting facts,
superseded facts, reviewed translation, inaccessible imagery, and entry/high-
level scope incompatibility.

## Conclusion

Adopt the structural Schema / explicit relational-gate boundary. Use Effect for
compiler I/O and typed operational failures, keep deterministic gates/generators
pure, encode before canonicalization, validate generated outputs, and promote the
release manifest last. Start with a thin Bun compiler app and extract one shared
content package only when the site is a real second consumer.

`MANIFEST.sha256` covers every tracked lane file except itself using repository-
relative paths.
