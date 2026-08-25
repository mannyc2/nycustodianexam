# Deployment handoff

The repository has three deliberately separate delivery layers:

1. `Certification` runs on every pull request and `main` push. It needs no
   Cloudflare credential and exercises Static Assets through local workerd.
2. `Cloudflare remote preview` is manual, re-runs certification, accepts only
   the exact current merged `main` commit, and uploads an inactive Worker
   version with a preview alias. It does not activate production traffic. The
   preview URL is public unless the Cloudflare account protects it with Access.
3. `Cloudflare production deployment` is manual, re-runs certification, accepts
   only the exact current merged `main` commit, requires the operator to type
   `DEPLOY`, and waits on the protected `production` GitHub Environment before
   deploying Static Assets to the configured apex custom domain.

## GitHub configuration still required

Create `cloudflare-preview` and `production` Environments. Restrict both
Environments' deployment branches to `main`. Put these secrets in each
environment rather than in repository variables or source:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Scope the API token to the one target Cloudflare account and only the Worker and
zone permissions needed for version upload/deployment. After the domain is
selected, configure `CANONICAL_DOMAIN` as a non-secret variable on both
Environments, with the same bare apex hostname in each. Add required reviewers
to `production` and do not approve its first run until the manual certification
record is complete.

Both remote-preview and production builds receive
`NYCUSTODIAN_CANONICAL_ORIGIN` as `https://<CANONICAL_DOMAIN>`, so the manually
tested candidate and the production build use the same canonical metadata. The
generator uses that origin for absolute canonical links and the artifact
verifier proves the sitemap's closed route set. Each manual workflow rejects a
non-`main` or superseded dispatch before requesting Environment access and
rechecks `origin/main` immediately before contacting Cloudflare. The checked-in
Worker configuration disables the alternate production `workers.dev` route
while explicitly permitting manual version preview URLs. Configure the
domain-level `www` to apex redirect in the Cloudflare zone; it is not a
same-host Static Assets redirect.

## Candidate-bound manual certification

[`certification/production-v1.json`](certification/production-v1.json) is an
executable production gate, not a narrative checklist. It is deliberately
checked in with `blocked` status. First upload the exact merged `main` candidate
to the inactive remote preview and complete the full manual matrix against that
candidate. Then create a certification-attestation change that modifies only
this record and, when useful, evidence files under
`docs/certification/evidence/<candidateCommitSha>/`:

- `status: "certified"`;
- the candidate's exact 40-character `candidateCommitSha`;
- a valid `reviewedAt` timestamp;
- `true` for every required automated, assistive-technology, zoom, device, and
  print check;
- `jawsSmoke: "passed"`, or `"not-licensed"` only when no JAWS license is
  available;
- no remaining gaps; and
- at least one durable evidence reference.

The attestation commit cannot literally contain its own Git SHA, so the gate
does not attempt that impossible self-reference. Instead, the production
workflow proves that `candidateCommitSha` is an ancestor of `GITHUB_SHA` and
that only the certification JSON plus evidence nested under that exact
candidate SHA differ. Any application, content, workflow, configuration, or
unrelated documentation change therefore invalidates the attestation and
requires a new candidate preview and manual matrix. Automated certification
runs again on the attestation commit before this relationship is checked and
before the workflow builds or contacts Cloudflare. A protected GitHub
Environment approval is an additional operator gate; it cannot substitute for
this record.

## Explicit exclusions

These workflows do not purchase a domain, create a Cloudflare account, attach a
correction endpoint, deploy a data-collection Worker, enable analytics, contact
any third party, or send external messages. Correction intake has a separate
activation gate even after its dormant implementation exists.
