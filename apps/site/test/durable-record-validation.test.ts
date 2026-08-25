import { describe, expect, it } from "vitest"
import { decodeStoredHazardAttempt } from "../src/hazard-player/persistence.ts"
import { decodeStoredQuestionAttempt } from "../src/question-player/persistence.ts"
import {
  decodeStoredReviewAcknowledgement,
  reviewAcknowledgementId
} from "../src/review/persistence.ts"

const sha = "0".repeat(64)

describe("durable event semantic validation", () => {
  it("rejects a question event with a non-finite commit time", () => {
    expect(() => decodeStoredQuestionAttempt({
      id: "launch-v1:v1:launch-v1:question:1",
      questionId: "question-1",
      selectedOptionId: "option-a",
      reviewIntent: "unflagged",
      committedAt: Number.NaN,
      receipt: {
        releaseId: "launch-v1",
        packVersion: 1,
        sessionId: "launch-v1",
        position: 1,
        postcommitPath: "/content/vertical-slice/questions/question-1.postcommit.json",
        postcommitBytes: 1,
        postcommitSha256: sha,
        questionId: "question-1"
      },
      optionIds: ["option-a"]
    })).toThrow("invalid commit time")
  })

  it("rejects a hazard event with a negative commit time", () => {
    expect(() => decodeStoredHazardAttempt({
      id: "launch-v1:v1:launch-v1:hazard-nonvisual:1",
      sceneId: "scene-1",
      mode: "nonvisual",
      markers: [],
      selectedZoneOrders: [0],
      zeroHazardsConfirmed: false,
      committedAt: -1,
      receipt: {
        releaseId: "launch-v1",
        packVersion: 1,
        sessionId: "launch-v1",
        position: 1,
        postcommitPath: "/content/vertical-slice/scenes/scene-1.postcommit.json",
        postcommitBytes: 1,
        postcommitSha256: sha,
        sceneId: "scene-1",
        mode: "nonvisual",
        assetRevision: 1,
        assetMasterSha256: sha
      },
      allowedZoneOrders: [0]
    })).toThrow("invalid commit time")
  })

  it("rejects a canonical acknowledgement with a non-finite event time", () => {
    const coordinate = {
      itemId: "question-1",
      attemptId: "launch-v1:v1:launch-v1:question:1",
      reasonIds: ["incorrect-answer"]
    } as const
    expect(() => decodeStoredReviewAcknowledgement({
      id: reviewAcknowledgementId(coordinate),
      ...coordinate,
      acknowledgedAt: Number.POSITIVE_INFINITY
    })).toThrow("invalid acknowledgement time")
  })
})
