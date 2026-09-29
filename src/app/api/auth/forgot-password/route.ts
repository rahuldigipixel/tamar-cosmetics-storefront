import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL, GraphQLError } from "@/lib/wpgraphql/client";
import { SEND_PASSWORD_RESET_EMAIL } from "@/lib/wpgraphql/mutations/auth";
import { translateAuthErrorMessage } from "@/lib/wpgraphql/authErrors";

interface SendPasswordResetEmailData {
  sendPasswordResetEmail: {
    success: boolean | null;
  };
}

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json({ error: "יש להזין שם משתמש או כתובת אימייל." }, { status: 400 });
  }

  try {
    const { data } = await fetchGraphQL<SendPasswordResetEmailData>(
      SEND_PASSWORD_RESET_EMAIL,
      { username },
      { cache: "no-store" }
    );
    return NextResponse.json({ success: data.sendPasswordResetEmail.success ?? true });
  } catch (error) {
    const fallback = "השליחה נכשלה, נסו שוב.";
    const message = error instanceof GraphQLError ? translateAuthErrorMessage(error.message, fallback) : fallback;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
