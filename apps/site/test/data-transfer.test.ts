import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import { hazardAttemptId } from "../src/attempt-receipt.ts"
import { encodeCanonicalBase64 } from "../src/retained-image.ts"
import {
  TransferPayload,
  canonicalJson,
  classifyImportCandidates,
  dependentClosureDecision,
  normalizeDataTransfer,
  preflightDataImportPlan,
  rebindPortableSimulationSessions,
  sealDataImportPlan,
  type ImportPreview
} from "../src/settings/data-transfer.ts"
import { validatePortableHazardAttemptIntegrity } from
  "../src/settings/portable-record-integrity.ts"
import { storesForResetScope } from "../src/settings/persistence.ts"
import { appDatabaseStores } from "../src/study-storage/app-database.ts"
import {
  OfflinePackDescriptor,
  OfflinePackRecord,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackShellBuildFingerprintSource
} from "../src/offline-packs/model.ts"
import { assembleSimulation } from "../src/simulation/generation.ts"
import {
  SimulationBootstrap,
  SimulationSessionRecord,
  SimulationSubmissionRecord,
  SimulationTimingSettings,
  simulationItemId,
  simulationSubmissionId
} from "../src/simulation/model.ts"
import {
  validateSimulationSession,
  validateSimulationSubmission
} from "../src/simulation/persistence.ts"
import { decodeTrustedReleaseContentRegistry } from
  "../src/trusted-release-content.ts"

const sha256Text = async (value: string): Promise<string> =>
  createHash("sha256").update(value).digest("hex")

const v1Payload = {
  schemaVersion: 1,
  exportedAt: 123,
  includesCorrectionDrafts: false,
  questionAttempts: [],
  hazardAttempts: [],
  reviewAcknowledgements: [],
  preferences: [],
  correctionDrafts: []
} as const

const envelope = async (
  payload: Readonly<Record<string, unknown>>,
  checksumPayload: unknown = payload
): Promise<string> => JSON.stringify({
  schemaVersion: 1,
  format: "nycustodian-local-data",
  checksumAlgorithm: "SHA-256",
  payload,
  checksum: await sha256Text(canonicalJson(checksumPayload))
})

const registry = decodeTrustedReleaseContentRegistry({
  schemaVersion: 1,
  scope: "trusted-release-content-registry",
  entries: [{
    releaseId: "release-1",
    packVersion: 1,
    variant: "question",
    itemId: "q1",
    postcommitReceipt: {
      postcommitPath: "/content/vertical-slice/questions/q1.postcommit.json",
      postcommitBytes: 1,
      postcommitSha256: "a".repeat(64)
    },
    optionIds: ["a", "b"]
  }]
})

const simulationBootstrap = Schema.decodeUnknownSync(SimulationBootstrap)({
  schemaVersion: 2,
  releaseId: "release-1",
  packVersion: 1,
  profiles: [{
    id: "profile-1",
    label: "Entry-level custodians",
    version: 1,
    jurisdiction: "New York State",
    compatibilityKey: "profile-1-v1",
    disclaimer: "Original practice only."
  }],
  inventory: [{
    question: {
      schemaVersion: 2,
      id: "q1",
      version: 1,
      profileId: "profile-1",
      prompt: "Question one",
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" }
      ],
      memberships: [{
        filterKind: "domain",
        filterValue: "cleaning-tools-and-uses"
      }]
    },
    receipt: {
      releaseId: "release-1",
      packVersion: 1,
      sessionId: "release-1",
      position: 1,
      postcommitPath: "/content/vertical-slice/questions/q1.postcommit.json",
      postcommitBytes: 1,
      postcommitSha256: "a".repeat(64),
      questionId: "q1"
    },
    profileIds: ["profile-1"]
  }],
  hazards: [],
  advertisedLengths: [1]
})

const activeSimulation = (): SimulationSessionRecord => assembleSimulation({
  bootstrap: simulationBootstrap,
  sessionId: "sim-transfer1",
  profileId: "profile-1",
  length: 1,
  seed: "transfer",
  selectedCategories: ["Cleaning tools and uses"],
  timing: new SimulationTimingSettings({
    mode: "untimed",
    durationSeconds: null,
    timerVisible: false,
    autoSubmit: false
  }),
  now: 1
})

const packDescriptor = new OfflinePackDescriptor({
  schemaVersion: 1,
  id: "release-1-v1-en",
  releaseId: "release-1",
  packVersion: 1,
  locale: "en",
  label: "Release one",
  lifecycle: "published",
  publicationTime: "2026-08-25T00:00:00.000Z",
  compatibility: [{
    profileId: "profile-1",
    label: "Entry-level custodians",
    compatibilityKey: "profile-1-v1"
  }],
  counts: { profiles: 1, sources: 0, tools: 0, questions: 1, hazardScenes: 0 },
  totalBytes: 1,
  receipts: [{
    kind: "artifact",
    path: "/content/vertical-slice/questions/q1.postcommit.json",
    bytes: 1,
    sha256: "a".repeat(64)
  }],
  applicationShellManifestPath: "/offline-pack-shell-manifest.json",
  applicationShellManifestReceipt: {
    path: "/offline-pack-shell-manifest.json",
    bytes: 1,
    sha256: "b".repeat(64)
  },
  applicationShellBytes: 2,
  estimatedDownloadBytes: 3,
  requiredNavigation: ["/simulations/"]
})

