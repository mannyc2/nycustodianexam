# Real-browser probe execution result

Status: BLOCKED

Executor browser:
- Chromium 144.0.7559.96
- DevTools Protocol endpoint successfully launched and controlled.

Attempted origins:
1. http://127.0.0.1:4173/probe.html
2. file:///tmp/r24/probe.html

Observed renderer result:
- `location.href` became `chrome-error://chromewebdata/`
- `window.R24` remained undefined because fixture JavaScript did not load.
- enterprise interstitial summary: `Your organization doesn’t allow you to view this site`
- file interstitial heading: `“file” links are blocked`

Fallback:
- an unpacked Manifest V3 local extension was passed via
  `--disable-extensions-except` / `--load-extension`;
- the managed headless build exposed only the about:blank page and did not load
  the extension, so it was not used to generate behavioral claims.

Consequences:
- No IndexedDB behavioral result from this executor is labeled OBSERVED.
- The browser-native fixture is committed for rerun in an unrestricted Chromium,
  Firefox, and WebKit environment.
- fake-indexeddb was not substituted for real-browser evidence.
