import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

const VALID_NOTE_TYPES = ["information", "volunteering", "is_this_person", "believed_found"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json<{
    authorName?: string;
    message?: string;
    contactInfo?: string;
    noteType?: string;
    website?: string;
  }>();

  // Honeypot: real users never fill this hidden field; bots that fill every field do.
  if (body.website?.trim()) {
    return NextResponse.json({ error: "El nombre y el mensaje son obligatorios" }, { status: 400 });
  }

  const authorName = body.authorName?.trim();
  const message = body.message?.trim();
  const contactInfo = body.contactInfo?.trim() || null;
  const noteType = VALID_NOTE_TYPES.includes(body.noteType ?? "")
    ? (body.noteType as string)
    : "information";

  if (!authorName || !message) {
    return NextResponse.json({ error: "El nombre y el mensaje son obligatorios" }, { status: 400 });
  }

  const { DB } = await getEnv();

  const post = await DB.prepare(`SELECT id FROM posts WHERE id = ?1`).bind(id).first();
  if (!post) {
    return NextResponse.json({ error: "publicación no encontrada" }, { status: 404 });
  }

  const replyId = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO replies (id, post_id, author_name, message, contact_info, note_type)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  )
    .bind(replyId, id, authorName, message, contactInfo, noteType)
    .run();

  if (noteType === "believed_found") {
    await DB.prepare(`UPDATE posts SET status = 'found' WHERE id = ?1`).bind(id).run();
  }

  return NextResponse.json({ id: replyId }, { status: 201 });
}
