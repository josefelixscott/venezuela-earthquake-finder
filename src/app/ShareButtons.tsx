"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const SITE_URL = "https://terremotovenezuela2026.com";

export default function ShareButtons() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}${pathname}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(
    typeof document !== "undefined" ? document.title : "Ayuda Terremoto Venezuela"
  );

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-3">
      <span className="text-xs text-neutral-500 mr-1">Comparte:</span>
      <button
        onClick={copyLink}
        className="text-xs border rounded px-2.5 py-1.5 bg-white hover:bg-neutral-50"
      >
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs border rounded px-2.5 py-1.5 bg-white hover:bg-neutral-50"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
