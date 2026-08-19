# Product specification

This directory is the implementation-facing product contract recovered and normalized from prior project work. It is deliberately separate from `../docs/`, which remains the authority for exam facts, test scope, provenance, and unresolved factual questions.

## Authority order

1. **Exam truth and scope:** `../docs/FACTBASE.md`, `../docs/SCOPE.md`, `../docs/TAXONOMY.md`, `../docs/OPEN.md`.
2. **Current implementation constraints:** `ARCHITECTURE_CONSTRAINTS.md`.
3. **Product behavior and UX:** `FEATURE_SPEC.md`.
4. **Illustration production:** `../illustration/`.
5. **Supporting investigations:** `../research/`.
6. **Recovery bookkeeping:** `../recovery/CORPUS_RECOVERY.md`.

A lower layer must never silently promote an unknown exam fact into a product claim.

## Recovered feature contract

`FEATURE_SPEC.md` is a normalized durable version of the 3,427-line August 17, 2026 buildable feature specification recovered from the ChatGPT Library. The original recovered artifact is identified in the recovery ledger by SHA-256 so later source recovery can be mechanically compared.

The contract covers:

- page and route inventory plus shared loading/empty/ready/answered/reviewed/offline/error states;
- announcement/profile selection and fact-state rendering;
- tool atlas, tool families, procedures, and repair study;
- question-player commitment and explanation behavior;
- hazard-scene marking, decoys, zoned reveal, and nonvisual equivalents;
- session assembly, simulations, and local spaced review;
- print center and deterministic print output;
- conceptual content and progress data models;
- offline/PWA behavior and content-pack updates;
- WCAG 2.2 accessibility behavior;
- authoring, validation, security, privacy, and release gates;
- a deliberately tiny network surface and no required account.

A separately authored print-system deliverable discussed in an earlier chat was **not located** as a durable Library artifact during this pass. The recovered feature specification contains the durable print contract; chat-only recollections are not silently promoted into this repository.
