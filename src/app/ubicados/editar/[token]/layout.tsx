import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar lista de personas ubicadas",
  robots: { index: false, follow: false },
};

export default function EditLocatedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
