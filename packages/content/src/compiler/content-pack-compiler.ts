import { Effect, Schema } from "effect"
import {
  AuthoredContentPack,
  ContentSource
} from "../model/authored-pack.ts"
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
  AcceptedSceneAccessibilityLedger,
  AcceptedSceneRegionLedger,
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
  sameMembers,
  sameOrderedValues
} from "./collection-invariants.ts"
import {
  closureError,
  relationError,
  schemaError
} from "./content-validation.ts"
import { validateQuestionOptionConceptClosure } from "./question-compiler.ts"

const decodeAuthoredPack = Schema.decodeUnknownEffect(AuthoredContentPack)
const decodeAcceptedTools = Schema.decodeUnknownEffect(AcceptedToolReleaseLedger)
const decodeAcceptedScenes = Schema.decodeUnknownEffect(AcceptedSceneReleaseLedger)
const decodeAcceptedSceneRegions = Schema.decodeUnknownEffect(AcceptedSceneRegionLedger)
const decodeAcceptedSceneAccessibility = Schema.decodeUnknownEffect(
  AcceptedSceneAccessibilityLedger
)
const decodeCatalogArtifact = Schema.decodeUnknownEffect(CatalogArtifact)
const decodePrecommitPackArtifact = Schema.decodeUnknownEffect(PrecommitPackArtifact)
const decodePostcommitPackArtifact = Schema.decodeUnknownEffect(PostcommitPackArtifact)

const expectedDerivativePath = (
  family: "tools" | "scenes",
  opaqueAssetId: string,
  kind: "web" | "phone" | "print"
): string => `content/assets/derivatives/${family}/${opaqueAssetId}-${kind}.png`

const expectedMasterPath = (
  family: "tools" | "scenes",
  opaqueAssetId: string
): string => `content/assets/masters/${family}/${opaqueAssetId}.png`

const validateDerivativeSet = (
  family: "tools" | "scenes",
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
    readonly locator: string
    readonly scope: string
    readonly url?: string
  },
  right: {
    readonly id: string
    readonly title: string
    readonly locator: string
    readonly scope: string
    readonly url?: string
  }
): boolean =>
  left.id === right.id &&
  left.title === right.title &&
  left.locator === right.locator &&
  left.scope === right.scope &&
  left.url === right.url

