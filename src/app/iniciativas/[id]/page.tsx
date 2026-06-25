import { notFound } from "next/navigation";
import { getEnv } from "@/lib/cloudflare";
import { CATEGORY_LABELS } from "@/lib/initiativeCategories";

export const dynamic = "force-dynamic";

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
      <a href="/iniciativas" className="text-sm text-red-700 underline">
        Volver a iniciativas
      </a>
      <div className="border rounded p-4 bg-white">
        {initiative.photo_key && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${initiative.photo_key}`}
            alt={initiative.title}
            className="w-full max-h-80 object-cover rounded mb-3"
          />
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{initiative.title}</h1>
          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
            {CATEGORY_LABELS[initiative.category] ?? initiative.category}
          </span>
        </div>
        {initiative.state && (
          <p className="text-neutral-700 mt-1">
            <span className="font-medium">Estado:</span> {initiative.state}
          </p>
        )}
        <p className="text-neutral-700 mt-1">
          <span className="font-medium">Ubicación:</span> {initiative.location}
        </p>
        {initiative.description && (
          <p className="text-neutral-700 mt-1">{initiative.description}</p>
        )}
        <p className="text-neutral-700 mt-1">
          <span className="font-medium">Contacto:</span> {initiative.contact_info}
        </p>
        {initiative.link && (
          <p className="mt-2">
            <a
              href={initiative.link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium"
            >
              Visitar enlace (recaudación, redes, más información)
            </a>
          </p>
        )}
        <p className="text-xs text-neutral-400 mt-2">
          Publicado {new Date(initiative.created_at + "Z").toLocaleString("es-VE")}
        </p>
      </div>
    </div>
  );
}
