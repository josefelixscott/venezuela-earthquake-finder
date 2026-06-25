"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowLeft, IconBuildingHospital } from "@tabler/icons-react";
import { VENEZUELA_STATES } from "@/lib/venezuelaStates";

export default function NewLocatedListPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/located", { method: "POST", body: formData });
      const data = (await res.json()) as { editToken?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      router.push(`/ubicados/editar/${data.editToken}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <a href="/ubicados" className="text-sm text-red-800 flex items-center gap-1">
        <IconArrowLeft size={14} /> Volver a personas ubicadas
      </a>

      <div>
        <h1 className="text-2xl font-medium">Publica una lista de personas ubicadas</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Útil para transcribir listas de hospitales, refugios u otros lugares. No afirmes el
          estado de salud de nadie — esta lista solo indica que la persona fue registrada en el
          lugar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-4">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] w-px h-px opacity-0"
          aria-hidden="true"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Lugar *</label>
          <input
            name="locationName"
            required
            placeholder="Ej: Hospital Universitario de Caracas"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select name="state" defaultValue="" className="w-full border rounded px-3 py-2">
            <option value="">Sin especificar</option>
            {VENEZUELA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nombres *</label>
          <textarea
            name="entries"
            required
            rows={10}
            placeholder={"Un nombre por línea. Edad o cédula opcional después de una coma:\nVilchez Brayan, 23 años\nManuel Gomez, 19814839\nPerez Francisca"}
            className="w-full border rounded px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Un nombre por línea. Si agregas un número de 5 o más cifras lo identificamos
            automáticamente como cédula; si no, lo tratamos como edad. Para incluir ambos, usa:
            Nombre, Edad, Cédula.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Contexto adicional sobre la lista (fuente, fecha, etc.)"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contacto del lugar (opcional)</label>
          <input
            name="contactInfo"
            placeholder="Teléfono o forma de contactar al lugar para verificar"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          <IconBuildingHospital size={18} stroke={1.75} />
          {submitting ? "Publicando..." : "Publicar lista"}
        </button>
      </form>
    </div>
  );
}
