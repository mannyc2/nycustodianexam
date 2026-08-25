import { Clock, Context, Effect, Layer, Schema } from "effect"
import {
  AppDatabase,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"
import {
  decodePrintJobId,
  decodePrintTimestamp,
  PrintJobRecord,
  ReleasedPrintJobManifest,
  ReleasedPrintPacket,
  type PrintAnnouncementProfileFactSheet,
  type ReleasedPrintJobManifest as ReleasedPrintJobManifestValue,
  type PrintRetainedAsset,
  type ReleasedPrintPacketSection,
  type PrintJobRecord as PrintJobRecordValue
} from "./model.ts"
import {
  computePrintManifestFingerprint,
  computePrintPacketFingerprint,
  computePrintPairingFingerprint,
  printOptionLabel
} from "./generation.ts"
import {
  decodeRetainedImage,
  sameAssetReceipt,
  validateRetainedImage
} from "../retained-image.ts"

export class PrintPersistenceError extends Schema.TaggedError<PrintPersistenceError>()(
  "PrintPersistenceError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export interface SavePrintJobInput {
  readonly id: string
  readonly manifest: ReleasedPrintJobManifestValue
  readonly packet: ReleasedPrintPacket
}

export class PrintPersistence extends Context.Service<
  PrintPersistence,
  {
    readonly savePrintJob: (
      input: SavePrintJobInput
    ) => Effect.Effect<PrintJobRecordValue, PrintPersistenceError>
    readonly findPrintJob: (
      id: string
    ) => Effect.Effect<PrintJobRecordValue | undefined, PrintPersistenceError>
    readonly markStale: (
      id: string
    ) => Effect.Effect<PrintJobRecordValue, PrintPersistenceError>
    readonly requestSystemPrint: (
      id: string
    ) => Effect.Effect<PrintJobRecordValue, PrintPersistenceError>
  }
>()("@nycustodian/site/print/PrintPersistence") {}

const printJobsStore = appDatabaseStores.printJobs

export const monotonicPrintTimestamp = (
  wallClock: number,
  ...durableLowerBounds: ReadonlyArray<number>
): number => Math.max(
  decodePrintTimestamp(wallClock),
  ...durableLowerBounds.map(decodePrintTimestamp)
)

const persistenceError = (operation: string, cause: unknown): PrintPersistenceError =>
  new PrintPersistenceError({
    operation,
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "IndexedDB print operation failed",
    cause
  })

const databasePersistenceError = (cause: AppDatabaseError): PrintPersistenceError =>
  new PrintPersistenceError({
    operation: cause.operation,
    detail: cause.detail,
    cause
  })

const questionProducts = new Set([
  "blank-answer-sheet",
  "multiple-choice-questions",
  "answer-key",
  "explanations-and-sources"
])

const expectedSectionTags = (manifest: ReleasedPrintJobManifestValue): ReadonlyArray<string> => {
  switch (manifest.settings.product) {
    case "blank-answer-sheet": return ["answer-sheet"]
    case "multiple-choice-questions":
      return manifest.settings.answerKeyPlacement === "new-section"
        ? [
            "questions",
            "answer-key",
            ...(manifest.settings.includeExplanations ? ["explanations"] : [])
          ]
        : ["questions"]
    case "answer-key": return ["answer-key"]
    case "explanations-and-sources": return ["explanations"]
    case "tool-family-contrast-cards": return ["tool-family-cards"]
    case "hazard-worksheet": return ["hazard-worksheet"]
    case "annotated-hazard-answer-packet": return ["annotated-hazard-answers"]
    case "text-equivalent-set": return ["text-equivalent-scenes"]
    case "announcement-profile-fact-sheet": return ["announcement-profile-fact-sheet"]
    case "correction-change-log-excerpt": return ["correction-change-log-excerpt"]
  }
}

const exactSequence = (
  received: ReadonlyArray<string | number>,
  expected: ReadonlyArray<string | number>
): boolean => JSON.stringify(received) === JSON.stringify(expected)

const expectedQuestionNumbers = (
  manifest: ReleasedPrintJobManifestValue
): ReadonlyArray<number> => Array.from(
  { length: manifest.actualLength },
  (_, index) => index + 1
)

const optionLabels = (optionIds: ReadonlyArray<string>): ReadonlyArray<string> =>
  optionIds.map((_, index) => printOptionLabel(index))

const validateQuestionSection = (
  manifest: ReleasedPrintJobManifestValue,
  section: Extract<ReleasedPrintPacketSection, { readonly tag: "questions" }>
): void => {
  for (const [index, question] of section.questions.entries()) {
    const coordinate = manifest.questions[index]
    if (
      coordinate === undefined ||
      question.number !== index + 1 ||
      question.id !== coordinate.questionId ||
      !exactSequence(question.options.map((option) => option.id), coordinate.optionIds) ||
      !exactSequence(
        question.options.map((option) => option.label),
        optionLabels(coordinate.optionIds)
      )
    ) {
      throw new Error("Saved question content is outside the exact manifest coordinate closure")
    }
  }
}

const validateAnswerSheetSection = (
  manifest: ReleasedPrintJobManifestValue,
  section: Extract<ReleasedPrintPacketSection, { readonly tag: "answer-sheet" }>
): void => {
  const maximumOptions = Math.max(...manifest.questions.map((question) => question.optionIds.length))
  if (
    !exactSequence(section.questionNumbers, expectedQuestionNumbers(manifest)) ||
    !exactSequence(
      section.optionLabels,
      Array.from({ length: maximumOptions }, (_, index) => printOptionLabel(index))
    )
  ) {
    throw new Error("Saved answer sheet is outside the exact manifest coordinate closure")
  }
}

const validateAnswerKeySection = (
  manifest: ReleasedPrintJobManifestValue,
  section: Extract<ReleasedPrintPacketSection, { readonly tag: "answer-key" }>
): void => {
  for (const [index, answer] of section.answers.entries()) {
    const coordinate = manifest.questions[index]
    if (
      coordinate === undefined ||
      answer.number !== index + 1 ||
      !optionLabels(coordinate.optionIds).includes(answer.optionLabel)
    ) {
      throw new Error("Saved answer key is outside the exact manifest coordinate closure")
    }
  }
}

const validateExplanationSection = (
  manifest: ReleasedPrintJobManifestValue,
  section: Extract<ReleasedPrintPacketSection, { readonly tag: "explanations" }>,
  packetSchemaVersion: 1 | 2
): void => {
  for (const [index, explanation] of section.explanations.entries()) {
    const coordinate = manifest.questions[index]
    if (coordinate === undefined) {
      throw new Error("Saved explanations are outside the exact manifest coordinate closure")
    }
    const labels = optionLabels(coordinate.optionIds)
    if (
      explanation.number !== index + 1 ||
      !labels.includes(explanation.correctOptionLabel) ||
      !exactSequence(explanation.rationales.map((rationale) => rationale.optionLabel), labels) ||
      (!manifest.settings.includeSources && explanation.sources.length > 0)
    ) {
      throw new Error("Saved explanations are outside the exact manifest coordinate closure")
    }
    if (packetSchemaVersion === 2) {
      if (!("claims" in explanation)) {
        throw new Error("A v2 print packet is missing its source-line evidence closure")
      }
      const claimIds = explanation.claims.map((claim) => claim.id)
      const claimIdSet = new Set(claimIds)
      const citedClaimIds = explanation.rationales.flatMap((rationale) =>
        "claimIds" in rationale ? rationale.claimIds : []
      )
      if (
        claimIdSet.size !== claimIds.length ||
        new Set(citedClaimIds).size !== claimIdSet.size ||
        citedClaimIds.some((claimId) => !claimIdSet.has(claimId)) ||
        explanation.rationales.some((rationale) =>
          !("claimIds" in rationale) ||
          new Set(rationale.claimIds).size !== rationale.claimIds.length ||
          rationale.claimIds.some((claimId) => !claimIdSet.has(claimId))
        )
      ) {
        throw new Error("Saved explanations have an invalid claim closure")
      }
      if (manifest.settings.includeSources) {
        const sourceIds = explanation.sources.map((source) => source.id)
        const sourceIdSet = new Set(sourceIds)
        if (
          sourceIds.length === 0 ||
          sourceIdSet.size !== sourceIds.length ||
          explanation.claims.some((claim) =>
            claim.sourceLineIds.some((sourceLineId) => {
              const source = explanation.sources.find((candidate) => candidate.id === sourceLineId)
              return source === undefined || !source.supportedClaimIds.includes(claim.id)
            })
          )
        ) {
          throw new Error("Saved explanations have an invalid source-line receipt closure")
        }
      }
    }
  }
}

const sameMembers = (
  left: ReadonlyArray<string>,
  right: ReadonlyArray<string>
): boolean => left.length === right.length && left.every((value) => right.includes(value))

const validateCurrentAnnouncementFactSheet = (
  factSheet: PrintAnnouncementProfileFactSheet
): void => {
  const factIds = factSheet.facts.map((fact) => fact.id)
  const sourceLineIds = factSheet.sourceLines.map((sourceLine) => sourceLine.id)
  const referencedSourceLineIds = factSheet.facts.flatMap((fact) => [
    ...fact.sourceLineIds,
    ...fact.conflictingValues.flatMap((candidate) => candidate.sourceLineIds)
  ]).concat(factSheet.changeHistory.flatMap((change) => change.sourceLineIds))
  if (
    new Set(factIds).size !== factIds.length ||
    new Set(sourceLineIds).size !== sourceLineIds.length ||
    !sameMembers([...new Set(referencedSourceLineIds)], sourceLineIds)
  ) {
    throw new Error("Saved announcement facts have an invalid source-line receipt closure")
  }
  for (const fact of factSheet.facts) {
    const factSourceLineIds = [
      ...fact.sourceLineIds,
      ...fact.conflictingValues.flatMap((candidate) => candidate.sourceLineIds)
    ]
    const conflictValues = fact.conflictingValues.map((candidate) => candidate.value)
    if (
      new Set(fact.appliesToExamNumbers).size !== fact.appliesToExamNumbers.length ||
      new Set(factSourceLineIds).size !== factSourceLineIds.length ||
      new Set(conflictValues).size !== conflictValues.length ||
      fact.reviewedOn > factSheet.lastReviewedOn
    ) {
      throw new Error(`Saved announcement fact ${fact.id} has an invalid evidence or review closure`)
    }
    const hasValue = fact.value !== null
    const hasDetail = fact.detail !== null
    const hasDirectEvidence = fact.sourceLineIds.length > 0
    const hasConflicts = fact.conflictingValues.length > 0
    const hasSupersedingFact = fact.supersededByFactId !== null
    const hasEffectiveStart = fact.effectiveFrom !== null
    const hasEffectiveEnd = fact.effectiveThrough !== null
    const validForState = (() => {
      switch (fact.state) {
        case "verified":
          return hasValue && !hasDetail && hasDirectEvidence && !hasConflicts &&
            !hasSupersedingFact && hasEffectiveStart && !hasEffectiveEnd
        case "not_published":
        case "unverified":
        case "not_applicable":
          return !hasValue && hasDetail && !hasConflicts && !hasSupersedingFact &&
            !hasEffectiveStart && !hasEffectiveEnd
        case "conflicting":
          return !hasValue && hasDetail && !hasDirectEvidence &&
            fact.conflictingValues.length >= 2 && !hasSupersedingFact &&
            !hasEffectiveStart && !hasEffectiveEnd
        case "superseded":
          return hasValue && hasDetail && hasDirectEvidence && !hasConflicts &&
            hasSupersedingFact && hasEffectiveStart && hasEffectiveEnd &&
            fact.effectiveFrom! <= fact.effectiveThrough!
      }
    })()
    if (!validForState) {
      throw new Error(`Saved announcement fact ${fact.id} violates its ${fact.state} state contract`)
    }
    if (fact.state === "superseded") {
      const successor = factSheet.facts.find(
        (candidate) => candidate.id === fact.supersededByFactId
      )
      if (
        successor === undefined ||
        successor.category !== fact.category ||
        !sameMembers(successor.appliesToExamNumbers, fact.appliesToExamNumbers) ||
        !["superseded", "verified"].includes(successor.state) ||
        successor.effectiveFrom === null ||
        successor.effectiveFrom <= fact.effectiveThrough!
      ) {
        throw new Error(`Saved announcement fact ${fact.id} has an invalid successor closure`)
      }
    }
  }
  for (let leftIndex = 0; leftIndex < factSheet.facts.length; leftIndex += 1) {
    const left = factSheet.facts[leftIndex]!
    if (left.effectiveFrom === null) continue
    for (let rightIndex = leftIndex + 1; rightIndex < factSheet.facts.length; rightIndex += 1) {
      const right = factSheet.facts[rightIndex]!
      if (
        right.effectiveFrom === null ||
        left.category !== right.category ||
        !left.appliesToExamNumbers.some((examNumber) =>
          right.appliesToExamNumbers.includes(examNumber)
        )
      ) continue
      const overlaps =
        (left.effectiveThrough === null || right.effectiveFrom <= left.effectiveThrough) &&
        (right.effectiveThrough === null || left.effectiveFrom <= right.effectiveThrough)
      if (overlaps) throw new Error("Saved announcement facts have overlapping effective history")
    }
  }
  if (factSheet.changeHistory.some((change, index) =>
    change.version !== index + 1 ||
    change.changedOn > factSheet.lastReviewedOn ||
    (index > 0 && change.changedOn < factSheet.changeHistory[index - 1]!.changedOn)
  ) || factSheet.changeHistory.at(-1)?.version !== factSheet.version) {
    throw new Error("Saved announcement facts have an invalid change-history closure")
  }
}

const validateNonQuestionSection = (
  manifest: ReleasedPrintJobManifestValue,
  section: ReleasedPrintPacketSection
): void => {
  const expectedIds = manifest.itemIds
  switch (section.tag) {
    case "tool-family-cards":
      if (!exactSequence(section.families.map((family) => family.family), expectedIds)) {
        throw new Error("Saved tool families are outside the exact manifest item closure")
      }
      return
    case "hazard-worksheet":
      if (!exactSequence(section.scenes.map((scene) => scene.id), expectedIds)) {
        throw new Error("Saved hazard worksheet is outside the exact manifest item closure")
      }
      return
    case "annotated-hazard-answers":
    case "text-equivalent-scenes":
      if (
        !exactSequence(section.scenes.map((scene) => scene.id), expectedIds) ||
        section.scenes.some((scene) => scene.answer.sceneId !== scene.id)
      ) {
        throw new Error("Saved hazard answers are outside the exact manifest item closure")
      }
      return
    case "announcement-profile-fact-sheet":
      if (
        !exactSequence(expectedIds, [manifest.profile.id]) ||
        section.profileLabel !== manifest.profile.label ||
        section.jurisdiction !== manifest.profile.jurisdiction ||
        manifest.profile.announcementFactSheet === null ||
        JSON.stringify(section.factSheet) !==
          JSON.stringify(manifest.profile.announcementFactSheet)
      ) {
        throw new Error("Saved announcement profile is outside the exact manifest item closure")
      }
      if (section.factSheet.schemaVersion === 2) {
        validateCurrentAnnouncementFactSheet(section.factSheet)
      }
      return
    case "correction-change-log-excerpt":
      if (!exactSequence(section.corrections.map((correction) => correction.id), expectedIds)) {
        throw new Error("Saved corrections are outside the exact manifest item closure")
      }
      return
    case "answer-sheet":
    case "questions":
    case "answer-key":
    case "explanations":
      return
  }
}

const retainedPacketAssets = (
  sections: ReadonlyArray<ReleasedPrintPacketSection>
): ReadonlyArray<PrintRetainedAsset> => sections.flatMap((section) => {
  switch (section.tag) {
    case "tool-family-cards":
      return section.families.flatMap((family) =>
        family.tools.flatMap((tool) => tool.asset === null ? [] : [tool.asset])
      )
    case "hazard-worksheet":
    case "annotated-hazard-answers":
      return section.scenes.flatMap((scene) => scene.asset === null ? [] : [scene.asset])
    default:
      return []
  }
})

export const validatePrintJobRecord = (value: unknown): PrintJobRecordValue => {
  const record = Schema.decodeUnknownSync(
    PrintJobRecord,
    { onExcessProperty: "error" }
  )(value)
  if (record.manifest.schemaVersion !== record.packet.schemaVersion) {
    throw new Error("Saved print manifest and packet use incompatible schema versions")
  }
  const retainedAssets = retainedPacketAssets(record.packet.sections)
  if (
    retainedAssets.length !== record.manifest.assets.length ||
    retainedAssets.some((asset, index) => {
      const receipt = record.manifest.assets[index]
      return receipt === undefined || !sameAssetReceipt(asset.receipt, receipt)
    })
  ) {
    throw new Error("Saved print images are outside the exact manifest asset closure")
  }
  for (const asset of retainedAssets) decodeRetainedImage(asset)
  if (
    record.manifest.actualLength !== record.manifest.itemIds.length ||
    record.manifest.settings.count !== record.manifest.actualLength ||
    record.manifest.settings.profileId !== record.manifest.profile.id ||
    record.manifest.pageCount < 1 ||
    record.manifest.actualDistribution.reduce((total, entry) => total + entry.count, 0) !==
      record.manifest.actualLength
  ) {
    throw new Error("A saved print manifest has inconsistent item counts")
  }
  const expectedTags = expectedSectionTags(record.manifest)
  const receivedTags = record.packet.sections.map((section) => section.tag)
  if (JSON.stringify(receivedTags) !== JSON.stringify(expectedTags)) {
    throw new Error("A saved print product has an invalid section composition or order")
  }
  const isQuestionProduct = questionProducts.has(record.manifest.settings.product)
  if (
    (isQuestionProduct && record.manifest.pairingFingerprint === null) ||
    (!isQuestionProduct && record.manifest.pairingFingerprint !== null) ||
    (isQuestionProduct && record.manifest.questions.length !== record.manifest.actualLength) ||
    (!isQuestionProduct && record.manifest.questions.length !== 0)
  ) {
    throw new Error("A saved print product has an invalid set-pairing closure")
  }
  if (
    isQuestionProduct &&
    !exactSequence(
      record.manifest.questions.map((question) => question.questionId),
      record.manifest.itemIds
    )
  ) {
    throw new Error("A saved print product has question coordinates outside its item closure")
  }
  if (record.manifest.pairingFingerprint !== computePrintPairingFingerprint(record.manifest)) {
    throw new Error("A saved print product has an invalid set-pairing fingerprint")
  }
  if (record.manifest.fingerprint !== computePrintManifestFingerprint(record.manifest)) {
    throw new Error("A saved print product has an invalid manifest fingerprint")
  }
  if (record.packet.fingerprint !== computePrintPacketFingerprint(record.packet)) {
    throw new Error("A saved print product has an invalid packet fingerprint")
  }
  for (const section of record.packet.sections) {
    const length = section.tag === "answer-sheet"
      ? section.questionNumbers.length
      : section.tag === "questions"
        ? section.questions.length
        : section.tag === "answer-key"
          ? section.answers.length
          : section.tag === "explanations"
            ? section.explanations.length
            : undefined
    if (length !== undefined && length !== record.manifest.actualLength) {
      throw new Error(`Saved ${section.tag} content does not close over the paired item set`)
    }
    switch (section.tag) {
      case "questions":
        validateQuestionSection(record.manifest, section)
        break
      case "answer-sheet":
        validateAnswerSheetSection(record.manifest, section)
        break
      case "answer-key":
        validateAnswerKeySection(record.manifest, section)
        break
      case "explanations":
        validateExplanationSection(record.manifest, section, record.packet.schemaVersion)
        break
      default:
        validateNonQuestionSection(record.manifest, section)
    }
  }
  return record
}

export const validatePrintJobRecordIntegrity = async (
  value: unknown
): Promise<PrintJobRecordValue> => {
  const record = validatePrintJobRecord(value)
  await Promise.all(retainedPacketAssets(record.packet.sections).map(validateRetainedImage))
  return record
}

const sameImmutableJob = (
  existing: PrintJobRecordValue,
  input: SavePrintJobInput
): boolean =>
  existing.manifest.fingerprint === input.manifest.fingerprint &&
  JSON.stringify(existing.manifest) === JSON.stringify(input.manifest) &&
  JSON.stringify(existing.packet) === JSON.stringify(input.packet)

const save = Effect.fn("PrintPersistence.savePrintJob")(function*(
  database: IDBDatabase,
  input: SavePrintJobInput,
  updatedAt: number
) {
  return yield* Effect.tryPromise({
    try: async () => {
      decodePrintJobId(input.id)
      const effectiveUpdatedAt = decodePrintTimestamp(updatedAt)
      Schema.decodeUnknownSync(
        ReleasedPrintJobManifest,
        { onExcessProperty: "error" }
      )(input.manifest)
      Schema.decodeUnknownSync(
        ReleasedPrintPacket,
        { onExcessProperty: "error" }
      )(input.packet)
      const candidate = await validatePrintJobRecordIntegrity(new PrintJobRecord({
        id: input.id,
        manifest: input.manifest,
        packet: input.packet,
        status: "preview-ready",
        updatedAt: effectiveUpdatedAt
      }))
      const saved = await new Promise<PrintJobRecordValue>((resolve, reject) => {
        const transaction = database.transaction(printJobsStore, "readwrite")
        const store = transaction.objectStore(printJobsStore)
        const request = store.get(input.id)
        let saved: PrintJobRecordValue | undefined

        request.onsuccess = () => {
          try {
            if (request.result !== undefined) {
              const existing = validatePrintJobRecord(request.result)
              if (!sameImmutableJob(existing, input)) {
                transaction.abort()
                reject(new Error("This print-job ID already identifies different immutable content"))
                return
              }
              saved = existing
              return
            }
            saved = candidate
            store.put(saved)
          } catch (cause) {
            transaction.abort()
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (saved === undefined) {
            reject(new Error("Print transaction completed without a saved record"))
            return
          }
          resolve(saved)
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Print transaction aborted"))
      })
      return validatePrintJobRecordIntegrity(saved)
    },
    catch: (cause) => persistenceError("save-print-job", cause)
  })
})

const find = Effect.fn("PrintPersistence.findPrintJob")(function*(
  database: IDBDatabase,
  id: string
) {
  return yield* Effect.tryPromise({
    try: async () => {
      decodePrintJobId(id)
      const value = await new Promise<unknown | undefined>((resolve, reject) => {
        const transaction = database.transaction(printJobsStore, "readonly")
        const request = transaction.objectStore(printJobsStore).get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Print read transaction aborted"))
      })
      return value === undefined ? undefined : validatePrintJobRecordIntegrity(value)
    },
    catch: (cause) => persistenceError("find-print-job", cause)
  })
})

const updateStatus = Effect.fn("PrintPersistence.updateStatus")(function*(
  database: IDBDatabase,
  id: string,
  status: "stale" | "system-print-requested",
  updatedAt: number
) {
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<PrintJobRecordValue>((resolve, reject) => {
        decodePrintJobId(id)
        const wallClock = decodePrintTimestamp(updatedAt)
        const transaction = database.transaction(printJobsStore, "readwrite")
        const store = transaction.objectStore(printJobsStore)
        const request = store.get(id)
        let updated: PrintJobRecordValue | undefined
        request.onsuccess = () => {
          try {
            if (request.result === undefined) {
              transaction.abort()
              reject(new Error("The requested print job does not exist"))
              return
            }
            const existing = validatePrintJobRecord(request.result)
            updated = validatePrintJobRecord(new PrintJobRecord({
              ...existing,
              status,
              updatedAt: monotonicPrintTimestamp(wallClock, existing.updatedAt)
            }))
            store.put(updated)
          } catch (cause) {
            transaction.abort()
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (updated === undefined) {
            reject(new Error("Print status transaction completed without a record"))
            return
          }
          resolve(updated)
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Print status transaction aborted"))
      }),
    catch: (cause) => persistenceError("update-print-job-status", cause)
  })
})

export const printPersistenceLive = Layer.effect(
  PrintPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    const connection = appDatabase.connection.pipe(Effect.mapError(databasePersistenceError))
    const savePrintJob = Effect.fn("PrintPersistence.live.savePrintJob")(function*(
      input: SavePrintJobInput
    ) {
      return yield* save(yield* connection, input, yield* Clock.currentTimeMillis)
    })
    const findPrintJob = Effect.fn("PrintPersistence.live.findPrintJob")(function*(id: string) {
      return yield* find(yield* connection, id)
    })
    const markStale = Effect.fn("PrintPersistence.live.markStale")(function*(id: string) {
      return yield* updateStatus(
        yield* connection,
        id,
        "stale",
        yield* Clock.currentTimeMillis
      )
    })
    const requestSystemPrint = Effect.fn("PrintPersistence.live.requestSystemPrint")(
      function*(id: string) {
        return yield* updateStatus(
          yield* connection,
          id,
          "system-print-requested",
          yield* Clock.currentTimeMillis
        )
      }
    )
    return PrintPersistence.of({
      savePrintJob,
      findPrintJob,
      markStale,
      requestSystemPrint
    })
  })
)
