# Initial research normalization — start receipt

**Started:** 2026-08-21  
**Repository:** `mannyc2/nycustodianexam`  
**Base branch:** `agent/chat-corpus-reconciliation`  
**Base SHA:** `22bfe0badbf3badf0e13517d48c5707c63b6d38e`  
**Output branch:** `research/normalize-initial-effect-outputs`

## Supplied input

- Original uploaded filename: `8f7353c8-08fd-4677-bfeb-69a595dd0638.zip`
- SHA-256: `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5`
- Compressed size: approximately 2.4 MB
- Archive entries: 134
- Extracted files: 100
- Uncompressed bytes: 6,714,382
- Path traversal/symlink safety check: passed
- text/config secret-pattern scan: no detected credentials

The archive contains:

1. the unpacked deterministic tool-geometry research/POC bundle; and
2. nine Effect research outputs from the initial parallel pass.

## Normalization constraints

Current maintainer direction superseding the first-pass version recommendation:

- use the latest Effect v4 line for the project;
- do not recommend Effect v3 for production implementation;
- future research must follow current Effect v4 patterns directly;
- use Bun and Bun workspaces;
- use an `apps/` and `packages/` monorepo structure;
- preserve standards-first semantic HTML/CSS and Cloudflare deployment direction unless later evidence changes them;
- preserve raw research separately from normalized conclusions;
- do not promote a first-pass recommendation merely because several reports repeated it;
- explicitly identify duplicate, superseded, reusable, and redo-required material.

No application code, package graph, Bun workspace, or deployment configuration will be created during this normalization pass.
