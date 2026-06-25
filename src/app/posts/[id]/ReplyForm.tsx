"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      authorName: formData.get("authorName"),
      message: formData.get("message"),
      contactInfo: formData.get("contactInfo"),
      noteType: formData.get("noteType"),
      website: formData.get("website"),
    };

    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Algo salió mal");
      }
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t pt-4">
      <h3 className="font-medium text-sm">¿Tienes información? Responde aquí.</h3>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />
      <select name="noteType" defaultValue="information" className="w-full border rounded px-3 py-2 text-sm">
        <option value="information">Tengo información</option>
        <option value="is_this_person">Soy esta persona</option>
        <option value="volunteering">Quiero ayudar a buscar</option>
        <option value="believed_found">Creo que esta persona fue encontrada</option>
      </select>
      <input
        name="authorName"
        required
        placeholder="Tu nombre"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <textarea
        name="message"
        required
        rows={2}
        placeholder="¿Qué sabes?"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        name="contactInfo"
        placeholder="Tu información de contacto (opcional)"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-neutral-800 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Enviar respuesta"}
      </button>
    </form>
  );
}