const assetManifestRecords = (
  usage: "tool-atlas" | "hazard-scene",
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
    const acceptedScenes = yield* decodeAcceptedScenes(input.acceptedScenes).pipe(
      Effect.mapError((cause) => schemaError("acceptedScenes", cause))
    )
    const acceptedSceneRegions = yield* decodeAcceptedSceneRegions(input.acceptedSceneRegions).pipe(
      Effect.mapError((cause) => schemaError("acceptedSceneRegions", cause))
    )
    const acceptedSceneAccessibility = yield* decodeAcceptedSceneAccessibility(
      input.acceptedSceneAccessibility
    ).pipe(Effect.mapError((cause) => schemaError("acceptedSceneAccessibility", cause)))

    if (authoredPack.version <= 0) {
      return yield* relationError("pack version must be a positive integer", "authoredPack.version")
    }

    const uniqueGroups: ReadonlyArray<readonly [string, ReadonlyArray<string>]> = [
      ["authored source ids", authoredPack.sources.map((source) => source.id)],
      ["profile ids", authoredPack.profiles.map((profile) => profile.id)],
      ["authored tool ids", authoredPack.tools.map((tool) => tool.conceptId)],
      ["question ids", authoredPack.questions.map((question) => question.id)],
      ["selected scene ids", authoredPack.sceneIds],
      ["accepted tool ids", acceptedTools.map((tool) => tool.conceptId)],
      ["accepted tool opaque ids", acceptedTools.map((tool) => tool.opaqueAssetId)],
      ["accepted scene ids", acceptedScenes.map((scene) => scene.sceneId)],
      ["accepted scene opaque ids", acceptedScenes.map((scene) => scene.opaqueAssetId)],
      ["scene region ids", acceptedSceneRegions.map((regions) => regions.sceneId)],
      ["scene accessibility ids", acceptedSceneAccessibility.map((entry) => entry.sceneId)]
    ]
    for (const [label, values] of uniqueGroups) {
      const duplicate = firstDuplicate(values)
      if (duplicate !== undefined) {
        return yield* relationError(`${label} must be unique; duplicate ${duplicate}`)
      }
    }

    const sourceMap = new Map<string, ContentSource>()
    for (const source of authoredPack.sources) {
      if ([source.id, source.title, source.locator, source.scope].some(isBlank)) {
        return yield* relationError(`source ${source.id} contains a blank field`, `sources.${source.id}`)
      }
      sourceMap.set(source.id, source)
    }

    const profileMap = new Map(authoredPack.profiles.map((profile) => [profile.id, profile]))
    for (const profile of authoredPack.profiles) {
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
    }

    const acceptedToolMap = new Map(acceptedTools.map((tool) => [tool.conceptId, tool]))
    const authoredToolMap = new Map(authoredPack.tools.map((tool) => [tool.conceptId, tool]))
    const catalogTools: Array<unknown> = []
    const assets: Array<typeof AssetManifestRecord.Type> = []

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
      const missingSource = tool.sourceIds.find((sourceId) => !sourceMap.has(sourceId))
      if (missingSource !== undefined) {
        return yield* relationError(
          `tool ${tool.conceptId} references missing source ${missingSource}`,
          `tools.${tool.conceptId}.sourceIds`
        )
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
        canonicalTerm: release.canonicalTerm,
        family: tool.family,
        sourceIds: tool.sourceIds,
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

    const precommitQuestions: Array<unknown> = []
    const postcommitQuestions: Array<unknown> = []
    for (const question of authoredPack.questions) {
      const optionIds = question.options.map((option) => option.id)
      const conceptIds = question.options.map((option) => option.conceptId)
      const rationaleIds = question.rationales.map((rationale) => rationale.optionId)
      const duplicateOption = firstDuplicate(optionIds)
      const duplicateConcept = firstDuplicate(conceptIds)
      const duplicateRationale = firstDuplicate(rationaleIds)
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
      const missingSource = question.sourceIds.find((sourceId) => !sourceMap.has(sourceId))
      if (missingSource !== undefined) {
        return yield* relationError(
          `question ${question.id} references missing source ${missingSource}`,
          `questions.${question.id}.sourceIds`
        )
      }
      for (const option of question.options) {
        const tool = authoredToolMap.get(option.conceptId)
        if (tool === undefined) {
          return yield* relationError(
            `question ${question.id} references unpacked tool ${option.conceptId}`,
            `questions.${question.id}.options.${option.id}`
          )
        }
        if (tool.practiceEligibility !== "text-question") {
          return yield* relationError(
            `question ${question.id} uses atlas-only tool ${option.conceptId}`,
            `questions.${question.id}.options.${option.id}`
          )
        }
      }
      precommitQuestions.push({
        id: question.id,
        profileIds: question.profileIds,
        prompt: question.prompt,
        options: question.options.map((option) => ({ id: option.id, label: option.label }))
      })
      postcommitQuestions.push({
        id: question.id,
        optionConceptIds: question.options.map((option) => ({
          optionId: option.id,
          conceptId: option.conceptId
        })),
        correctOptionId: question.correctOptionId,
        rationales: question.rationales,
        sourceIds: question.sourceIds
      })
    }

    const acceptedSceneMap = new Map(acceptedScenes.map((scene) => [scene.sceneId, scene]))
    const regionMap = new Map(acceptedSceneRegions.map((regions) => [regions.sceneId, regions]))
    const accessibilityMap = new Map(
      acceptedSceneAccessibility.map((entry) => [entry.sceneId, entry])
    )
    const precommitScenes: Array<unknown> = []
    const postcommitScenes: Array<unknown> = []

    for (const sceneId of authoredPack.sceneIds) {
      const scene = acceptedSceneMap.get(sceneId)
      const regions = regionMap.get(sceneId)
      const accessibility = accessibilityMap.get(sceneId)
      if (scene === undefined) {
        return yield* relationError(`scene ${sceneId} has no accepted release`, `sceneIds.${sceneId}`)
      }
      if (regions === undefined) {
        return yield* relationError(`scene ${sceneId} has no accepted region record`, `sceneIds.${sceneId}`)
      }
      if (accessibility === undefined) {
        return yield* relationError(
          `scene ${sceneId} has no accepted accessibility record`,
          `sceneIds.${sceneId}`
        )
      }
      if (scene.publicationGate !== null) {
        return yield* relationError(`scene ${sceneId} retains a publication gate`, `sceneIds.${sceneId}`)
      }
      if (
        scene.opaqueAssetId !== regions.opaqueAssetId ||
        scene.opaqueAssetId !== accessibility.opaqueAssetId
      ) {
        return yield* closureError(`scene ${sceneId} opaque asset bindings disagree`, `sceneIds.${sceneId}`)
      }
      if (scene.master.sha256 !== regions.masterSha256) {
        return yield* closureError(`scene ${sceneId} region record targets another master hash`, sceneId)
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

      const targetIds = scene.semanticManifest.targets.map((target) => target.id)
      const regionTargetIds = regions.targetRegions.map((region) => region.inventoryId)
      const decoyIds = scene.semanticManifest.decoys.map((decoy) => decoy.id)
      const regionDecoyIds = regions.decoyRegions.map((region) => region.inventoryId)
      if (firstDuplicate(targetIds) !== undefined || firstDuplicate(decoyIds) !== undefined) {
        return yield* relationError(`scene ${sceneId} target and decoy ids must be unique`, sceneId)
      }
      if (!sameMembers(targetIds, regionTargetIds)) {
        return yield* closureError(`scene ${sceneId} target regions do not close over target inventory`, sceneId)
      }
      if (!sameMembers(decoyIds, regionDecoyIds)) {
        return yield* closureError(`scene ${sceneId} decoy regions do not close over decoy inventory`, sceneId)
      }
      if (scene.kind === "positive") {
        if (scene.hazardFamily === null || targetIds.length === 0) {
          return yield* relationError(
            `positive scene ${sceneId} requires a hazard family and target`,
            sceneId
          )
        }
      } else if (scene.hazardFamily !== null || targetIds.length !== 0) {
        return yield* relationError(
          `zero-hazard scene ${sceneId} must not contain a hazard family or target`,
          sceneId
        )
      }

      const full = accessibility.fullPostAnswer
      if (full.claim !== scene.semanticManifest.claim) {
        return yield* closureError(`scene ${sceneId} accessibility claim does not match semantic claim`, sceneId)
      }
      if (
        !sameOrderedValues(
          full.targets.map((target) => `${target.condition}\n${target.correction}`),
          scene.semanticManifest.targets.map((target) => `${target.condition}\n${target.correction}`)
        )
      ) {
        return yield* closureError(`scene ${sceneId} accessible targets do not match target inventory`, sceneId)
      }
      if (
        !sameOrderedValues(
          full.decoys.map((decoy) => `${decoy.condition}\n${decoy.safeBecause}`),
          scene.semanticManifest.decoys.map((decoy) => `${decoy.condition}\n${decoy.safeBecause}`)
        )
      ) {
        return yield* closureError(`scene ${sceneId} accessible decoys do not match decoy inventory`, sceneId)
      }
      if (!sameOrderedValues(full.safeBackground, scene.semanticManifest.safeBackground)) {
        return yield* closureError(
          `scene ${sceneId} accessible safe background does not match semantic inventory`,
          sceneId
        )
      }
      if (
        !sameMembers(
          full.sources.map((source) => source.id),
          scene.semanticManifest.sources.map((source) => source.id)
        )
      ) {
        return yield* closureError(`scene ${sceneId} accessible sources do not match semantic sources`, sceneId)
      }
      for (const source of scene.semanticManifest.sources) {
        const accessibleSource = full.sources.find((candidate) => candidate.id === source.id)
        if (accessibleSource === undefined || !sameSource(source, accessibleSource)) {
          return yield* closureError(`scene ${sceneId} source ${source.id} is inconsistent`, sceneId)
        }
        const compiledSource = new ContentSource({
          id: source.id,
          title: source.title,
          locator: source.locator,
          scope: source.scope,
          url: source.url
        })
        const existing = sourceMap.get(source.id)
        if (existing !== undefined && !sameSource(existing, compiledSource)) {
          return yield* relationError(`source ${source.id} has conflicting definitions`, sceneId)
        }
        sourceMap.set(source.id, compiledSource)
      }
      for (const target of full.targets) {
        const missingSource = target.sourceIds.find((sourceId) => !sourceMap.has(sourceId))
        if (missingSource !== undefined) {
          return yield* closureError(
            `scene ${sceneId} target references missing source ${missingSource}`,
            sceneId
          )
        }
      }

      const targetStatements = accessibility.nonvisualZonedEquivalent.filter(
        (statement) => statement.role === "target"
      )
      const decoyStatements = accessibility.nonvisualZonedEquivalent.filter(
        (statement) => statement.role === "decoy"
      )
      const safeBackgroundStatements = accessibility.nonvisualZonedEquivalent.filter(
        (statement) => statement.role === "safe-background"
      )
      if (
        !sameOrderedValues(
          targetStatements.map((statement) => statement.statement),
          scene.semanticManifest.targets.map((target) => target.condition)
        ) ||
        !sameOrderedValues(
          decoyStatements.map((statement) => statement.statement),
          scene.semanticManifest.decoys.map(
            (decoy) => `${decoy.condition}; ${decoy.safeBecause}.`
          )
        ) ||
        !sameOrderedValues(
          safeBackgroundStatements.map((statement) => statement.statement),
          scene.semanticManifest.safeBackground
        )
      ) {
        return yield* closureError(
          `scene ${sceneId} nonvisual equivalent does not exactly cover semantic inventories`,
          sceneId
        )
      }
      const zoneOrders = accessibility.neutralPreAnswer.zones.map((zone) => zone.order)
      const zoneLabels = accessibility.neutralPreAnswer.zones.map((zone) => zone.label)
      const zoneCoordinates = accessibility.neutralPreAnswer.zones.map(
        (zone) => `${zone.order}\n${zone.label}`
      )
      if (
        firstDuplicate(zoneOrders.map(String)) !== undefined ||
        firstDuplicate(zoneLabels) !== undefined ||
        !sameOrderedValues(
          zoneCoordinates,
          regions.zoneOrder.map((zone) => `${zone.order}\n${zone.label}`)
        )
      ) {
        return yield* closureError(
          `scene ${sceneId} neutral zone labels and orders do not match regions`,
          sceneId
        )
      }
      if (!accessibility.nonvisualZonedEquivalent.every(
        (statement) => zoneLabels.includes(statement.zone)
      )) {
        return yield* closureError(
          `scene ${sceneId} nonvisual statements reference an unknown neutral zone`,
          sceneId
        )
      }
      for (const region of [...regions.targetRegions, ...regions.decoyRegions]) {
        for (const polygon of region.polygons) {
          for (const [x, y] of polygon) {
            if (x < 0 || x > 1 || y < 0 || y > 1) {
              return yield* closureError(`scene ${sceneId} contains an out-of-bounds region`, sceneId)
            }
          }
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
        neutralPreAnswer: accessibility.neutralPreAnswer
      })
      postcommitScenes.push({
        id: scene.sceneId,
        opaqueAssetId: scene.opaqueAssetId,
        kind: scene.kind,
        hazardFamily: scene.hazardFamily,
        claim: scene.semanticManifest.claim,
        sourceIds: scene.semanticManifest.sources.map((source) => source.id),
        targets: scene.semanticManifest.targets,
        decoys: scene.semanticManifest.decoys,
        targetRegions: regions.targetRegions,
        decoyRegions: regions.decoyRegions,
        fullPostAnswer: accessibility.fullPostAnswer,
        nonvisualZonedEquivalent: accessibility.nonvisualZonedEquivalent
      })
      assets.push(...assetManifestRecords("hazard-scene", scene.opaqueAssetId, scene.derivatives))
    }

    const duplicateAssetPath = firstDuplicate(assets.map((asset) => asset.path))
    if (duplicateAssetPath !== undefined) {
      return yield* closureError(`asset closure repeats ${duplicateAssetPath}`, duplicateAssetPath)
    }

    const publicProfiles = authoredPack.profiles.map((profile) => ({
      id: profile.id,
      label: profile.label,
      jurisdiction: profile.jurisdiction,
      series: profile.series,
      compatibilityKey: profile.compatibilityKey,
      disclaimer: profile.disclaimer
    }))
    const sources = [...sourceMap.values()]

    const catalog = yield* decodeCatalogArtifact({
      schemaVersion: 1,
      packId: authoredPack.packId,
      version: authoredPack.version,
      locale: authoredPack.locale,
      sources: authoredPack.sources,
      profiles: publicProfiles,
      tools: catalogTools
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
      schemaVersion: 1,
      packId: authoredPack.packId,
      version: authoredPack.version,
      locale: authoredPack.locale,
      sources,
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
      const sourceReceipts: Array<SourceReceipt> = []
      for (const sourceId of answer.sourceIds) {
        const source = sourceMap.get(sourceId)
        if (source === undefined) {
          return yield* closureError(
            `question ${question.id} is missing compiled source ${sourceId}`,
            `questions.${question.id}.sourceIds`
          )
        }
        sourceReceipts.push(
          new SourceReceipt({ id: source.id, label: source.title, locator: source.locator })
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
          schemaVersion: 1,
          id: question.id,
          profileId: question.profileIds[0],
          prompt: question.prompt,
          options
        }),
        postcommit: new PostcommitQuestion({
          schemaVersion: 1,
          id: question.id,
          optionConceptIds,
          correctOptionId: answer.correctOptionId,
          rationales: answer.rationales,
          sources: [firstSource, ...remainingSources]
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
