import { NextRequest, NextResponse } from "next/server";
import { wpEnv } from "@/lib/wpgraphql/env";
import { logApiCall } from "@/lib/wpgraphql/apiAuditLog";

// Not a GraphQL mutation — no `login` exists on this backend's WPGraphQL
// schema (no JWT/auth plugin installed). Proxies to the custom REST endpoint
// in the tamar-headless-api plugin (includes/class-auth.php) instead, same
// fail-fast-on-timeout contract as fetchGraphQL/tamarFetch.
const REQUEST_TIMEOUT_MS = 10_000;

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "יש למלא שם משתמש וסיסמה." }, { status: 400 });
  }

  logApiCall("REST", "/tamar/v1/login");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${wpEnv.wordpressUrl}/wp-json/tamar/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.message ?? "ההתחברות נכשלה." }, { status: res.status });
    }
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "השרת אינו זמין כרגע, נסו שוב." }, { status: 503 });
  } finally {
    clearTimeout(timer);
  }
}
