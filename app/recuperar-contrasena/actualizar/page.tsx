import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ResetPasswordPageContent } from './ResetPasswordPageContent'

export const metadata: Metadata = {
  title: 'Nueva contraseña | Amará',
  description: 'Establece una nueva contraseña para volver a tu espacio Amará.',
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center px-6 py-16 text-sm text-earth-500">
          Cargando…
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  )
}
