import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface CloudflareEnv {
  DB: D1Database;
  PHOTOS: R2Bucket;
  EXPORT_TOKEN?: string;
}

export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as CloudflareEnv;
}
