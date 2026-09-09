import type { ReviewReason } from "./model.ts"

export const reviewReasonId = (reason: ReviewReason): string => {
  switch (reason.tag) {
    case "flag":
      return "flag"
    case "incorrect_answer":
      return "incorrect-answer"
    case "hazard_miss":
      return `hazard-miss:${reason.inventoryId}`
    case "decoy_false_positive":
      return `decoy-false-positive:${reason.inventoryId}`
    case "general_false_positive":
      return `general-false-positive:${reason.markerId}`
  }
}
