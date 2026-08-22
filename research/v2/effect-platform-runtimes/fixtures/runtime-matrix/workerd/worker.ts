interface Env {
  readonly BUILD_ID: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface ExportedHandler<Bindings> {
  fetch(request: Request, env: Bindings, ctx: ExecutionContext): Response | Promise<Response>;
}


export const diagnostics = {
  moduleInitializations: 1,
  requestCount: 0
};

interface CorrectionEnvelope {
  readonly correctionId: string;
  readonly questionId: string;
  readonly message: string;
}

const isCorrectionEnvelope = (value: unknown): value is CorrectionEnvelope => {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Record<string, unknown>;
  return typeof input.correctionId === "string" &&
    input.correctionId.length > 0 &&
    typeof input.questionId === "string" &&
    input.questionId.length > 0 &&
    typeof input.message === "string" &&
    input.message.length > 0 &&
    input.message.length <= 4000;
};

const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), {
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

    let input: unknown;
    try {
      input = await request.json();
    } catch {
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
} satisfies ExportedHandler<Env>;

export default handler;
