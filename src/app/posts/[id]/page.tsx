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
  state: string | null;
  status: string;
  photo_key: string | null;
  created_at: string;
  last_confirmed_at: string;
}

interface ReplyRow {
  id: string;
  author_name: string;
  message: string;
  note_type: string;
  created_at: string;
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  information: "Tiene información",
  is_this_person: "Es esta persona",
  volunteering: "Quiere ayudar a buscar",
  believed_found: "Cree que fue encontrado/a",
};

const STALE_AFTER_DAYS = 7;

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { DB } = await getEnv();

  // contact_info is intentionally excluded: contact only happens through the reply
  // relay below, never by exposing a phone number/address directly on a public page.
  const post = await DB.prepare(
    `SELECT id, name, age, last_known_location, description, state, status, photo_key, created_at, last_confirmed_at
     FROM posts WHERE id = ?1`
  )
    .bind(id)
    .first<PostRow>();
  if (!post) {
    notFound();
  }

  const repliesResult = await DB.prepare(
    `SELECT id, author_name, message, note_type, created_at FROM replies WHERE post_id = ?1 ORDER BY created_at ASC`
  )
    .bind(id)
    .all<ReplyRow>();
  const replies = repliesResult.results;

  const daysSinceConfirmed = Math.floor(
    (Date.now() - new Date(post.last_confirmed_at + "Z").getTime()) / (1000 * 60 * 60 * 24)
  );
  const isStale = post.status === "looking" && daysSinceConfirmed >= STALE_AFTER_DAYS;

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
              Encontrado
            </span>
          )}
        </div>
        {post.state && (
          <p className="text-neutral-700 mt-1">
            <span className="font-medium">Estado:</span> {post.state}
          </p>
        )}
        <p className="text-neutral-700 mt-1">
          <span className="font-medium">Última ubicación conocida:</span>{" "}
          {post.last_known_location}
        </p>
        {post.description && <p className="text-neutral-700 mt-1">{post.description}</p>}
        <p className="text-neutral-700 mt-1 text-sm bg-neutral-50 border rounded p-2">
          Por seguridad, no mostramos el contacto directo de quien publicó. Usa el formulario de
          respuesta abajo para comunicarte — la persona que publicó verá tu mensaje y tu
          contacto.
        </p>
        <p className="text-xs text-neutral-400 mt-2">
          Publicado {new Date(post.created_at + "Z").toLocaleString("es-VE")}
        </p>
        {isStale && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
            Esta publicación no se ha confirmado en {daysSinceConfirmed} días. Es posible que la
            información esté desactualizada.
          </p>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Respuestas ({replies.length})</h2>
        {replies.length === 0 ? (
          <p className="text-neutral-500 text-sm mb-4">Aún no hay respuestas.</p>
        ) : (
          <ul className="space-y-3 mb-4">
            {replies.map((reply) => (
              <li key={reply.id} className="border rounded p-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{reply.author_name}</span>
                  {NOTE_TYPE_LABELS[reply.note_type] && (
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                      {NOTE_TYPE_LABELS[reply.note_type]}
                    </span>
                  )}
                </div>
                <p className="text-neutral-700 text-sm">{reply.message}</p>
              </li>
            ))}
          </ul>
        )}

        <ReplyForm postId={post.id} />
      </div>
    </div>
  );
}
