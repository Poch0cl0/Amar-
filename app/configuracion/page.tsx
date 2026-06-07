import type { Metadata } from 'next'
import { ConfiguracionPageContent } from '@/components/configuracion/ConfiguracionPageContent'

export const metadata: Metadata = {
  title: 'Configuración | Amará',
  description:
    'Personaliza tu perfil, biografía, foto y contraseña en Amará.',
}

export default function ConfiguracionPage() {
  return <ConfiguracionPageContent />
}
