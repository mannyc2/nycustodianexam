from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path
from typing import Any

from playwright.sync_api import Page, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
JS = PUBLIC / "js"
RESULTS = ROOT.parents[1] / "raw-results" / "browser-inline-results.json"

MODULE_ORDER = (
    "fixture-decoder.js",
    "question.js",
    "model.js",
    "persistence.js",
    "controller.js",
    "grade-client.js",
    "direct-view.js",
    "template-view.js",
)


def chromium_version() -> str:
    return subprocess.check_output(["/usr/bin/chromium", "--version"], text=True).strip()


def module_body(name: str) -> str:
    source = (JS / name).read_text(encoding="utf-8")
    source = re.sub(r"^import .*?\n", "", source, flags=re.MULTILINE)
    source = re.sub(r"^export\s+", "", source, flags=re.MULTILINE)
    return f"\n// source: {name}\n{source}\n"


def body_markup(name: str) -> str:
    html = (PUBLIC / f"{name}.html").read_text(encoding="utf-8")
    match = re.search(r"<body[^>]*>(.*)<script type=\"module\"", html, flags=re.DOTALL)
    if not match:
        raise RuntimeError(f"Could not extract body from {name}.html")
    return match.group(1).strip()


def application_bundle() -> str:
    sources = "".join(module_body(name) for name in MODULE_ORDER)
    direct = json.dumps(body_markup("direct"))
    template = json.dumps(body_markup("template"))
    harness = f"""
const __armMarkup = Object.freeze({{ direct: {direct}, template: {template} }})

if (typeof crypto.randomUUID !== "function") {{
  let __uuid = 0
  Object.defineProperty(crypto, "randomUUID", {{ value: () => `fixture-attempt-${{++__uuid}}` }})
}}

globalThis.fetch = async (_input, init) => {{
  const payload = JSON.parse(String(init?.body ?? "{{}}"))
  const correct = payload.selectedOptionId === "b"
  return new Response(JSON.stringify({{
    correct,
    explanation: "A fire door must remain unobstructed so its closer and latch can complete their protective function."
  }}), {{ status: 200, headers: {{ "content-type": "application/json" }} }})
}}

async function mountFixture(renderer, options = {{}}) {{
  if (globalThis.__fixture && !globalThis.__fixture.disposed()) globalThis.__fixture.controller.dispose()
  document.body.dataset.renderer = renderer
  document.body.innerHTML = __armMarkup[renderer]
  if (options.reset) await resetDatabase()
  const persistence = await openPersistence()
  let failureMode = "success"
  const view = renderer === "template" ? createTemplateView() : createDirectView()
  const controller = createQuestionController({{
    question,
    persistence,
    grade: gradeAttempt,
    render: view.render,
    commitMode: () => failureMode
  }})
  globalThis.__fixture = Object.freeze({{
    controller,
    setFailureMode(mode) {{ failureMode = mode }},
    state() {{ return controller.getState() }},
    disposed() {{ return controller.isDisposed() }}
  }})
  await controller.start()
  return controller.getState()
}}

globalThis.mountFixture = mountFixture
"""
    return sources + harness


def assert_no_precommit_leak(page: Page) -> None:
    if page.locator("#outcome-panel").count() == 1:
        assert page.locator("#outcome-panel").is_hidden()
    text = page.locator("body").inner_text()
    assert "A fire door must remain unobstructed" not in text
    assert page.locator("[data-answer], [data-correct], [aria-label*='correct' i]").count() == 0


