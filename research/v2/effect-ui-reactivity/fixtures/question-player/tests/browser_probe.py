from __future__ import annotations

import json
import os
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
RESULTS = ROOT.parents[1] / "raw-results" / "browser-results.json"

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        return

    def do_POST(self) -> None:
        if self.path != "/api/grade":
            self.send_error(404)
            return
        length = int(self.headers.get("content-length", "0"))
        payload = json.loads(self.rfile.read(length))
        if payload.get("questionId") != "fixture-fire-door-001":
            self.send_error(400)
            return
        correct = payload.get("selectedOptionId") == "b"
        body = json.dumps({
            "correct": correct,
            "explanation": "A fire door must remain unobstructed so its closer and latch can complete their protective function."
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.send_header("cache-control", "no-store")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def assert_no_precommit_leak(page: Any) -> None:
    assert page.locator("#outcome-panel").count() == 1 or page.locator("#outcome-panel").count() == 0
    if page.locator("#outcome-panel").count() == 1:
        assert page.locator("#outcome-panel").is_hidden()
    text = page.locator("body").inner_text()
    assert "A fire door must remain unobstructed" not in text
    assert page.locator("[data-answer], [data-correct], [aria-label*='correct' i]").count() == 0


def exercise(page: Any, base: str, name: str) -> dict[str, Any]:
    page.goto(f"{base}/{name}.html?reset=1", wait_until="networkidle")
    page.wait_for_function("window.__fixture && window.__fixture.state().phase === 'ready'")
    assert_no_precommit_leak(page)

    page.locator("input[value='b']").check()
    page.evaluate("window.__fixture.setFailureMode('reject')")
    page.locator("#commit-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'commit-failed'")
    assert_no_precommit_leak(page)
    assert page.locator("input[value='b']").is_checked()
    first_attempt = page.evaluate("window.__fixture.state().attemptId")
    assert first_attempt

    page.evaluate("window.__fixture.setFailureMode('success')")
    page.locator("#commit-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'revealed'")
    assert page.evaluate("window.__fixture.state().attemptId") == first_attempt
    assert page.locator("#outcome-heading").inner_text() == "Correct"
    assert "unobstructed" in page.locator("#explanation").inner_text()
    assert page.evaluate("document.activeElement && document.activeElement.id") == "outcome-heading"
    assert "Answer saved. Correct." in page.locator("#live-region").inner_text()

    page.locator("#flag-button").click()
    assert page.locator("#flag-button").get_attribute("aria-pressed") == "true"
    page.locator("#next-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'ready' && window.__fixture.state().itemIndex === 1")
    assert page.locator("#outcome-panel").count() == 0 or page.locator("#outcome-panel").is_hidden()

    page.locator("input[value='c']").check()
    page.locator("#flag-button").click()
    page.reload(wait_until="networkidle")
    page.wait_for_function("window.__fixture && window.__fixture.state().phase === 'ready'")
    assert page.locator("input[value='c']").is_checked()
    assert page.locator("#flag-button").get_attribute("aria-pressed") == "true"

    page.locator("#leave-button").click()
    assert page.evaluate("window.__fixture.disposed()") is True
    assert page.evaluate("window.__fixture.state().phase") == "disposed"
    return {
        "renderer": name,
        "failure_no_reveal": True,
        "retry_same_attempt_id": True,
        "durable_reveal": True,
        "focus_outcome": True,
        "live_region": True,
        "flag": True,
        "next": True,
        "restoration": True,
        "disposal": True,
        "attempt_id": first_attempt,
    }


def unknown_outcome(page: Any, base: str, name: str) -> dict[str, Any]:
    page.goto(f"{base}/{name}.html?reset=1", wait_until="networkidle")
    page.wait_for_function("window.__fixture && window.__fixture.state().phase === 'ready'")
    page.locator("input[value='a']").check()
    page.evaluate("window.__fixture.setFailureMode('unknown')")
    page.locator("#commit-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'revealed'")
    assert page.locator("#outcome-heading").inner_text() == "Incorrect"
    return {"renderer": name, "unknown_outcome_reconciled": True}


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}"
    output: dict[str, Any] = {
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "base": base,
        "chromium_executable": "/usr/bin/chromium",
        "results": [],
    }
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
            context = browser.new_context()
            page = context.new_page()
            for name in ("direct", "template"):
                output["results"].append(exercise(page, base, name))
                output["results"].append(unknown_outcome(page, base, name))
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    RESULTS.parent.mkdir(parents=True, exist_ok=True)
    RESULTS.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
