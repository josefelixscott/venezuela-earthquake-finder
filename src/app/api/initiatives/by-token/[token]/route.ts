import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  contact_info: string;
  link: string | null;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { DB } = await getEnv();

  const initiative = await DB.prepare(
    `SELECT id, title, category, location, description, contact_info, link, created_at
     FROM initiatives WHERE edit_token = ?1`
  )
    .bind(token)
    .first<InitiativeRow>();

  if (!initiative) {
    return NextResponse.json({ error: "enlace de edición no válido" }, { status: 404 });
  }

  return NextResponse.json({ initiative });
}
