'use client'

import { SectionHeading } from '@/components/common/SectionHeading'
import { ProductsCatalog } from '@/components/productos/ProductsCatalog'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

export function ProductsPageContent() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).productos

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="center"
        />

        <div className="mx-auto mt-8 max-w-2xl border-b border-earth-200" />

        <ProductsCatalog />
      </div>
    </section>
  )
}
