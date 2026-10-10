import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL, GraphQLError } from "@/lib/wpgraphql/client";
import { REGISTER_CUSTOMER } from "@/lib/wpgraphql/mutations/auth";
import { translateAuthErrorMessage } from "@/lib/wpgraphql/authErrors";
import { wpEnv } from "@/lib/wpgraphql/env";

interface RegisterCustomerData {
  registerCustomer: {
    customer: {
      id: string;
      databaseId: number;
      email: string;
      username: string;
    } | null;
  };
}

interface LoginResponse {
  token: string;
  customer: {
    id: number;
    databaseId: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export async function POST(request: NextRequest) {
  const { username, email, password, accept_marketing } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "יש למלא שם משתמש, אימייל וסיסמה." }, { status: 400 });
  }

  try {
    await fetchGraphQL<RegisterCustomerData>(REGISTER_CUSTOMER, { username, email, password }, { cache: "no-store" });
  } catch (error) {
    const fallback = "ההרשמה נכשלה, נסו שוב.";
    const message = error instanceof GraphQLError ? translateAuthErrorMessage(error.message, fallback) : fallback;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Registering only creates the WP user — it doesn't log them in (WPGraphQL's
  // registerCustomer returns no token). Chain straight into the same login
  // endpoint the login form uses so a fresh signup lands the customer
  // logged-in immediately instead of having to re-type their password.
  try {
    const loginRes = await fetch(`${wpEnv.wordpressUrl}/wp-json/tamar/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    if (loginRes.ok) {
      const login = (await loginRes.json()) as LoginResponse;
      if (accept_marketing) {
        // Ticked Flashy box: the plugin subscribes the new contact to its list (best effort — never blocks signup).
        await fetch(`${wpEnv.wordpressUrl}/wp-json/tamar/v1/flashy-consent`, {
          method: "POST",
          headers: { Authorization: `Bearer ${login.token}` },
          cache: "no-store",
        }).catch(() => undefined);
      }
      return NextResponse.json({ token: login.token, customer: login.customer });
    }
  } catch {
    // Registration succeeded even if this auto-login step failed — fall
    // through to the "registered, please log in" response below.
  }

  return NextResponse.json({ customer: null });
}
