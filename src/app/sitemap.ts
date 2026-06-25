import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

const SITE_URL = "https://terremotovenezuela2026.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { DB } = await getEnv();

  const [posts, initiatives] = await Promise.all([
    DB.prepare(`SELECT id, created_at FROM posts ORDER BY created_at DESC LIMIT 5000`).all<{
      id: string;
      created_at: string;
    }>(),
    DB.prepare(`SELECT id, created_at FROM initiatives ORDER BY created_at DESC LIMIT 5000`).all<{
      id: string;
      created_at: string;
    }>(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/personas`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/iniciativas`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/new`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/iniciativas/nueva`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/como-funciona`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/como-ayudar`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.results.map((post) => ({
    url: `${SITE_URL}/posts/${post.id}`,
    lastModified: new Date(post.created_at + "Z"),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const initiativePages: MetadataRoute.Sitemap = initiatives.results.map((initiative) => ({
    url: `${SITE_URL}/iniciativas/${initiative.id}`,
    lastModified: new Date(initiative.created_at + "Z"),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...initiativePages];
}
