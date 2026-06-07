import type { Metadata } from 'next'
import { EjerciciosPageContent } from '@/components/ejercicios/EjerciciosPageContent'

export const metadata: Metadata = {
  title: 'Ejercicios de relajación | Amará',
  description:
    'Encuentra tu centro con rutinas guiadas diseñadas para liberar tensiones y cultivar la serenidad en tu día a día.',
}

export default function EjerciciosPage() {
  return <EjerciciosPageContent />
}
