import Link from "next/link";
import {
  IconUsers,
  IconUserSearch,
  IconCheck,
  IconArrowLeft,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { getEnv } from "@/lib/cloudflare";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";
import { getPostStats } from "@/lib/postStats";
import { getStateFlag } from "@/lib/flags";
import AvatarInitials from "@/components/AvatarInitials";
import StatusPill from "@/components/StatusPill";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personas desaparecidas",
  description:
    "Busca o publica sobre personas desaparecidas tras el terremoto en Venezuela. Filtra por estado y nombre para ayudar a reconectar familias.",
  alternates: { canonical: "/personas" },
};

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  state: string | null;
  status: string;
  photo_key: string | null;
  created_at: string;
  last_confirmed_at: string;
}

const STALE_AFTER_DAYS = 7;
const HIDE_AFTER_DAYS = 30;

async function getPosts(q?: string, state?: string): Promise<PostRow[]> {
  const { DB } = await getEnv();
  // contact_info is intentionally excluded from every public listing query.
  // Posts unconfirmed for HIDE_AFTER_DAYS drop out of the default list (but the
  // direct link still works) so volunteers stop spending time on stale leads.
  const columns =
    "id, name, age, last_known_location, description, state, status, photo_key, created_at, last_confirmed_at";

  const conditions = [
    `(status = 'found' OR last_confirmed_at >= datetime('now', '-${HIDE_AFTER_DAYS} days'))`,
  ];
  const params: string[] = [];

  if (q) {
    conditions.push("(name LIKE ? OR last_known_location LIKE ? OR description LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (state) {
    conditions.push("state = ?");
    params.push(state);
  }

  const result = await DB.prepare(
    `SELECT ${columns} FROM posts WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 200`
  )
    .bind(...params)
    .all<PostRow>();
  return result.results;
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const { q, state } = await searchParams;
  const [posts, stats] = await Promise.all([getPosts(q, state), getPostStats()]);

  return (
    <div className="space-y-6">
      <a href="/" className="text-sm text-red-800 flex items-center gap-1">
        <IconArrowLeft size={14} /> Volver al inicio
      </a>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-3 text-center">
          <IconUsers size={20} stroke={1.75} className="mx-auto text-neutral-500" />
          <div className="text-xl font-medium mt-1">{stats.total}</div>
          <div className="text-xs text-neutral-600 mt-0.5">Registradas</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <IconUserSearch size={20} stroke={1.75} className="mx-auto text-red-800" />
          <div className="text-xl font-medium mt-1 text-red-800">{stats.looking}</div>
          <div className="text-xs text-red-800 mt-0.5">Por localizar</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <IconCheck size={20} stroke={1.75} className="mx-auto text-green-800" />
          <div className="text-xl font-medium mt-1 text-green-800">{stats.found}</div>
          <div className="text-xs text-green-800 mt-0.5">Localizadas</div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-medium">Personas desaparecidas 🇻🇪</h1>
        <p className="text-neutral-600 mt-1">
          Publica sobre un familiar desaparecido, o busca para ver si alguien ha publicado sobre
          alguien que conoces.{" "}
          <a href="/como-funciona" className="text-red-800 underline">
            Ver cómo funciona
          </a>
          .
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
          href="/new"
          className="bg-red-800 text-white px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
        >
          + Publicar
        </a>
      </div>

      {q && (
        <p className="text-sm text-neutral-500">
          ¿Buscas iniciativas de ayuda en lugar de personas?{" "}
          <a href={`/iniciativas?q=${encodeURIComponent(q)}`} className="text-red-800 underline">
            Búscalas aquí
          </a>
          .
        </p>
      )}

      {posts.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {q || state
            ? "No se encontraron publicaciones."
            : "Aún no hay publicaciones. Sé el primero en publicar."}
        </p>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => {
            const daysSinceConfirmed = Math.floor(
              (Date.now() - new Date(post.last_confirmed_at + "Z").getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const isStale = post.status === "looking" && daysSinceConfirmed >= STALE_AFTER_DAYS;
            return (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 bg-white hover:bg-neutral-50"
                >
                  {post.photo_key ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/photos/${post.photo_key}`}
                      alt={post.name}
                      className="w-12 h-12 object-cover rounded-full shrink-0"
                    />
                  ) : (
                    <AvatarInitials name={post.name} size={48} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{post.name}</span>
                      {post.age && <span className="text-sm text-neutral-500">{post.age}</span>}
                    </div>
                    <div className="text-sm text-neutral-600 truncate">
                      {getStateFlag(post.state)} {post.state ? `${post.state} — ` : ""}
                      {post.last_known_location}
                    </div>
                    {post.description && (
                      <div className="text-sm text-neutral-500 truncate">{post.description}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusPill status={post.status === "found" ? "found" : "looking"} />
                    {isStale && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <IconAlertTriangle size={10} /> Sin confirmar
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
