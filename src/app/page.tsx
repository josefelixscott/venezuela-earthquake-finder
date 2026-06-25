import Link from "next/link";
import {
  IconUsers,
  IconUserSearch,
  IconCheck,
  IconHeartHandshake,
  IconArrowRight,
} from "@tabler/icons-react";
import { getEnv } from "@/lib/cloudflare";
import { getPostStats } from "@/lib/postStats";
import { getInitiativeCount } from "@/lib/initiativeStats";
import { formatRelativeTime } from "@/lib/relativeTime";
import { getStateFlag } from "@/lib/flags";
import AvatarInitials from "@/components/AvatarInitials";
import InitiativeIcon from "@/components/InitiativeIcon";
import StatusPill from "@/components/StatusPill";

export const dynamic = "force-dynamic";

interface LatestPost {
  id: string;
  name: string;
  state: string | null;
  status: string;
  photo_key: string | null;
  created_at: string;
}

interface LatestInitiative {
  id: string;
  title: string;
  category: string;
  state: string | null;
  photo_key: string | null;
  created_at: string;
}

async function getLatestPosts(): Promise<LatestPost[]> {
  const { DB } = await getEnv();
  const result = await DB.prepare(
    `SELECT id, name, state, status, photo_key, created_at FROM posts
     WHERE status = 'looking' ORDER BY created_at DESC LIMIT 3`
  ).all<LatestPost>();
  return result.results;
}

async function getLatestInitiatives(): Promise<LatestInitiative[]> {
  const { DB } = await getEnv();
  const result = await DB.prepare(
    `SELECT id, title, category, state, photo_key, created_at FROM initiatives
     ORDER BY created_at DESC LIMIT 3`
  ).all<LatestInitiative>();
  return result.results;
}

export default async function HubPage() {
  const [stats, initiativeCount, latestPosts, latestInitiatives] = await Promise.all([
    getPostStats(),
    getInitiativeCount(),
    getLatestPosts(),
    getLatestInitiatives(),
  ]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-blue-800 text-white rounded-xl p-5">
        <p className="text-xs font-medium text-blue-200 tracking-wide">
          AYUDA AFECTADOS TERREMOTO 2026 EN VENEZUELA 🇻🇪
        </p>
        <h1 className="text-2xl font-medium mt-2">
          Reconectando familias, organizando ayuda
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Una plataforma comunitaria, gratuita y en español.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-3 text-center">
          <IconUsers size={20} stroke={1.75} className="mx-auto text-neutral-500" />
          <div className="text-xl font-medium mt-1">{stats.total}</div>
          <div className="text-xs text-neutral-600 mt-0.5">Registradas</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <IconUserSearch size={20} stroke={1.75} className="mx-auto text-red-800" />
          <div className="text-xl font-medium mt-1 text-red-800">{stats.looking}</div>
          <div className="text-xs text-red-800 mt-0.5">Por localizar</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <IconCheck size={20} stroke={1.75} className="mx-auto text-green-800" />
          <div className="text-xl font-medium mt-1 text-green-800">{stats.found}</div>
          <div className="text-xs text-green-800 mt-0.5">Localizadas</div>
        </div>
      </div>

      <div className="bg-teal-50 rounded-lg p-3 flex items-center gap-3">
        <IconHeartHandshake size={22} stroke={1.75} className="text-teal-800 shrink-0" />
        <p className="text-sm text-teal-800">
          <span className="text-lg font-medium">{initiativeCount}</span> iniciativas de ayuda
          activas 🇻🇪
        </p>
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

      {latestPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Últimas personas publicadas</h2>
            <Link
              href="/personas"
              className="text-xs text-red-800 flex items-center gap-0.5"
            >
              Ver todas <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-center gap-2.5 rounded-lg p-2.5 bg-white hover:bg-neutral-50"
              >
                {post.photo_key ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/photos/${post.photo_key}`}
                    alt={post.name}
                    className="w-10 h-10 object-cover rounded-full shrink-0"
                  />
                ) : (
                  <AvatarInitials name={post.name} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{post.name}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {getStateFlag(post.state)} {post.state ? `${post.state} · ` : ""}
                    {formatRelativeTime(post.created_at)}
                  </p>
                </div>
                <StatusPill status="looking" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {latestInitiatives.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Últimas iniciativas de ayuda</h2>
            <Link
              href="/iniciativas"
              className="text-xs text-teal-800 flex items-center gap-0.5"
            >
              Ver todas <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {latestInitiatives.map((initiative) => (
              <Link
                key={initiative.id}
                href={`/iniciativas/${initiative.id}`}
                className="flex items-center gap-2.5 rounded-lg p-2.5 bg-white hover:bg-neutral-50"
              >
                {initiative.photo_key ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/photos/${initiative.photo_key}`}
                    alt={initiative.title}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <InitiativeIcon category={initiative.category} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{initiative.title}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {getStateFlag(initiative.state)} {initiative.state ? `${initiative.state} · ` : ""}
                    {formatRelativeTime(initiative.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href="/personas"
          className="flex-1 flex items-center justify-center gap-1.5 text-center bg-red-50 text-red-800 py-3 rounded-lg font-medium text-sm"
        >
          <IconUserSearch size={18} stroke={1.75} /> Listado de Personas
        </a>
        <a
          href="/iniciativas"
          className="flex-1 flex items-center justify-center gap-1.5 text-center bg-teal-800 text-white py-3 rounded-lg font-medium text-sm"
        >
          <IconHeartHandshake size={18} stroke={1.75} /> Ver cómo ayudar
        </a>
      </div>

      <div className="flex gap-2">
        <a
          href="/new"
          className="flex-1 text-center bg-red-800 text-white py-2.5 rounded-lg font-medium text-sm"
        >
          Busco a una persona
        </a>
        <a
          href="/iniciativas/nueva"
          className="flex-1 text-center bg-teal-50 text-teal-800 py-2.5 rounded-lg font-medium text-sm"
        >
          + Publicar iniciativa
        </a>
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
