# Recovery provenance

The original normalized E05 report is preserved in four byte-boundary parts at
`research/initial-pass/raw/effect/05-effect-v4-schema-content-registry/`. Its
README records the source file SHA-256
`f9a73928373b3f26c61f38d46bc5fc0f0e541f8b3947a3233d30072b5875646c`.

A later chat task had substantively completed the Effect v4 rewrite but did not
publish a GitHub lane. It used an older repository base and rc.110. This recovery
does not attempt to treat chat state as canonical. It uses the byte-preserved raw
report only as normalized research, re-reads current maintained authority, pins
current official source, creates the missing executable proof and lane outputs,
and publishes those results through draft PR #22.

Therefore:

- the architectural finding is recovered and independently current-checked;
- the original task's historical launch procedure is not claimed as completed;
- current GitHub files and probe outputs are the durable input to R2.90;
- any difference between old chat wording and this lane resolves in favor of the
  maintained repo and current official/observed evidence.
