import Link from "next/link";
import { getEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  status: string;
  created_at: string;
  last_confirmed_at: string;
}

const STALE_AFTER_DAYS = 7;
const HIDE_AFTER_DAYS = 30;

async function getPosts(q?: string): Promise<PostRow[]> {
  const { DB } = await getEnv();
  // contact_info is intentionally excluded from every public listing query.
  // Posts unconfirmed for HIDE_AFTER_DAYS drop out of the default list (but the
  // direct link still works) so volunteers stop spending time on stale leads.
  const columns = "id, name, age, last_known_location, description, status, created_at, last_confirmed_at";
  if (q) {
    const like = `%${q}%`;
    const result = await DB.prepare(
      `SELECT ${columns} FROM posts
       WHERE (name LIKE ?1 OR last_known_location LIKE ?1 OR description LIKE ?1)
         AND (status = 'found' OR last_confirmed_at >= datetime('now', '-${HIDE_AFTER_DAYS} days'))
       ORDER BY created_at DESC LIMIT 200`
    )
      .bind(like)
      .all<PostRow>();
    return result.results;
  }
  const result = await DB.prepare(
    `SELECT ${columns} FROM posts
     WHERE status = 'found' OR last_confirmed_at >= datetime('now', '-${HIDE_AFTER_DAYS} days')
     ORDER BY created_at DESC LIMIT 200`
  ).all<PostRow>();
  return result.results;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const posts = await getPosts(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buscando familia tras el terremoto</h1>
        <p className="text-neutral-600 mt-1">
          Publica sobre un familiar desaparecido, o busca para ver si alguien ha publicado sobre
          alguien que conoces.{" "}
          <a href="/como-funciona" className="text-red-700 underline">
            Ver cómo funciona
          </a>
          .
        </p>
      </div>

      <form className="flex gap-2">
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

      {posts.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {q
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
                    <div className="text-sm text-neutral-600">{post.last_known_location}</div>
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
