# Native browser and Service Worker probe

Run through `../run_browser_probe.py` against a localhost HTTP server in real Chromium.

The probe covers native provider behavior needed to evaluate Effect adapters:

- IndexedDB commit and abort;
- fetch abort;
- Service Worker event lifetime;
- Cache Storage;
- BroadcastChannel;
- Web Locks;
- StorageManager;
- compression and Web Streams;
- Web Crypto;
- Blob/File;
- dedicated Worker;
- DOM events.

It does not import Effect and must not be cited as Effect package execution.
