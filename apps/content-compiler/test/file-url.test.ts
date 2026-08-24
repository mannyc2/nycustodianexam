import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"
import { resolveFileUrlWithinRoot } from "../src/file-url.ts"

const root = pathToFileURL("/tmp/nycustodian-content-compiler-root/")

describe("resolveFileUrlWithinRoot", () => {
  it("resolves a nested artifact below the declared root", () => {
    expect(resolveFileUrlWithinRoot(root, "questions/q-1.precommit.json").href).toBe(
      "file:///tmp/nycustodian-content-compiler-root/questions/q-1.precommit.json"
    )
  })

  it.each([
    "",
    "/tmp/outside.json",
    "../outside.json",
    "questions/../../outside.json",
    "questions/%2e%2e/%2e%2e/outside.json",
    "questions/q-1%2foutside.json",
    "questions/%5coutside.json",
    "questions\\..\\outside.json",
    "file:///tmp/outside.json",
    "questions/q-1.json?revision=other",
    "questions/q-1.json#other"
  ])("rejects a non-relative or ambiguously encoded path: %s", (path) => {
    expect(() => resolveFileUrlWithinRoot(root, path)).toThrow()
  })
})
