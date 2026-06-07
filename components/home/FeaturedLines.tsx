import { SectionHeading } from '@/components/common/SectionHeading'
import { getLandingContent } from '@/lib/landing-content'

export function FeaturedLines() {
  const { productLines } = getLandingContent()

  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Lineas de producto"
          title="Una estructura simple para mostrar tus colecciones con claridad."
          description="Tomamos la idea de tus lineas, productos y beneficios para construir una pagina intuitiva desde el inicio."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {productLines.map((line) => (
            <article
              key={line.slug}
              className="rounded-[2rem] border border-earth-200/80 bg-white/80 p-8 shadow-card"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sage-700">
                {line.icon}
              </p>
              <h3 className="mt-5 font-display text-3xl text-earth-900">{line.name}</h3>
              <p className="mt-4 text-sm leading-7 text-earth-600">{line.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
