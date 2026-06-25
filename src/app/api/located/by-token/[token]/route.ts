import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

interface LocatedPersonRow {
  id: string;
  batch_id: string;
  name: string;
  age: string | null;
  cedula: string | null;
  location_name: string;
  state: string | null;
  notes: string | null;
  contact_info: string | null;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { DB } = await getEnv();

  const result = await DB.prepare(
    `SELECT id, batch_id, name, age, cedula, location_name, state, notes, contact_info, created_at
     FROM located_persons WHERE edit_token = ?1 ORDER BY created_at ASC`
  )
    .bind(token)
    .all<LocatedPersonRow>();

  if (result.results.length === 0) {
    return NextResponse.json({ error: "enlace de edición no válido" }, { status: 404 });
  }

  return NextResponse.json({ people: result.results });
}

interface PatchBody {
  locationName?: string;
  state?: string | null;
  notes?: string | null;
  contactInfo?: string | null;
}

// Updates the shared fields (location/state/notes/contact) across every entry in the batch.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json<PatchBody>();
  const { DB } = await getEnv();

  const existing = await DB.prepare(`SELECT id FROM located_persons WHERE edit_token = ?1 LIMIT 1`)
    .bind(token)
    .first();
  if (!existing) {
    return NextResponse.json({ error: "enlace de edición no válido" }, { status: 404 });
  }

  const locationName = body.locationName?.trim();
  const state = body.state && VENEZUELA_STATES.includes(body.state) ? body.state : null;

  await DB.prepare(
    `UPDATE located_persons SET
       location_name = COALESCE(?1, location_name),
       state = ?2,
       notes = ?3,
       contact_info = ?4
     WHERE edit_token = ?5`
  )
    .bind(
      locationName || null,
      state,
      body.notes?.trim() || null,
      body.contactInfo?.trim() || null,
      token
    )
    .run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { DB } = await getEnv();

  await DB.prepare(`DELETE FROM located_persons WHERE edit_token = ?1`).bind(token).run();

  return NextResponse.json({ ok: true });
}
