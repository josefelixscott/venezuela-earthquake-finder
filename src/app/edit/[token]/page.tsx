"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IconCheck, IconCopy, IconDeviceFloppy } from "@tabler/icons-react";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
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
  contact_info: string | null;
  note_type: string;
  created_at: string;
}

const NOTE_TYPE_LABELS: Record<string, string> = {
  information: "Tiene información",
  is_this_person: "Es esta persona",
  volunteering: "Quiere ayudar a buscar",
  believed_found: "Cree que fue encontrado/a",
};

export default function EditPostPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token;
  const justCreated = searchParams.get("created") === "1";

  const [post, setPost] = useState<PostRow | null>(null);
  const [replies, setReplies] = useState<ReplyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function load() {
    return fetch(`/api/posts/by-token/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as { post: PostRow; replies: ReplyRow[] };
        setPost(data.post);
        setReplies(data.replies);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!post) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      token,
      status: formData.get("status"),
      name: formData.get("name"),
      age: formData.get("age"),
      lastKnownLocation: formData.get("lastKnownLocation"),
      description: formData.get("description"),
      contactInfo: formData.get("contactInfo"),
      state: formData.get("state"),
    };

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      setSaved(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmStillLooking() {
    if (!post) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, status: "looking" }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Algo salió mal");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setConfirming(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !post) return;
    setUploadingPhoto(true);
    setPhotoError(null);

    const formData = new FormData();
    formData.append("token", token);
    formData.append("photo", file);

    try {
      const res = await fetch(`/api/posts/${post.id}/photo`, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      await load();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <p className="text-center text-neutral-500 py-12">Cargando...</p>;
  }

  if (notFound || !post) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-2">
        <p className="text-neutral-700">Este enlace de edición no es válido.</p>
        <button onClick={() => router.push("/")} className="text-red-700 underline">
          Volver al inicio
        </button>
      </div>
    );
  }

  const daysSinceConfirmed = Math.floor(
    (Date.now() - new Date(post.last_confirmed_at + "Z").getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      {justCreated && (
        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900">
          <p className="font-medium mb-1">¡Publicación creada! Guarda este enlace.</p>
          <p>
            Esta página te permite editar la publicación, ver respuestas con su contacto, o
            marcarla como <strong>encontrado/a</strong> más adelante. No podrás volver a esta
            página sin el enlace.
          </p>
          <button
            onClick={copyLink}
            className="mt-2 flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-lg text-amber-900 text-xs font-medium"
          >
            <IconCopy size={13} />
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-medium">Editar publicación</h1>
        <a href={`/posts/${post.id}`} className="text-sm text-red-800 underline">
          Ver publicación pública
        </a>
      </div>

      <div className="bg-white rounded-lg p-3 text-sm flex items-center justify-between gap-3">
        <span className="text-neutral-600">
          Confirmada hace {daysSinceConfirmed === 0 ? "menos de un día" : `${daysSinceConfirmed} días`}.
          Confirma regularmente para que otros sepan que la publicación sigue vigente.
        </span>
        <button
          onClick={handleConfirmStillLooking}
          disabled={confirming}
          className="flex items-center gap-1 bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap disabled:opacity-50"
        >
          <IconCheck size={13} />
          {confirming ? "..." : "Sigo buscando"}
        </button>
      </div>

      <div className="bg-white rounded-lg p-3">
        <label className="block text-sm font-medium mb-1">Foto</label>
        {post.photo_key && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${post.photo_key}`}
            alt={post.name}
            className="w-24 h-24 object-cover rounded-lg mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={uploadingPhoto}
          className="w-full text-sm"
        />
        {uploadingPhoto && <p className="text-xs text-neutral-500 mt-1">Subiendo...</p>}
        {photoError && <p className="text-red-600 text-sm mt-1">{photoError}</p>}
        <p className="text-xs text-neutral-500 mt-1">
          Se muestra públicamente para ayudar a identificar a la persona.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estado de la búsqueda</label>
          <select
            name="status"
            defaultValue={post.status}
            className="w-full border rounded px-3 py-2"
          >
            <option value="looking">Buscando</option>
            <option value="found">Encontrado/a</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado (Venezuela) *</label>
          <select
            name="state"
            required
            defaultValue={post.state ?? ""}
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled>
              Selecciona un estado
            </option>
            {VENEZUELA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            name="name"
            required
            defaultValue={post.name}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Edad</label>
          <input
            name="age"
            defaultValue={post.age ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Última ubicación conocida *</label>
          <input
            name="lastKnownLocation"
            required
            defaultValue={post.last_known_location}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={post.description ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tu información de contacto *</label>
          <input
            name="contactInfo"
            required
            defaultValue={post.contact_info}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Nunca se muestra públicamente. Solo tú la ves aquí.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">Cambios guardados.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 bg-red-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          <IconDeviceFloppy size={18} stroke={1.75} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <div>
        <h2 className="font-medium mb-2">Respuestas ({replies.length})</h2>
        {replies.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aún no hay respuestas.</p>
        ) : (
          <ul className="space-y-3">
            {replies.map((reply) => (
              <li key={reply.id} className="rounded-lg p-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{reply.author_name}</span>
                  {NOTE_TYPE_LABELS[reply.note_type] && (
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                      {NOTE_TYPE_LABELS[reply.note_type]}
                    </span>
                  )}
                </div>
                <p className="text-neutral-700 text-sm">{reply.message}</p>
                {reply.contact_info && (
                  <p className="text-neutral-500 text-xs mt-1">Contacto: {reply.contact_info}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
