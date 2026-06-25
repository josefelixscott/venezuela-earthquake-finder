import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IconArrowLeft, IconExternalLink, IconPhone } from "@tabler/icons-react";
import { getEnv } from "@/lib/cloudflare";
import { CATEGORY_LABELS } from "@/lib/initiativeCategories";
import { getStateFlag } from "@/lib/flags";
import InitiativeIcon from "@/components/InitiativeIcon";

export const dynamic = "force-dynamic";

const SITE_URL = "https://terremotovenezuela2026.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { DB } = await getEnv();
  const initiative = await DB.prepare(
    `SELECT title, location, state, photo_key FROM initiatives WHERE id = ?1`
  )
    .bind(id)
    .first<{ title: string; location: string; state: string | null; photo_key: string | null }>();

  if (!initiative) {
    return { title: "Iniciativa no encontrada" };
  }

  const title = `${initiative.title} — Iniciativa de ayuda`;
  const description = `${initiative.state ? initiative.state + " — " : ""}${initiative.location}. Ayuda a difundir esta iniciativa.`;
  const images = initiative.photo_key
    ? [`${SITE_URL}/api/photos/${initiative.photo_key}`]
    : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images, url: `${SITE_URL}/iniciativas/${id}` },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  contact_info: string;
  link: string | null;
  state: string | null;
  photo_key: string | null;
  created_at: string;
}

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { DB } = await getEnv();

  const initiative = await DB.prepare(
    `SELECT id, title, category, location, description, contact_info, link, state, photo_key, created_at
     FROM initiatives WHERE id = ?1`
  )
    .bind(id)
    .first<InitiativeRow>();

  if (!initiative) {
    notFound();
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <a href="/iniciativas" className="text-sm text-red-800 flex items-center gap-1">
        <IconArrowLeft size={14} /> Volver a iniciativas
      </a>
      <div className="rounded-lg p-4 bg-white">
        {initiative.photo_key ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${initiative.photo_key}`}
            alt={initiative.title}
            className="w-full max-h-80 object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="mb-3">
            <InitiativeIcon category={initiative.category} size={56} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">{initiative.title}</h1>
        </div>
        <span className="inline-block text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full mt-1">
          {CATEGORY_LABELS[initiative.category] ?? initiative.category}
        </span>
        {initiative.state && (
          <p className="text-neutral-700 mt-2">
            {getStateFlag(initiative.state)} <span className="font-medium">{initiative.state}</span>
          </p>
        )}
        <p className="text-neutral-700 mt-1">
          <span className="font-medium">Ubicación:</span> {initiative.location}
        </p>
        {initiative.description && (
          <p className="text-neutral-700 mt-1">{initiative.description}</p>
        )}
        <p className="text-neutral-700 mt-2 flex items-center gap-1.5">
          <IconPhone size={16} className="text-neutral-500 shrink-0" />
          {initiative.contact_info}
        </p>
        {initiative.link && (
          <p className="mt-3">
            <a
              href={initiative.link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 bg-red-800 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              <IconExternalLink size={16} /> Visitar enlace (recaudación, redes, más información)
            </a>
          </p>
        )}
        <p className="text-xs text-neutral-400 mt-3">
          Publicado {new Date(initiative.created_at + "Z").toLocaleString("es-VE")}
        </p>
      </div>
    </div>
  );
}
