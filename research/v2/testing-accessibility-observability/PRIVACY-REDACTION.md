# Privacy and redaction contract

## Default posture

Core study use requires no telemetry and no account. Local diagnostics are the default. Any networked research/analytics collection is optional, first-party, minimized, and purpose-bound.

## Never collect in general telemetry

- question stems, choices, keys, rationales, source excerpts, or secure-content-like text;
- free-form correction/security submissions;
- exact search input;
- names, email addresses, phone numbers, addresses, employer/applicant/admission identifiers;
- advertising IDs or cross-site identifiers;
- IP-derived location stored as a product-research field;
- full URLs/query strings when they can contain user-entered data;
- raw DOM/accessibility snapshots from scored sessions.

## Identifier rules

Prefer no identifier. When longitudinal analysis is explicitly needed, use a random study ID scoped to first-party product research. Do not join it to correction contact information. Rotate or expire identifiers when the research purpose ends.

Technical object IDs may be logged only when they are non-sensitive, necessary for diagnosis, and do not disclose answers through naming. Prefer revision hashes or coarse object types over human-readable answer-bearing filenames.

## Redaction boundary

Redaction must occur before network transmission and before persistent analytics storage. Do not rely on downstream dashboards to remove prohibited fields.

Structured event schemas should use allowlists. Unknown fields are rejected rather than passed through.

## Retention

Use the shortest purpose-appropriate retention:

- build/content validation: normal CI artifact retention;
- correction endpoint operational logs: approximately 14-30 days unless abuse/security investigation requires a separately controlled hold;
- optional reliability events: <=30 days raw, then delete or retain only aggregate statistics;
- optional Web Vitals/product research: <=90 days raw unless an explicitly reviewed research plan states a shorter period;
- experiment events: experiment duration plus a bounded analysis window, then delete raw assignment history when no longer needed.

## Security-sensitive reports

Suspected secure exam content must never enter general telemetry, analytics, or public logs. It follows the product's nonpublic security hold process. Generic endpoint responses and diagnostics must not confirm whether suspected content is genuine.

## Consent

Declining telemetry cannot reduce core study functionality, offline packs, progress, export/reset, or accessibility. Consent state itself should remain a minimal local preference unless a server-side record is genuinely required.
