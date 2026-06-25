import { IconBuildingHospital, IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react";
import { getEnv } from "@/lib/cloudflare";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";
import { getLocatedCount } from "@/lib/locatedStats";
import { getStateFlag } from "@/lib/flags";
import AvatarInitials from "@/components/AvatarInitials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personas ubicadas en hospitales y centros",
  description:
    "Listas de personas registradas en hospitales, refugios y otros lugares tras el terremoto en Venezuela. El estado de cada persona no está confirmado — verifica directamente con el lugar.",
  alternates: { canonical: "/ubicados" },
};

export const dynamic = "force-dynamic";

interface LocatedPersonRow {
  id: string;
  name: string;
  age: string | null;
  location_name: string;
  state: string | null;
  notes: string | null;
  created_at: string;
}

async function getLocatedPersons(q?: string, state?: string): Promise<LocatedPersonRow[]> {
  const { DB } = await getEnv();
  const conditions: string[] = [];
  const params: string[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR location_name LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like);
  }
  if (state) {
    conditions.push("state = ?");
    params.push(state);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await DB.prepare(
    `SELECT id, name, age, location_name, state, notes, created_at FROM located_persons
     ${where} ORDER BY created_at DESC LIMIT 500`
  )
    .bind(...params)
    .all<LocatedPersonRow>();
  return result.results;
}

export default async function UbicadosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const { q, state } = await searchParams;
  const [people, total] = await Promise.all([
    getLocatedPersons(q, state),
    getLocatedCount(),
  ]);

  return (
    <div className="space-y-6">
      <a href="/" className="text-sm text-red-800 flex items-center gap-1">
        <IconArrowLeft size={14} /> Volver al inicio
      </a>

      <div>
        <h1 className="text-2xl font-medium">Personas ubicadas 🇻🇪</h1>
        <p className="text-neutral-600 mt-1">
          Listas de personas registradas en hospitales, refugios y otros lugares tras el
          terremoto.
        </p>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900 flex items-start gap-2">
        <IconAlertTriangle size={18} className="shrink-0 mt-0.5" />
        <p>
          El estado de cada persona (con vida o no) <strong>no está confirmado</strong>. Esta
          lista solo indica que el nombre fue registrado en el lugar señalado. Verifica
          directamente con el lugar antes de sacar conclusiones.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
        <IconBuildingHospital size={22} stroke={1.75} className="text-blue-800 shrink-0" />
        <p className="text-sm text-blue-800">
          <span className="text-lg font-medium">{total}</span> personas registradas en listas
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <form className="flex flex-wrap gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o lugar..."
            className="flex-1 min-w-[150px] border rounded px-3 py-2"
          />
          <select name="state" defaultValue={state ?? ""} className="border rounded px-3 py-2">
            <option value="">Todos los estados</option>
            {VENEZUELA_STATES.map((s) => (
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
          href="/ubicados/nueva"
          className="bg-blue-800 text-white px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
        >
          + Publicar lista
        </a>
      </div>

      {people.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {q || state
            ? "No se encontraron registros."
            : "Aún no hay personas registradas. Sé el primero en publicar una lista."}
        </p>
      ) : (
        <ul className="space-y-2">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-3 rounded-lg p-3 bg-white"
            >
              <AvatarInitials name={person.name} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{person.name}</span>
                  {person.age && <span className="text-sm text-neutral-500">{person.age}</span>}
                </div>
                <div className="text-sm text-neutral-600 truncate">
                  {getStateFlag(person.state)} {person.state ? `${person.state} — ` : ""}
                  {person.location_name}
                </div>
                {person.notes && (
                  <div className="text-sm text-neutral-500 truncate">{person.notes}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
