import type { Metadata } from 'next'
import { NosotrosPageContent } from '@/components/nosotros/NosotrosPageContent'

export const metadata: Metadata = {
  title: 'Nosotros | Amará',
  description:
    'Conoce la misión y visión de AMARÁ: bienestar emocional, autocuidado y soluciones innovadoras para la calma y la relajación.',
}

export default function NosotrosPage() {
  return <NosotrosPageContent />
}
