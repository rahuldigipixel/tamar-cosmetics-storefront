import { NextRequest, NextResponse } from "next/server";
import { submitBlogComment } from "@/lib/wpgraphql/tamarApi";

export async function POST(request: NextRequest) {
  const { postId, authorName, authorEmail, content } = await request.json();
  if (!postId || !authorName || !authorEmail || !content) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }
  const result = await submitBlogComment({ postId, authorName, authorEmail, content });
  return NextResponse.json(result ?? { success: false });
}
