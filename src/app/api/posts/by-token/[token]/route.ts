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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { DB } = await getEnv();

  const post = await DB.prepare(
    `SELECT id, name, age, last_known_location, description, contact_info, status, created_at
     FROM posts WHERE edit_token = ?1`
  )
    .bind(token)
    .first<PostRow>();

  if (!post) {
    return NextResponse.json({ error: "enlace de edición no válido" }, { status: 404 });
  }

  return NextResponse.json({ post });
}
