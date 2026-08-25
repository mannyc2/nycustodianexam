import { Schema } from "effect"
import { assessVisualMarkers, hasValidPostcommitClosure } from "../hazard-player/assessment.ts"
import {
  type SimulationFormat,
  SimulationHazardResult,
  type SimulationHazardSessionItem,
  SimulationSessionRecord,
  simulationAlgorithm,
  simulationItemId,
  type AssembleSimulationInput,
  type EvaluateSimulationInput,
  SimulationQuestionResult,
  type SimulationSessionItem,
  type SimulationSubmittedAnswer,
  type SimulationResult
} from "./model.ts"
import { DeterministicSeed } from "../deterministic-seed.ts"
import { sameAssetReceipt } from "../retained-image.ts"

const hashSeed = (value: string): number => {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

const shuffled = <A>(values: ReadonlyArray<A>, random: () => number): A[] => {
  const output = [...values]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    const current = output[index] as A
    output[index] = output[target] as A
    output[target] = current
  }
  return output
}

export const simulationCapacity = (
  inventory: AssembleSimulationInput["bootstrap"]["inventory"],
  selectedCategories?: ReadonlyArray<string>,
  profileId?: string
): number => {
  const compatibleInventory = profileId === undefined
    ? inventory
    : inventory.filter((item) => item.profileIds.includes(profileId))
  const categories = new Set(
    selectedCategories ?? [...new Set(compatibleInventory.map((item) => item.category))]
  )
  return new Set(
    compatibleInventory
      .filter((item) => categories.has(item.category))
      .map((item) => item.question.id)
  ).size
}

export const simulationCategoryCapacities = (
  inventory: AssembleSimulationInput["bootstrap"]["inventory"],
  profileId?: string
): ReadonlyArray<{ readonly category: string; readonly count: number }> => {
  const counts = new Map<string, Set<string>>()
  for (const item of inventory) {
    if (profileId !== undefined && !item.profileIds.includes(profileId)) continue
    const ids = counts.get(item.category) ?? new Set<string>()
    ids.add(item.question.id)
    counts.set(item.category, ids)
  }
  return [...counts]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, ids]) => ({ category, count: ids.size }))
}

export const simulationHazardCapacity = (
  hazards: AssembleSimulationInput["bootstrap"]["hazards"],
  selectedCategories?: ReadonlyArray<string>,
  profileId?: string
): number => {
  const compatible = profileId === undefined
    ? hazards
    : hazards.filter((item) => item.profileIds.includes(profileId))
  const categories = new Set(
    selectedCategories ?? [...new Set(compatible.map((item) => item.category))]
  )
  return new Set(
    compatible
      .filter((item) => categories.has(item.category))
      .map((item) => item.scene.id)
  ).size
}

export const simulationHazardCategoryCapacities = (
  hazards: AssembleSimulationInput["bootstrap"]["hazards"],
  profileId?: string
): ReadonlyArray<{ readonly category: string; readonly count: number }> => {
  const counts = new Map<string, Set<string>>()
  for (const item of hazards) {
    if (profileId !== undefined && !item.profileIds.includes(profileId)) continue
    const ids = counts.get(item.category) ?? new Set<string>()
    ids.add(item.scene.id)
    counts.set(item.category, ids)
  }
  return [...counts]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, ids]) => ({ category, count: ids.size }))
}

