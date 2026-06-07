import type { Metadata } from 'next'
import { SectionHeading } from '@/components/common/SectionHeading'

export const metadata: Metadata = {
  title: 'Nosotros | Amara',
  description: 'Conoce la esencia de Amara y la intencion detras de cada coleccion de bienestar.',
}

export default function NosotrosPage() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Pagina Nosotros"
            title="Amara nace para convertir pequenos momentos en refugios cotidianos."
            description="Esta pagina cuenta la historia de la marca con una narrativa cercana, suave y muy alineada con una landing emocional."
          />

          <div className="space-y-5 text-base leading-8 text-earth-600">
            <p>
              La idea de Amara es acompanar a personas que viven con tension, cansancio mental o
              necesidad de una pausa mas amable.
            </p>
            <p>
              En esta primera etapa dejamos una presencia digital limpia, moderna y lista para que
              luego sumemos productos reales, audios y automatizaciones.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[2.5rem] bg-white p-3 shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"
              alt="Historia de Amara"
              className="h-[22rem] w-full rounded-[2rem] object-cover"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-earth-200 bg-white p-6 shadow-card">
              <p className="font-display text-2xl text-earth-900">Mision</p>
              <p className="mt-3 text-sm leading-7 text-earth-600">
                Crear experiencias sensibles que inviten a respirar, bajar el ritmo y volver al
                cuerpo.
              </p>
            </div>
            <div className="rounded-[2rem] border border-earth-200 bg-white p-6 shadow-card">
              <p className="font-display text-2xl text-earth-900">Vision</p>
              <p className="mt-3 text-sm leading-7 text-earth-600">
                Evolucionar hacia una marca cercana que combine objetos, sonido y acompanamiento
                digital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
