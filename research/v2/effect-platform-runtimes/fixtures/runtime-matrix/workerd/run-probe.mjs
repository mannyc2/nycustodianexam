import handler, { diagnostics } from "./dist/worker.js";

const makeContext = () => {
  const waitUntilPromises = [];
  return {
    waitUntilPromises,
    context: {
      waitUntil(promise) {
        waitUntilPromises.push(Promise.resolve(promise));
      },
      passThroughOnException() {}
    }
  };
};

const invoke = async (correctionId) => {
  const { waitUntilPromises, context } = makeContext();
  const request = new Request("https://worker.test/api/corrections", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      correctionId,
      questionId: "question-017",
      message: "The explanation should distinguish dilution from neutralization."
    })
  });
  const response = await handler.fetch(request, { BUILD_ID: "r23-probe" }, context);
  const body = await response.json();
  await Promise.all(waitUntilPromises);
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    cacheControl: response.headers.get("cache-control"),
    body,
    waitUntilCount: waitUntilPromises.length
  };
};

const first = await invoke("correction-001");
const second = await invoke("correction-002");
const result = {
  runtime: `node ${process.version}`,
  first,
  second,
  moduleInitializations: diagnostics.moduleInitializations,
  requestCount: diagnostics.requestCount,
  workerdRuntimeProof: false,
  effectLayerProof: false
};
console.log(JSON.stringify(result, null, 2));
if (first.status !== 202 || second.status !== 202 || diagnostics.moduleInitializations !== 1 || diagnostics.requestCount !== 2) {
  process.exitCode = 1;
}
