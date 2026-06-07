'use client'

import { ProductKitCard } from '@/components/productos/ProductKitCard'
import { SectionHeading } from '@/components/common/SectionHeading'
import { HomeSectionLink } from '@/components/home/HomeSectionLink'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getProducts } from '@/lib/products-data'

export function HomeProductsPreview() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).home
  const products = getProducts().slice(0, 3)

  return (
    <section className="bg-sand-50/60 px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={copy.productsEyebrow}
          title={copy.productsTitle}
          description={copy.productsDescription}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductKitCard key={product.id} product={product} lang={lang} />
          ))}
        </div>

        <HomeSectionLink href="/productos" label={copy.productsLink} />
      </div>
    </section>
  )
}
