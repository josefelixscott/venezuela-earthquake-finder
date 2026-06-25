import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publica sobre alguien que buscas",
  description:
    "Publica sobre un familiar o persona desaparecida tras el terremoto en Venezuela. Tu contacto nunca se muestra públicamente.",
  alternates: { canonical: "/new" },
};

export default function NewPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
