import type { Metadata } from 'next'
import { MelodiasPageContent } from '@/components/melodias/MelodiasPageContent'

export const metadata: Metadata = {
  title: 'Música | Amará',
  description:
    'Sumérgete en una selección curada de frecuencias y melodías diseñadas para restaurar tu equilibrio interior.',
}

export default function MelodiasPage() {
  return <MelodiasPageContent />
}
