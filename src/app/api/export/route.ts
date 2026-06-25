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
  photo_key: string | null;
  created_at: string;
  last_confirmed_at: string;
}

type ExportRow = Omit<PostRow, "photo_key"> & { photo_url: string | null };

function toCsv(rows: ExportRow[]): string {
  const headers: (keyof ExportRow)[] = [
    "id",
    "name",
    "age",
    "last_known_location",
    "description",
    "contact_info",
    "state",
    "status",
    "photo_url",
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
    lines.push(headers.map((h) => escape(row[h] as string | null)).join(","));
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
    `SELECT id, name, age, last_known_location, description, contact_info, state, status, photo_key, created_at, last_confirmed_at
     FROM posts ORDER BY created_at DESC`
  ).all<PostRow>();

  const baseUrl = request.nextUrl.origin;
  const rows: ExportRow[] = result.results.map(({ photo_key, ...rest }) => ({
    ...rest,
    photo_url: photo_key ? `${baseUrl}/api/photos/${photo_key}` : null,
  }));

  if (format === "csv") {
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=personas-buscadas.csv",
      },
    });
  }

  return NextResponse.json({ posts: rows });
}
