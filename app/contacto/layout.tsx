import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto | Amara',
  description: 'Formulario inicial de contacto para la landing de Amara.',
}

export default function ContactoLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
