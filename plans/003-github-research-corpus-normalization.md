# Plan 003: Normalize and reduce the research corpus through connected @GitHub

## Launch prompt

You are performing an aggressive, maintainer-reviewed cleanup of the repository
research corpus after visual production is merged. This is not a light wording
pass. Normalize structure, consolidate overlapping conclusions, deduplicate
content, delete obsolete/raw/generated material, and repair every affected
reference.

Your literal first tool call must use the connected @GitHub capability. The
launch message must provide the exact post-visual main SHA. Do not substitute a
moving branch head or the old planning SHA.

## Required launch inputs

- Repository: mannyc2/nycustodianexam
- Source branch: main
- Required source SHA: POST_VISUAL_MAIN_SHA
- Required visual prerequisites: merged tool-library and hazard-bank heads or
  receipts
- Output branch: maintenance/research-corpus-normalization
- Draft PR base: main

STOP if the exact SHA or visual prerequisite coordinates are absent.

## Mandatory GitHub-first checkpoint

The literal first tool call must use @GitHub to:

1. resolve main and verify it equals the supplied post-visual SHA;
2. verify both visual prerequisites are reachable from that SHA;
3. verify maintenance/research-corpus-normalization does not exist;
4. inventory research paths from GitHub rather than trusting a stale checkout.

Stop on drift, a pre-existing output branch, missing prerequisites, or
unavailable GitHub read/write access.

Then create the output branch from the exact SHA. Open a draft PR as soon as the
first truthful normalization commit exists. Put the evolving inventory,
classification totals, deletion rationale, and verification evidence in the PR
description instead of adding another directory of START/FINAL receipts to
research.

Never force-push and do not merge the PR.

## Baseline to verify

At planning time the Git tree has:

- 439 tracked files under research;
- 385 tracked files under research/v2;
- about 3.9 MB of tracked research;
- a roughly 2.3 MB recovered-input ZIP;
- 11 R2 directories plus initial-pass, prompt-curation, and one-off reports;
- repeated receipts, raw results, environment dumps, temporary links,
  generated fixture output, superseded launch guidance, and overlapping
  conclusions.

Known exact-content duplicate groups include:

- effect-ui-reactivity/raw-results/payload-measure-command.txt and
  payload-measurements.json;
- three identical bundle-lab application README files;
- tool-geometry-audit/raw-results/toolchain-smoke.json and toolchain-smoke.log;
- effect-platform-runtimes browser-runtime-probe.json and its stdout copy;
- two empty platform-runtime stderr files.

These are examples, not the full semantic-duplication audit.

## Desired end state

The research tree should become a small navigable set of unique, still-useful
research notes. Current product truth should live in maintained docs and
policies, not be duplicated across research reports. Historical detail should
remain recoverable from Git at the supplied pre-cleanup SHA rather than copied
into a new archive directory.

The final research/README.md must:

- explain what belongs in research and what does not;
- link every retained research file or retained subdirectory;
- identify the pre-cleanup SHA as the historical archive coordinate;
- map deleted research families to their current canonical docs or concise
  retained synthesis;
- clearly label unresolved research versus accepted historical conclusions;
- state that committing research does not make it product authority.

Do not create research/archive, research/legacy, or another receipts folder.
Moving clutter into a different directory is not normalization.

## Allowed scope

Primary mutation scope:

