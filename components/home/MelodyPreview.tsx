import { MelodyCard } from '@/components/cards/MelodyCard'
import { SectionHeading } from '@/components/common/SectionHeading'
import { getLandingContent } from '@/lib/landing-content'

export function MelodyPreview() {
  const { melodies } = getLandingContent()

  return (
    <section className="bg-sand-100/70 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Melodias"
          title="Audios suaves para acompanar cada ritual."
          description="La seccion esta pensada para que despues conectemos tus audios reales desde Supabase."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {melodies.slice(0, 3).map((melody) => (
            <MelodyCard key={melody.title} melody={melody} />
          ))}
        </div>
      </div>
    </section>
  )
}
