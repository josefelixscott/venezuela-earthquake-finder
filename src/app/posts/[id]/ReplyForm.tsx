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
    };

    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t pt-4">
      <h3 className="font-medium text-sm">Have information? Reply here.</h3>
      <input
        name="authorName"
        required
        placeholder="Your name"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <textarea
        name="message"
        required
        rows={2}
        placeholder="What do you know?"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        name="contactInfo"
        placeholder="Your contact info (optional)"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-neutral-800 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send reply"}
      </button>
    </form>
  );
}
