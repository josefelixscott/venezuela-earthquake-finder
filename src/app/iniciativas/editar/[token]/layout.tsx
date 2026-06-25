import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar iniciativa",
  robots: { index: false, follow: false },
};

export default function EditInitiativeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
