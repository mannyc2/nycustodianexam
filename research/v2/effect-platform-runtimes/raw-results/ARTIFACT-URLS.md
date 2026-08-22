# Official artifact bootstrap coordinates

These URLs are recorded so the lane's alternate bootstrap path is auditable when ordinary package-manager networking is unavailable.

## Bun 1.4.0

- [Official Bun Linux x64 npm binary](https://unpkg.com/@oven/bun-linux-x64@1.4.0/bin/bun)
- [Official Bun release](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.0)
- [Official npm package](https://www.npmjs.com/package/@oven/bun-linux-x64/v/1.4.0)

## Effect fixture packages

- [effect 4.0.0-rc.110 tarball](https://registry.npmjs.org/effect/-/effect-4.0.0-rc.110.tgz)
- [platform-browser 4.0.0-rc.110 tarball](https://registry.npmjs.org/@effect/platform-browser/-/platform-browser-4.0.0-rc.110.tgz)
- [platform-bun 4.0.0-rc.110 tarball](https://registry.npmjs.org/@effect/platform-bun/-/platform-bun-4.0.0-rc.110.tgz)
- [platform-node-shared 4.0.0-rc.110 tarball](https://registry.npmjs.org/@effect/platform-node-shared/-/platform-node-shared-4.0.0-rc.110.tgz)

The presence of a URL or registry artifact is not itself runtime proof. Any downloaded artifact must be identified by exact executable/package metadata and exercised by committed probes before the lane labels it OBSERVED.
