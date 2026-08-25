export interface WithdrawalRecord {
  /** Exact, root-relative published path that must now terminate with 410. */
  readonly path: string
  /** Public explanation only; never include withdrawn or secure content. */
  readonly publicMessage: string
  /** Reviewed, root-relative destination that remains safe to render. */
  readonly recoveryPath: string
  readonly recoveryLabel: string
}

export interface WithdrawalRegistry {
  readonly records: ReadonlyArray<WithdrawalRecord>
  readonly find: (pathname: string) => WithdrawalRecord | undefined
}

const canonicalDocumentPath = /^\/(?:[a-z0-9][a-z0-9._-]*\/)*$/

const assertCanonicalDocumentPath = (value: string, label: string): void => {
  if (!canonicalDocumentPath.test(value)) {
    throw new Error(`${label} must be a canonical root-relative document path`)
  }
}

const assertPublicText = (value: string, label: string): void => {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(`${label} must be non-empty public text without outer whitespace`)
  }
}

export const createWithdrawalRegistry = (
  input: ReadonlyArray<WithdrawalRecord>
): WithdrawalRegistry => {
  const records: Array<WithdrawalRecord> = []
  const byPath = new Map<string, WithdrawalRecord>()
  let previousPath: string | undefined

  for (const unsafeRecord of input) {
    assertCanonicalDocumentPath(unsafeRecord.path, "Withdrawal path")
    assertCanonicalDocumentPath(unsafeRecord.recoveryPath, "Withdrawal recovery path")
    assertPublicText(unsafeRecord.publicMessage, "Withdrawal public message")
    assertPublicText(unsafeRecord.recoveryLabel, "Withdrawal recovery label")
    if (unsafeRecord.path === unsafeRecord.recoveryPath) {
      throw new Error("A withdrawn path cannot recover to itself")
    }
    if (previousPath !== undefined && unsafeRecord.path <= previousPath) {
      throw new Error("Withdrawal records must have unique paths in ascending order")
    }

    const record = Object.freeze({ ...unsafeRecord })
    records.push(record)
    byPath.set(record.path, record)
    previousPath = record.path
  }

  const frozenRecords = Object.freeze(records)
  return Object.freeze({
    records: frozenRecords,
    find: (pathname: string) => byPath.get(pathname)
  })
}

/**
 * Production withdrawal authority. Launch has no withdrawn public documents;
 * add reviewed records here rather than redirecting or deleting known URLs.
 */
export const productionWithdrawalRecords = [] as const satisfies ReadonlyArray<WithdrawalRecord>

export const productionWithdrawalRegistry = createWithdrawalRegistry(
  productionWithdrawalRecords
)
