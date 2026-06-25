import { getEnv } from "@/lib/cloudflare";

export interface PostStats {
  total: number;
  looking: number;
  found: number;
}

export async function getPostStats(): Promise<PostStats> {
  const { DB } = await getEnv();
  const row = await DB.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'looking' THEN 1 ELSE 0 END) AS looking,
       SUM(CASE WHEN status = 'found' THEN 1 ELSE 0 END) AS found
     FROM posts`
  ).first<{ total: number; looking: number | null; found: number | null }>();

  return {
    total: row?.total ?? 0,
    looking: row?.looking ?? 0,
    found: row?.found ?? 0,
  };
}