def exercise(page: Page, name: str) -> dict[str, Any]:
    page.evaluate("([renderer]) => mountFixture(renderer, { reset: true })", [name])
    page.wait_for_function("window.__fixture.state().phase === 'ready'")
    assert_no_precommit_leak(page)

    page.locator("input[value='b']").check()
    page.evaluate("window.__fixture.setFailureMode('reject')")
    page.locator("#commit-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'commit-failed'")
    assert_no_precommit_leak(page)
    assert page.locator("input[value='b']").is_checked()
    first_attempt = page.evaluate("window.__fixture.state().attemptId")
    assert first_attempt
    page.wait_for_function("document.activeElement?.id === 'error-panel'")
    assert page.evaluate("document.activeElement?.id") == "error-panel"

    page.evaluate("window.__fixture.setFailureMode('success')")
    page.locator("#commit-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'revealed'")
    assert page.evaluate("window.__fixture.state().attemptId") == first_attempt
    assert page.locator("#outcome-heading").inner_text() == "Correct"
    assert "unobstructed" in page.locator("#explanation").inner_text()
    page.wait_for_function("document.activeElement?.id === 'outcome-heading'")
    assert page.evaluate("document.activeElement?.id") == "outcome-heading"
    assert "Answer saved. Correct." in page.locator("#live-region").inner_text()

    page.locator("#flag-button").click()
    assert page.locator("#flag-button").get_attribute("aria-pressed") == "true"
    page.locator("#next-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'ready' && window.__fixture.state().itemIndex === 1")
    if page.locator("#outcome-panel").count() == 1:
        assert page.locator("#outcome-panel").is_hidden()

    page.locator("input[value='c']").check()
    page.locator("#flag-button").click()
    page.wait_for_timeout(30)
    page.evaluate("window.__fixture.controller.dispose()")
    page.evaluate("([renderer]) => mountFixture(renderer, { reset: false })", [name])
    page.wait_for_function("window.__fixture.state().phase === 'ready'")
    assert page.locator("input[value='c']").is_checked()
    assert page.locator("#flag-button").get_attribute("aria-pressed") == "true"

    page.locator("#leave-button").click()
    assert page.evaluate("window.__fixture.disposed()") is True
    assert page.evaluate("window.__fixture.state().phase") == "disposed"
    return {
        "renderer": name,
        "failure_no_reveal": True,
        "failure_focus": True,
        "retry_same_attempt_id": True,
        "durable_gate_with_api_shim": True,
        "focus_outcome": True,
        "live_region": True,
        "flag": True,
        "next": True,
        "restoration": True,
        "disposal": True,
        "attempt_id": first_attempt,
    }


def unknown_outcome(page: Page, name: str) -> dict[str, Any]:
    page.evaluate("([renderer]) => mountFixture(renderer, { reset: true })", [name])
    page.wait_for_function("window.__fixture.state().phase === 'ready'")
    page.locator("input[value='a']").check()
    page.evaluate("window.__fixture.setFailureMode('unknown')")
    page.locator("#commit-button").click()
    page.wait_for_function("window.__fixture.state().phase === 'revealed'")
    assert page.locator("#outcome-heading").inner_text() == "Incorrect"
    snapshot = page.evaluate("window.__fakeIndexedDB._snapshot()")
    attempts = snapshot[0]["stores"]["attempts"]
    assert len(attempts) == 1
    return {"renderer": name, "unknown_outcome_reconciled": True, "attempt_records": len(attempts)}


def main() -> None:
    output: dict[str, Any] = {
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "chromium": chromium_version(),
        "transport": "about:blank + Page.setContent; managed URLBlocklist prevents all navigation",
        "native_indexeddb": None,
        "indexeddb_backend": "test-only asynchronous API-compatible in-page shim; not native IndexedDB proof",
        "results": [],
    }
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
        page = browser.new_page()
        output["user_agent"] = page.evaluate("navigator.userAgent")
        output["native_indexeddb"] = page.evaluate(
            """async () => {
              try {
                const req = indexedDB.open('native-policy-probe', 1)
                return await new Promise((resolve) => {
                  req.onsuccess = () => resolve({ status: 'unexpected-success' })
                  req.onerror = () => resolve({ status: 'request-error', error: String(req.error) })
                })
              } catch (error) {
                return { status: 'blocked', name: error.name, message: error.message }
              }
            }"""
        )
        page.set_content("<!doctype html><html lang='en'><head><meta charset='utf-8'><title>R2.2 inline browser harness</title></head><body></body></html>")
        page.add_script_tag(content=(ROOT / "tests" / "fake-indexeddb.js").read_text(encoding="utf-8"))
        page.add_script_tag(content=application_bundle())
        for name in ("direct", "template"):
            output["results"].append(exercise(page, name))
            output["results"].append(unknown_outcome(page, name))
        browser.close()

    RESULTS.parent.mkdir(parents=True, exist_ok=True)
    RESULTS.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
