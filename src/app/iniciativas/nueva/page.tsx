"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORY_OPTIONS } from "@/lib/initiativeCategories";

export default function NewInitiativePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/initiatives", { method: "POST", body: formData });
      const data = (await res.json()) as { id?: string; editToken?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      router.push(`/iniciativas/editar/${data.editToken}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Publica una iniciativa de ayuda</h1>
      <p className="text-neutral-600 text-sm mb-4">
        A diferencia de las publicaciones de personas buscadas, aquí tu información de contacto
        sí se muestra públicamente, porque el objetivo es que te encuentren fácilmente.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] w-px h-px opacity-0"
          aria-hidden="true"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            name="title"
            required
            placeholder="Ej: Centro de acopio en Ciudad de México"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select name="category" defaultValue="centro_de_acopio" className="w-full border rounded px-3 py-2">
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
            placeholder="Ciudad, dirección..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Qué necesitan, horarios, cómo participar..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Información de contacto *</label>
          <input
            name="contactInfo"
            required
            placeholder="Teléfono, correo, redes sociales..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Enlace (opcional)</label>
          <input
            name="link"
            type="text"
            placeholder="GoFundMe, recaudación, página o red social..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-700 text-white py-2.5 rounded font-semibold disabled:opacity-50"
        >
          {submitting ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
