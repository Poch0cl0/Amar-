'use client'

import { ProductKitCard } from '@/components/productos/ProductKitCard'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getProducts } from '@/lib/products-data'

export function ProductsCatalog() {
  const { lang } = useLocale()
  const products = getProducts()

  return (
    <div className="mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductKitCard key={product.id} product={product} lang={lang} />
      ))}
    </div>
  )
}
