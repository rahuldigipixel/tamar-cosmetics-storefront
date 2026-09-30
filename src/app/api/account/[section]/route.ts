import { wpEnv } from "@/lib/wpgraphql/env";
import { NextRequest, NextResponse } from "next/server";
import { accountRequest, type AccountSection } from "@/lib/wpgraphql/tamarApi";

const SECTIONS: AccountSection[] = ["billing", "profile", "confirm-email", "cancel-email"];

async function handle(request: NextRequest, params: Promise<{ section: string }>, withBody: boolean) {
  const { section } = await params;
  const token = request.headers.get("Authorization")?.match(/Bearer\s+(\S+)/i)?.[1];
  if (!token) return NextResponse.json({ error: "יש להתחבר." }, { status: 401 });
  if (!SECTIONS.includes(section as AccountSection)) return NextResponse.json({ error: "not found" }, { status: 404 });

  // siteUrl is added here (server-side), not taken from the browser: the WP plugin
  // uses it to build the email-confirmation link and only accepts allow-listed origins.
  const body = withBody ? { ...(await request.json().catch(() => ({}))), siteUrl: wpEnv.siteUrl } : undefined;
  const result = await accountRequest(section as AccountSection, token, body);
  if (!result.ok) {
    const message = (result.data as { message?: string } | null)?.message ?? "הפעולה נכשלה. נסו שוב מאוחר יותר.";
    return NextResponse.json({ error: message }, { status: result.status === 502 ? 502 : result.status });
  }
  return NextResponse.json(result.data);
}

export function GET(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  return handle(request, params, false);
}

export function POST(request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  return handle(request, params, true);
}
