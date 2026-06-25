import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Página para ayudar a encontrar personas desaparecidas por el terremoto de Junio 24 en Venezuela";

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Un espacio para ayudar a reconectar a familias separadas por el terremoto en Venezuela.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="bg-red-700 text-white px-4 py-3 shadow">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <a href="/" className="font-bold leading-snug">
              {SITE_NAME}
            </a>
            <div className="flex items-center gap-2 shrink-0">
              <a href="/como-funciona" className="text-sm underline whitespace-nowrap">
                Cómo funciona
              </a>
              <a href="/como-ayudar" className="text-sm underline whitespace-nowrap">
                Cómo ayudar
              </a>
              <a
                href="/new"
                className="bg-white text-red-700 px-3 py-1.5 rounded font-semibold text-sm whitespace-nowrap"
              >
                + Publicar a alguien que buscas
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-neutral-500 py-4">
          Espacio comunitario. Verifica cuidadosamente cualquier contacto antes de compartir
          información sensible.
        </footer>
      </body>
    </html>
  );
}
