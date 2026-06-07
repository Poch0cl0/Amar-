import type { Metadata } from 'next'
import { ProductsPageContent } from '@/components/productos/ProductsPageContent'

export const metadata: Metadata = {
  title: 'Productos | Amara',
  description: 'Kits relajantes y accesorios sensoriales pensados para una experiencia de bienestar.',
}

export default function ProductosPage() {
  return <ProductsPageContent />
}
