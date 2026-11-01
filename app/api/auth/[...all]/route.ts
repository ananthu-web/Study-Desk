import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  try {
    const auth = await getAuth();
    const handlers = toNextJsHandler(auth);
    return request.method === "GET" ? await handlers.GET(request) : await handlers.POST(request);
  } catch {
    return Response.json({ code: "AUTH_UNAVAILABLE", message: "Account access is temporarily unavailable. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export { handle as GET, handle as POST };
