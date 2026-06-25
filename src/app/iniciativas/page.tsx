import Link from "next/link";
import { getEnv } from "@/lib/cloudflare";
import { CATEGORY_LABELS } from "@/lib/initiativeCategories";

export const dynamic = "force-dynamic";

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  created_at: string;
}

async function getInitiatives(q?: string): Promise<InitiativeRow[]> {
  const { DB } = await getEnv();
  const columns = "id, title, category, location, description, created_at";
  if (q) {
    const like = `%${q}%`;
    const result = await DB.prepare(
      `SELECT ${columns} FROM initiatives
       WHERE title LIKE ?1 OR location LIKE ?1 OR description LIKE ?1
       ORDER BY created_at DESC LIMIT 200`
    )
      .bind(like)
      .all<InitiativeRow>();
    return result.results;
  }
  const result = await DB.prepare(
    `SELECT ${columns} FROM initiatives ORDER BY created_at DESC LIMIT 200`
  ).all<InitiativeRow>();
  return result.results;
}

export default async function InitiativesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initiatives = await getInitiatives(q);

  return (
    <div className="space-y-6">
      <a href="/" className="text-sm text-red-700 underline">
        Volver al inicio
      </a>

      <div>
        <h1 className="text-2xl font-bold">Iniciativas de ayuda</h1>
        <p className="text-neutral-600 mt-1">
          Centros de acopio, donaciones, refugios, transporte y voluntariado organizados por la
          comunidad.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <form className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o ubicación..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-neutral-800 text-white px-4 py-2 rounded">
            Buscar
          </button>
        </form>
        <a
          href="/iniciativas/nueva"
          className="bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm whitespace-nowrap"
        >
          + Publicar iniciativa
        </a>
      </div>

      {q && (
        <p className="text-sm text-neutral-500">
          ¿Buscas a una persona desaparecida en lugar de una iniciativa?{" "}
          <a href={`/personas?q=${encodeURIComponent(q)}`} className="text-red-700 underline">
            Búscala aquí
          </a>
          .
        </p>
      )}

      {initiatives.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {q ? "No se encontraron iniciativas." : "Aún no hay iniciativas publicadas."}
        </p>
      ) : (
        <ul className="space-y-3">
          {initiatives.map((initiative) => (
            <li key={initiative.id}>
              <Link
                href={`/iniciativas/${initiative.id}`}
                className="block border rounded p-3 bg-white hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{initiative.title}</span>
                  <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                    {CATEGORY_LABELS[initiative.category] ?? initiative.category}
                  </span>
                </div>
                <div className="text-sm text-neutral-600">{initiative.location}</div>
                {initiative.description && (
                  <div className="text-sm text-neutral-500 truncate">
                    {initiative.description}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
