import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
  DurableTimestamp,
  NormalizedCoordinate
} from "../src/durable-values.ts"
import { HazardAttemptRecord } from "../src/hazard-player/persistence.ts"
import { PrintSceneAnswer } from "../src/print/model.ts"
import { QuestionAttemptRecord } from "../src/question-player/persistence.ts"
import { ReviewAcknowledgementRecord } from "../src/review/persistence.ts"
import { StudySessionRecord } from "../src/study-storage/app-database.ts"

const invalidTimestamps = [
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  -1,
  0.5,
  Number.MAX_SAFE_INTEGER + 1
]

const invalidCoordinates = [
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  -0.01,
  1.01
]

const questionAttempt = {
  id: "primary:q-1",
  questionId: "q-1",
  selectedOptionId: "option-a",
  reviewIntent: "unflagged" as const,
  committedAt: 1
}

const hazardAttempt = {
  id: "legacy-hazard-1",
  sceneId: "scene-1",
  mode: "visual" as const,
  markers: [{ id: "marker-1", x: 0.5, y: 0.5 }],
  selectedZoneOrders: [],
  zeroHazardsConfirmed: false,
  committedAt: 1
}

const studySession = {
  id: "active",
  latestAttemptId: "primary:q-1",
  updatedAt: 1
}

const reviewAcknowledgement = {
  id: "review:6:item-1:9:attempt-1:8:reason-1",
  itemId: "item-1",
  attemptId: "attempt-1",
  reasonIds: ["reason-1"],
  acknowledgedAt: 1
}

const printSceneAnswer = {
  sceneId: "scene-1",
  kind: "positive" as const,
  hazardFamily: "housekeeping",
  claim: "A reviewed hazard is present.",
  targets: [{
    id: "target-1",
    condition: "Liquid crosses the route.",
    correction: "Close and clean the route."
  }],
  decoys: [{
    id: "decoy-1",
    condition: "A closed door is visible.",
    safeBecause: "The door is outside the route."
  }],
  targetRegions: [{
    inventoryId: "target-1",
    polygons: [[[0, 0], [1, 0], [0.5, 1]]]
  }],
  nonvisualStatements: [{
    zone: "floor",
    role: "target" as const,
    statement: "Liquid crosses the route."
  }],
  sourceReferences: []
}

describe("durable numeric schemas", () => {
  it("rejects unsafe timestamps across every durable record boundary", () => {
    expect(Schema.decodeUnknownSync(DurableTimestamp)(0)).toBe(0)
    expect(Schema.decodeUnknownSync(DurableTimestamp)(Number.MAX_SAFE_INTEGER)).toBe(
      Number.MAX_SAFE_INTEGER
    )

    for (const invalid of invalidTimestamps) {
      expect(() => Schema.decodeUnknownSync(DurableTimestamp)(invalid)).toThrow()
      expect(() => Schema.decodeUnknownSync(QuestionAttemptRecord)({
        ...questionAttempt,
        committedAt: invalid
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(HazardAttemptRecord)({
        ...hazardAttempt,
        committedAt: invalid
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(StudySessionRecord)({
        ...studySession,
        updatedAt: invalid
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(ReviewAcknowledgementRecord)({
        ...reviewAcknowledgement,
        acknowledgedAt: invalid
      })).toThrow()
    }
  })

  it("accepts boundary coordinates and rejects non-finite or out-of-range persisted points", () => {
    expect(Schema.decodeUnknownSync(NormalizedCoordinate)(0)).toBe(0)
    expect(Schema.decodeUnknownSync(NormalizedCoordinate)(1)).toBe(1)
    expect(Schema.decodeUnknownSync(PrintSceneAnswer)(printSceneAnswer)).toMatchObject({
      sceneId: "scene-1"
    })

    for (const invalid of invalidCoordinates) {
      expect(() => Schema.decodeUnknownSync(NormalizedCoordinate)(invalid)).toThrow()
      expect(() => Schema.decodeUnknownSync(HazardAttemptRecord)({
        ...hazardAttempt,
        markers: [{ id: "marker-1", x: invalid, y: 0.5 }]
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(HazardAttemptRecord)({
        ...hazardAttempt,
        markers: [{ id: "marker-1", x: 0.5, y: invalid }]
      })).toThrow()
      expect(() => Schema.decodeUnknownSync(PrintSceneAnswer)({
        ...printSceneAnswer,
        targetRegions: [{
          inventoryId: "target-1",
          polygons: [[[0, 0], [invalid, 0], [0.5, 1]]]
        }]
      })).toThrow()
    }
  })
})
