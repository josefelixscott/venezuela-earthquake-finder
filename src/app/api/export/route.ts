import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
  state: string | null;
  status: string;
  created_at: string;
  last_confirmed_at: string;
}

function toCsv(rows: PostRow[]): string {
  const headers = [
    "id",
    "name",
    "age",
    "last_known_location",
    "description",
    "contact_info",
    "state",
    "status",
    "created_at",
    "last_confirmed_at",
  ];
  const escape = (value: string | null) => {
    if (value == null) return "";
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h as keyof PostRow] as string | null)).join(","));
  }
  return lines.join("\n");
}

// Full export including contact_info, intended for vetted official partners
// (Red Cross, SAR teams) ingesting into their own systems — gated behind a
// shared secret so this isn't just an open scrape target for contact data.
export async function GET(request: NextRequest) {
  const { DB, EXPORT_TOKEN } = await getEnv();

  if (!EXPORT_TOKEN) {
    return NextResponse.json({ error: "la exportación no está configurada" }, { status: 503 });
  }

  const token = request.nextUrl.searchParams.get("token");
  if (token !== EXPORT_TOKEN) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "json";

  const result = await DB.prepare(
    `SELECT id, name, age, last_known_location, description, contact_info, state, status, created_at, last_confirmed_at
     FROM posts ORDER BY created_at DESC`
  ).all<PostRow>();

  if (format === "csv") {
    return new NextResponse(toCsv(result.results), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=personas-buscadas.csv",
      },
    });
  }

  return NextResponse.json({ posts: result.results });
}
