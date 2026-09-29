import { NextRequest, NextResponse } from "next/server";
import { wpEnv } from "@/lib/wpgraphql/env";

const REQUEST_TIMEOUT_MS = 10_000;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ success: true });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    await fetch(`${wpEnv.wordpressUrl}/wp-json/tamar/v1/logout`, {
      method: "POST",
      headers: { Authorization: authHeader },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    // Best-effort: the client clears its local token regardless.
  } finally {
    clearTimeout(timer);
  }

  return NextResponse.json({ success: true });
}
