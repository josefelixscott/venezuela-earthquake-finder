"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconCopy,
  IconDeviceFloppy,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

interface LocatedPersonRow {
  id: string;
  name: string;
  age: string | null;
  location_name: string;
  state: string | null;
  notes: string | null;
  contact_info: string | null;
  created_at: string;
}

export default function EditLocatedListPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token;
  const justCreated = searchParams.get("created") === "1";

  const [people, setPeople] = useState<LocatedPersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function load() {
    return fetch(`/api/located/by-token/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as { people: LocatedPersonRow[] };
        setPeople(data.people);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const body = {
      locationName: formData.get("locationName"),
      state: formData.get("state"),
      notes: formData.get("notes"),
      contactInfo: formData.get("contactInfo"),
    };

    try {
      const res = await fetch(`/api/located/by-token/${token}`, {
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

  async function handleAddEntries(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const entries = formData.get("newEntries") as string;

    try {
      const res = await fetch(`/api/located/by-token/${token}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      (e.target as HTMLFormElement).reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteEntry(entryId: string) {
    setDeletingEntry(entryId);
    setError(null);
    try {
      const res = await fetch(`/api/located/by-token/${token}/entries/${entryId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Algo salió mal");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setDeletingEntry(null);
    }
  }

  async function handleDeleteBatch() {
    if (!window.confirm("¿Eliminar toda la lista? Esta acción no se puede deshacer.")) return;
    setDeletingBatch(true);
    setError(null);
    try {
      const res = await fetch(`/api/located/by-token/${token}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Algo salió mal");
      }
      router.push("/ubicados");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setDeletingBatch(false);
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

  if (notFound || people.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-2">
        <p className="text-neutral-700">Este enlace de edición no es válido.</p>
        <button onClick={() => router.push("/ubicados")} className="text-red-800 underline">
          Ver personas ubicadas
        </button>
      </div>
    );
  }

  const first = people[0];

  return (
    <div className="max-w-md mx-auto space-y-6">
      {justCreated && (
        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900">
          <p className="font-medium mb-1">¡Lista publicada! Guarda este enlace.</p>
          <p>
            Esta página te permite editar el lugar, agregar más nombres, eliminar nombres
            individuales o eliminar toda la lista más adelante.
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
        <h1 className="text-2xl font-medium">Editar lista de personas ubicadas</h1>
        <a href="/ubicados" className="text-sm text-red-800 underline">
          Ver personas ubicadas
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Lugar *</label>
          <input
            name="locationName"
            required
            defaultValue={first.location_name}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="state"
            defaultValue={first.state ?? ""}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Sin especificar</option>
            {VENEZUELA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={first.notes ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contacto del lugar (opcional)</label>
          <input
            name="contactInfo"
            defaultValue={first.contact_info ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">Cambios guardados.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          <IconDeviceFloppy size={18} stroke={1.75} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <div>
        <h2 className="font-medium mb-2">Nombres ({people.length})</h2>
        <ul className="space-y-2 mb-4">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-2 bg-white rounded-lg p-3"
            >
              <div>
                <span className="font-medium">{person.name}</span>
                {person.age && <span className="text-sm text-neutral-500 ml-2">{person.age}</span>}
              </div>
              <button
                onClick={() => handleDeleteEntry(person.id)}
                disabled={deletingEntry === person.id}
                className="text-red-800 disabled:opacity-50"
                aria-label="Eliminar"
              >
                <IconTrash size={16} />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddEntries} className="space-y-2 bg-white rounded-lg p-4">
          <label className="block text-sm font-medium">Agregar más nombres</label>
          <textarea
            name="newEntries"
            required
            rows={4}
            placeholder={"Un nombre por línea, edad opcional después de una coma"}
            className="w-full border rounded px-3 py-2 text-sm font-mono"
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            <IconPlus size={16} />
            {adding ? "Agregando..." : "Agregar"}
          </button>
        </form>
      </div>

      <button
        onClick={handleDeleteBatch}
        disabled={deletingBatch}
        className="w-full flex items-center justify-center gap-1.5 bg-red-50 text-red-800 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        <IconTrash size={16} />
        {deletingBatch ? "Eliminando..." : "Eliminar toda la lista"}
      </button>
    </div>
  );
}
