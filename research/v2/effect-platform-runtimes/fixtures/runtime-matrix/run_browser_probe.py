from __future__ import annotations

import argparse
import json
import pathlib
from playwright.sync_api import sync_playwright


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8765/index.html")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    output = pathlib.Path(args.out)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path="/usr/bin/chromium",
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page()
        console_messages: list[dict[str, str]] = []
        page.on("console", lambda msg: console_messages.append({"type": msg.type, "text": msg.text}))
        page.goto(args.url, wait_until="domcontentloaded")
        page.wait_for_function(
            "document.documentElement.dataset.probeStatus === 'complete' || document.documentElement.dataset.probeStatus === 'failed'",
            timeout=30_000,
        )
        status = page.get_attribute("html", "data-probe-status")
        payload = page.evaluate("window.__R23_RESULTS__ || window.__R23_FAILURE__")
        result = {
            "status": status,
            "url": args.url,
            "chromiumVersion": browser.version,
            "console": console_messages,
            "payload": payload,
        }
        output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps(result, indent=2, sort_keys=True))
        browser.close()


if __name__ == "__main__":
    main()
