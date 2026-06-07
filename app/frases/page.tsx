import type { Metadata } from 'next'
import { FrasesDelDia } from '@/components/frases/FrasesDelDia'

export const metadata: Metadata = {
  title: 'Frases para tu día | Amará',
  description:
    'Encuentra la palabra precisa que tu alma necesita hoy. Un refugio de sabiduría y calma.',
}

export default function FrasesPage() {
  return <FrasesDelDia />
}
