export const metadata = {
  title: "Recomendaciones — Buscando Familia",
};

export default function ComoAyudarPage() {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Recomendaciones</h1>
        <p className="text-neutral-600 mt-1">
          No necesitas estar buscando a alguien para ayudar. Esto es lo más útil que puedes
          hacer.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">1. Comparte el sitio</h2>
        <p className="text-neutral-700 text-sm">
          Este sitio solo funciona si más personas lo conocen. Comparte{" "}
          <strong>terremotovenezuela2026.com</strong> en grupos de WhatsApp, Telegram, redes
          sociales y con organizaciones locales. Cuantas más personas busquen y publiquen, más
          posibilidades hay de reconectar familias.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. Revisa las publicaciones</h2>
        <p className="text-neutral-700 text-sm">
          Busca por nombre o ubicación. Si reconoces a alguien o tienes información — aunque sea
          parcial — usa el formulario de <strong>“Responder”</strong> en esa publicación.
          Cualquier detalle puede ayudar: dónde se le vio, en qué estado se encuentra, con quién
          está.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. Ofrécete como voluntario</h2>
        <p className="text-neutral-700 text-sm">
          Si puedes ayudar a buscar activamente en alguna zona, responde a una publicación
          eligiendo la opción <strong>“Quiero ayudar a buscar”</strong>. La persona que publicó
          verá tu mensaje y podrá coordinar contigo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4. Verifica antes de compartir</h2>
        <p className="text-neutral-700 text-sm">
          No compartas información sin confirmar como si fuera un hecho — puede generar falsas
          esperanzas o pánico innecesario. Si no estás seguro, dilo claramente al responder
          (“creo que…”, “no estoy seguro, pero…”).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5. Cuidado con las estafas</h2>
        <p className="text-neutral-700 text-sm">
          Lamentablemente, las crisis atraen a personas que se aprovechan del dolor de otros.
          Nunca envíes dinero a alguien que contactaste por este sitio, y desconfía de cualquiera
          que pida pagos a cambio de información.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">6. Apoya a organizaciones oficiales</h2>
        <p className="text-neutral-700 text-sm">
          Este sitio es un esfuerzo comunitario y no sustituye a los equipos oficiales de
          búsqueda y rescate. Si puedes, apoya y colabora con la Cruz Roja Venezolana,
          Protección Civil, y otros organismos oficiales que coordinan la respuesta a la
          emergencia.
        </p>
      </section>

      <div className="text-center">
        <a href="/iniciativas" className="text-red-700 underline text-sm">
          Ver iniciativas de ayuda (centros de acopio, donaciones, refugios)
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
