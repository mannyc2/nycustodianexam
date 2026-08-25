import {
  decodeSimulationTimestamp,
  type SimulationSessionRecord,
  type SimulationSubmissionRecord
} from "./model.ts"

export const simulationElapsedMilliseconds = (
  session: SimulationSessionRecord,
  submission: SimulationSubmissionRecord
): number => {
  const createdAt = decodeSimulationTimestamp(session.createdAt)
  const submittedAt = decodeSimulationTimestamp(submission.submittedAt)
  if (submittedAt < createdAt) {
    throw new Error("Simulation submission time precedes its durable creation time")
  }
  return submittedAt - createdAt
}

export const formatSimulationElapsed = (milliseconds: number): string => {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1_000)
  const hours = Math.floor(totalSeconds / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0
    ? `${hours} h ${minutes} min ${seconds} sec`
    : `${minutes} min ${seconds} sec`
}
