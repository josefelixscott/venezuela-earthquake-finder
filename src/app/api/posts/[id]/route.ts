import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
  status: string;
  created_at: string;
}

interface ReplyRow {
  id: string;
  post_id: string;
  author_name: string;
  message: string;
  contact_info: string | null;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { DB } = await getEnv();

  const post = await DB.prepare(`SELECT * FROM posts WHERE id = ?1`).bind(id).first<PostRow>();
  if (!post) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  const replies = await DB.prepare(
    `SELECT * FROM replies WHERE post_id = ?1 ORDER BY created_at ASC`
  )
    .bind(id)
    .all<ReplyRow>();

  return NextResponse.json({ post, replies: replies.results });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json<{ status?: string }>();

  if (body.status !== "looking" && body.status !== "found") {
    return NextResponse.json(
      { error: "el estado debe ser 'looking' o 'found'" },
      { status: 400 }
    );
  }

  const { DB } = await getEnv();
  await DB.prepare(`UPDATE posts SET status = ?1 WHERE id = ?2`).bind(body.status, id).run();

  return NextResponse.json({ ok: true });
}
