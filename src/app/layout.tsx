import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ShareButtons from "./ShareButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ayuda Afectados Terremoto 2026 en Venezuela",
  description:
    "Un espacio para encontrar personas desaparecidas, publicar y descubrir iniciativas de ayuda tras el terremoto en Venezuela.",
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
        <header className="bg-blue-700 text-white px-4 py-3 shadow">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
            <a href="/" className="font-bold text-lg">
              Ayuda Terremoto Venezuela
            </a>
            <div className="flex items-center gap-3 shrink-0 text-sm">
              <a href="/como-funciona" className="underline whitespace-nowrap">
                Cómo funciona
              </a>
              <a href="/como-ayudar" className="underline whitespace-nowrap">
                Recomendaciones
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">{children}</main>
        <div className="border-t bg-white">
          <ShareButtons />
        </div>
        <footer className="text-center text-xs text-neutral-500 py-4">
          Espacio comunitario. Verifica cuidadosamente cualquier contacto antes de compartir
          información sensible.
        </footer>
      </body>
    </html>
  );
}
