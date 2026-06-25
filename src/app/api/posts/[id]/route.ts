import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  state: string | null;
  status: string;
  photo_key: string | null;
  created_at: string;
  last_confirmed_at: string;
}

interface ReplyRow {
  id: string;
  post_id: string;
  author_name: string;
  message: string;
  note_type: string;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { DB } = await getEnv();

  // contact_info is intentionally never returned from this public endpoint.
  const post = await DB.prepare(
    `SELECT id, name, age, last_known_location, description, state, status, photo_key, created_at, last_confirmed_at
     FROM posts WHERE id = ?1`
  )
    .bind(id)
    .first<PostRow>();
  if (!post) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  const replies = await DB.prepare(
    `SELECT id, post_id, author_name, message, note_type, created_at FROM replies WHERE post_id = ?1 ORDER BY created_at ASC`
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
  state?: string | null;
  confirm?: boolean;
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
  const state = body.state && VENEZUELA_STATES.includes(body.state) ? body.state : null;

  // Any save from the owner (including an explicit "confirm") counts as confirming
  // the post is still accurate, which resets the staleness clock.
  await DB.prepare(
    `UPDATE posts SET
       status = COALESCE(?1, status),
       name = COALESCE(?2, name),
       age = ?3,
       last_known_location = COALESCE(?4, last_known_location),
       description = ?5,
       contact_info = COALESCE(?6, contact_info),
       state = ?7,
       last_confirmed_at = datetime('now')
     WHERE id = ?8`
  )
    .bind(
      body.status ?? null,
      name || null,
      body.age?.trim() || null,
      lastKnownLocation || null,
      body.description?.trim() || null,
      contactInfo || null,
      state,
      id
    )
    .run();

  return NextResponse.json({ ok: true });
}
