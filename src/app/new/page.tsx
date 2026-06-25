"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

export default function NewPostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/posts", { method: "POST", body: formData });
      const data = (await res.json()) as { id?: string; editToken?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      router.push(`/edit/${data.editToken}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Publica sobre alguien que buscas</h1>
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
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input name="name" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Edad</label>
          <input name="age" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado *</label>
          <select name="state" required defaultValue="" className="w-full border rounded px-3 py-2">
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
          <label className="block text-sm font-medium mb-1">Última ubicación conocida *</label>
          <input
            name="lastKnownLocation"
            required
            placeholder="Ciudad, barrio, dirección..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Descripción física, qué ocurrió, con quién estaba..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tu información de contacto *</label>
          <input
            name="contactInfo"
            required
            placeholder="Número de teléfono, correo o WhatsApp"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Foto (opcional)</label>
          <input
            name="photo"
            type="file"
            accept="image/*"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-neutral-500 mt-1">
            La foto se muestra públicamente para ayudar a identificar a la persona. No incluyas
            otras personas o información sensible en la imagen.
          </p>
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
