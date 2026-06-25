"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_OPTIONS } from "@/lib/initiativeCategories";

interface InitiativeRow {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string | null;
  contact_info: string;
  link: string | null;
  created_at: string;
}

export default function EditInitiativePage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token;
  const justCreated = searchParams.get("created") === "1";

  const [initiative, setInitiative] = useState<InitiativeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/initiatives/by-token/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as { initiative: InitiativeRow };
        setInitiative(data.initiative);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!initiative) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      token,
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      description: formData.get("description"),
      contactInfo: formData.get("contactInfo"),
      link: formData.get("link"),
    };

    try {
      const res = await fetch(`/api/initiatives/${initiative.id}`, {
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

  async function handleDelete() {
    if (!initiative) return;
    if (!window.confirm("¿Eliminar esta iniciativa? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}?token=${token}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Algo salió mal");
      }
      router.push("/iniciativas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setDeleting(false);
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

  if (notFound || !initiative) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-2">
        <p className="text-neutral-700">Este enlace de edición no es válido.</p>
        <button onClick={() => router.push("/iniciativas")} className="text-red-700 underline">
          Ver iniciativas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {justCreated && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800">
          <p className="font-semibold mb-1">¡Iniciativa publicada! Guarda este enlace.</p>
          <p>
            Esta página te permite editar o eliminar tu iniciativa más adelante. No podrás
            volver a esta página sin el enlace.
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
        <h1 className="text-2xl font-bold">Editar iniciativa</h1>
        <a href={`/iniciativas/${initiative.id}`} className="text-sm text-red-700 underline">
          Ver iniciativa pública
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            name="title"
            required
            defaultValue={initiative.title}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            name="category"
            defaultValue={initiative.category}
            className="w-full border rounded px-3 py-2"
          >
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ubicación *</label>
          <input
            name="location"
            required
            defaultValue={initiative.location}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initiative.description ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Información de contacto *</label>
          <input
            name="contactInfo"
            required
            defaultValue={initiative.contact_info}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Enlace (opcional)</label>
          <input
            name="link"
            type="text"
            defaultValue={initiative.link ?? ""}
            placeholder="GoFundMe, recaudación, página o red social..."
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

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full border border-red-300 text-red-700 py-2 rounded text-sm disabled:opacity-50"
      >
        {deleting ? "Eliminando..." : "Eliminar iniciativa"}
      </button>
    </div>
  );
}
