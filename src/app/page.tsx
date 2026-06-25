import Link from "next/link";
import { getEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
  photo_key: string | null;
  status: string;
  created_at: string;
}

async function getPosts(q?: string): Promise<PostRow[]> {
  const { DB } = await getEnv();
  if (q) {
    const like = `%${q}%`;
    const result = await DB.prepare(
      `SELECT * FROM posts WHERE name LIKE ?1 OR last_known_location LIKE ?1 OR description LIKE ?1 ORDER BY created_at DESC LIMIT 200`
    )
      .bind(like)
      .all<PostRow>();
    return result.results;
  }
  const result = await DB.prepare(`SELECT * FROM posts ORDER BY created_at DESC LIMIT 200`).all<PostRow>();
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
        <h1 className="text-2xl font-bold">Looking for family after the earthquake</h1>
        <p className="text-neutral-600 mt-1">
          Post about a missing family member, or search to see if someone has posted about
          someone you know.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or location..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-neutral-800 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {posts.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {q ? "No matching posts found." : "No posts yet. Be the first to post."}
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="flex gap-3 border rounded p-3 bg-white hover:bg-neutral-50"
              >
                {post.photo_key ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/photos/${post.photo_key}`}
                    alt={post.name}
                    className="w-16 h-16 object-cover rounded shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-neutral-200 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.name}</span>
                    {post.age && <span className="text-sm text-neutral-500">{post.age}</span>}
                    {post.status === "found" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Found
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
          ))}
        </ul>
      )}
    </div>
  );
}
