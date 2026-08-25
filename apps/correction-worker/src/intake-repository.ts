import type { CorrectionReportValue } from "@nycustodian/correction-intake"
import type { D1Database } from "./cloudflare-boundary.ts"

export type IntakeResult = "accepted" | "matched" | "conflict"

interface StoredDigest {
  readonly client_receipt_id: string
  readonly payload_sha256: string
}

const insertReport = `
INSERT OR IGNORE INTO correction_reports (
  client_receipt_id, payload_sha256, schema_version, category, page_path,
  content_id, profile_id, pack_id, pack_version, summary, details,
  public_source_url, received_at, lane, triage_status
) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`

const selectDigest = `
SELECT client_receipt_id, payload_sha256
FROM correction_reports
WHERE client_receipt_id = ?`

export const persistCorrectionReport = async (
  database: D1Database,
  input: {
    readonly report: CorrectionReportValue
    readonly payloadSha256: string
    readonly receivedAt: string
  }
): Promise<IntakeResult> => {
  const { report } = input
  const lane = report.category === "security" ? "security_hold" : "untriaged"
  const [, selected] = await database.batch([
    database.prepare(insertReport).bind(
      report.clientReceiptId,
      input.payloadSha256,
      report.category,
      report.subject.pagePath,
      report.subject.contentId ?? null,
      report.subject.profileId ?? null,
      report.subject.packId ?? null,
      report.subject.packVersion ?? null,
      report.summary,
      report.details,
      report.publicSourceUrl ?? null,
      input.receivedAt,
      lane
    ),
    database.prepare(selectDigest).bind(report.clientReceiptId)
  ])
  if (selected?.success !== true) throw new Error("D1 correction intake batch failed")
  const stored = selected.results?.[0] as StoredDigest | undefined
  if (stored === undefined) throw new Error("D1 correction intake batch returned no receipt")
  return stored.payload_sha256 === input.payloadSha256 ? "matched" : "conflict"
}
