import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { afterEach, describe, expect, it } from "vitest"
import { Effect } from "effect"
import { activateRelease, type ReleaseActivationPaths } from "../src/release-activation.ts"

const temporaryRoots: string[] = []

const makePaths = async (): Promise<ReleaseActivationPaths> => {
  const root = await mkdtemp(join(tmpdir(), "nycustodian-content-compiler-"))
  temporaryRoots.push(root)
  const rootUrl = pathToFileURL(`${root}/`)
  return {
    active: new URL("active/", rootUrl),
    staging: new URL("staging/", rootUrl),
    backup: new URL("backup/", rootUrl)
  }
}

const writeMarker = async (directory: URL, value: string): Promise<void> => {
  await mkdir(directory, { recursive: true })
  await writeFile(new URL("marker.txt", directory), value, "utf8")
}

const exists = async (path: URL): Promise<boolean> => {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("activateRelease", () => {
  it("promotes staging and removes the preserved previous release", async () => {
    const paths = await makePaths()
    await writeMarker(paths.active, "previous")
    await writeMarker(paths.staging, "next")

    await Effect.runPromise(activateRelease(paths))

    await expect(readFile(new URL("marker.txt", paths.active), "utf8")).resolves.toBe("next")
    await expect(exists(paths.staging)).resolves.toBe(false)
    await expect(exists(paths.backup)).resolves.toBe(false)
  })

  it("restores the previous release when staging promotion fails", async () => {
    const paths = await makePaths()
    await writeMarker(paths.active, "previous")

    await expect(Effect.runPromise(activateRelease(paths))).rejects.toMatchObject({
      _tag: "ContentBuildError",
      detail: "Unable to activate compiled release"
    })

    await expect(readFile(new URL("marker.txt", paths.active), "utf8")).resolves.toBe("previous")
    await expect(exists(paths.backup)).resolves.toBe(false)
  })

  it("reconciles an interrupted activation that already moved the previous release", async () => {
    const paths = await makePaths()
    await writeMarker(paths.backup, "previous")

    await expect(Effect.runPromise(activateRelease(paths))).rejects.toMatchObject({
      _tag: "ContentBuildError",
      detail: "Unable to activate compiled release"
    })

    await expect(readFile(new URL("marker.txt", paths.active), "utf8")).resolves.toBe("previous")
    await expect(exists(paths.backup)).resolves.toBe(false)
  })
})
