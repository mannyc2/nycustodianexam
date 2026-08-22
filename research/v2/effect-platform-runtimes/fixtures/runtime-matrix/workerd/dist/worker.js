export const diagnostics = {
    moduleInitializations: 1,
    requestCount: 0
};
const isCorrectionEnvelope = (value) => {
    if (typeof value !== "object" || value === null)
        return false;
    const input = value;
    return typeof input.correctionId === "string" &&
        input.correctionId.length > 0 &&
        typeof input.questionId === "string" &&
        input.questionId.length > 0 &&
        typeof input.message === "string" &&
        input.message.length > 0 &&
        input.message.length <= 4000;
};
const json = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
    }
});
const handler = {
    async fetch(request, env, ctx) {
        diagnostics.requestCount += 1;
        const url = new URL(request.url);
        if (url.pathname !== "/api/corrections") {
            return json(404, { error: "not_found" });
        }
        if (request.method !== "POST") {
            return json(405, { error: "method_not_allowed" });
        }
        const declaredLength = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(declaredLength) && declaredLength > 65_536) {
            return json(413, { error: "payload_too_large" });
        }
        let input;
        try {
            input = await request.json();
        }
        catch {
            return json(400, { error: "invalid_json" });
        }
        if (!isCorrectionEnvelope(input)) {
            return json(422, { error: "invalid_correction" });
        }
        ctx.waitUntil(Promise.resolve());
        return json(202, {
            accepted: true,
            correctionId: input.correctionId,
            buildId: env.BUILD_ID
        });
    }
};
export default handler;
//# sourceMappingURL=worker.js.map