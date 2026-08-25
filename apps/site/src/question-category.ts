import type { PrecommitQuestion } from "@nycustodian/content/model"

const domainLabels = {
  "cleaning-tools-and-uses": "Cleaning tools and uses",
  "minor-maintenance-and-repair": "Minor maintenance and repair",
  "health-and-safety": "Health and safety"
} as const

/**
 * Derives the learner-facing category only from compiler-approved, pre-answer
 * membership metadata. Postcommit tags and answer-bearing concept mappings are
 * intentionally outside this boundary.
 */
export const questionCategoryFromSafeMetadata = (
  question: Pick<PrecommitQuestion, "id" | "memberships">
): string => {
  const domainMemberships = question.memberships?.filter(
    (membership) => membership.filterKind === "domain"
  ) ?? []
  if (domainMemberships.length === 0) {
    return "Mixed-domain and scenario questions"
  }
  if (domainMemberships.length > 1) {
    throw new Error(`Question ${question.id} has multiple safe domain memberships`)
  }
  const domain = domainMemberships[0]?.filterValue
  if (domain === undefined || !(domain in domainLabels)) {
    throw new Error(`Question ${question.id} has an unsupported safe domain membership`)
  }
  return domainLabels[domain as keyof typeof domainLabels]
}
