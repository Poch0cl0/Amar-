import Link from 'next/link'

export function ContactCta() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2.75rem] border border-earth-200/80 bg-white/90 px-8 py-14 shadow-soft md:px-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-700">
              Contacto
            </p>
            <h2 className="mt-4 font-display text-4xl text-earth-950 md:text-5xl">
              Llevemos Amara a su primera version publica.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-earth-600">
              Ya quedaron listas las secciones clave, el boton de frase del dia y el punto de
              entrada del mini chat para seguir evolucionando.
            </p>
          </div>

          <Link
            href="/contacto"
            className="inline-flex rounded-full bg-sage-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-700"
          >
            Ir a contacto
          </Link>
        </div>
      </div>
    </section>
  )
}
