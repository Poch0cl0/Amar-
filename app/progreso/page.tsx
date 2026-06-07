import type { Metadata } from 'next'
import { ProgresoPageContent } from '@/components/progreso/ProgresoPageContent'

export const metadata: Metadata = {
  title: 'Mi Progreso | Amará',
  description:
    'Registra tus emociones día a día y visualiza tu bienestar con un calendario emocional y estadísticas mensuales.',
}

export default function ProgresoPage() {
  return <ProgresoPageContent />
}
