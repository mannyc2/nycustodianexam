# Contributing

This project is currently a research and documentation corpus for a free, independent study site for New York's Entry-Level Custodians and Janitors civil-service test series.

## Before changing a fact

Check the canonical documents in `docs/` and preserve their evidence model. A new assertion should include:

- the source;
- source type/evidence tier;
- publication or observation date where relevant;
- the exact jurisdiction/title/administration it applies to; and
- any limitation that prevents generalizing it statewide.

Do not silently replace contradictory evidence. Resolve it only when a controlling source supports the resolution; otherwise add the conflict to `docs/OPEN.md`.

## Exam security

Do **not** open an issue, pull request, discussion, or commit containing:

- remembered or reconstructed exam questions;
- secure test drawings or photographs;
- answer choices or answer keys from a live/secure administration;
- candidate review-session notes that reproduce test content;
- purchased or scraped "actual question" dumps.

Reports about possible secure content should identify the URL/source at a high level without reproducing the protected material.

## Useful contributions

Good contributions include:

- newer official announcements or test guides;
- corrections backed by official/public evidence;
- missing public class specifications;
- source-backed tool or safety facts;
- accessibility or translation corrections;
- evidence about a jurisdiction using the same test plan;
- original practice-content QA that does not derive from secure questions.

## Editorial boundaries

The project must not imply affiliation with NYS DCS, Nassau County, a school district, or another civil-service commission. Do not add claims of official item counts, weights, score conversions, pass probability, or predictable exam cadence without controlling evidence.

## Research reports versus canonical state

Put substantial exploratory work in `research/` first. A research report is evidence/proposal, not automatically project truth. Merge accepted findings into the relevant canonical `docs/` file after review.

## Code

The repository is docs-first today. When implementation begins, contribution rules for tests, formatting, build commands, accessibility checks, and content validation will be added alongside the selected stack rather than guessed in advance.