const contentFingerprint = createHash("sha256")
  .update(offlinePackContentFingerprintSource(packDescriptor))
  .digest("hex")
const shellBuildFingerprint = createHash("sha256")
  .update(offlinePackShellBuildFingerprintSource(packDescriptor))
  .digest("hex")

const destinationPack = (
  generation: string,
  status: "active" | "retained"
): OfflinePackRecord => new OfflinePackRecord({
  id: offlinePackClaimId(packDescriptor.id, generation),
  packId: packDescriptor.id,
  generation,
  contentFingerprint,
  shellBuildFingerprint,
  descriptor: packDescriptor,
  status,
  cacheName: offlinePackCacheName(packDescriptor, generation),
  downloadedBytes: 3,
  stagedAt: 1,
  verifiedAt: 2,
  activatedAt: 3,
  detail: null
})

const sourceClaimedSimulation = (): SimulationSessionRecord =>
  validateSimulationSession(new SimulationSessionRecord({
    ...activeSimulation(),
    schemaVersion: 2,
    packClaim: {
      claimId: offlinePackClaimId(packDescriptor.id, "source-device-uuid"),
      packId: packDescriptor.id,
      generation: "source-device-uuid",
      contentFingerprint,
      shellBuildFingerprint: "c".repeat(64),
      releaseId: "release-1",
      packVersion: 1
    }
  }))

describe("portable data transfer v2", () => {
  it("includes M4 substantive records in both study reset scopes", () => {
    for (const scope of ["study-events", "all-portable-data"] as const) {
      expect(storesForResetScope(scope)).toEqual(expect.arrayContaining([
        appDatabaseStores.simulationSessions,
        appDatabaseStores.simulationSubmissions,
        appDatabaseStores.printJobs
      ]))
    }
  })

  it("checks a strict v1 checksum before the only migration hop", async () => {
    const normalized = await normalizeDataTransfer(
      await envelope(v1Payload),
      sha256Text
    )
    expect(normalized.sourceSchemaVersion).toBe(1)
    expect(normalized.sourceChecksum).toBe(await sha256Text(canonicalJson(v1Payload)))
    expect(normalized.payload).toMatchObject({
      schemaVersion: 2,
      simulationSessions: [],
      simulationSubmissions: [],
      printJobs: []
    })
    expect(normalized.normalizedChecksum).toBe(
      await sha256Text(canonicalJson(normalized.payload))
    )

    const postMigrationShape = {
      ...v1Payload,
      schemaVersion: 2,
      simulationSessions: [],
      simulationSubmissions: [],
      printJobs: []
    }
    await expect(normalizeDataTransfer(
      await envelope(v1Payload, postMigrationShape),
      sha256Text
    )).rejects.toThrow("checksum does not match")
  })

  it("rejects excess v1 fields instead of normalizing them away", async () => {
    const payload = { ...v1Payload, unexpected: true }
    await expect(normalizeDataTransfer(
      await envelope(payload),
      sha256Text
    )).rejects.toThrow()
  })

  it("deep-freezes plans and rejects payload or preview changes at preflight", async () => {
    const normalized = await normalizeDataTransfer(
      await envelope(v1Payload),
      sha256Text
    )
    const preview: ImportPreview = {
      checksum: normalized.sourceChecksum,
      exportedAt: normalized.payload.exportedAt,
      includesCorrectionDrafts: false,
      insert: 0,
      matched: 0,
      conflicts: 0,
      unknownReferences: 0,
      byStore: []
    }
    const plan = await sealDataImportPlan(normalized, preview, registry, sha256Text)
    expect(Object.isFrozen(plan)).toBe(true)
    expect(Object.isFrozen(plan.payload)).toBe(true)
    expect(Object.isFrozen(plan.preview.byStore)).toBe(true)
    await expect(preflightDataImportPlan(plan, registry, sha256Text)).resolves.toEqual(plan)

    const changedPayload = {
      ...plan,
      payload: new TransferPayload({ ...plan.payload, exportedAt: 124 })
    }
    await expect(preflightDataImportPlan(
      changedPayload,
      registry,
      sha256Text
    )).rejects.toThrow("normalized checksum")

    const changedPreview = {
      ...plan,
      preview: { ...plan.preview, insert: 1 }
    }
    await expect(preflightDataImportPlan(
      changedPreview,
      registry,
      sha256Text
    )).rejects.toThrow("seal is invalid")
  })

  it("propagates unknown and conflicting simulation dependencies whole", () => {
    expect(dependentClosureDecision(["insert", "matched"])).toBeUndefined()
    expect(dependentClosureDecision(["insert", "conflict"])).toBe("conflict")
    expect(dependentClosureDecision(["conflict", "unknown-reference"]))
      .toBe("unknown-reference")
  })

  it("rebinds resumable sessions to the destination active generation", () => {
    const source = sourceClaimedSimulation()
    const retained = destinationPack("retained-generation", "retained")
    const active = destinationPack("destination-generation", "active")
    const rebound = rebindPortableSimulationSessions(
      [source],
      [retained, active]
    )
    expect(rebound.eligibleResumableSessionIds.has(source.id)).toBe(true)
    expect(rebound.sessions[0]).toMatchObject({
      schemaVersion: 2,
      packClaim: {
        claimId: active.id,
        generation: active.generation,
        contentFingerprint: active.contentFingerprint
      }
    })
    expect(JSON.stringify(rebound.sessions[0])).not.toContain("source-device-uuid")
  })

  it("strips a source claim and quarantines the unmatched submitted closure whole", () => {
    const source = sourceClaimedSimulation()
    const item = source.items[0]
    if (item === undefined) throw new Error("Missing simulation item fixture")
    const session = validateSimulationSession(new SimulationSessionRecord({
      ...source,
      status: "submitted",
      updatedAt: 2
    }))
    const submission = validateSimulationSubmission(
      session,
      new SimulationSubmissionRecord({
        schemaVersion: 1,
        id: simulationSubmissionId(session.id),
        sessionId: session.id,
        status: "submitted",
        answers: [{
          questionId: simulationItemId(item),
          selectedOptionId: null,
          reviewIntent: "unflagged"
        }],
        submittedAt: 2
      })
    )
    const rebound = rebindPortableSimulationSessions([session], [])
    const portableSession = rebound.sessions[0]
    if (portableSession === undefined) throw new Error("Missing rebound simulation fixture")
    expect(rebound.eligibleResumableSessionIds.has(session.id)).toBe(false)
    expect(portableSession.schemaVersion).toBe(1)
    expect(portableSession.packClaim).toBeUndefined()
    expect(JSON.stringify(portableSession)).not.toContain("source-device-uuid")

    const classified = classifyImportCandidates([
      {
        store: appDatabaseStores.simulationSessions,
        record: portableSession,
        trustedReference: false
      },
      {
        store: appDatabaseStores.simulationSubmissions,
        record: submission,
        trustedReference: true
      }
    ], {})
    expect(classified.map(({ decision }) => decision)).toEqual([
      "unknown-reference",
      "unknown-reference"
    ])
  })
})

