import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { parseEntries } from "../../../route";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json<{ entries?: string }>();
  const { DB } = await getEnv();

  const existing = await DB.prepare(
    `SELECT batch_id, location_name, state, notes, contact_info FROM located_persons WHERE edit_token = ?1 LIMIT 1`
  )
    .bind(token)
    .first<{
      batch_id: string;
      location_name: string;
      state: string | null;
      notes: string | null;
      contact_info: string | null;
    }>();

  if (!existing) {
    return NextResponse.json({ error: "enlace de edición no válido" }, { status: 404 });
  }

  const entries = parseEntries(body.entries ?? "");
  if (entries.length === 0) {
    return NextResponse.json({ error: "no se recibieron nombres" }, { status: 400 });
  }
  if (entries.length > 500) {
    return NextResponse.json({ error: "máximo 500 nombres por envío" }, { status: 400 });
  }

  const statements = entries.map((entry) =>
    DB.prepare(
      `INSERT INTO located_persons (id, batch_id, name, age, location_name, state, notes, contact_info, edit_token)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    ).bind(
      crypto.randomUUID(),
      existing.batch_id,
      entry.name,
      entry.age,
      existing.location_name,
      existing.state,
      existing.notes,
      existing.contact_info,
      token
    )
  );
  await DB.batch(statements);

  return NextResponse.json({ ok: true, count: entries.length }, { status: 201 });
}
