import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { storePhoto } from "@/lib/photos";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const token = formData.get("token") as string | null;

  if (!token) {
    return NextResponse.json({ error: "se requiere el token de edición" }, { status: 401 });
  }

  const env = await getEnv();
  const initiative = await env.DB.prepare(`SELECT edit_token FROM initiatives WHERE id = ?1`)
    .bind(id)
    .first<{ edit_token: string }>();

  if (!initiative) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  if (initiative.edit_token !== token) {
    return NextResponse.json({ error: "token de edición inválido" }, { status: 403 });
  }

  const { key, error } = await storePhoto(env, formData.get("photo") as File | null);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!key) {
    return NextResponse.json({ error: "no se recibió ninguna foto" }, { status: 400 });
  }

  await env.DB.prepare(`UPDATE initiatives SET photo_key = ?1 WHERE id = ?2`).bind(key, id).run();

  return NextResponse.json({ ok: true, photoKey: key });
}