- research/**

Reference-repair and conclusion-promotion scope:

- README.md
- AGENTS.md
- CONTRIBUTING.md
- docs/README.md
- docs/OPEN.md
- product/README.md
- product/ARCHITECTURE_CONSTRAINTS.md
- recovery/CORPUS_RECOVERY.md
- illustration/README.md
- illustration/TOOL_GEOMETRY_PIPELINE.md
- prompts/research-v2/**
- content/authoring/visuals/inventory/**, only to replace references to research
  inputs being removed with the retained canonical inventory-provenance record

Outside-primary files may change only to absorb a unique accepted conclusion,
remove obsolete launch instructions, repair references to removed research
paths, or state the historical SHA. Do not turn this into an application,
taxonomy, policy, or product-feature rewrite.

Explicitly out of scope:

- accepted visual bytes and production manifests;
- docs/FACTBASE.md, docs/SCOPE.md, and docs/TAXONOMY.md exam truth;
- illustration/VISUAL_AUTHORING_POLICY.md;
- product/FEATURE_SPEC.md;
- application/workspace/compiler implementation;
- Git history rewriting;
- branch settings, issue changes, or merging the draft PR.

## Step 1: Inventory and classify every tracked research file

Read every tracked research file and relevant inbound reference. Create a
working ledger with one row per path and one disposition:

- KEEP: unique, current-useful evidence that is not canonical elsewhere;
- CONSOLIDATE: unique material to merge into one retained synthesis or
  maintained doc before deletion;
- DELETE-EXACT-DUPLICATE;
- DELETE-SUPERSEDED;
- DELETE-RAW-NOISE;
- DELETE-GENERATED;
- DELETE-ARCHIVE;
- DELETE-EMPTY;
- MOVE: only when a retained file has a clearer canonical location.

For every KEEP or CONSOLIDATE decision record the canonical consumer and why Git
history alone is insufficient. For every deletion record the old path, reason,
replacement/current authority if any, and pre-cleanup SHA.

Use content hashes for exact duplicates and claim-level comparison for semantic
duplicates. Same filename does not imply sameness; different filenames do not
imply unique value.

## Step 2: Promote unique conclusions before deleting evidence

Where a research file contains an accepted conclusion not represented in a
maintained document, move the concise conclusion—not the entire research
narrative—into the correct allowed maintained file with its source basis and
status.

Do not duplicate current conclusions into both research and maintained docs.
Do not promote provisional measurements or abandoned options into policy.
Unresolved items that still matter should be stated once in the appropriate
current open-questions surface.

## Step 3: Consolidate retained research

Collapse overlapping initial-pass, prompt-curation, individual R2, and R2.90
material around topics rather than around historical agent lanes. Prefer a few
concise syntheses with clear status and links to canonical maintained docs.

The default is to delete:

- START/FINAL receipts whose only purpose was proving an already-merged lane;
- temporary download-link files and GitHub publication-attempt logs;
- command stdout/stderr copies, environment dumps, empty files, and duplicate
  result formats when a concise result is retained;
- generated dist files, source maps, install artifacts, and fixture output;
- obsolete launch-readiness and prompt-curation status;
- first-pass raw reports fully superseded by later synthesis;
- redundant matrices, ledgers, and reports expressing the same conclusion;
- completed experimental fixtures that are not referenced by an active
  reproducibility contract;
- the recovered-input ZIP after any uniquely required checksums, rights facts,
  and inventory evidence are preserved concisely.

Before deleting the recovered tool-geometry ZIP, verify that the exact 65-row
taxonomy inventory member, source ZIP checksum, internal member path, and
observation date are retained under
`content/authoring/visuals/inventory/`. Repoint maintained inventory records to
that retained provenance artifact. Do not make a production inventory depend on
a historical archive that this plan removes.

Exceptions require a path-specific justification in the PR description.

Do not use a file-count quota as a substitute for judgment. However, if more
than 100 tracked research files remain, explain in the PR why the corpus still
needs that much granularity and why each retained directory cannot be
consolidated further.

## Step 4: Delete and repair

Delete classified material from the current tree. Git history at the exact
pre-cleanup SHA is the recovery mechanism.

Repair all inbound Markdown links, prose path references, manifests, and
navigation. Historical prompts may point to the pre-cleanup SHA when their
original inputs no longer exist at HEAD; they must not masquerade as runnable
current launch instructions.

Do not preserve a dead path merely because another stale file mentions it.
Normalize or delete both sides.

## Step 5: Verify the reduced corpus

The final branch must satisfy:

- no exact-content duplicate groups remain among tracked research files unless
  the PR documents a compelling format requirement;
- no tracked empty files, generated install/build output, recovered archives,
  temporary download links, or redundant stdout/stderr copies remain;
- every retained research path is reachable from research/README.md;
- every deleted research path referenced outside research is repaired or
  intentionally historical with an immutable SHA;
- one current canonical home exists for each accepted conclusion;
- git diff --check passes;
- the visual corpus and protected exam/policy files are unchanged.

Record before/after file counts and bytes, exact-duplicate counts, deleted and
consolidated totals, remaining unresolved research, and link-check results in
the draft PR description.

Useful checks:

    git ls-files research | wc -l

    git ls-files -z research | xargs -0 sha256sum | sort

    rg -n 'research/' --glob '!research/**' .

    git diff --check

## Local ignored-workspace cleanup

GitHub cannot remove ignored local files. If execution also occurs in the
current named workspace, verify this exact directory is ignored and
reproducible:

    research/v2/effect-schema-compiler/fixtures/current-v4-compiler/node_modules

At planning time it is about 152 MB and 3,859 files. After verification, delete
only that exact node_modules directory. Do not run a broad git clean or delete
any other untracked path. Report that this workspace-only deletion is
recoverable by reinstalling the fixture dependencies.

## Done criteria

- Every originally tracked research file has a recorded disposition.
- Unique accepted conclusions survive once in a canonical current location.
- Duplicate, superseded, raw-noise, generated, empty, and archival-only files
  are removed from HEAD.
- The recovered ZIP is absent unless the PR contains a specific approved reason
  to retain it.
- research/README.md is the complete map of the reduced corpus.
- No broken or misleading references to removed research remain.
- The draft PR shows a material reduction with before/after evidence.
- Git history is untouched and the PR remains unmerged for maintainer review.

## STOP conditions

Stop and request maintainer direction if:

- source main differs from the exact supplied SHA;
- a deletion would remove the only known support for current exam truth,
  licensing, rights, or an accepted safety claim and no concise preservation is
  possible;
- two sources conflict and there is no controlling maintained decision;
- an inbound consumer outside the allowlist must change;
- the branch already exists or @GitHub write access is unavailable;
- verification cannot distinguish generated noise from uniquely valuable
  evidence;
- the cleanup would require history rewriting or force-push.
