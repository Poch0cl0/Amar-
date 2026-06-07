import type { Lang } from '@/lib/i18n'

export type ProductBenefit = { es?: string; en?: string }

export type ProductBenefitsByLang = {
  es?: string[]
  en?: string[]
}

export type Product = {
  id: number
  name_es: string
  name_en: string | null
  description_es: string
  description_en: string | null
  image_url: string | null
  benefits: ProductBenefit[] | ProductBenefitsByLang | null
  category: string | null
  sort_order: number | null
  is_active?: boolean
}

export function getProductName(product: Product, lang: Lang): string {
  if (lang === 'en' && product.name_en?.trim()) return product.name_en.trim()
  return product.name_es
}

export function getProductDescription(product: Product, lang: Lang): string {
  if (lang === 'en' && product.description_en?.trim()) return product.description_en.trim()
  return product.description_es
}

function extractBenefitText(item: unknown, lang: Lang): string {
  if (typeof item === 'string') return item.trim()
  if (typeof item !== 'object' || !item) return ''

  const record = item as Record<string, unknown>
  const primaryKeys =
    lang === 'en'
      ? ['en', 'benefit_en', 'text_en', 'beneficio_en', 'name_en']
      : ['es', 'benefit_es', 'text_es', 'beneficio_es', 'name_es']
  const fallbackKeys =
    lang === 'en'
      ? ['es', 'benefit_es', 'text_es', 'beneficio_es', 'name_es']
      : ['en', 'benefit_en', 'text_en', 'beneficio_en', 'name_en']

  for (const key of primaryKeys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  for (const key of fallbackKeys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

function normalizeBenefitsInput(raw: unknown, lang: Lang): unknown[] {
  if (raw == null) return []

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      return normalizeBenefitsInput(JSON.parse(trimmed), lang)
    } catch {
      return lang === 'es' ? [trimmed] : []
    }
  }

  if (Array.isArray(raw)) return raw

  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    const primaryBucket = lang === 'en' ? record.en : record.es
    const fallbackBucket = lang === 'en' ? record.es : record.en

    if (Array.isArray(primaryBucket)) return primaryBucket
    if (Array.isArray(fallbackBucket)) return fallbackBucket

    for (const key of ['benefits', 'items', 'list']) {
      const bucket = record[key]
      if (Array.isArray(bucket)) return bucket
    }
  }

  return []
}

export function parseBenefits(raw: unknown, lang: Lang = 'es'): string[] {
  const items = normalizeBenefitsInput(raw, lang)

  return items
    .map((item) => extractBenefitText(item, lang))
    .filter(Boolean)
}
