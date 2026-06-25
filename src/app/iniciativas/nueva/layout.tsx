import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publica una iniciativa de ayuda",
  description:
    "Publica un centro de acopio, donación, refugio, transporte o iniciativa de voluntariado para ayudar tras el terremoto en Venezuela.",
  alternates: { canonical: "/iniciativas/nueva" },
};

export default function NewInitiativeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
