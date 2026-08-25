# Dormant correction intake

This Worker implements the authorized narrow first-party correction contract.
It is not authorized to collect data. The checked-in Wrangler configuration is
disabled and deliberately defines no route, D1 binding, rate-limit binding,
secret, preview URL, workers.dev URL, observability, or logs.

Activation requires all of the following as a separate reviewed production
change:

- `CORRECTION_INTAKE_MODE=active-v1`;
- `CORRECTION_RATE_LIMIT_IDENTITY_MODE=ephemeral-network-hash-v1`;
- a secret `CORRECTION_RATE_KEY_SECRET` of at least 32 characters;
- `CORRECTIONS_DB`, `CORRECTIONS_CLIENT_RATE_LIMITER`, and
  `CORRECTIONS_GLOBAL_RATE_LIMITER` bindings;
- approved storage, retention, triage, privacy, abuse-handling, routing, and
  operator contracts.

The per-client limiter receives only a secret-keyed HMAC of Cloudflare's
ephemeral network identity; the raw value is not persisted or logged. A
separate global limiter supplies the route ceiling. Request objects are strict-
decoded with excess properties rejected, and idempotency hashes the canonical
decoded report rather than caller JSON formatting. Security-category reports
enter a nonpublic lane while the public receipt remains generic.
