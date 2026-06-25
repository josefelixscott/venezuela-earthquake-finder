import { getEnv } from "@/lib/cloudflare";

export async function getInitiativeCount(): Promise<number> {
  const { DB } = await getEnv();
  const row = await DB.prepare(`SELECT COUNT(*) AS total FROM initiatives`).first<{
    total: number;
  }>();
  return row?.total ?? 0;
}
