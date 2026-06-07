import type { Metadata } from 'next'
import { AboutPreview } from '@/components/home/AboutPreview'
import { HeroSection } from '@/components/home/HeroSection'
import { HomeDailyPhrase } from '@/components/home/HomeDailyPhrase'
import { HomeExercisesPreview } from '@/components/home/HomeExercisesPreview'
import { HomeMusicPreview } from '@/components/home/HomeMusicPreview'
import { HomeProductsPreview } from '@/components/home/HomeProductsPreview'

export const metadata: Metadata = {
  title: 'Amará | Bienestar consciente',
  description:
    'Frase del día, kit de bienestar, melodías relajantes y ejercicios guiados para pausas más conscientes.',
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <HomeDailyPhrase />
      <HomeProductsPreview />
      <HomeMusicPreview />
      <HomeExercisesPreview />
      <AboutPreview />
    </div>
  )
}
