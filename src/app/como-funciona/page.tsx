export const metadata = {
  title: "Cómo funciona — Buscando Familia",
};

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Cómo funciona este sitio</h1>
        <p className="text-neutral-600 mt-1">
          Una guía rápida para publicar, buscar y responder de forma segura.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Si buscas a alguien</h2>
        <p className="text-neutral-700 text-sm">
          Toca <strong>“+ Publicar a alguien que buscas”</strong> y completa el nombre, edad
          (si la sabes), última ubicación conocida, una descripción y tu información de
          contacto. Tu contacto <strong>nunca se muestra públicamente</strong> — solo tú lo ves.
        </p>
        <p className="text-neutral-700 text-sm">
          Al publicar, recibirás un <strong>enlace privado de edición</strong>. Guárdalo
          (cópialo a tus notas, WhatsApp o correo) — es la única forma de editar tu publicación,
          ver las respuestas con su contacto, o marcarla como <strong>encontrado/a</strong> más
          adelante. Si pierdes ese enlace, no podrás recuperarlo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Si tienes información sobre alguien</h2>
        <p className="text-neutral-700 text-sm">
          Busca por nombre o ubicación en la página principal. Si encuentras a la persona,
          abre la publicación y usa el formulario de <strong>“Responder”</strong> al final.
          Indica qué tipo de información tienes (información, eres esa persona, quieres ayudar
          a buscar, o crees que ya fue encontrada).
        </p>
        <p className="text-neutral-700 text-sm">
          Tu mensaje y tu contacto llegan solo a quien publicó — nunca se muestran públicamente.
          Esto protege a ambas partes de estafas o mal uso de los datos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Confirma que tu publicación sigue vigente</h2>
        <p className="text-neutral-700 text-sm">
          Las publicaciones sin confirmar durante 7 días muestran una etiqueta de{" "}
          <strong>“Sin confirmar”</strong>, y después de 30 días dejan de aparecer en la lista
          principal (aunque el enlace directo sigue funcionando). Usa tu enlace privado de
          edición para tocar <strong>“Sigo buscando”</strong> y mantener la publicación visible
          y confiable para otros.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Seguridad y privacidad</h2>
        <ul className="list-disc list-inside text-neutral-700 text-sm space-y-1">
          <li>No se muestran números de teléfono ni direcciones exactas públicamente.</li>
          <li>Toda comunicación pasa por el formulario de respuesta del sitio.</li>
          <li>
            Verifica cuidadosamente cualquier contacto antes de compartir información sensible o
            dinero — lamentablemente, este tipo de sitios puede atraer estafadores.
          </li>
          <li>
            Organizaciones oficiales (Cruz Roja, equipos de búsqueda y rescate) pueden solicitar
            acceso a los datos para sus propios sistemas.
          </li>
        </ul>
      </section>

      <div className="text-center space-x-4">
        <a href="/como-ayudar" className="text-red-700 underline text-sm">
          ¿Quieres ayudar sin estar buscando a alguien?
        </a>
      </div>

      <div className="text-center">
        <a href="/" className="text-red-700 underline text-sm">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
