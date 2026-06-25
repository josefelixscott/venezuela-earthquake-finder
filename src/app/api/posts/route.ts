import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
  photo_key: string | null;
  status: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { DB } = await getEnv();
  const q = request.nextUrl.searchParams.get("q")?.trim();

  let result;
  if (q) {
    const like = `%${q}%`;
    result = await DB.prepare(
      `SELECT * FROM posts WHERE name LIKE ?1 OR last_known_location LIKE ?1 OR description LIKE ?1 ORDER BY created_at DESC LIMIT 200`
    )
      .bind(like)
      .all<PostRow>();
  } else {
    result = await DB.prepare(`SELECT * FROM posts ORDER BY created_at DESC LIMIT 200`).all<PostRow>();
  }

  return NextResponse.json({ posts: result.results });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = (formData.get("name") as string)?.trim();
  const age = (formData.get("age") as string)?.trim() || null;
  const lastKnownLocation = (formData.get("lastKnownLocation") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const contactInfo = (formData.get("contactInfo") as string)?.trim();

  if (!name || !lastKnownLocation || !contactInfo) {
    return NextResponse.json(
      { error: "name, lastKnownLocation, and contactInfo are required" },
      { status: 400 }
    );
  }

  const { DB } = await getEnv();
  const id = crypto.randomUUID();

  await DB.prepare(
    `INSERT INTO posts (id, name, age, last_known_location, description, contact_info)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  )
    .bind(id, name, age, lastKnownLocation, description, contactInfo)
    .run();

  return NextResponse.json({ id }, { status: 201 });
}
