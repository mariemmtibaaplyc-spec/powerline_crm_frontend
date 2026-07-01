import { toNextJsHandler } from "better-auth/next-js";
import { auth, dbReady } from "@/lib/better-auth.server";

const { GET: _GET, POST: _POST } = toNextJsHandler(auth);

// Ensure SQLite tables exist before handling any auth request
export async function GET(request: Request) {
  await dbReady;
  return _GET(request);
}

export async function POST(request: Request) {
  await dbReady;
  return _POST(request);
}
