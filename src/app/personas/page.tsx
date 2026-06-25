import Link from "next/link";
import { getEnv } from "@/lib/cloudflare";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";
import { getPostStats } from "@/lib/postStats";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  state: string | null;
  status: string;
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
    "id, name, age, last_known_location, description, state, status, created_at, last_confirmed_at";

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
      <a href="/" className="text-sm text-red-700 underline">
        Volver al inicio
      </a>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-neutral-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-neutral-800">{stats.total}</div>
          <div className="text-xs text-neutral-600 mt-1">Personas registradas</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{stats.looking}</div>
          <div className="text-xs text-red-700 mt-1">Por localizar</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{stats.found}</div>
          <div className="text-xs text-green-700 mt-1">Localizadas</div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Personas desaparecidas</h1>
        <p className="text-neutral-600 mt-1">
          Publica sobre un familiar desaparecido, o busca para ver si alguien ha publicado sobre
          alguien que conoces.{" "}
          <a href="/como-funciona" className="text-red-700 underline">
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
          className="bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm whitespace-nowrap"
        >
          + Publicar
        </a>
      </div>

      {q && (
        <p className="text-sm text-neutral-500">
          ¿Buscas iniciativas de ayuda en lugar de personas?{" "}
          <a href={`/iniciativas?q=${encodeURIComponent(q)}`} className="text-red-700 underline">
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
        <ul className="space-y-3">
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
                  className="flex gap-3 border rounded p-3 bg-white hover:bg-neutral-50"
                >
                  <div className="w-16 h-16 rounded bg-neutral-200 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.name}</span>
                      {post.age && <span className="text-sm text-neutral-500">{post.age}</span>}
                      {post.status === "found" && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Encontrado
                        </span>
                      )}
                      {isStale && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          Sin confirmar
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {post.state && <span className="font-medium">{post.state} — </span>}
                      {post.last_known_location}
                    </div>
                    {post.description && (
                      <div className="text-sm text-neutral-500 truncate">{post.description}</div>
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
