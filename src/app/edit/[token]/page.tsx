"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface PostRow {
  id: string;
  name: string;
  age: string | null;
  last_known_location: string;
  description: string | null;
  contact_info: string;
  status: string;
  created_at: string;
}

export default function EditPostPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token;
  const justCreated = searchParams.get("created") === "1";

  const [post, setPost] = useState<PostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/by-token/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as { post: PostRow };
        setPost(data.post);
      })
      .finally(() => setLoading(false));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-md mx-auto space-y-6">
      {justCreated && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800">
          <p className="font-semibold mb-1">¡Publicación creada! Guarda este enlace.</p>
          <p>
            Esta página te permite editar la publicación o marcarla como{" "}
            <strong>encontrado/a</strong> más adelante. No podrás volver a esta página sin el
            enlace.
          </p>
          <button
            onClick={copyLink}
            className="mt-2 bg-yellow-200 px-3 py-1 rounded text-yellow-900 text-xs font-medium"
          >
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Editar publicación</h1>
        <a href={`/posts/${post.id}`} className="text-sm text-red-700 underline">
          Ver publicación pública
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
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
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">Cambios guardados.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-700 text-white py-2.5 rounded font-semibold disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
