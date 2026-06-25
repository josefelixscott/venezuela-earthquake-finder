import { notFound } from "next/navigation";
import { getEnv } from "@/lib/cloudflare";
import ReplyForm from "./ReplyForm";

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

interface ReplyRow {
  id: string;
  author_name: string;
  message: string;
  contact_info: string | null;
  created_at: string;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { DB } = await getEnv();

  const post = await DB.prepare(`SELECT * FROM posts WHERE id = ?1`).bind(id).first<PostRow>();
  if (!post) {
    notFound();
  }

  const repliesResult = await DB.prepare(
    `SELECT * FROM replies WHERE post_id = ?1 ORDER BY created_at ASC`
  )
    .bind(id)
    .all<ReplyRow>();
  const replies = repliesResult.results;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="border rounded p-4 bg-white">
        {post.photo_key && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${post.photo_key}`}
            alt={post.name}
            className="w-full max-h-80 object-cover rounded mb-3"
          />
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{post.name}</h1>
          {post.age && <span className="text-neutral-500">{post.age}</span>}
          {post.status === "found" && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              Found
            </span>
          )}
        </div>
        <p className="text-neutral-700 mt-1">
          <span className="font-medium">Last known location:</span> {post.last_known_location}
        </p>
        {post.description && <p className="text-neutral-700 mt-1">{post.description}</p>}
        <p className="text-neutral-700 mt-1">
          <span className="font-medium">Contact:</span> {post.contact_info}
        </p>
        <p className="text-xs text-neutral-400 mt-2">
          Posted {new Date(post.created_at + "Z").toLocaleString()}
        </p>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Replies ({replies.length})</h2>
        {replies.length === 0 ? (
          <p className="text-neutral-500 text-sm mb-4">No replies yet.</p>
        ) : (
          <ul className="space-y-3 mb-4">
            {replies.map((reply) => (
              <li key={reply.id} className="border rounded p-3 bg-white">
                <div className="font-medium">{reply.author_name}</div>
                <p className="text-neutral-700 text-sm">{reply.message}</p>
                {reply.contact_info && (
                  <p className="text-neutral-500 text-xs mt-1">Contact: {reply.contact_info}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <ReplyForm postId={post.id} />
      </div>
    </div>
  );
}
