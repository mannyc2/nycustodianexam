interface Env {
    readonly BUILD_ID: string;
}
interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
}
export declare const diagnostics: {
    moduleInitializations: number;
    requestCount: number;
};
declare const handler: {
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default handler;
