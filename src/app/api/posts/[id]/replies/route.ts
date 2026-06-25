import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json<{
    authorName?: string;
    message?: string;
    contactInfo?: string;
  }>();

  const authorName = body.authorName?.trim();
  const message = body.message?.trim();
  const contactInfo = body.contactInfo?.trim() || null;

  if (!authorName || !message) {
    return NextResponse.json({ error: "authorName and message are required" }, { status: 400 });
  }

  const { DB } = await getEnv();

  const post = await DB.prepare(`SELECT id FROM posts WHERE id = ?1`).bind(id).first();
  if (!post) {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }

  const replyId = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO replies (id, post_id, author_name, message, contact_info) VALUES (?1, ?2, ?3, ?4, ?5)`
  )
    .bind(replyId, id, authorName, message, contactInfo)
    .run();

  return NextResponse.json({ id: replyId }, { status: 201 });
}
