import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publica una lista de personas ubicadas",
  description:
    "Transcribe una lista de personas registradas en un hospital, refugio u otro lugar tras el terremoto en Venezuela.",
  alternates: { canonical: "/ubicados/nueva" },
};

export default function NewLocatedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
