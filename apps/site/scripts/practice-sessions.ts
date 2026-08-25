import { createHash } from "node:crypto"

export interface SafePracticeMembership {
  readonly filterKind: "domain" | "family" | "confusion-set"
  readonly filterValue: string
}

export interface PracticeQuestionLike {
  readonly id: string
  readonly profileId?: string
  readonly profileIds?: ReadonlyArray<string>
  readonly memberships?: ReadonlyArray<SafePracticeMembership>
}

export interface PracticeCapacityRecordLike {
  readonly profileId: string
  readonly filterKind: "all" | "domain" | "family" | "confusion-set"
  readonly filterValue: string
  readonly questionCount: number
  readonly availableSetLengths: ReadonlyArray<45 | 60 | 90>
}

export interface DerivedPracticeSession<T> {
  readonly id: string
  readonly length: 45 | 60 | 90
  readonly record: PracticeCapacityRecordLike
  readonly questions: ReadonlyArray<T>
  readonly profile: {
    readonly id: string
    readonly version: number
    readonly compatibilityKey: string
  }
}

const matches = (
  question: PracticeQuestionLike,
  record: PracticeCapacityRecordLike
): boolean => {
  const profileIds = question.profileIds ?? (
    question.profileId === undefined ? undefined : [question.profileId]
  )
  if (profileIds === undefined) {
    throw new Error(`Question ${question.id} has no profile compatibility metadata`)
  }
  if (
    question.profileId !== undefined &&
    question.profileIds !== undefined &&
    !question.profileIds.includes(question.profileId)
  ) {
    throw new Error(`Question ${question.id} has contradictory profile compatibility metadata`)
  }
  if (!profileIds.includes(record.profileId)) return false
  if (record.filterKind === "all") return true
  return (question.memberships ?? []).some(
    (membership) =>
      membership.filterKind === record.filterKind &&
      membership.filterValue === record.filterValue
  )
}

export const derivePracticeSessions = <T extends { readonly value: PracticeQuestionLike }>(input: {
  readonly releaseId: string
  readonly packVersion: number
  readonly profile: {
    readonly id: string
    readonly version: number
    readonly compatibilityKey: string
  }
  readonly questions: ReadonlyArray<T>
  readonly records: ReadonlyArray<PracticeCapacityRecordLike>
}): ReadonlyArray<DerivedPracticeSession<T>> => {
  const capacityRecords = input.records.filter((record) => record.profileId === input.profile.id)
  const digestFor = (id: string): string =>
    createHash("sha256").update(`${input.releaseId}:site-designed:${id}`).digest("hex")

  return capacityRecords.flatMap((record) =>
    record.availableSetLengths.map((length) => {
      const candidates = input.questions
        .filter(({ value }) => matches(value, record))
        .toSorted((left, right) =>
          digestFor(left.value.id).localeCompare(digestFor(right.value.id))
        )
      if (candidates.length < length || record.questionCount !== candidates.length) {
        throw new Error(
          `Practice capacity drift for ${record.profileId}:${record.filterKind}:${record.filterValue}`
        )
      }
      return {
        id: `ps-${createHash("sha256").update(JSON.stringify({
          releaseId: input.releaseId,
          packVersion: input.packVersion,
          profileId: input.profile.id,
          profileVersion: input.profile.version,
          compatibilityKey: input.profile.compatibilityKey,
          filterKind: record.filterKind,
          filterValue: record.filterValue,
          length
        })).digest("hex").slice(0, 24)}`,
        length,
        record,
        questions: candidates.slice(0, length),
        profile: input.profile
      }
    })
  )
}
