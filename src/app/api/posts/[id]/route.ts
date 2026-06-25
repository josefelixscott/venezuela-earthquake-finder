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
  edit_token: string;
  created_at: string;
}

interface ReplyRow {
  id: string;
  post_id: string;
  author_name: string;
  message: string;
  contact_info: string | null;
  note_type: string;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { DB } = await getEnv();

  const post = await DB.prepare(
    `SELECT id, name, age, last_known_location, description, contact_info, status, created_at FROM posts WHERE id = ?1`
  )
    .bind(id)
    .first<Omit<PostRow, "edit_token">>();
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

interface PatchBody {
  token?: string;
  status?: string;
  name?: string;
  age?: string | null;
  lastKnownLocation?: string;
  description?: string | null;
  contactInfo?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json<PatchBody>();

  if (!body.token) {
    return NextResponse.json({ error: "se requiere el token de edición" }, { status: 401 });
  }

  const { DB } = await getEnv();
  const post = await DB.prepare(`SELECT edit_token FROM posts WHERE id = ?1`)
    .bind(id)
    .first<{ edit_token: string }>();

  if (!post) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }
  if (post.edit_token !== body.token) {
    return NextResponse.json({ error: "token de edición inválido" }, { status: 403 });
  }

  if (body.status !== undefined && body.status !== "looking" && body.status !== "found") {
    return NextResponse.json(
      { error: "el estado debe ser 'looking' o 'found'" },
      { status: 400 }
    );
  }

  const name = body.name?.trim();
  const lastKnownLocation = body.lastKnownLocation?.trim();
  const contactInfo = body.contactInfo?.trim();

  await DB.prepare(
    `UPDATE posts SET
       status = COALESCE(?1, status),
       name = COALESCE(?2, name),
       age = ?3,
       last_known_location = COALESCE(?4, last_known_location),
       description = ?5,
       contact_info = COALESCE(?6, contact_info)
     WHERE id = ?7`
  )
    .bind(
      body.status ?? null,
      name || null,
      body.age?.trim() || null,
      lastKnownLocation || null,
      body.description?.trim() || null,
      contactInfo || null,
      id
    )
    .run();

  return NextResponse.json({ ok: true });
}
