import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ForgotPasswordPageContent } from './ForgotPasswordPageContent'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | Amará',
  description: 'Solicita un enlace seguro para restablecer el acceso a tu cuenta Amará.',
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center px-6 py-16 text-sm text-earth-500">
          Cargando…
        </div>
      }
    >
      <ForgotPasswordPageContent />
    </Suspense>
  )
}
