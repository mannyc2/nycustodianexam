# Architecture constraints and decisions

**Status:** current implementation constraints, 2026-08-19. This file records decisions made after the recovered v1 feature-design pass. It does not replace the product behavior contract or the exam-fact corpus.

## Resolved

### Standards-first: HTML, CSS, and TypeScript

Do **not** use Next.js. Do not assume React, Vue, Svelte, or another application framework is needed merely because the product has interactive study modes.

The site should be designed as a standards-first web application using **HTML, CSS, and TypeScript**, with progressive enhancement as the default boundary:

- acquisition/reference pages expose useful semantic HTML without requiring client-side rendering;
- TypeScript enhances practice, local progress, filtering, offline packs, simulations, and other stateful interactions;
- native HTML controls and semantics are preferred over framework/custom-widget abstractions;
- the build system may generate static HTML, but the browser should not need a SPA router to reach indexable content.

### Research prose is not runtime content

Keep three distinct layers:

- `docs/` — human-readable factual research and scope authority;
- future machine-readable publication data — reviewed exam profiles, sources, tools, questions, scenes, translations, and content-pack manifests;
- site implementation — rendering, interaction, print, offline, and validation code.

Mutable announcement facts and scored content must not exist only as handwritten page prose.

## Preferred, pending dedicated current-source research

### Cloudflare

Cloudflare is the preferred deployment direction. Do not freeze a Pages/Workers choice or a `wrangler` configuration from memory. A dedicated architecture pass must verify current Cloudflare guidance for static assets, HTML routing, caching, redirects/headers, deploy previews, service workers, and any Worker code actually needed.

### Small build pipeline

A small TypeScript-aware build tool is acceptable when it earns its complexity through deterministic page generation, development ergonomics, asset processing, or validation. The architecture research should compare at least:

- native scripts + the TypeScript compiler;
- Vite used as a build/development tool without a UI framework;
- a small static-generation step for indexable routes;
- Cloudflare's current recommended static deployment path.

## Non-negotiable properties inherited from the product contract

- Crawlable, indexable HTML for acquisition/reference pages.
- Versioned announcement facts; unknown values remain visibly unknown.
- Local-first progress with no required account.
- Installable/offline behavior with explicit content-pack handling rather than accidental cache-only UX.
- Deterministic print output from the same validated content.
- WCAG 2.2 behavior and nonvisual equivalents as first-class requirements.
- No answer/reveal leakage through rendered DOM, accessible names, user-facing metadata, or asset naming before commitment.
- Original or independently rights-cleared images only.
- No third-party behavioral advertising/tracking requirement.
- A minimal or absent backend until a concrete feature requires one.

## Still open

- exact build tool and package manager;
- exact Cloudflare product/configuration;
- machine-readable content format and schema-validation implementation;
- test runner and browser-test stack;
- CSS organization/design-token strategy;
- service-worker tooling and cache/version protocol;
- first-party analytics choice, if any;
- custom-domain/canonical-host configuration.

Resolve these with a dedicated primary-source architecture research pass before production code is scaffolded.
