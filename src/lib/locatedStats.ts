import { getEnv } from "@/lib/cloudflare";

export async function getLocatedCount(): Promise<number> {
  const { DB } = await getEnv();
  const row = await DB.prepare(`SELECT COUNT(*) AS total FROM located_persons`).first<{
    total: number;
  }>();
  return row?.total ?? 0;
}