export const assembleSimulation = (input: AssembleSimulationInput): SimulationSessionRecord => {
  const seed = Schema.decodeUnknownSync(DeterministicSeed)(input.seed)
  const format: SimulationFormat = input.format ?? "questions"
  const profile = input.bootstrap.profiles.find((candidate) => candidate.id === input.profileId)
  if (profile === undefined) throw new Error("Select a simulation profile from this release")
  const compatibleQuestions = input.bootstrap.inventory.filter(
    (item) => item.profileIds.includes(profile.id)
  )
  const compatibleHazards = input.bootstrap.hazards.filter(
    (item) => item.profileIds.includes(profile.id)
  )
  const compatibleInventory = format === "questions" ? compatibleQuestions : compatibleHazards
  const availableCategories = new Set(compatibleInventory.map((item) => item.category))
  const selectedCategories = [...new Set(input.selectedCategories)].sort()
  if (
    selectedCategories.length === 0 ||
    selectedCategories.length !== input.selectedCategories.length ||
    selectedCategories.some((category) => !availableCategories.has(category))
  ) {
    throw new Error("Select one or more unique content categories from this release")
  }
  if (
    (input.timing.mode === "untimed" &&
      (input.timing.durationSeconds !== null || input.timing.autoSubmit || input.timing.timerVisible)) ||
    (input.timing.mode === "timed" && input.timing.durationSeconds === null)
  ) {
    throw new Error("Simulation timing settings are inconsistent")
  }
  const capacity = format === "questions"
    ? simulationCapacity(input.bootstrap.inventory, selectedCategories, profile.id)
    : simulationHazardCapacity(input.bootstrap.hazards, selectedCategories, profile.id)
  if (!Number.isSafeInteger(input.length) || input.length <= 0 || input.length > capacity) {
    throw new Error(`Requested ${input.length} unique items, but only ${capacity} are available`)
  }
  const random = mulberry32(hashSeed(JSON.stringify({
    algorithm: simulationAlgorithm,
    releaseId: input.bootstrap.releaseId,
    packVersion: input.bootstrap.packVersion,
    profileId: profile.id,
    ...(format === "questions" ? {} : { format }),
    seed,
    selectedCategories,
    timing: input.timing
  })))
  const items = format === "questions"
    ? (() => {
        const canonical = compatibleQuestions
          .filter((item) => selectedCategories.includes(item.category))
          .sort((left, right) => left.question.id.localeCompare(right.question.id))
        if (canonical.some((item, index) =>
          index > 0 && item.question.id === canonical[index - 1]?.question.id
        )) {
          throw new Error("Simulation inventory contains a duplicate question id")
        }
        return shuffled(canonical, random).slice(0, input.length).map((item, index) => ({
          position: index + 1,
          question: item.question,
          receipt: {
            ...item.receipt,
            sessionId: input.sessionId,
            position: index + 1
          },
          profileIds: item.profileIds,
          optionOrder: shuffled(
            item.question.options.map((option) => option.id).sort(),
            random
          ),
          category: item.category
        }))
      })()
    : (() => {
        const mode = format === "visual-hazards" ? "visual" as const : "nonvisual" as const
        const canonical = compatibleHazards
          .filter((item) => selectedCategories.includes(item.category))
          .sort((left, right) => left.scene.id.localeCompare(right.scene.id))
        if (canonical.some((item, index) =>
          index > 0 && item.scene.id === canonical[index - 1]?.scene.id
        )) {
          throw new Error("Simulation inventory contains a duplicate hazard scene id")
        }
        return shuffled(canonical, random).slice(0, input.length).map((item, index) => ({
          position: index + 1,
          scene: item.scene,
          receipt: {
            ...(mode === "visual" ? item.visualReceipt : item.nonvisualReceipt),
            sessionId: input.sessionId,
            position: index + 1,
            mode
          },
          profileIds: item.profileIds,
          mode,
          visualAsset: mode === "visual" ? item.visualAsset : null,
          category: item.category
        }))
      })()
  const distributionMap = new Map<string, number>()
  for (const item of items) {
    distributionMap.set(item.category, (distributionMap.get(item.category) ?? 0) + 1)
  }
  const distribution = [...distributionMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => ({ label, count }))
  const record = {
    schemaVersion: 1 as const,
    id: input.sessionId,
    status: "active" as const,
    algorithm: simulationAlgorithm,
    format,
    seed,
    releaseId: input.bootstrap.releaseId,
    packVersion: input.bootstrap.packVersion,
    profile,
    selectedCategories,
    timing: input.timing,
    advertisedLength: input.length,
    actualLength: items.length,
    distribution,
    items,
    responses: [],
    currentPosition: 1,
    createdAt: input.now,
    updatedAt: input.now
  }
  return Schema.decodeUnknownSync(SimulationSessionRecord)(record)
}

type QuestionPostcommit = Extract<
  EvaluateSimulationInput["postcommit"][number]["payload"],
  { readonly correctOptionId: string }
>

type ScenePostcommit = Exclude<
  EvaluateSimulationInput["postcommit"][number]["payload"],
  { readonly correctOptionId: string }
>

const exactSet = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length &&
  new Set(left).size === left.length &&
  new Set(right).size === right.length &&
  left.every((value) => right.includes(value))

export const hasValidQuestionPostcommitClosure = (
  item: SimulationSessionItem,
  payload: QuestionPostcommit
): boolean => {
  const optionIds = item.question.options.map((option) => option.id)
  const rationaleIds = payload.rationales.map((rationale) => rationale.optionId)
  const conceptOptionIds = payload.optionConceptIds?.map((mapping) => mapping.optionId)
  return payload.id === item.question.id &&
    optionIds.includes(payload.correctOptionId) &&
    exactSet(optionIds, rationaleIds) &&
    (conceptOptionIds === undefined || exactSet(optionIds, conceptOptionIds))
}

