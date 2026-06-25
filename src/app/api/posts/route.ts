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
  created_at: string;
  last_confirmed_at: string;
}

const HIDE_AFTER_DAYS = 30;

export async function GET(request: NextRequest) {
  const { DB } = await getEnv();
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const state = request.nextUrl.searchParams.get("state")?.trim();
  // contact_info is intentionally excluded from this public endpoint.
  const columns =
    "id, name, age, last_known_location, description, state, status, created_at, last_confirmed_at";

  const conditions = ["(status = 'found' OR last_confirmed_at >= datetime('now', '-" + HIDE_AFTER_DAYS + " days'))"];
  const params: string[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR last_known_location LIKE ? OR description LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (state) {
    conditions.push("state = ?");
    params.push(state);
  }

  const result = await DB.prepare(
    `SELECT ${columns} FROM posts WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 200`
  )
    .bind(...params)
    .all<PostRow>();

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
  const stateRaw = (formData.get("state") as string)?.trim();
  const state = VENEZUELA_STATES.includes(stateRaw) ? stateRaw : null;

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
    `INSERT INTO posts (id, name, age, last_known_location, description, contact_info, state, edit_token)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
  )
    .bind(id, name, age, lastKnownLocation, description, contactInfo, state, editToken)
    .run();

  return NextResponse.json({ id, editToken }, { status: 201 });
}
