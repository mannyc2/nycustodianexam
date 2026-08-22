# bun.lock generation blocked

`bun.lock` is not present because Bun 1.4.0 could not be executed and the npm registry was unreachable from the measurement environment. Do not replace this marker with a handwritten lockfile. Generate the lock with the pinned root `package.json` using `bun install`, then commit the generated text lockfile.
