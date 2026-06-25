import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/edit/", "/iniciativas/editar/", "/api/"],
      },
    ],
    sitemap: "https://terremotovenezuela2026.com/sitemap.xml",
  };
}
