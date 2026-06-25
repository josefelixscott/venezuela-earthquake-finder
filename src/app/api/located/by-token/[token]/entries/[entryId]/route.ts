import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string; entryId: string }> }
) {
  const { token, entryId } = await params;
  const { DB } = await getEnv();

  const entry = await DB.prepare(
    `SELECT id FROM located_persons WHERE id = ?1 AND edit_token = ?2`
  )
    .bind(entryId, token)
    .first();

  if (!entry) {
    return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  }

  await DB.prepare(`DELETE FROM located_persons WHERE id = ?1`).bind(entryId).run();

  return NextResponse.json({ ok: true });
}
