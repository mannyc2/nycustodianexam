# Deployment handoff

The repository has three deliberately separate delivery layers:

1. `Certification` runs on every pull request and `main` push. It needs no
   Cloudflare credential and exercises Static Assets through local workerd.
2. `Cloudflare remote preview` is manual, re-runs certification, accepts only
   the exact current merged `main` commit, and uploads an inactive Worker
   version with a preview alias. It does not activate production traffic.
3. `Cloudflare production deployment` is manual, re-runs certification, accepts
   only the exact current merged `main` commit, requires the operator to type
   `DEPLOY`, and waits on the protected `production` GitHub Environment before
   deploying Static Assets to the configured apex custom domain.

## GitHub configuration still required

Create `cloudflare-preview` and `production` Environments. Put these secrets in
each environment rather than in repository variables or source:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Scope the API token to the one target Cloudflare account and only the Worker and
zone permissions needed for version upload/deployment. Configure
`CANONICAL_DOMAIN` as a non-secret variable on the `production` Environment
after the domain is selected. Add required reviewers to `production` and do not
approve its first run until the manual certification record is complete.

The production build receives `NYCUSTODIAN_CANONICAL_ORIGIN` as
`https://<CANONICAL_DOMAIN>`. Production remains blocked until the generator
uses that origin for absolute canonical links and the sitemap verifier proves
the closed route set. Configure the domain-level `www` to apex redirect in the
Cloudflare zone; it is not a same-host Static Assets redirect.

## Commit-bound manual certification

[`certification/production-v1.json`](certification/production-v1.json) is an
executable production gate, not a narrative checklist. It is deliberately
checked in with `blocked` status. After all automated gates and the full manual
matrix have been completed against the intended merged `main` commit, update
the record to:

- `status: "certified"`;
- the exact 40-character `commitSha` being deployed;
- a valid `reviewedAt` timestamp;
- `true` for every required automated, assistive-technology, zoom, device, and
  print check;
- `jawsSmoke: "passed"`, or `"not-licensed"` only when no JAWS license is
  available;
- no remaining gaps; and
- at least one durable evidence reference.

Any content or application change produces a new commit and therefore requires
a new certification record. The production workflow validates the record
against `GITHUB_SHA` after its certification jobs pass and before building or
contacting Cloudflare. A protected GitHub Environment approval is an additional
operator gate; it cannot substitute for this record.

## Explicit exclusions

These workflows do not purchase a domain, create a Cloudflare account, attach a
correction endpoint, deploy a data-collection Worker, enable analytics, contact
any third party, or send external messages. Correction intake has a separate
activation gate even after its dormant implementation exists.