describe("portable late hazard feedback", () => {
  const releaseRoot = new URL("../../../content/releases/vertical-slice/", import.meta.url)
  const postcommitBytes = new Uint8Array(readFileSync(
    new URL("scenes/s001.postcommit.json", releaseRoot)
  ))
  const payload = JSON.parse(new TextDecoder().decode(postcommitBytes)) as unknown
  const receipt = {
    releaseId: "vertical-slice-v1",
    packVersion: 1,
    sessionId: "vertical-slice-v1-nonvisual",
    position: 1,
    postcommitPath: "/content/vertical-slice/scenes/s001.postcommit.json",
    postcommitBytes: postcommitBytes.byteLength,
    postcommitSha256: createHash("sha256").update(postcommitBytes).digest("hex"),
    sceneId: "s001",
    mode: "nonvisual" as const,
    assetRevision: 1,
    assetMasterSha256: "5648c401bd764f44b1f23e1dbaa5aac3e79c4292990e68c98f1d47947037ff0d"
  }
  const attempt = {
    id: hazardAttemptId(receipt),
    sceneId: "s001",
    mode: "nonvisual",
    markers: [],
    selectedZoneOrders: [3],
    zeroHazardsConfirmed: false,
    committedAt: 1,
    receipt,
    allowedZoneOrders: [1, 2, 3, 4],
    evaluation: {
      payload,
      postcommitBase64: encodeCanonicalBase64(postcommitBytes),
      retainedVisualAsset: null
    }
  }

  it("accepts receipt-bound feedback bytes and rejects a changed digest", async () => {
    await expect(validatePortableHazardAttemptIntegrity(attempt)).resolves.toMatchObject({
      id: attempt.id,
      evaluation: { payload }
    })
    const changedBytes = postcommitBytes.slice()
    changedBytes[0] = changedBytes[0] === 0x7b ? 0x5b : 0x7b
    await expect(validatePortableHazardAttemptIntegrity({
      ...attempt,
      evaluation: {
        ...attempt.evaluation,
        postcommitBase64: encodeCanonicalBase64(changedBytes)
      }
    })).rejects.toThrow("bytes do not match")
  })
})
