import { PostcommitScene } from "@nycustodian/content/model"
import { Schema } from "effect"
import {
  HazardAttemptRecord,
  decodeStoredHazardAttempt,
  hasBoundHazardReceipt
} from "../hazard-player/persistence.ts"
import { PrintJobRecord } from "../print/model.ts"
import {
  validatePrintJobRecord,
  validatePrintJobRecordIntegrity
} from "../print/persistence.ts"
import {
  decodeCanonicalBase64,
  sha256Bytes,
  validateRetainedImage
} from "../retained-image.ts"
import {
  SimulationSessionRecord,
  SimulationSubmissionRecord
} from "../simulation/model.ts"
import {
  validateSimulationSession,
  validateSimulationSubmission,
  validateSimulationSubmissionIntegrity
} from "../simulation/persistence.ts"

export const decodePortableSimulationSession = (
  value: unknown
): SimulationSessionRecord => validateSimulationSession(
  Schema.decodeUnknownSync(
    SimulationSessionRecord,
    { onExcessProperty: "error" }
  )(value)
)

export const decodePortableSimulationSubmission = (
  session: SimulationSessionRecord,
  value: unknown
): SimulationSubmissionRecord => validateSimulationSubmission(
  session,
  Schema.decodeUnknownSync(
    SimulationSubmissionRecord,
    { onExcessProperty: "error" }
  )(value)
)

export const decodePortablePrintJob = (value: unknown): PrintJobRecord =>
  validatePrintJobRecord(
    Schema.decodeUnknownSync(
      PrintJobRecord,
      { onExcessProperty: "error" }
    )(value)
  )

const expectedHazardPostcommitPath = (opaqueAssetId: string): string =>
  `/content/vertical-slice/scenes/${encodeURIComponent(opaqueAssetId)}.postcommit.json`

export const validatePortableHazardAttemptIntegrity = async (
  value: unknown
): Promise<HazardAttemptRecord> => {
  const attempt = decodeStoredHazardAttempt(value)
  if (attempt.evaluation === undefined) return attempt
  if (!hasBoundHazardReceipt(attempt)) {
    throw new Error("Portable hazard feedback is missing its release coordinate")
  }

  const bytes = decodeCanonicalBase64(attempt.evaluation.postcommitBase64)
  if (
    bytes.byteLength !== attempt.receipt.postcommitBytes ||
    await sha256Bytes(bytes) !== attempt.receipt.postcommitSha256
  ) {
    throw new Error("Portable hazard feedback bytes do not match their release receipt")
  }
  const payload = Schema.decodeUnknownSync(
    PostcommitScene,
    { onExcessProperty: "error" }
  )(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown)
  if (
    JSON.stringify(payload) !== JSON.stringify(attempt.evaluation.payload) ||
    attempt.receipt.postcommitPath !== expectedHazardPostcommitPath(payload.opaqueAssetId)
  ) {
    throw new Error("Portable hazard feedback payload does not match its release receipt")
  }
  if (attempt.evaluation.retainedVisualAsset !== null) {
    await validateRetainedImage(attempt.evaluation.retainedVisualAsset)
  }
  return attempt
}

export const validatePortableSimulationSubmissionIntegrity = async (
  session: SimulationSessionRecord,
  value: unknown
): Promise<SimulationSubmissionRecord> => {
  Schema.decodeUnknownSync(
    SimulationSubmissionRecord,
    { onExcessProperty: "error" }
  )(value)
  return validateSimulationSubmissionIntegrity(session, value)
}

export const validatePortablePrintJobIntegrity = async (
  value: unknown
): Promise<PrintJobRecord> => {
  Schema.decodeUnknownSync(
    PrintJobRecord,
    { onExcessProperty: "error" }
  )(value)
  return validatePrintJobRecordIntegrity(value)
}
