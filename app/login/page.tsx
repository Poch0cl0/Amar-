import { Suspense } from 'react'
import { LoginPageContent } from './LoginPageContent'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center px-6 py-16 text-sm text-earth-500">
          Cargando…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
