import { Effect, Schema } from "effect"
import {
  AuthoredContentPack,
  ContentSource
} from "../model/authored-pack.ts"
import {
  SourceLine,
  SupportedClaim
} from "../model/source-evidence.ts"
import {
  CatalogArtifact,
  PostcommitPackArtifact,
  PostcommitScene,
  PrecommitPackArtifact,
  PrecommitScene
} from "../model/compiled-pack-artifacts.ts"
import {
  PostcommitQuestion,
  PrecommitQuestion,
  QuestionOption,
  SourceReceipt
} from "../model/question-artifacts.ts"
import { AssetManifestRecord } from "../model/release-manifest.ts"
import {
  AcceptedComparisonReleaseLedger,
  AcceptedSceneReleaseLedger,
  AcceptedToolReleaseLedger
} from "../model/visual-release-inputs.ts"
import type {
  CompileContentPackInput,
  CompiledContentPack,
  CompiledQuestionArtifacts,
  CompiledSceneArtifacts
} from "./compiled-content.ts"
import {
  firstDuplicate,
  isBlank,
  sameMembers
} from "./collection-invariants.ts"
import {
  closureError,
  relationError,
  schemaError
} from "./content-validation.ts"
import { validateQuestionOptionConceptClosure } from "./question-compiler.ts"
import { questionReviewSha256 } from "./question-review.ts"

const decodeAuthoredPack = Schema.decodeUnknownEffect(AuthoredContentPack)
const decodeAcceptedTools = Schema.decodeUnknownEffect(AcceptedToolReleaseLedger)
const decodeAcceptedComparisons = Schema.decodeUnknownEffect(AcceptedComparisonReleaseLedger)
const decodeAcceptedScenes = Schema.decodeUnknownEffect(
  AcceptedSceneReleaseLedger,
  { onExcessProperty: "error" }
)
const decodeCatalogArtifact = Schema.decodeUnknownEffect(CatalogArtifact)
const decodePrecommitPackArtifact = Schema.decodeUnknownEffect(PrecommitPackArtifact)
const decodePostcommitPackArtifact = Schema.decodeUnknownEffect(PostcommitPackArtifact)

const expectedDerivativePath = (
  family: "tools" | "comparisons" | "scenes",
  opaqueAssetId: string,
  kind: "web" | "phone" | "print"
): string => `content/assets/derivatives/${family}/${opaqueAssetId}-${kind}.png`

const expectedMasterPath = (
  family: "tools" | "comparisons" | "scenes",
  opaqueAssetId: string
): string => `content/assets/masters/${family}/${opaqueAssetId}.png`

const validateDerivativeSet = (
  family: "tools" | "comparisons" | "scenes",
  opaqueAssetId: string,
  derivatives: ReadonlyArray<{
    readonly kind: "web" | "phone" | "print"
    readonly path: string
    readonly bytes: number
  }>
): string | undefined => {
  const kinds = derivatives.map((derivative) => derivative.kind)
  if (!sameMembers(kinds, ["web", "phone", "print"])) {
    return `${opaqueAssetId} must have exactly one web, phone, and print derivative`
  }
  if (firstDuplicate(kinds) !== undefined) {
    return `${opaqueAssetId} has a duplicate derivative profile`
  }
  for (const derivative of derivatives) {
    if (derivative.path !== expectedDerivativePath(family, opaqueAssetId, derivative.kind)) {
      return `${opaqueAssetId} ${derivative.kind} derivative does not use its opaque release path`
    }
    if (derivative.bytes <= 0) {
      return `${opaqueAssetId} ${derivative.kind} derivative must not be empty`
    }
  }
  return undefined
}

const sameSource = (
  left: {
    readonly id: string
    readonly title: string
    readonly publisher: string
    readonly evidenceTier: string
    readonly version: string
    readonly locator: string
    readonly scope: string
    readonly rightsNotes: string
    readonly url?: string
  },
  right: {
    readonly id: string
    readonly title: string
    readonly publisher: string
    readonly evidenceTier: string
    readonly version: string
    readonly locator: string
    readonly scope: string
    readonly rightsNotes: string
    readonly url?: string
  }
): boolean =>
  left.id === right.id &&
  left.title === right.title &&
  left.publisher === right.publisher &&
  left.evidenceTier === right.evidenceTier &&
  left.version === right.version &&
  left.locator === right.locator &&
  left.scope === right.scope &&
  left.rightsNotes === right.rightsNotes &&
  left.url === right.url

const sameSourceLine = (
  left: {
    readonly id: string
    readonly sourceId: string
    readonly locator: string
    readonly excerpt: string
    readonly language: string
    readonly verifiedOn: string
    readonly supportedClaimIds: ReadonlyArray<string>
  },
  right: {
    readonly id: string
    readonly sourceId: string
    readonly locator: string
    readonly excerpt: string
    readonly language: string
    readonly verifiedOn: string
    readonly supportedClaimIds: ReadonlyArray<string>
  }
): boolean =>
  left.id === right.id &&
  left.sourceId === right.sourceId &&
  left.locator === right.locator &&
  left.excerpt === right.excerpt &&
  left.language === right.language &&
  left.verifiedOn === right.verifiedOn

const sameSourceReceipt = (
  left: typeof SourceReceipt.Type,
  right: typeof SourceReceipt.Type
): boolean =>
  sameSourceLine(left, right) &&
  left.title === right.title &&
  left.publisher === right.publisher &&
  left.evidenceTier === right.evidenceTier &&
  left.version === right.version &&
  left.rightsNotes === right.rightsNotes &&
  left.scope === right.scope &&
  left.sourceLocator === right.sourceLocator &&
  left.url === right.url &&
  sameMembers(left.supportedClaimIds, right.supportedClaimIds)

const sameSupportedClaim = (
  left: {
    readonly id: string
    readonly text: string
    readonly sourceLineIds: ReadonlyArray<string>
    readonly evidenceTier: string
    readonly caveat: string | null
  },
  right: {
    readonly id: string
    readonly text: string
    readonly sourceLineIds: ReadonlyArray<string>
    readonly evidenceTier: string
    readonly caveat: string | null
  }
): boolean =>
  left.id === right.id &&
  left.text === right.text &&
  sameMembers(left.sourceLineIds, right.sourceLineIds) &&
  left.evidenceTier === right.evidenceTier &&
  left.caveat === right.caveat

const assetManifestRecords = (
  usage: "tool-atlas" | "tool-comparison" | "hazard-scene",
  opaqueAssetId: string,
  derivatives: ReadonlyArray<{
    readonly kind: "web" | "phone" | "print"
    readonly path: string
    readonly sha256: string
    readonly bytes: number
  }>
): ReadonlyArray<typeof AssetManifestRecord.Type> =>
  derivatives.map((derivative) => ({
    opaqueAssetId,
    usage,
    kind: derivative.kind,
    path: derivative.path,
    sha256: derivative.sha256,
    bytes: derivative.bytes
  }))

