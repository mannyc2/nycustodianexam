export async function gradeAttempt(attempt) {
  const response = await fetch("/api/grade", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      attemptId: attempt.attemptId,
      questionId: attempt.questionId,
      questionVersion: attempt.questionVersion,
      selectedOptionId: attempt.selectedOptionId
    })
  })
  if (!response.ok) throw new Error(`Grade service failed: ${response.status}`)
  const value = await response.json()
  if (typeof value.correct !== "boolean" || typeof value.explanation !== "string") {
    throw new Error("Invalid grade response")
  }
  return Object.freeze({ correct: value.correct, explanation: value.explanation })
}
