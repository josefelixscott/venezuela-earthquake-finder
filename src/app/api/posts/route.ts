import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  status: string;
  created_at: string;
  last_confirmed_at: string;
}

const HIDE_AFTER_DAYS = 30;

export async function GET(request: NextRequest) {
  const { DB } = await getEnv();
  const q = request.nextUrl.searchParams.get("q")?.trim();
  // contact_info is intentionally excluded from this public endpoint.
  const columns =
    "id, name, age, last_known_location, description, status, created_at, last_confirmed_at";

  let result;
  if (q) {
    const like = `%${q}%`;
    result = await DB.prepare(
      `SELECT ${columns} FROM posts
       WHERE (name LIKE ?1 OR last_known_location LIKE ?1 OR description LIKE ?1)
         AND (status = 'found' OR last_confirmed_at >= datetime('now', '-${HIDE_AFTER_DAYS} days'))
       ORDER BY created_at DESC LIMIT 200`
    )
      .bind(like)
      .all<PostRow>();
  } else {
    result = await DB.prepare(
      `SELECT ${columns} FROM posts
       WHERE status = 'found' OR last_confirmed_at >= datetime('now', '-${HIDE_AFTER_DAYS} days')
       ORDER BY created_at DESC LIMIT 200`
    ).all<PostRow>();
  }

  return NextResponse.json({ posts: result.results });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Honeypot: real users never fill this hidden field; bots that fill every field do.
  if ((formData.get("website") as string)?.trim()) {
    return NextResponse.json({ error: "el nombre, la ubicación y el contacto son obligatorios" }, { status: 400 });
  }

  const name = (formData.get("name") as string)?.trim();
  const age = (formData.get("age") as string)?.trim() || null;
  const lastKnownLocation = (formData.get("lastKnownLocation") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const contactInfo = (formData.get("contactInfo") as string)?.trim();

  if (!name || !lastKnownLocation || !contactInfo) {
    return NextResponse.json(
      { error: "el nombre, la ubicación y el contacto son obligatorios" },
      { status: 400 }
    );
  }

  const { DB } = await getEnv();
  const id = crypto.randomUUID();
  const editToken = crypto.randomUUID();

  await DB.prepare(
    `INSERT INTO posts (id, name, age, last_known_location, description, contact_info, edit_token)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  )
    .bind(id, name, age, lastKnownLocation, description, contactInfo, editToken)
    .run();

  return NextResponse.json({ id, editToken }, { status: 201 });
}