export const compileContentPack = Effect.fn("Content.compileContentPack")(
  function*(input: CompileContentPackInput) {
    const authoredPack = yield* decodeAuthoredPack(input.authoredPack).pipe(
      Effect.mapError((cause) => schemaError("authoredPack", cause))
    )
    const acceptedTools = yield* decodeAcceptedTools(input.acceptedTools).pipe(
      Effect.mapError((cause) => schemaError("acceptedTools", cause))
    )
    const acceptedComparisons = yield* decodeAcceptedComparisons(input.acceptedComparisons).pipe(
      Effect.mapError((cause) => schemaError("acceptedComparisons", cause))
    )
    const acceptedScenes = yield* decodeAcceptedScenes(input.acceptedScenes).pipe(
      Effect.mapError((cause) => schemaError("acceptedScenes", cause))
    )

    if (authoredPack.version <= 0) {
      return yield* relationError("pack version must be a positive integer", "authoredPack.version")
    }

    const uniqueGroups: ReadonlyArray<readonly [string, ReadonlyArray<string>]> = [
      ["authored source ids", authoredPack.sources.map((source) => source.id)],
      ["source-line ids", authoredPack.sourceLines.map((line) => line.id)],
      ["supported-claim ids", authoredPack.claims.map((claim) => claim.id)],
      ["profile ids", authoredPack.profiles.map((profile) => profile.id)],
      ["profile canonical paths", authoredPack.profiles.map((profile) => profile.canonicalPath)],
      ["authored tool ids", authoredPack.tools.map((tool) => tool.conceptId)],
      ["selected comparison ids", authoredPack.comparisonIds],
      ["question ids", authoredPack.questions.map((question) => question.id)],
      [
        "question objective ids",
        authoredPack.questions.map((question) => question.capacity.objectiveId)
      ],
      [
        "question equivalence-group ids",
        authoredPack.questions.map((question) => question.capacity.equivalenceGroupId)
      ],
      [
        "question review receipt ids",
        authoredPack.questions.map((question) => question.reviewReceipt.id)
      ],
      ["selected scene ids", authoredPack.sceneIds],
      ["accepted tool ids", acceptedTools.map((tool) => tool.conceptId)],
      ["accepted tool opaque ids", acceptedTools.map((tool) => tool.opaqueAssetId)],
      ["accepted comparison ids", acceptedComparisons.map((comparison) => comparison.id)],
      [
        "accepted comparison opaque ids",
        acceptedComparisons.map((comparison) => comparison.opaqueAssetId)
      ],
      ["accepted scene ids", acceptedScenes.map((scene) => scene.sceneId)],
      ["accepted scene opaque ids", acceptedScenes.map((scene) => scene.opaqueAssetId)],
      ["accepted scene slots", acceptedScenes.map((scene) => String(scene.slot))]
    ]
    for (const [label, values] of uniqueGroups) {
      const duplicate = firstDuplicate(values)
      if (duplicate !== undefined) {
        return yield* relationError(`${label} must be unique; duplicate ${duplicate}`)
      }
    }

    if (!sameMembers(
      authoredPack.sceneIds,
      acceptedScenes.map((scene) => scene.sceneId)
    )) {
      return yield* closureError(
        "accepted scene releases must exactly match authored scene ids",
        "acceptedScenes"
      )
    }

    const sourceMap = new Map<string, ContentSource>()
    for (const source of authoredPack.sources) {
      if (
        [
          source.id,
          source.title,
          source.publisher,
          source.version,
          source.locator,
          source.scope,
          source.rightsNotes
        ].some(isBlank)
      ) {
        return yield* relationError(`source ${source.id} contains a blank field`, `sources.${source.id}`)
      }
      sourceMap.set(source.id, source)
    }

    const sourceLineMap = new Map<string, SourceLine>()
    for (const line of authoredPack.sourceLines) {
      if (!sourceMap.has(line.sourceId)) {
        return yield* relationError(
          `source line ${line.id} references missing source ${line.sourceId}`,
          `sourceLines.${line.id}.sourceId`
        )
      }
      if (firstDuplicate(line.supportedClaimIds) !== undefined) {
        return yield* relationError(
          `source line ${line.id} repeats a supported claim`,
          `sourceLines.${line.id}.supportedClaimIds`
        )
      }
      sourceLineMap.set(line.id, line)
    }

    const claimMap = new Map<string, SupportedClaim>()
    for (const claim of authoredPack.claims) {
      if (firstDuplicate(claim.sourceLineIds) !== undefined) {
        return yield* relationError(
          `claim ${claim.id} repeats a source line`,
          `claims.${claim.id}.sourceLineIds`
        )
      }
      const missingLine = claim.sourceLineIds.find((lineId) => !sourceLineMap.has(lineId))
      if (missingLine !== undefined) {
        return yield* relationError(
          `claim ${claim.id} references missing source line ${missingLine}`,
          `claims.${claim.id}.sourceLineIds`
        )
      }
      claimMap.set(claim.id, claim)
    }
    for (const line of authoredPack.sourceLines) {
      const missingClaim = line.supportedClaimIds.find((claimId) => !claimMap.has(claimId))
      if (missingClaim !== undefined) {
        return yield* relationError(
          `source line ${line.id} references missing claim ${missingClaim}`,
          `sourceLines.${line.id}.supportedClaimIds`
        )
      }
      for (const claimId of line.supportedClaimIds) {
        if (!claimMap.get(claimId)!.sourceLineIds.includes(line.id)) {
          return yield* closureError(
            `source line ${line.id} and claim ${claimId} do not form a bidirectional evidence edge`,
            `sourceLines.${line.id}.supportedClaimIds`
          )
        }
      }
    }
    for (const claim of authoredPack.claims) {
      for (const lineId of claim.sourceLineIds) {
        if (!sourceLineMap.get(lineId)!.supportedClaimIds.includes(claim.id)) {
          return yield* closureError(
            `claim ${claim.id} and source line ${lineId} do not form a bidirectional evidence edge`,
            `claims.${claim.id}.sourceLineIds`
          )
        }
      }
    }

    const profileMap = new Map(authoredPack.profiles.map((profile) => [profile.id, profile]))
    const duplicatePracticeLength = firstDuplicate(
      authoredPack.advertisedPracticeLengths.map(String)
    )
    if (duplicatePracticeLength !== undefined) {
      return yield* relationError(
        `advertised practice lengths repeat ${duplicatePracticeLength}`,
        "advertisedPracticeLengths"
      )
    }
    for (const profile of authoredPack.profiles) {
      if (profile.version <= 0) {
        return yield* relationError(
          `profile ${profile.id} version must be positive`,
          `profiles.${profile.id}.version`
        )
      }
      if (profile.layer === "statewide-series" && profile.parentProfileId !== null) {
        return yield* relationError(
          `statewide profile ${profile.id} cannot have a parent profile`,
          `profiles.${profile.id}.parentProfileId`
        )
      }
      if (
        profile.layer === "jurisdiction" &&
        (profile.parentProfileId === null || !profileMap.has(profile.parentProfileId))
      ) {
        return yield* relationError(
          `jurisdiction profile ${profile.id} requires a packed parent profile`,
          `profiles.${profile.id}.parentProfileId`
        )
      }
      const duplicate = firstDuplicate(profile.sourceIds)
      if (duplicate !== undefined) {
        return yield* relationError(
          `profile ${profile.id} repeats source ${duplicate}`,
          `profiles.${profile.id}.sourceIds`
        )
      }
      const missingSource = profile.sourceIds.find((sourceId) => !sourceMap.has(sourceId))
      if (missingSource !== undefined) {
        return yield* relationError(
          `profile ${profile.id} references missing source ${missingSource}`,
          `profiles.${profile.id}.sourceIds`
        )
      }
      const duplicateExamNumber = firstDuplicate(
        profile.examIdentities.map((identity) => identity.examNumber)
      )
      const duplicateCompetitionType = firstDuplicate(profile.competitionTypes)
      if (duplicateExamNumber !== undefined || duplicateCompetitionType !== undefined) {
        return yield* relationError(
          `profile ${profile.id} repeats ${duplicateExamNumber ?? duplicateCompetitionType}`,
          `profiles.${profile.id}.examIdentities`
        )
      }
      const identityCompetitionTypes = [
        ...new Set(profile.examIdentities.map((identity) => identity.competitionType))
      ]
      if (
        profile.layer === "jurisdiction" &&
        (
          profile.examIdentityState !== "verified" ||
          profile.competitionTypeState !== "verified" ||
          profile.examIdentities.length === 0 ||
          !sameMembers(profile.competitionTypes, identityCompetitionTypes)
        )
      ) {
        return yield* relationError(
          `jurisdiction profile ${profile.id} must expose each exam number and its exact competition type`,
          `profiles.${profile.id}.examIdentities`
        )
      }
      if (
        profile.layer === "statewide-series" &&
        (
          profile.examIdentityState !== "not_applicable" ||
          profile.competitionTypeState !== "not_applicable" ||
          profile.examIdentities.length !== 0 ||
          profile.competitionTypes.length !== 0
        )
      ) {
        return yield* relationError(
          `statewide profile ${profile.id} must mark announcement identity and competition type not applicable`,
          `profiles.${profile.id}.examIdentities`
        )
      }
      if (
        profile.testPlanCompatibility.compatibilityKey !== profile.compatibilityKey
      ) {
        return yield* relationError(
          `profile ${profile.id} test-plan compatibility key must match its pinned profile key`,
          `profiles.${profile.id}.testPlanCompatibility.compatibilityKey`
        )
      }
      const profileReceiptLineIds = [
        ...profile.examIdentities.flatMap((identity) => identity.sourceLineIds),
        ...profile.testPlanCompatibility.sourceLineIds
      ]
      const invalidProfileReceiptLine = profileReceiptLineIds.find((sourceLineId) => {
        const line = sourceLineMap.get(sourceLineId)
        return line === undefined || !profile.sourceIds.includes(line.sourceId)
      })
      if (invalidProfileReceiptLine !== undefined) {
        return yield* relationError(
          `profile ${profile.id} identity or compatibility references a source line outside its profile receipt set: ${invalidProfileReceiptLine}`,
          `profiles.${profile.id}`
        )
      }
      const factSheet = profile.announcementFactSheet
      if (profile.layer === "jurisdiction" && factSheet === null) {
        return yield* relationError(
          `jurisdiction profile ${profile.id} requires an announcement fact sheet`,
          `profiles.${profile.id}.announcementFactSheet`
        )
      }
      if (factSheet !== null) {
        if (factSheet.version <= 0) {
          return yield* relationError(
            `profile ${profile.id} fact-sheet version must be positive`,
            `profiles.${profile.id}.announcementFactSheet.version`
          )
        }
        const duplicateFactId = firstDuplicate(factSheet.facts.map((fact) => fact.id))
        if (duplicateFactId !== undefined) {
          return yield* relationError(
            `profile ${profile.id} repeats fact ${duplicateFactId}`,
            `profiles.${profile.id}.announcementFactSheet.facts`
          )
        }
        for (const fact of factSheet.facts) {
          const factSourceLineIds = [
            ...fact.sourceLineIds,
            ...fact.conflictingValues.flatMap((value) => value.sourceLineIds)
          ]
          const duplicateFactSourceLine = firstDuplicate(factSourceLineIds)
          const duplicateConflictValue = firstDuplicate(
            fact.conflictingValues.map((candidate) => candidate.value)
          )
          const unknownExamNumber = fact.appliesToExamNumbers.find(
            (examNumber) => !profile.examIdentities.some(
              (identity) => identity.examNumber === examNumber
            )
          )
          if (duplicateFactSourceLine !== undefined || duplicateConflictValue !== undefined) {
            return yield* relationError(
              `profile ${profile.id} fact ${fact.id} repeats evidence or a conflicting value`,
              `profiles.${profile.id}.announcementFactSheet.facts.${fact.id}`
            )
          }
          if (unknownExamNumber !== undefined || fact.appliesToExamNumbers.length === 0) {
            return yield* relationError(
              `profile ${profile.id} fact ${fact.id} must identify only packed exam numbers`,
              `profiles.${profile.id}.announcementFactSheet.facts.${fact.id}.appliesToExamNumbers`
            )
          }
          if (fact.reviewedOn > factSheet.lastReviewedOn) {
            return yield* relationError(
              `profile ${profile.id} fact ${fact.id} was reviewed after its fact sheet`,
              `profiles.${profile.id}.announcementFactSheet.facts.${fact.id}.reviewedOn`
            )
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
                return hasValue && !hasDetail && hasDirectEvidence && !hasConflicts && !hasSupersedingFact && hasEffectiveStart && !hasEffectiveEnd
              case "not_published":
              case "unverified":
              case "not_applicable":
                return !hasValue && hasDetail && !hasConflicts && !hasSupersedingFact && !hasEffectiveStart && !hasEffectiveEnd
              case "conflicting":
                return !hasValue && hasDetail && !hasDirectEvidence && fact.conflictingValues.length >= 2 && !hasSupersedingFact && !hasEffectiveStart && !hasEffectiveEnd
              case "superseded":
                return hasValue && hasDetail && hasDirectEvidence && !hasConflicts && hasSupersedingFact && hasEffectiveStart && hasEffectiveEnd && fact.effectiveFrom! <= fact.effectiveThrough!
            }
          })()
          if (!validForState) {
            return yield* relationError(
              `profile ${profile.id} fact ${fact.id} does not satisfy the ${fact.state} state contract`,
              `profiles.${profile.id}.announcementFactSheet.facts.${fact.id}`
            )
          }
        }
        for (let leftIndex = 0; leftIndex < factSheet.facts.length; leftIndex += 1) {
          const left = factSheet.facts[leftIndex]!
          if (left.effectiveFrom === null) continue
          for (
            let rightIndex = leftIndex + 1;
            rightIndex < factSheet.facts.length;
            rightIndex += 1
          ) {
            const right = factSheet.facts[rightIndex]!
            if (
              right.effectiveFrom === null ||
              left.category !== right.category ||
              !left.appliesToExamNumbers.some((examNumber) =>
                right.appliesToExamNumbers.includes(examNumber)
              )
            ) {
              continue
            }
            const intervalsOverlap =
              (left.effectiveThrough === null ||
                right.effectiveFrom <= left.effectiveThrough) &&
              (right.effectiveThrough === null ||
                left.effectiveFrom <= right.effectiveThrough)
            if (intervalsOverlap) {
              return yield* relationError(
                `profile ${profile.id} facts ${left.id} and ${right.id} have overlapping effective history`,
                `profiles.${profile.id}.announcementFactSheet.facts`
              )
            }
          }
        }
        const supersededWithoutCurrent = factSheet.facts.find((fact) => {
          if (fact.state !== "superseded") return false
          const successor = factSheet.facts.find(
            (candidate) => candidate.id === fact.supersededByFactId
          )
          return successor === undefined ||
            successor.category !== fact.category ||
            !sameMembers(successor.appliesToExamNumbers, fact.appliesToExamNumbers) ||
            !["superseded", "verified"].includes(successor.state) ||
            successor.effectiveFrom === null ||
            successor.effectiveFrom <= fact.effectiveThrough!
        })
        if (supersededWithoutCurrent !== undefined) {
          return yield* relationError(
            `profile ${profile.id} superseded fact ${supersededWithoutCurrent.id} must point forward to a later superseded or verified fact of the same kind`,
            `profiles.${profile.id}.announcementFactSheet.facts.${supersededWithoutCurrent.id}`
          )
        }
        const requiredFactKinds = [
          "filing_period",
          "exam_date",
          "fee",
          "jurisdictions",
          "qualifications",
          "subjects",
          "medium",
          "counts",
          "weights",
          "scoring",
          "review",
          "form_identity"
        ] as const
        const invalidCurrentFactKind = profile.examIdentities.flatMap((identity) =>
          requiredFactKinds
            .filter((factKind) => factSheet.facts.filter(
              (fact) =>
                fact.category === factKind &&
                fact.appliesToExamNumbers.includes(identity.examNumber) &&
                fact.state !== "superseded"
            ).length !== 1)
            .map((factKind) => `${identity.examNumber}:${factKind}`)
        )[0]
        if (invalidCurrentFactKind !== undefined) {
          return yield* relationError(
            `profile ${profile.id} requires exactly one current fact-state wrapper for ${invalidCurrentFactKind}`,
            `profiles.${profile.id}.announcementFactSheet.facts`
          )
        }
        const factSheetSourceLineIds = [
          ...factSheet.facts.flatMap((fact) => [
            ...fact.sourceLineIds,
            ...fact.conflictingValues.flatMap((value) => value.sourceLineIds)
          ]),
          ...factSheet.changeHistory.flatMap((change) => change.sourceLineIds)
        ]
        const factSheetEntries = [
          ...factSheet.facts.map((fact) => ({ kind: `${fact.state} fact`, ...fact })),
          ...factSheet.changeHistory.map((change) => ({
            kind: `history version ${change.version}`,
            id: String(change.version),
            ...change
          }))
        ]
        const entryWithDuplicateSourceLine = factSheetEntries.find(
          (entry) => firstDuplicate(entry.sourceLineIds) !== undefined
        )
        if (entryWithDuplicateSourceLine !== undefined) {
          return yield* relationError(
            `profile ${profile.id} ${entryWithDuplicateSourceLine.kind} ${entryWithDuplicateSourceLine.id} repeats a source-line receipt`,
            `profiles.${profile.id}.announcementFactSheet`
          )
        }
        const missingFactSheetSourceLine = factSheetSourceLineIds.find(
          (sourceLineId) => {
            const sourceLine = sourceLineMap.get(sourceLineId)
            return sourceLine === undefined || !profile.sourceIds.includes(sourceLine.sourceId)
          }
        )
        if (missingFactSheetSourceLine !== undefined) {
          return yield* relationError(
            `profile ${profile.id} fact sheet references a source line outside its profile receipt set: ${missingFactSheetSourceLine}`,
            `profiles.${profile.id}.announcementFactSheet`
          )
        }
        const factSheetSourceIds = [...new Set(
          [...factSheetSourceLineIds, ...profileReceiptLineIds]
            .map((sourceLineId) => sourceLineMap.get(sourceLineId)!.sourceId)
        )]
        if (!sameMembers(profile.sourceIds, factSheetSourceIds)) {
          return yield* relationError(
            `profile ${profile.id} source receipts must exactly match its fact-sheet evidence`,
            `profiles.${profile.id}.sourceIds`
          )
        }
        const historyVersions = factSheet.changeHistory.map((change) => change.version)
        const duplicateHistoryVersion = firstDuplicate(historyVersions.map(String))
        const versionsOrdered = historyVersions.every(
          (version, index) => version === index + 1
        )
        const datesOrdered = factSheet.changeHistory.every(
          (change, index) =>
            change.changedOn <= factSheet.lastReviewedOn &&
            (index === 0 || change.changedOn >= factSheet.changeHistory[index - 1]!.changedOn)
        )
        const latestHistory = factSheet.changeHistory.at(-1)
        if (
          duplicateHistoryVersion !== undefined ||
          !versionsOrdered ||
          !datesOrdered ||
          latestHistory?.version !== factSheet.version
        ) {
          return yield* relationError(
            `profile ${profile.id} fact-sheet history must be sequential from 1, date-ordered, nonfuture, and end at version ${factSheet.version}`,
            `profiles.${profile.id}.announcementFactSheet.changeHistory`
          )
        }
      }
    }

    const acceptedToolMap = new Map(acceptedTools.map((tool) => [tool.conceptId, tool]))
    const authoredToolMap = new Map(authoredPack.tools.map((tool) => [tool.conceptId, tool]))
    const catalogTools: Array<unknown> = []
    const assets: Array<typeof AssetManifestRecord.Type> = []
    const missingComparisonSource = authoredPack.comparisonSourceIds.find(
      (sourceId) => !sourceMap.has(sourceId)
    )
    if (missingComparisonSource !== undefined) {
      return yield* relationError(
        `comparison releases reference missing source ${missingComparisonSource}`,
        "comparisonSourceIds"
      )
    }

    for (const tool of authoredPack.tools) {
      const release = acceptedToolMap.get(tool.conceptId)
      if (release === undefined) {
        return yield* relationError(
          `tool ${tool.conceptId} has no accepted visual release`,
          `tools.${tool.conceptId}`
        )
      }
      if (release.master.path !== expectedMasterPath("tools", release.opaqueAssetId)) {
        return yield* closureError(
          `tool ${tool.conceptId} master does not use its opaque release path`,
          release.master.path
        )
      }
      if (release.master.bytes <= 0) {
        return yield* closureError(`tool ${tool.conceptId} master must not be empty`, release.master.path)
      }
      const derivativeError = validateDerivativeSet("tools", release.opaqueAssetId, release.derivatives)
      if (derivativeError !== undefined) {
        return yield* closureError(derivativeError, `tools.${tool.conceptId}.derivatives`)
      }
      if (tool.practiceEligibility === "text-question" && release.publicationGate !== null) {
        return yield* relationError(
          `tool ${tool.conceptId} is gated and cannot enter scored practice`,
          `tools.${tool.conceptId}.practiceEligibility`
        )
      }
      if (
        tool.scopeStatus === "watchlist-or-gated" &&
        tool.practiceEligibility !== "atlas-only"
      ) {
        return yield* relationError(
          `watchlist or gated tool ${tool.conceptId} must remain atlas-only`,
          `tools.${tool.conceptId}.practiceEligibility`
        )
      }
      if (
        (tool.evidenceTier.includes("C") || release.publicationGate !== null) &&
        tool.scopeStatus !== "watchlist-or-gated"
      ) {
        return yield* relationError(
          `tool ${tool.conceptId} must expose its watchlist or publication-gate status`,
          `tools.${tool.conceptId}.scopeStatus`
        )
      }
      const missingSource = tool.sourceIds.find((sourceId) => !sourceMap.has(sourceId))
      if (missingSource !== undefined) {
        return yield* relationError(
          `tool ${tool.conceptId} references missing source ${missingSource}`,
          `tools.${tool.conceptId}.sourceIds`
        )
      }
      for (const [label, claimId] of [
        ["use", tool.useClaimId],
        ["recognition feature", tool.featureClaimId]
      ] as const) {
        const claim = claimMap.get(claimId)
        if (claim === undefined) {
          return yield* relationError(
            `tool ${tool.conceptId} references missing ${label} claim ${claimId}`,
            `tools.${tool.conceptId}`
          )
        }
        const outsideSource = claim.sourceLineIds
          .map((lineId) => sourceLineMap.get(lineId)!)
          .find((line) => !tool.sourceIds.includes(line.sourceId))
        if (outsideSource !== undefined) {
          return yield* relationError(
            `tool ${tool.conceptId} ${label} claim uses source ${outsideSource.sourceId} outside its receipt set`,
            `tools.${tool.conceptId}`
          )
        }
      }
      const missingConfusable = tool.confusableConceptIds.find(
        (conceptId) => !authoredToolMap.has(conceptId)
      )
      if (missingConfusable !== undefined) {
        return yield* relationError(
          `tool ${tool.conceptId} references unpacked confusable ${missingConfusable}`,
          `tools.${tool.conceptId}.confusableConceptIds`
        )
      }
      catalogTools.push({
        conceptId: tool.conceptId,
        domain: tool.domain,
        canonicalTerm: release.canonicalTerm,
        family: tool.family,
        evidenceTier: tool.evidenceTier,
        scopeStatus: tool.scopeStatus,
        sourceIds: tool.sourceIds,
        useClaimId: tool.useClaimId,
        featureClaimId: tool.featureClaimId,
        useSummary: tool.useSummary,
        distinguishingFeatures: tool.distinguishingFeatures,
        confusableConceptIds: tool.confusableConceptIds,
        neutralDescription: tool.neutralDescription,
        fullDescription: tool.fullDescription,
        practiceEligibility: tool.practiceEligibility,
        publicationGate: release.publicationGate,
        asset: {
          opaqueAssetId: release.opaqueAssetId,
          revision: release.assetRevision,
          masterSha256: release.master.sha256,
          derivatives: release.derivatives
        }
      })
      assets.push(...assetManifestRecords("tool-atlas", release.opaqueAssetId, release.derivatives))
    }

    const acceptedComparisonMap = new Map(
      acceptedComparisons.map((comparison) => [comparison.id, comparison])
    )
    const catalogComparisons: Array<unknown> = []
    for (const comparisonId of authoredPack.comparisonIds) {
      const comparison = acceptedComparisonMap.get(comparisonId)
      if (comparison === undefined) {
        return yield* relationError(
          `comparison ${comparisonId} has no accepted visual release`,
          `comparisonIds.${comparisonId}`
        )
      }
      if (comparison.memberIds.length < 2) {
        return yield* relationError(
          `comparison ${comparisonId} requires at least two members`,
          `comparisons.${comparisonId}.memberIds`
        )
      }
      const duplicateMember = firstDuplicate(comparison.memberIds)
      const duplicateMemberHash = firstDuplicate(
        comparison.memberMasterHashes.map((member) => member.conceptId)
      )
      if (duplicateMember !== undefined || duplicateMemberHash !== undefined) {
        return yield* relationError(
          `comparison ${comparisonId} repeats member ${duplicateMember ?? duplicateMemberHash}`,
          `comparisons.${comparisonId}.memberIds`
        )
      }
      if (!sameMembers(
        comparison.memberIds,
        comparison.memberMasterHashes.map((member) => member.conceptId)
      )) {
        return yield* closureError(
          `comparison ${comparisonId} member hashes do not close over its members`,
          `comparisons.${comparisonId}.memberMasterHashes`
        )
      }

      const sourceIds: Array<string> = []
      for (const memberId of comparison.memberIds) {
        const authoredMember = authoredToolMap.get(memberId)
        const acceptedMember = acceptedToolMap.get(memberId)
        if (authoredMember === undefined || acceptedMember === undefined) {
          return yield* relationError(
            `comparison ${comparisonId} references unpacked member ${memberId}`,
            `comparisons.${comparisonId}.memberIds`
          )
        }
        const memberHash = comparison.memberMasterHashes.find(
          (candidate) => candidate.conceptId === memberId
        )
        if (memberHash?.sha256 !== acceptedMember.master.sha256) {
          return yield* closureError(
            `comparison ${comparisonId} member ${memberId} targets another accepted master`,
            `comparisons.${comparisonId}.memberMasterHashes`
          )
        }
        for (const sourceId of authoredMember.sourceIds) {
          if (!sourceIds.includes(sourceId)) sourceIds.push(sourceId)
        }
      }
      for (const sourceId of authoredPack.comparisonSourceIds) {
        if (!sourceIds.includes(sourceId)) sourceIds.push(sourceId)
      }
      if (comparison.master.path !== expectedMasterPath("comparisons", comparison.opaqueAssetId)) {
        return yield* closureError(
          `comparison ${comparisonId} master does not use its opaque release path`,
          comparison.master.path
        )
      }
      if (comparison.master.bytes <= 0) {
        return yield* closureError(
          `comparison ${comparisonId} master must not be empty`,
          comparison.master.path
        )
      }
      const derivativeError = validateDerivativeSet(
        "comparisons",
        comparison.opaqueAssetId,
        comparison.derivatives
      )
      if (derivativeError !== undefined) {
        return yield* closureError(
          derivativeError,
          `comparisons.${comparisonId}.derivatives`
        )
      }
      catalogComparisons.push({
        id: comparison.id,
        memberIds: comparison.memberIds,
        decisiveDistinction: comparison.decisiveDistinction,
        scoredUseGate: comparison.scoredUseGate,
        sourceIds,
        asset: {
          opaqueAssetId: comparison.opaqueAssetId,
          revision: comparison.assetRevision,
          masterSha256: comparison.master.sha256,
          derivatives: comparison.derivatives
        }
      })
      assets.push(
        ...assetManifestRecords(
          "tool-comparison",
          comparison.opaqueAssetId,
          comparison.derivatives
        )
      )
    }

    const precommitQuestions: Array<unknown> = []
    const postcommitQuestions: Array<unknown> = []
    const safeMembershipsByQuestionId = new Map<
      string,
      Array<{
        readonly filterKind: "domain" | "family" | "confusion-set"
        readonly filterValue: string
      }>
    >()
    for (const question of authoredPack.questions) {
      const optionIds = question.options.map((option) => option.id)
      const conceptIds = question.options.map((option) => option.conceptId)
      const rationaleIds = question.rationales.map((rationale) => rationale.optionId)
      const duplicateOption = firstDuplicate(optionIds)
      const duplicateConcept = firstDuplicate(conceptIds)
      const duplicateRationale = firstDuplicate(rationaleIds)
      const duplicateProfile = firstDuplicate(question.profileIds)
      const duplicateClaim = firstDuplicate(question.claimIds)
      const duplicateReviewClaim = firstDuplicate(question.reviewReceipt.evidenceClaimIds)
      const duplicateConfusionSet = firstDuplicate(question.tags.confusionSetIds)
      if (question.version <= 0) {
        return yield* relationError(
          `question ${question.id} version must be positive`,
          `questions.${question.id}.version`
        )
      }
      if (question.options.length < 2) {
        return yield* relationError(
          `question ${question.id} requires at least two options`,
          `questions.${question.id}.options`
        )
      }
      if (duplicateOption !== undefined) {
        return yield* relationError(
          `question ${question.id} repeats option ${duplicateOption}`,
          `questions.${question.id}.options`
        )
      }
      if (duplicateConcept !== undefined) {
        return yield* relationError(
          `question ${question.id} repeats concept ${duplicateConcept}`,
          `questions.${question.id}.options`
        )
      }
      if (duplicateRationale !== undefined) {
        return yield* relationError(
          `question ${question.id} repeats rationale ${duplicateRationale}`,
          `questions.${question.id}.rationales`
        )
      }
      if (
        duplicateProfile !== undefined ||
        duplicateClaim !== undefined ||
        duplicateReviewClaim !== undefined ||
        duplicateConfusionSet !== undefined
      ) {
        return yield* relationError(
          `question ${question.id} repeats a profile, claim, review claim, or confusion-set receipt`,
          `questions.${question.id}`
        )
      }
      if (!optionIds.includes(question.correctOptionId)) {
        return yield* relationError(
          `question ${question.id} correctOptionId does not reference an option`,
          `questions.${question.id}.correctOptionId`
        )
      }
      if (!sameMembers(optionIds, rationaleIds)) {
        return yield* relationError(
          `question ${question.id} must have exactly one rationale for every option`,
          `questions.${question.id}.rationales`
        )
      }
      const missingProfile = question.profileIds.find((profileId) => !profileMap.has(profileId))
      if (missingProfile !== undefined) {
        return yield* relationError(
          `question ${question.id} references missing profile ${missingProfile}`,
          `questions.${question.id}.profileIds`
        )
      }
      const unavailableProfile = question.profileIds
        .map((profileId) => profileMap.get(profileId)!)
        .find((profile) =>
          profile.testPlanCompatibility.status !== "compatible" ||
          profile.contentAvailability.status === "unavailable"
        )
      if (unavailableProfile !== undefined) {
        return yield* relationError(
          `question ${question.id} cannot publish into incompatible or unavailable profile ${unavailableProfile.id}`,
          `questions.${question.id}.profileIds`
        )
      }
      const missingClaim = question.claimIds.find((claimId) => !claimMap.has(claimId))
      if (missingClaim !== undefined) {
        return yield* relationError(
          `question ${question.id} references missing claim ${missingClaim}`,
          `questions.${question.id}.claimIds`
        )
      }
      if (!question.claimIds.includes(question.capacity.objectiveId)) {
        return yield* relationError(
          `question ${question.id} objective ${question.capacity.objectiveId} must be one of its supported claims`,
          `questions.${question.id}.capacity.objectiveId`
        )
      }
      if (!sameMembers(question.claimIds, question.reviewReceipt.evidenceClaimIds)) {
        return yield* relationError(
          `question ${question.id} review receipt must cover every question claim`,
          `questions.${question.id}.reviewReceipt.evidenceClaimIds`
        )
      }
      const rationaleClaimIds = [
        ...new Set(question.rationales.flatMap((rationale) => rationale.claimIds))
      ]
      if (!sameMembers(question.claimIds, rationaleClaimIds)) {
        return yield* relationError(
          `question ${question.id} rationales must collectively cite every question claim`,
          `questions.${question.id}.rationales`
        )
      }
      for (const rationale of question.rationales) {
        const duplicateRationaleClaim = firstDuplicate(rationale.claimIds)
        const missingRationaleClaim = rationale.claimIds.find(
          (claimId) => !question.claimIds.includes(claimId) || !claimMap.has(claimId)
        )
        if (duplicateRationaleClaim !== undefined || missingRationaleClaim !== undefined) {
          return yield* relationError(
            `question ${question.id} rationale ${rationale.optionId} has an invalid claim receipt`,
            `questions.${question.id}.rationales.${rationale.optionId}.claimIds`
          )
        }
      }
      if (
        questionReviewSha256(question, {
          claims: authoredPack.claims,
          sourceLines: authoredPack.sourceLines,
          sources: authoredPack.sources
        }) !== question.reviewReceipt.reviewedArtifactSha256
      ) {
        return yield* relationError(
          `question ${question.id} or its resolved evidence changed after its recorded review`,
          `questions.${question.id}.reviewReceipt.reviewedArtifactSha256`
        )
      }
      for (const option of question.options) {
        const tool = authoredToolMap.get(option.conceptId)
        if (tool === undefined) {
          if (!option.conceptId.startsWith("action.")) {
            return yield* relationError(
              `question ${question.id} references neither a packed tool nor an authored action: ${option.conceptId}`,
              `questions.${question.id}.options.${option.id}`
            )
          }
          continue
        }
        if (tool.practiceEligibility !== "text-question") {
          return yield* relationError(
            `question ${question.id} uses atlas-only tool ${option.conceptId}`,
            `questions.${question.id}.options.${option.id}`
          )
        }
      }
      const correctOption = question.options.find(
        (option) => option.id === question.correctOptionId
      )
      const correctTool = correctOption === undefined
        ? undefined
        : authoredToolMap.get(correctOption.conceptId)
      if (correctTool !== undefined && question.tags.family !== correctTool.family) {
        return yield* relationError(
          `question ${question.id} family tag must match its correct concept`,
          `questions.${question.id}.tags.family`
        )
      }
      if (correctTool === undefined && !correctOption?.conceptId.startsWith("action.")) {
        return yield* relationError(
          `question ${question.id} has no valid correct concept`,
          `questions.${question.id}.correctOptionId`
        )
      }
      for (const confusionSetId of question.tags.confusionSetIds) {
        const comparison = acceptedComparisonMap.get(confusionSetId)
        if (comparison === undefined || !authoredPack.comparisonIds.includes(confusionSetId)) {
          return yield* relationError(
            `question ${question.id} references unpublished confusion set ${confusionSetId}`,
            `questions.${question.id}.tags.confusionSetIds`
          )
        }
        if (comparison.scoredUseGate.length > 0) {
          return yield* relationError(
            `question ${question.id} references atlas-only comparison ${confusionSetId}`,
            `questions.${question.id}.tags.confusionSetIds`
          )
        }
        const optionConceptIds = new Set(question.options.map((option) => option.conceptId))
        if (
          correctTool === undefined ||
          !comparison.memberIds.includes(correctTool.conceptId) ||
          comparison.memberIds.filter((memberId) => optionConceptIds.has(memberId)).length < 2
        ) {
          return yield* relationError(
            `question ${question.id} does not exercise both sides of ${confusionSetId}`,
            `questions.${question.id}.tags.confusionSetIds`
          )
        }
      }
      if (
        question.capacity.factKind === "comparison-distinction" &&
        question.tags.confusionSetIds.length === 0
      ) {
        return yield* relationError(
          `comparison question ${question.id} requires a confusion-set tag`,
          `questions.${question.id}.tags.confusionSetIds`
        )
      }
      const optionTools = question.options.map((option) => authoredToolMap.get(option.conceptId))
      const memberships: Array<{
        readonly filterKind: "domain" | "family" | "confusion-set"
        readonly filterValue: string
      }> = []
      if (optionTools.every((tool) => tool !== undefined)) {
        const concreteTools = optionTools as Array<NonNullable<(typeof optionTools)[number]>>
        if (
          concreteTools.every((tool) => tool.domain === question.tags.domain)
        ) {
          memberships.push({ filterKind: "domain", filterValue: question.tags.domain })
        }
        if (
          concreteTools.every((tool) => tool.family === question.tags.family)
        ) {
          memberships.push({ filterKind: "family", filterValue: question.tags.family })
        }
        for (const confusionSetId of question.tags.confusionSetIds) {
          const comparison = acceptedComparisonMap.get(confusionSetId)!
          if (
            question.options.every((option) => comparison.memberIds.includes(option.conceptId))
          ) {
            memberships.push({
              filterKind: "confusion-set",
              filterValue: confusionSetId
            })
          }
        }
      }
      safeMembershipsByQuestionId.set(question.id, memberships)
      precommitQuestions.push({
        id: question.id,
        version: question.version,
        profileIds: question.profileIds,
        prompt: question.prompt,
        options: question.options.map((option) => ({ id: option.id, label: option.label })),
        memberships
      })
      postcommitQuestions.push({
        id: question.id,
        version: question.version,
        optionConceptIds: question.options.map((option) => ({
          optionId: option.id,
          conceptId: option.conceptId
        })),
        correctOptionId: question.correctOptionId,
        rationales: question.rationales,
        claimIds: question.claimIds,
        tags: question.tags,
        objectiveId: question.capacity.objectiveId,
        equivalenceGroupId: question.capacity.equivalenceGroupId,
        factKind: question.capacity.factKind
      })
    }

    const acceptedSceneClaims = acceptedScenes.flatMap((scene) => scene.claims)
    const duplicateAcceptedSceneClaimId = firstDuplicate(
      acceptedSceneClaims.map((claim) => claim.id)
    )
    if (duplicateAcceptedSceneClaimId !== undefined) {
      return yield* relationError(
        `accepted scenes repeat claim ${duplicateAcceptedSceneClaimId}`,
        "acceptedScenes"
      )
    }
    const acceptedSceneClaimMap = new Map(
      acceptedSceneClaims.map((claim) => [claim.id, claim])
    )
    const acceptedSceneSourceLineMap = new Map<
      string,
      typeof acceptedScenes[number]["sources"][number]
    >()
    for (const scene of acceptedScenes) {
      for (const receipt of scene.sources) {
        const existingReceipt = acceptedSceneSourceLineMap.get(receipt.id)
        if (
          existingReceipt !== undefined &&
          !sameSourceReceipt(existingReceipt, receipt)
        ) {
          return yield* relationError(
            `accepted scene source line ${receipt.id} has conflicting global definitions`,
            `acceptedScenes.${scene.sceneId}.sources.${receipt.id}`
          )
        }
        acceptedSceneSourceLineMap.set(receipt.id, receipt)
      }
    }
    for (const receipt of acceptedSceneSourceLineMap.values()) {
      const missingClaimId = receipt.supportedClaimIds.find(
        (claimId) => !acceptedSceneClaimMap.has(claimId)
      )
      if (missingClaimId !== undefined) {
        return yield* closureError(
          `accepted scene source line ${receipt.id} references missing global claim ${missingClaimId}`,
          `acceptedScenes.sources.${receipt.id}.supportedClaimIds`
        )
      }
      for (const claimId of receipt.supportedClaimIds) {
        if (!acceptedSceneClaimMap.get(claimId)!.sourceLineIds.includes(receipt.id)) {
          return yield* closureError(
            `accepted scene source line ${receipt.id} and global claim ${claimId} do not form a bidirectional evidence edge`,
            `acceptedScenes.sources.${receipt.id}.supportedClaimIds`
          )
        }
      }
    }
    for (const claim of acceptedSceneClaimMap.values()) {
      const missingLineId = claim.sourceLineIds.find(
        (lineId) => !acceptedSceneSourceLineMap.has(lineId)
      )
      if (missingLineId !== undefined) {
        return yield* closureError(
          `accepted scene claim ${claim.id} references missing global source line ${missingLineId}`,
          `acceptedScenes.claims.${claim.id}.sourceLineIds`
        )
      }
      for (const lineId of claim.sourceLineIds) {
        if (!acceptedSceneSourceLineMap.get(lineId)!.supportedClaimIds.includes(claim.id)) {
          return yield* closureError(
            `accepted scene claim ${claim.id} and global source line ${lineId} do not form a bidirectional evidence edge`,
            `acceptedScenes.claims.${claim.id}.sourceLineIds`
          )
        }
      }
    }

    const acceptedSceneMap = new Map(acceptedScenes.map((scene) => [scene.sceneId, scene]))
    const precommitScenes: Array<unknown> = []
    const postcommitScenes: Array<unknown> = []

    for (const sceneId of authoredPack.sceneIds) {
      const scene = acceptedSceneMap.get(sceneId)
      if (scene === undefined) {
        return yield* relationError(`scene ${sceneId} has no accepted release`, `sceneIds.${sceneId}`)
      }
      if (scene.publicationGate !== null) {
        return yield* relationError(`scene ${sceneId} retains a publication gate`, `sceneIds.${sceneId}`)
      }
      if (scene.slot <= 0) {
        return yield* relationError(`scene ${sceneId} slot must be positive`, `scenes.${sceneId}.slot`)
      }
      if (scene.master.path !== expectedMasterPath("scenes", scene.opaqueAssetId)) {
        return yield* closureError(
          `scene ${sceneId} master does not use its opaque release path`,
          scene.master.path
        )
      }
      if (scene.master.bytes <= 0) {
        return yield* closureError(`scene ${sceneId} master must not be empty`, scene.master.path)
      }
      const derivativeError = validateDerivativeSet("scenes", scene.opaqueAssetId, scene.derivatives)
      if (derivativeError !== undefined) {
        return yield* closureError(derivativeError, `scenes.${sceneId}.derivatives`)
      }

      if (
        scene.tags.environment !== scene.environment ||
        scene.tags.hazardCategory !== scene.hazardFamily
      ) {
        return yield* closureError(
          `scene ${sceneId} tags must match its accepted environment and hazard family`,
          `scenes.${sceneId}.tags`
        )
      }
      const targetIds = scene.targets.map((target) => target.id)
      const decoyIds = scene.decoys.map((decoy) => decoy.id)
      const duplicateInventoryId = firstDuplicate([...targetIds, ...decoyIds])
      if (duplicateInventoryId !== undefined) {
        return yield* relationError(
          `scene ${sceneId} target and decoy ids must be unique; duplicate ${duplicateInventoryId}`,
          `scenes.${sceneId}`
        )
      }
      if (scene.kind === "positive") {
        if (
          scene.hazardFamily === null ||
          scene.tags.hazardCategory === null ||
          targetIds.length === 0
        ) {
          return yield* relationError(
            `positive scene ${sceneId} requires a hazard family, hazard category, and target`,
            `scenes.${sceneId}`
          )
        }
      } else if (
        scene.hazardFamily !== null ||
        scene.tags.hazardCategory !== null ||
        targetIds.length !== 0
      ) {
        return yield* relationError(
          `zero-hazard scene ${sceneId} must not contain a hazard family, hazard category, or target`,
          `scenes.${sceneId}`
        )
      }

      const zoneOrders = scene.neutralPreAnswer.zones.map((zone) => String(zone.order))
      const zoneLabels = scene.neutralPreAnswer.zones.map((zone) => zone.label)
      if (
        firstDuplicate(zoneOrders) !== undefined ||
        firstDuplicate(zoneLabels) !== undefined ||
        scene.neutralPreAnswer.zones.some((zone, index) => zone.order !== index + 1)
      ) {
        return yield* closureError(
          `scene ${sceneId} neutral zones require unique labels and consecutive one-based order`,
          `scenes.${sceneId}.neutralPreAnswer.zones`
        )
      }
      const zonedItems = [...scene.targets, ...scene.decoys, ...scene.safeBackground]
      const unknownZone = zonedItems.find((item) => !zoneLabels.includes(item.zone))
      if (unknownZone !== undefined) {
        return yield* closureError(
          `scene ${sceneId} inventory references unknown neutral zone ${unknownZone.zone}`,
          `scenes.${sceneId}`
        )
      }
      const duplicateSafeBackground = firstDuplicate(
        scene.safeBackground.map(
          (entry) => `${entry.zone}\n${entry.observableCondition}`
        )
      )
      if (duplicateSafeBackground !== undefined) {
        return yield* relationError(
          `scene ${sceneId} repeats a safe-background observation`,
          `scenes.${sceneId}.safeBackground`
        )
      }
      for (const item of [...scene.targets, ...scene.decoys]) {
        const duplicateConceptId = firstDuplicate(item.conceptIds)
        if (duplicateConceptId !== undefined) {
          return yield* relationError(
            `scene ${sceneId} inventory ${item.id} repeats concept ${duplicateConceptId}`,
            `scenes.${sceneId}.${item.id}.conceptIds`
          )
        }
        for (const polygon of item.polygons) {
          for (const [x, y] of polygon) {
            if (x < 0 || x > 1 || y < 0 || y > 1) {
              return yield* closureError(
                `scene ${sceneId} inventory ${item.id} contains an out-of-bounds region`,
                `scenes.${sceneId}.${item.id}.polygons`
              )
            }
          }
        }
      }

      const sceneClaimIds = scene.claims.map((claim) => claim.id)
      const duplicateClaimId = firstDuplicate(sceneClaimIds)
      if (duplicateClaimId !== undefined) {
        return yield* relationError(
          `scene ${sceneId} repeats claim ${duplicateClaimId}`,
          `scenes.${sceneId}.claims`
        )
      }
      const referencedClaimIds = [...new Set([
        ...scene.targets.flatMap((target) => [
          target.whyUnsafeClaimId,
          target.likelyConsequenceClaimId,
          target.immediateCorrectionClaimId
        ]),
        ...scene.decoys.flatMap((decoy) => [
          decoy.safeAsDepictedClaimId,
          decoy.unsafeIfClaimId
        ])
      ])]
      if (!sameMembers(referencedClaimIds, sceneClaimIds)) {
        return yield* closureError(
          `scene ${sceneId} claim registry must exactly match target and decoy claim references`,
          `scenes.${sceneId}.claims`
        )
      }

      const sceneSourceLineIds = scene.sources.map((source) => source.id)
      const duplicateSourceLineId = firstDuplicate(sceneSourceLineIds)
      if (duplicateSourceLineId !== undefined) {
        return yield* relationError(
          `scene ${sceneId} repeats source-line receipt ${duplicateSourceLineId}`,
          `scenes.${sceneId}.sources`
        )
      }
      const sceneClaimMap = new Map(scene.claims.map((claim) => [claim.id, claim]))
      const sceneSourceLineMap = new Map(scene.sources.map((source) => [source.id, source]))
      for (const claim of scene.claims) {
        const duplicateLineId = firstDuplicate(claim.sourceLineIds)
        if (duplicateLineId !== undefined) {
          return yield* relationError(
            `scene ${sceneId} claim ${claim.id} repeats source line ${duplicateLineId}`,
            `scenes.${sceneId}.claims.${claim.id}.sourceLineIds`
          )
        }
        const missingLineId = claim.sourceLineIds.find(
          (lineId) => !sceneSourceLineMap.has(lineId)
        )
        if (missingLineId !== undefined) {
          return yield* closureError(
            `scene ${sceneId} claim ${claim.id} references missing source line ${missingLineId}`,
            `scenes.${sceneId}.claims.${claim.id}.sourceLineIds`
          )
        }
        for (const lineId of claim.sourceLineIds) {
          if (!sceneSourceLineMap.get(lineId)!.supportedClaimIds.includes(claim.id)) {
            return yield* closureError(
              `scene ${sceneId} claim ${claim.id} and source line ${lineId} do not form a bidirectional evidence edge`,
              `scenes.${sceneId}.claims.${claim.id}.sourceLineIds`
            )
          }
        }
      }
      for (const receipt of scene.sources) {
        if (receipt.scope === undefined || receipt.sourceLocator === undefined) {
          return yield* relationError(
            `scene ${sceneId} source receipt ${receipt.id} requires source scope and source locator metadata`,
            `scenes.${sceneId}.sources.${receipt.id}`
          )
        }
        const duplicateSupportedClaim = firstDuplicate(receipt.supportedClaimIds)
        if (duplicateSupportedClaim !== undefined) {
          return yield* relationError(
            `scene ${sceneId} source receipt ${receipt.id} repeats claim ${duplicateSupportedClaim}`,
            `scenes.${sceneId}.sources.${receipt.id}.supportedClaimIds`
          )
        }
        const localSupportedClaimIds = receipt.supportedClaimIds.filter(
          (claimId) => sceneClaimMap.has(claimId)
        )
        if (localSupportedClaimIds.length === 0) {
          return yield* closureError(
            `scene ${sceneId} source receipt ${receipt.id} must support at least one local claim`,
            `scenes.${sceneId}.sources.${receipt.id}.supportedClaimIds`
          )
        }
        const localClaimsUsingReceipt = scene.claims
          .filter((claim) => claim.sourceLineIds.includes(receipt.id))
          .map((claim) => claim.id)
        if (!sameMembers(localSupportedClaimIds, localClaimsUsingReceipt)) {
          return yield* closureError(
            `scene ${sceneId} source receipt ${receipt.id} and its local claims do not form exact bidirectional evidence edges`,
            `scenes.${sceneId}.sources.${receipt.id}.supportedClaimIds`
          )
        }
      }

      for (const claim of scene.claims) {
        const existingClaim = claimMap.get(claim.id)
        if (existingClaim !== undefined && !sameSupportedClaim(existingClaim, claim)) {
          return yield* relationError(
            `claim ${claim.id} has conflicting definitions`,
            `scenes.${sceneId}.claims.${claim.id}`
          )
        }
        claimMap.set(claim.id, claim)
      }
      for (const receipt of scene.sources) {
        const compiledSource = new ContentSource({
          id: receipt.sourceId,
          title: receipt.title,
          publisher: receipt.publisher,
          evidenceTier: receipt.evidenceTier,
          version: receipt.version,
          locator: receipt.sourceLocator!,
          scope: receipt.scope!,
          rightsNotes: receipt.rightsNotes,
          ...(receipt.url === undefined ? {} : { url: receipt.url })
        })
        const existingSource = sourceMap.get(receipt.sourceId)
        if (existingSource !== undefined && !sameSource(existingSource, compiledSource)) {
          return yield* relationError(
            `source ${receipt.sourceId} has conflicting definitions`,
            `scenes.${sceneId}.sources.${receipt.id}`
          )
        }
        sourceMap.set(receipt.sourceId, compiledSource)

        const compiledLine = new SourceLine({
          id: receipt.id,
          sourceId: receipt.sourceId,
          locator: receipt.locator,
          excerpt: receipt.excerpt,
          language: receipt.language,
          verifiedOn: receipt.verifiedOn,
          supportedClaimIds: receipt.supportedClaimIds
        })
        const existingLine = sourceLineMap.get(receipt.id)
        if (existingLine !== undefined && !sameSourceLine(existingLine, compiledLine)) {
          return yield* relationError(
            `source line ${receipt.id} has conflicting definitions`,
            `scenes.${sceneId}.sources.${receipt.id}`
          )
        }
        if (existingLine === undefined) {
          sourceLineMap.set(receipt.id, compiledLine)
        } else {
          const supportedClaimIds = [...new Set([
            ...existingLine.supportedClaimIds,
            ...receipt.supportedClaimIds
          ])]
          const [firstSupportedClaimId, ...remainingSupportedClaimIds] = supportedClaimIds
          sourceLineMap.set(receipt.id, new SourceLine({
            id: existingLine.id,
            sourceId: existingLine.sourceId,
            locator: existingLine.locator,
            excerpt: existingLine.excerpt,
            language: existingLine.language,
            verifiedOn: existingLine.verifiedOn,
            supportedClaimIds: [firstSupportedClaimId!, ...remainingSupportedClaimIds]
          }))
        }
      }

      const asset = {
        opaqueAssetId: scene.opaqueAssetId,
        revision: 1,
        masterSha256: scene.master.sha256,
        derivatives: scene.derivatives
      }
      precommitScenes.push({
        id: scene.opaqueAssetId,
        environment: scene.environment,
        asset,
        neutralPreAnswer: scene.neutralPreAnswer
      })
      postcommitScenes.push({
        schemaVersion: 2,
        version: 2,
        id: scene.sceneId,
        opaqueAssetId: scene.opaqueAssetId,
        kind: scene.kind,
        hazardFamily: scene.hazardFamily,
        tags: scene.tags,
        targets: scene.targets,
        decoys: scene.decoys,
        safeBackground: scene.safeBackground,
        claims: scene.claims,
        sources: scene.sources.map((receipt) => ({
          ...receipt,
          supportedClaimIds: receipt.supportedClaimIds.filter(
            (claimId) => sceneClaimMap.has(claimId)
          )
        }))
      })
      assets.push(...assetManifestRecords("hazard-scene", scene.opaqueAssetId, scene.derivatives))
    }

    const duplicateAssetPath = firstDuplicate(assets.map((asset) => asset.path))
    if (duplicateAssetPath !== undefined) {
      return yield* closureError(`asset closure repeats ${duplicateAssetPath}`, duplicateAssetPath)
    }

    const publicProfiles = authoredPack.profiles.map((profile) => ({
      id: profile.id,
      version: profile.version,
      label: profile.label,
      jurisdiction: profile.jurisdiction,
      canonicalPath: profile.canonicalPath,
      layer: profile.layer,
      parentProfileId: profile.parentProfileId,
      audience: profile.audience,
      scopeNotes: profile.scopeNotes,
      announcementFactSheet: profile.announcementFactSheet,
      examIdentityState: profile.examIdentityState,
      examIdentities: profile.examIdentities,
      competitionTypeState: profile.competitionTypeState,
      competitionTypes: profile.competitionTypes,
      seriesLevel: profile.seriesLevel,
      testPlanCompatibility: profile.testPlanCompatibility,
      contentAvailability: profile.contentAvailability,
      sourceIds: profile.sourceIds,
      series: profile.series,
      compatibilityKey: profile.compatibilityKey,
      disclaimer: profile.disclaimer
    }))
    const sources = [...sourceMap.values()]

    const capacityRecords: Array<{
      readonly profileId: string
      readonly filterKind: "all" | "domain" | "family" | "confusion-set"
      readonly filterValue: string
      readonly questionCount: number
      readonly availableSetLengths: ReadonlyArray<45 | 60 | 90>
    }> = []
    const addCapacityRecord = (
      profileId: string,
      filterKind: "all" | "domain" | "family" | "confusion-set",
      filterValue: string,
      questionCount: number
    ): void => {
      capacityRecords.push({
        profileId,
        filterKind,
        filterValue,
        questionCount,
        availableSetLengths: authoredPack.advertisedPracticeLengths.filter(
          (length) => length <= questionCount
        )
      })
    }
    for (const profile of authoredPack.profiles) {
      const eligible = authoredPack.questions.filter((question) =>
        question.profileIds.includes(profile.id)
      )
      addCapacityRecord(profile.id, "all", "all", eligible.length)
      for (const filterKind of ["domain", "family", "confusion-set"] as const) {
        const values = [...new Set(
          eligible.flatMap((question) =>
            (safeMembershipsByQuestionId.get(question.id) ?? [])
              .filter((membership) => membership.filterKind === filterKind)
              .map((membership) => membership.filterValue)
          )
        )].sort()
        for (const filterValue of values) {
          addCapacityRecord(
            profile.id,
            filterKind,
            filterValue,
            eligible.filter((question) =>
              (safeMembershipsByQuestionId.get(question.id) ?? []).some(
                (membership) =>
                  membership.filterKind === filterKind &&
                  membership.filterValue === filterValue
              )
            ).length
          )
        }
      }
    }

    const profileSourceLineIds = new Set(
      authoredPack.profiles.flatMap((profile) => {
        const factSheet = profile.announcementFactSheet
        return [
          ...profile.examIdentities.flatMap((identity) => identity.sourceLineIds),
          ...profile.testPlanCompatibility.sourceLineIds,
          ...(factSheet === null ? [] : [
            ...factSheet.facts.flatMap((fact) => [
              ...fact.sourceLineIds,
              ...fact.conflictingValues.flatMap((value) => value.sourceLineIds)
            ]),
            ...factSheet.changeHistory.flatMap((change) => change.sourceLineIds)
          ])
        ]
      })
    )
    const catalog = yield* decodeCatalogArtifact({
      schemaVersion: 1,
      packId: authoredPack.packId,
      version: authoredPack.version,
      locale: authoredPack.locale,
      sources: authoredPack.sources,
      sourceLines: authoredPack.sourceLines.filter((line) => profileSourceLineIds.has(line.id)),
      profiles: publicProfiles,
      tools: catalogTools,
      comparisons: catalogComparisons,
      practiceCapacity: {
        advertisedSetLengths: authoredPack.advertisedPracticeLengths,
        records: capacityRecords
      }
    }).pipe(Effect.mapError((cause) => schemaError("compiled.catalog", cause)))

    const precommit = yield* decodePrecommitPackArtifact({
      schemaVersion: 1,
      packId: authoredPack.packId,
      version: authoredPack.version,
      locale: authoredPack.locale,
      profiles: publicProfiles,
      questions: precommitQuestions,
      scenes: precommitScenes
    }).pipe(Effect.mapError((cause) => schemaError("compiled.precommit", cause)))

    const postcommit = yield* decodePostcommitPackArtifact({
      schemaVersion: 2,
      packId: authoredPack.packId,
      version: authoredPack.version,
      locale: authoredPack.locale,
      sources,
      sourceLines: [...sourceLineMap.values()],
      claims: [...claimMap.values()],
      questions: postcommitQuestions,
      scenes: postcommitScenes
    }).pipe(Effect.mapError((cause) => schemaError("compiled.postcommit", cause)))

    const questions: Array<CompiledQuestionArtifacts> = []
    for (const question of precommit.questions) {
      const answer = postcommit.questions.find((candidate) => candidate.id === question.id)
      if (answer === undefined) {
        return yield* closureError(
          `question ${question.id} is missing its postcommit artifact`,
          `questions.${question.id}`
        )
      }
      const optionConceptIds = yield* validateQuestionOptionConceptClosure(
        question.id,
        question.options.map((option) => option.id),
        answer.optionConceptIds
      )
      const [firstOption, ...remainingOptions] = question.options
      const options: readonly [QuestionOption, ...Array<QuestionOption>] = [
        new QuestionOption({ id: firstOption.id, label: firstOption.label }),
        ...remainingOptions.map(
          (option) => new QuestionOption({ id: option.id, label: option.label })
        )
      ]
      const claims = answer.claimIds.map((claimId) => claimMap.get(claimId)!)
      const [firstClaim, ...remainingClaims] = claims
      if (firstClaim === undefined) {
        return yield* closureError(
          `question ${question.id} requires at least one compiled claim`,
          `questions.${question.id}.claimIds`
        )
      }
      const sourceLineIds = [...new Set(claims.flatMap((claim) => claim.sourceLineIds))]
      const sourceReceipts: Array<SourceReceipt> = []
      for (const sourceLineId of sourceLineIds) {
        const line = sourceLineMap.get(sourceLineId)
        const source = line === undefined ? undefined : sourceMap.get(line.sourceId)
        if (line === undefined || source === undefined) {
          return yield* closureError(
            `question ${question.id} is missing compiled source-line receipt ${sourceLineId}`,
            `questions.${question.id}.claimIds`
          )
        }
        sourceReceipts.push(
          new SourceReceipt({
            id: line.id,
            sourceId: source.id,
            title: source.title,
            publisher: source.publisher,
            evidenceTier: source.evidenceTier,
            version: source.version,
            rightsNotes: source.rightsNotes,
            locator: line.locator,
            excerpt: line.excerpt,
            language: line.language,
            verifiedOn: line.verifiedOn,
            supportedClaimIds: line.supportedClaimIds,
            ...(source.url === undefined ? {} : { url: source.url })
          })
        )
      }
      const [firstSource, ...remainingSources] = sourceReceipts
      if (firstSource === undefined) {
        return yield* closureError(
          `question ${question.id} requires at least one compiled source`,
          `questions.${question.id}.sourceIds`
        )
      }
      questions.push({
        id: question.id,
        precommit: new PrecommitQuestion({
          schemaVersion: 2,
          id: question.id,
          version: question.version,
          profileId: question.profileIds[0],
          profileIds: question.profileIds,
          prompt: question.prompt,
          options,
          memberships: question.memberships
        }),
        postcommit: new PostcommitQuestion({
          schemaVersion: 2,
          id: question.id,
          version: question.version,
          optionConceptIds,
          correctOptionId: answer.correctOptionId,
          rationales: answer.rationales,
          claims: [firstClaim, ...remainingClaims],
          sources: [firstSource, ...remainingSources],
          tags: answer.tags,
          objectiveId: answer.objectiveId,
          equivalenceGroupId: answer.equivalenceGroupId,
          factKind: answer.factKind
        })
      })
    }

    const scenes: Array<CompiledSceneArtifacts> = []
    for (const scene of precommit.scenes) {
      const answer = postcommit.scenes.find(
        (candidate) => candidate.opaqueAssetId === scene.id
      )
      if (answer === undefined) {
        return yield* closureError(
          `scene ${scene.id} is missing its postcommit artifact`,
          `scenes.${scene.id}`
        )
      }
      scenes.push({ opaqueAssetId: scene.id, precommit: scene, postcommit: answer })
    }

    const compatibilityQuestion = questions[0]
    if (compatibilityQuestion === undefined) {
      return yield* closureError("compiled pack requires at least one question", "questions")
    }
    const compiledQuestions: readonly [
      CompiledQuestionArtifacts,
      ...Array<CompiledQuestionArtifacts>
    ] = [compatibilityQuestion, ...questions.slice(1)]

    return {
      catalog,
      precommit,
      postcommit,
      questions: compiledQuestions,
      scenes,
      compatibilityQuestion,
      assets
    } satisfies CompiledContentPack
  }
)
