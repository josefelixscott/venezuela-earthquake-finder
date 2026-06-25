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

export const metadata: Metadata = {
  title: "Buscando Familia — Venezuela Earthquake",
  description:
    "A board to help reconnect families separated by the Venezuela earthquake.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="bg-red-700 text-white px-4 py-3 shadow">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <a href="/" className="font-bold text-lg">
              Buscando Familia
            </a>
            <a
              href="/new"
              className="bg-white text-red-700 px-3 py-1.5 rounded font-semibold text-sm"
            >
              + Post someone you're looking for
            </a>
          </div>
        </header>
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-neutral-500 py-4">
          Community-run board. Verify any contact carefully before sharing sensitive information.
        </footer>
      </body>
    </html>
  );
}
