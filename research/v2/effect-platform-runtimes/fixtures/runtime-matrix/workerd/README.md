# Cloudflare-compatible handler shape probe

This fixture defines a local `ExportedHandler<Env>`-compatible module Worker and compiles it with TypeScript. The compiled module is invoked twice under Node 22 using native Web `Request` and `Response` values.

Observed:

- successful type/build;
- two accepted correction requests;
- `waitUntil` registration;
- one module initialization across two calls.

Not observed:

- workerd execution;
- Cloudflare bindings;
- Cloudflare request abort;
- isolate cold start;
- Effect runtime/Layer construction;
- production security or rate limiting.
