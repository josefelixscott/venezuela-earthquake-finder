import { CloudflareEnv } from "@/lib/cloudflare";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function storePhoto(
  env: CloudflareEnv,
  photo: File | null
): Promise<{ key: string | null; error: string | null }> {
  if (!photo || photo.size === 0) {
    return { key: null, error: null };
  }
  if (!photo.type.startsWith("image/")) {
    return { key: null, error: "la foto debe ser una imagen" };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { key: null, error: "la foto debe ser menor a 5MB" };
  }

  const key = `${crypto.randomUUID()}-${photo.name}`;
  await env.PHOTOS.put(key, await photo.arrayBuffer(), {
    httpMetadata: { contentType: photo.type },
  });

  return { key, error: null };
}
