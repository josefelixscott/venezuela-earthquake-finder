import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { INITIATIVE_STATE_OPTIONS } from "@/lib/venezuelaStates";
import { storePhoto } from "@/lib/photos";

export const VALID_CATEGORIES = [
  "centro_de_acopio",
  "donaciones",
  "refugio",
  "transporte",
  "voluntariado",
  "otro",
];

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  contact_info: string;
  link: string | null;
  state: string | null;
  photo_key: string | null;
  created_at: string;
}

// Normalizes to an absolute http(s) URL, or returns null if not a safe link
// (guards against javascript: and other schemes being stored and later rendered as href).
export function normalizeLink(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { DB } = await getEnv();
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const state = request.nextUrl.searchParams.get("state")?.trim();
  const columns =
    "id, title, category, location, description, contact_info, link, state, photo_key, created_at";

  const conditions: string[] = [];
  const params: string[] = [];

  if (q) {
    conditions.push("(title LIKE ? OR location LIKE ? OR description LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (state) {
    conditions.push("state = ?");
    params.push(state);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await DB.prepare(
    `SELECT ${columns} FROM initiatives ${where} ORDER BY created_at DESC LIMIT 200`
  )
    .bind(...params)
    .all<InitiativeRow>();

  return NextResponse.json({ initiatives: result.results });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Honeypot: real users never fill this hidden field; bots that fill every field do.
  if ((formData.get("website") as string)?.trim()) {
    return NextResponse.json(
      { error: "el título, la ubicación y el contacto son obligatorios" },
      { status: 400 }
    );
  }

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const contactInfo = (formData.get("contactInfo") as string)?.trim();
  const link = normalizeLink(formData.get("link") as string | null);
  const stateRaw = (formData.get("state") as string)?.trim();
  const state = INITIATIVE_STATE_OPTIONS.includes(stateRaw) ? stateRaw : null;

  if (!title || !location || !contactInfo) {
    return NextResponse.json(
      { error: "el título, la ubicación y el contacto son obligatorios" },
      { status: 400 }
    );
  }

  const finalCategory = VALID_CATEGORIES.includes(category) ? category : "otro";

  const env = await getEnv();
  const { DB } = env;
  const { key: photoKey, error: photoError } = await storePhoto(
    env,
    formData.get("photo") as File | null
  );
  if (photoError) {
    return NextResponse.json({ error: photoError }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const editToken = crypto.randomUUID();

  await DB.prepare(
    `INSERT INTO initiatives (id, title, category, location, description, contact_info, link, state, photo_key, edit_token)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
  )
    .bind(
      id,
      title,
      finalCategory,
      location,
      description,
      contactInfo,
      link,
      state,
      photoKey,
      editToken
    )
    .run();

  return NextResponse.json({ id, editToken }, { status: 201 });
}
