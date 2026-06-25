import Link from "next/link";
import { IconHeartHandshake, IconArrowLeft } from "@tabler/icons-react";
import { getEnv } from "@/lib/cloudflare";
import { CATEGORY_LABELS } from "@/lib/initiativeCategories";
import { INITIATIVE_STATE_OPTIONS } from "@/lib/venezuelaStates";
import { getInitiativeCount } from "@/lib/initiativeStats";
import { getStateFlag } from "@/lib/flags";
import InitiativeIcon from "@/components/InitiativeIcon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciativas de ayuda",
  description:
    "Centros de acopio, donaciones, refugios, transporte y voluntariado organizados por la comunidad tras el terremoto en Venezuela.",
  alternates: { canonical: "/iniciativas" },
};

export const dynamic = "force-dynamic";

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  state: string | null;
  photo_key: string | null;
  created_at: string;
}

async function getInitiatives(q?: string, state?: string): Promise<InitiativeRow[]> {
  const { DB } = await getEnv();
  const columns = "id, title, category, location, description, state, photo_key, created_at";

  const conditions: string[] = [];
  const params: string[] = [];

  if (q) {
    conditions.push("(title LIKE ? OR location LIKE ? OR description LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (state) {
    conditions.push("state = ?");
    params.push(state);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await DB.prepare(
    `SELECT ${columns} FROM initiatives ${where} ORDER BY created_at DESC LIMIT 200`
  )
    .bind(...params)
    .all<InitiativeRow>();
  return result.results;
}

export default async function InitiativesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const { q, state } = await searchParams;
  const [initiatives, initiativeCount] = await Promise.all([
    getInitiatives(q, state),
    getInitiativeCount(),
  ]);

  return (
    <div className="space-y-6">
      <a href="/" className="text-sm text-red-800 flex items-center gap-1">
        <IconArrowLeft size={14} /> Volver al inicio
      </a>

      <div>
        <h1 className="text-2xl font-medium">Iniciativas de ayuda 🇻🇪</h1>
        <p className="text-neutral-600 mt-1">
          Centros de acopio, donaciones, refugios, transporte y voluntariado organizados por la
          comunidad.
        </p>
      </div>

      <div className="bg-teal-50 rounded-lg p-3 flex items-center gap-3">
        <IconHeartHandshake size={22} stroke={1.75} className="text-teal-800 shrink-0" />
        <p className="text-sm text-teal-800">
          <span className="text-lg font-medium">{initiativeCount}</span> iniciativas de ayuda
          activas
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <form className="flex flex-wrap gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o ubicación..."
            className="flex-1 min-w-[150px] border rounded px-3 py-2"
          />
          <select
            name="state"
            defaultValue={state ?? ""}
            className="border rounded px-3 py-2"
          >
            <option value="">Todos los estados</option>
            {INITIATIVE_STATE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-neutral-800 text-white px-4 py-2 rounded">
            Buscar
          </button>
        </form>
        <a
          href="/iniciativas/nueva"
          className="bg-teal-800 text-white px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
        >
          + Publicar iniciativa
        </a>
      </div>

      {q && (
        <p className="text-sm text-neutral-500">
          ¿Buscas a una persona desaparecida en lugar de una iniciativa?{" "}
          <a href={`/personas?q=${encodeURIComponent(q)}`} className="text-red-800 underline">
            Búscala aquí
          </a>
          .
        </p>
      )}

      {initiatives.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {q || state ? "No se encontraron iniciativas." : "Aún no hay iniciativas publicadas."}
        </p>
      ) : (
        <ul className="space-y-2">
          {initiatives.map((initiative) => (
            <li key={initiative.id}>
              <Link
                href={`/iniciativas/${initiative.id}`}
                className="flex items-center gap-3 rounded-lg p-3 bg-white hover:bg-neutral-50"
              >
                {initiative.photo_key ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/photos/${initiative.photo_key}`}
                    alt={initiative.title}
                    className="w-12 h-12 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <InitiativeIcon category={initiative.category} size={48} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{initiative.title}</span>
                  </div>
                  <div className="text-sm text-neutral-600 truncate">
                    {getStateFlag(initiative.state)} {initiative.state ? `${initiative.state} — ` : ""}
                    {initiative.location}
                  </div>
                  {initiative.description && (
                    <div className="text-sm text-neutral-500 truncate">
                      {initiative.description}
                    </div>
                  )}
                </div>
                <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  {CATEGORY_LABELS[initiative.category] ?? initiative.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
