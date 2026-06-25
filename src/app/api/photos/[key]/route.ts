import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const { PHOTOS } = await getEnv();

  const object = await PHOTOS.get(key);
  if (!object) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return new NextResponse(object.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
