import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL, GraphQLError } from "@/lib/wpgraphql/client";
import { RESET_USER_PASSWORD } from "@/lib/wpgraphql/mutations/auth";
import { translateAuthErrorMessage } from "@/lib/wpgraphql/authErrors";

interface ResetUserPasswordData {
  resetUserPassword: {
    user: { id: string; databaseId: number } | null;
  };
}

export async function POST(request: NextRequest) {
  const { key, login, password } = await request.json();

  if (!key || !login || !password) {
    return NextResponse.json({ error: "הקישור לאיפוס הסיסמה אינו תקין." }, { status: 400 });
  }

  try {
    const { data } = await fetchGraphQL<ResetUserPasswordData>(
      RESET_USER_PASSWORD,
      { key, login, password },
      { cache: "no-store" }
    );
    return NextResponse.json({ user: data.resetUserPassword.user });
  } catch (error) {
    const fallback = "איפוס הסיסמה נכשל, נסו שוב.";
    const message = error instanceof GraphQLError ? translateAuthErrorMessage(error.message, fallback) : fallback;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