export const evaluateHazardAnswer = (
  item: SimulationHazardSessionItem,
  answer: SimulationSubmittedAnswer,
  payload: ScenePostcommit
): Omit<SimulationHazardResult, "postcommit" | "postcommitBase64" | "retainedVisualAsset"> => {
  if (!hasValidPostcommitClosure(item.scene, payload)) {
    throw new Error(`Simulation hazard result closure is missing ${item.scene.id}`)
  }
  const markers = answer.markers ?? []
  const selectedZoneOrders = answer.selectedZoneOrders ?? []
  const answered = markers.length > 0 || selectedZoneOrders.length > 0 ||
    answer.zeroHazardsConfirmed === true
  let targetCount = 0
  let hitCount = 0
  let missedCount = 0
  let decoyFalsePositiveCount = 0
  let falsePositiveCount = 0
  let duplicateCount = 0
  if (item.mode === "visual") {
    const assessment = assessVisualMarkers(markers, payload)
    targetCount = payload.targetRegions.length
    hitCount = assessment.markers.filter((marker) => marker.kind === "hit").length
    missedCount = assessment.missedInventoryIds.length
    decoyFalsePositiveCount = assessment.markers.filter(
      (marker) => marker.kind === "decoy_false_positive"
    ).length
    falsePositiveCount = assessment.markers.filter(
      (marker) => marker.kind === "false_positive"
    ).length
    duplicateCount = assessment.markers.filter((marker) => marker.kind === "duplicate").length
  } else {
    const targetZones = new Set(payload.nonvisualZonedEquivalent
      .filter((statement) => statement.role === "target")
      .map((statement) => statement.zone))
    const decoyZones = new Set(payload.nonvisualZonedEquivalent
      .filter((statement) => statement.role === "decoy")
      .map((statement) => statement.zone))
    const selectedLabels = new Set(item.scene.neutralPreAnswer.zones
      .filter((zone) => selectedZoneOrders.includes(zone.order))
      .map((zone) => zone.label))
    targetCount = targetZones.size
    hitCount = [...targetZones].filter((zone) => selectedLabels.has(zone)).length
    missedCount = targetCount - hitCount
    decoyFalsePositiveCount = [...selectedLabels].filter(
      (zone) => !targetZones.has(zone) && decoyZones.has(zone)
    ).length
    falsePositiveCount = [...selectedLabels].filter(
      (zone) => !targetZones.has(zone) && !decoyZones.has(zone)
    ).length
  }
  const correct = answered && missedCount === 0 && decoyFalsePositiveCount === 0 &&
    falsePositiveCount === 0 && duplicateCount === 0
  return {
    kind: "hazard",
    questionId: item.scene.id,
    mode: item.mode,
    category: item.category,
    hazardFamily: payload.hazardFamily,
    answered,
    correct,
    targetCount,
    hitCount,
    missedCount,
    decoyFalsePositiveCount,
    falsePositiveCount,
    duplicateCount
  }
}

export const evaluateSimulation = (input: EvaluateSimulationInput): {
  readonly correctCount: number
  readonly results: ReadonlyArray<SimulationResult>
} => {
  const answerByQuestion = new Map(input.submission.answers.map((answer) => [answer.questionId, answer]))
  const questionPostcommit = input.postcommit.filter(
    (value): value is EvaluateSimulationInput["postcommit"][number] & { readonly payload: QuestionPostcommit } =>
      "correctOptionId" in value.payload
  )
  const scenePostcommit = input.postcommit.filter(
    (value): value is EvaluateSimulationInput["postcommit"][number] & { readonly payload: ScenePostcommit } =>
      "opaqueAssetId" in value.payload
  )
  const postcommitByQuestion = new Map(questionPostcommit.map((artifact) => [artifact.payload.id, artifact]))
  const results: Array<SimulationResult> = input.session.items.map((item) => {
    const itemId = simulationItemId(item)
    const answer = answerByQuestion.get(itemId)
    if (answer === undefined) throw new Error(`Simulation result closure is missing ${itemId}`)
    if ("question" in item) {
      const artifact = postcommitByQuestion.get(item.question.id)
      if (artifact === undefined) {
        throw new Error(`Simulation result closure is missing ${item.question.id}`)
      }
      const postcommit = artifact.payload
      if (!hasValidQuestionPostcommitClosure(item, postcommit)) {
        throw new Error(`Verified answer for ${item.question.id} is outside its pinned option closure`)
      }
      return new SimulationQuestionResult({
        kind: "question",
        questionId: item.question.id,
        selectedOptionId: answer.selectedOptionId,
        correctOptionId: postcommit.correctOptionId,
        correct: answer.selectedOptionId === postcommit.correctOptionId,
        category: item.category,
        postcommitBase64: artifact.postcommitBase64,
        postcommit
      })
    }

    const artifact = scenePostcommit.find(
      (candidate) => candidate.payload.opaqueAssetId === item.scene.asset.opaqueAssetId
    )
    const payload = artifact?.payload
    if (artifact === undefined || payload === undefined || !hasValidPostcommitClosure(item.scene, payload)) {
      throw new Error(`Simulation hazard result closure is missing ${item.scene.id}`)
    }
    const evaluation = evaluateHazardAnswer(item, answer, payload)
    const retainedVisualAsset = item.mode === "visual" && item.visualAsset !== null
      ? input.retainedVisualAssets?.find((asset) =>
          sameAssetReceipt(asset.receipt, item.visualAsset as NonNullable<typeof item.visualAsset>)
        )
      : undefined
    if (item.mode === "visual" && retainedVisualAsset === undefined) {
      throw new Error(`Simulation hazard result closure is missing the retained scene ${item.scene.id}`)
    }
    return new SimulationHazardResult({
      ...evaluation,
      retainedVisualAsset: retainedVisualAsset ?? null,
      postcommitBase64: artifact.postcommitBase64,
      postcommit: payload
    })
  })
  return {
    correctCount: results.filter((result) => result.correct).length,
    results
  }
}
