import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

interface LocatedPersonRow {
  id: string;
  name: string;
  age: string | null;
  location_name: string;
  state: string | null;
  notes: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { DB } = await getEnv();
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const state = request.nextUrl.searchParams.get("state")?.trim();

  const conditions: string[] = [];
  const params: string[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR location_name LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like);
  }
  if (state) {
    conditions.push("state = ?");
    params.push(state);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await DB.prepare(
    `SELECT id, name, age, location_name, state, notes, created_at FROM located_persons
     ${where} ORDER BY created_at DESC LIMIT 500`
  )
    .bind(...params)
    .all<LocatedPersonRow>();

  return NextResponse.json({ people: result.results });
}

export interface BulkEntry {
  name: string;
  age: string | null;
}

export function parseEntries(raw: string): BulkEntry[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...rest] = line.split(",");
      const name = namePart.trim();
      const age = rest.join(",").trim() || null;
      return { name, age };
    })
    .filter((entry) => entry.name.length > 0);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Honeypot: real users never fill this hidden field; bots that fill every field do.
  if ((formData.get("website") as string)?.trim()) {
    return NextResponse.json(
      { error: "el lugar y la lista de nombres son obligatorios" },
      { status: 400 }
    );
  }

  const locationName = (formData.get("locationName") as string)?.trim();
  const stateRaw = (formData.get("state") as string)?.trim();
  const state = VENEZUELA_STATES.includes(stateRaw) ? stateRaw : null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const contactInfo = (formData.get("contactInfo") as string)?.trim() || null;
  const rawEntries = (formData.get("entries") as string) ?? "";
  const entries = parseEntries(rawEntries);

  if (!locationName || entries.length === 0) {
    return NextResponse.json(
      { error: "el lugar y al menos un nombre son obligatorios" },
      { status: 400 }
    );
  }
  if (entries.length > 500) {
    return NextResponse.json(
      { error: "máximo 500 nombres por lista" },
      { status: 400 }
    );
  }

  const { DB } = await getEnv();
  const batchId = crypto.randomUUID();
  const editToken = crypto.randomUUID();

  const statements = entries.map((entry) =>
    DB.prepare(
      `INSERT INTO located_persons (id, batch_id, name, age, location_name, state, notes, contact_info, edit_token)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    ).bind(
      crypto.randomUUID(),
      batchId,
      entry.name,
      entry.age,
      locationName,
      state,
      notes,
      contactInfo,
      editToken
    )
  );
  await DB.batch(statements);

  return NextResponse.json({ batchId, editToken, count: entries.length }, { status: 201 });
}
