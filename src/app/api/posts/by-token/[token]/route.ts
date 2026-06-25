import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
  state: string | null;
  status: string;
  photo_key: string | null;
  created_at: string;
  last_confirmed_at: string;
}

interface ReplyRow {
  id: string;
  author_name: string;
  message: string;
  contact_info: string | null;
  note_type: string;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { DB } = await getEnv();

  // Only the owner, authenticated via their private edit token, can see
  // contact_info — both their own and every reply's — anywhere on the site.
  const post = await DB.prepare(
    `SELECT id, name, age, last_known_location, description, contact_info, state, status, photo_key, created_at, last_confirmed_at
     FROM posts WHERE edit_token = ?1`
  )
    .bind(token)
    .first<PostRow>();

  if (!post) {
    return NextResponse.json({ error: "enlace de edición no válido" }, { status: 404 });
  }

  const replies = await DB.prepare(
    `SELECT id, author_name, message, contact_info, note_type, created_at
     FROM replies WHERE post_id = ?1 ORDER BY created_at ASC`
  )
    .bind(post.id)
    .all<ReplyRow>();

  return NextResponse.json({ post, replies: replies.results });
}
