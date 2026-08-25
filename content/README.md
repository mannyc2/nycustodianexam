# Content corpus

This directory contains authored content records, visual-production evidence,
accepted raster masters, and deterministic delivery derivatives. Content is
reviewed input to the compiler; generated site output remains ignored.

## Binary storage decision

The initial visual release is stored in ordinary Git rather than Git LFS.
Every current binary is at most 9.8 MB, the repository has no existing LFS
contract, and adding LFS would introduce a separate quota and availability
dependency before the first durable release. Git also stores byte-identical
candidate/master promotions as one object even when two tracked paths refer to
the same bytes.

Track:

- exact generated candidates needed by the maintained lineage;
- immutable accepted masters;
- deterministic web, phone, and print derivatives;
- review artifacts, source/reference coordinates, release records, and
  checksums needed to audit an acceptance decision.

Do not track:

- generated `apps/site` output or compiler staging releases;
- dependency installations, caches, or temporary conversion output;
- review-only material in learner-facing packs; or
- regenerated copies whose bytes and role are already represented by a
  canonical tracked artifact.

Revisit the storage decision before the next large raster tranche or if a
single artifact, hosting policy, clone cost, or review workflow makes ordinary
Git unsuitable. Changing storage must preserve immutable hashes and historical
release coordinates; it must not rewrite accepted pixels or published history.

## Authority and publication

`authoring/` records why an asset or item exists and how it was reviewed.
`assets/masters/` holds accepted visual source bytes. `assets/derivatives/`
holds deterministic delivery forms. Release manifests and receipts bind these
paths to exact checksums.

The launch pack authoring boundary and regeneration workflow are documented in
[`authoring/packs/README.md`](authoring/packs/README.md). Human-reviewed
instructional text lives in the curated module; the builder only joins,
formats, and validates it against accepted inventories and release ledgers.

Candidate prompts, rejected attempts, overlays, full descriptions, answer
regions, and other answer-bearing review data never enter pre-answer learner
packs merely because they are tracked here.
