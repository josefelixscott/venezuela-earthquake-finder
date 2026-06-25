import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

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
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { DB } = await getEnv();
  const q = request.nextUrl.searchParams.get("q")?.trim();

  let result;
  if (q) {
    const like = `%${q}%`;
    result = await DB.prepare(
      `SELECT id, title, category, location, description, contact_info, created_at FROM initiatives
       WHERE title LIKE ?1 OR location LIKE ?1 OR description LIKE ?1
       ORDER BY created_at DESC LIMIT 200`
    )
      .bind(like)
      .all<InitiativeRow>();
  } else {
    result = await DB.prepare(
      `SELECT id, title, category, location, description, contact_info, created_at FROM initiatives
       ORDER BY created_at DESC LIMIT 200`
    ).all<InitiativeRow>();
  }

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

  if (!title || !location || !contactInfo) {
    return NextResponse.json(
      { error: "el título, la ubicación y el contacto son obligatorios" },
      { status: 400 }
    );
  }

  const finalCategory = VALID_CATEGORIES.includes(category) ? category : "otro";

  const { DB } = await getEnv();
  const id = crypto.randomUUID();
  const editToken = crypto.randomUUID();

  await DB.prepare(
    `INSERT INTO initiatives (id, title, category, location, description, contact_info, edit_token)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  )
    .bind(id, title, finalCategory, location, description, contactInfo, editToken)
    .run();

  return NextResponse.json({ id, editToken }, { status: 201 });
}
