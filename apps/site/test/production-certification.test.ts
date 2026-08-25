import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import {
  assertCertified,
  certificationRecordPath,
  type ProductionCertificationValue
} from "../../../scripts/check-production-certification.ts"

const candidateCommitSha = "a".repeat(40)
const deployCommitSha = "b".repeat(40)

const certifiedRecord = (): ProductionCertificationValue => ({
  schemaVersion: 2,
  status: "certified",
  candidateCommitSha,
  reviewedAt: "2026-08-25T16:00:00.000Z",
  checks: {
    automatedChromiumFirefoxWebKit: true,
    nvdaFirefoxWindows: true,
    voiceOverSafariMacOS: true,
    voiceOverSafariiOS: true,
    talkBackChromeAndroid: true,
    jawsSmoke: "not-licensed",
    zoom400Chrome: true,
    zoom400Firefox: true,
    zoom400Safari: true,
    printUsLetterNormal: true,
    printUsLetterLarge: true,
    printA4Normal: true,
    printA4Large: true,
    grayscalePhysicalPrint: true
  },
  gaps: [],
  evidence: ["preview/main-candidate/manual-matrix.md"],
  notes: []
})

describe("production certification attestation", () => {
  it("accepts a tested ancestor when only the attestation record changed", () => {
    expect(() => assertCertified(certifiedRecord(), deployCommitSha, {
      candidateIsAncestor: true,
      changedPaths: [certificationRecordPath]
    })).not.toThrow()

    expect(() => assertCertified(certifiedRecord(), deployCommitSha, {
      candidateIsAncestor: true,
      changedPaths: [
        certificationRecordPath,
        `docs/certification/evidence/${candidateCommitSha}/manual-matrix.md`
      ]
    })).not.toThrow()
  })

  it("rejects a non-ancestor candidate and every non-attestation delta", () => {
    expect(() => assertCertified(certifiedRecord(), deployCommitSha, {
      candidateIsAncestor: false,
      changedPaths: [certificationRecordPath]
    })).toThrow(/not an ancestor/)

    for (const changedPaths of [
      [] as string[],
      [certificationRecordPath, "apps/site/src/app-runtime.ts"],
      [certificationRecordPath, "docs/certification/evidence/wrong-candidate/manual.md"],
      ["apps/site/src/app-runtime.ts"]
    ]) {
      expect(() => assertCertified(certifiedRecord(), deployCommitSha, {
        candidateIsAncestor: true,
        changedPaths
      })).toThrow(/only the production certification record and candidate-scoped evidence/i)
    }
  })

  it("still rejects incomplete manual evidence", () => {
    const record = certifiedRecord()
    expect(() => assertCertified({
      ...record,
      checks: { ...record.checks, talkBackChromeAndroid: false }
    }, deployCommitSha, {
      candidateIsAncestor: true,
      changedPaths: [certificationRecordPath]
    })).toThrow(/talkBackChromeAndroid/)
  })
})

it("makes preview and production-origin intent explicit in Wrangler", async () => {
  const configuration = JSON.parse(
    await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  ) as { readonly workers_dev?: unknown; readonly preview_urls?: unknown }

  expect(configuration.workers_dev).toBe(false)
  expect(configuration.preview_urls).toBe(true)
})
