import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { VALID_CATEGORIES } from "../route";

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  contact_info: string;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { DB } = await getEnv();

  const initiative = await DB.prepare(
    `SELECT id, title, category, location, description, contact_info, created_at
     FROM initiatives WHERE id = ?1`
  )
    .bind(id)
    .first<InitiativeRow>();

  if (!initiative) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ initiative });
}

interface PatchBody {
  token?: string;
  title?: string;
  category?: string;
  location?: string;
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
  const initiative = await DB.prepare(`SELECT edit_token FROM initiatives WHERE id = ?1`)
    .bind(id)
    .first<{ edit_token: string }>();

  if (!initiative) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  if (initiative.edit_token !== body.token) {
    return NextResponse.json({ error: "token de edición inválido" }, { status: 403 });
  }

  const title = body.title?.trim();
  const location = body.location?.trim();
  const contactInfo = body.contactInfo?.trim();
  const category =
    body.category && VALID_CATEGORIES.includes(body.category) ? body.category : null;

  await DB.prepare(
    `UPDATE initiatives SET
       title = COALESCE(?1, title),
       category = COALESCE(?2, category),
       location = COALESCE(?3, location),
       description = ?4,
       contact_info = COALESCE(?5, contact_info)
     WHERE id = ?6`
  )
    .bind(
      title || null,
      category,
      location || null,
      body.description?.trim() || null,
      contactInfo || null,
      id
    )
    .run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "se requiere el token de edición" }, { status: 401 });
  }

  const { DB } = await getEnv();
  const initiative = await DB.prepare(`SELECT edit_token FROM initiatives WHERE id = ?1`)
    .bind(id)
    .first<{ edit_token: string }>();

  if (!initiative) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  if (initiative.edit_token !== token) {
    return NextResponse.json({ error: "token de edición inválido" }, { status: 403 });
  }

  await DB.prepare(`DELETE FROM initiatives WHERE id = ?1`).bind(id).run();

  return NextResponse.json({ ok: true });
}
