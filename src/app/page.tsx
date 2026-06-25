import { getPostStats } from "@/lib/postStats";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const stats = await getPostStats();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Ayuda Afectados Terremoto 2026 en Venezuela
        </p>
        <h1 className="text-2xl font-bold mt-1">¿Qué necesitas hacer?</h1>
        <p className="text-neutral-600 mt-1">
          Elige una opción para buscar, publicar, o encontrar formas de ayudar.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-neutral-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-neutral-800">{stats.total}</div>
          <div className="text-xs text-neutral-600 mt-1">Personas registradas</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{stats.looking}</div>
          <div className="text-xs text-red-700 mt-1">Por localizar</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{stats.found}</div>
          <div className="text-xs text-green-700 mt-1">Localizadas</div>
        </div>
      </div>

      <form action="/personas" className="flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="Buscar por nombre, lugar o iniciativa..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-neutral-800 text-white px-4 py-2 rounded">
          Buscar
        </button>
      </form>

      <div className="border rounded-lg bg-white p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-700 font-bold">P</span>
          </div>
          <h2 className="text-lg font-semibold">Personas desaparecidas</h2>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Busca a alguien o publica sobre un familiar que no encuentras.
        </p>
        <div className="flex gap-2">
          <a
            href="/personas"
            className="flex-1 text-center bg-red-50 text-red-700 border border-red-200 py-2.5 rounded font-medium"
          >
            Ver publicaciones
          </a>
          <a
            href="/new"
            className="flex-1 text-center bg-red-700 text-white py-2.5 rounded font-medium"
          >
            + Publicar
          </a>
        </div>
      </div>

      <div className="border rounded-lg bg-white p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded bg-teal-100 flex items-center justify-center shrink-0">
            <span className="text-teal-700 font-bold">I</span>
          </div>
          <h2 className="text-lg font-semibold">Iniciativas de ayuda</h2>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Centros de acopio, donaciones, refugios, transporte y voluntariado.
        </p>
        <div className="flex gap-2">
          <a
            href="/iniciativas"
            className="flex-1 text-center bg-teal-50 text-teal-700 border border-teal-200 py-2.5 rounded font-medium"
          >
            Ver iniciativas
          </a>
          <a
            href="/iniciativas/nueva"
            className="flex-1 text-center bg-teal-700 text-white py-2.5 rounded font-medium"
          >
            + Publicar
          </a>
        </div>
      </div>

      <div className="flex justify-center gap-4 text-sm">
        <a href="/como-funciona" className="text-neutral-500 underline">
          Cómo funciona
        </a>
        <a href="/como-ayudar" className="text-neutral-500 underline">
          Recomendaciones
        </a>
      </div>
    </div>
  );
}
