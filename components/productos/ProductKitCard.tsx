'use client'

import { useState } from 'react'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { Product } from '@/lib/products'
import {
  getProductDescription,
  getProductName,
  parseBenefits,
} from '@/lib/products'

type ProductKitCardProps = {
  product: Product
  lang: Lang
}

export function ProductKitCard({ product, lang }: ProductKitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const copy = getTranslations(lang).productos
  const name = getProductName(product, lang)
  const description = getProductDescription(product, lang)
  const benefits = parseBenefits(product.benefits, lang)

  return (
    <article
      className={`flex w-full flex-col self-start overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 ${
        expanded ? 'ring-1 ring-rose-200/60' : ''
      }`}
    >
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-[var(--color-primary-light)]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PackageIcon className="h-16 w-16 text-rose-400" />
          </div>
        )}
      </div>

      <div className="flex flex-col p-6">
        <h3 className="font-display text-2xl text-earth-900">{name}</h3>
        <p
          className={`mt-2 text-sm leading-relaxed text-earth-600 ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {description}
        </p>

        {expanded && (
          <div id={`product-benefits-${product.id}`} className="mt-4 border-t border-earth-100 pt-4">
            {benefits.length > 0 ? (
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li
                    key={`${product.id}-benefit-${index}`}
                    className="flex items-start gap-2 text-sm text-earth-700"
                  >
                    <span className="mt-0.5 shrink-0 font-semibold text-rose-400">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-earth-500">{copy.noBenefits}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((open) => !open)
          }}
          className="mt-4 flex w-full items-center justify-between border-t border-earth-100 pt-4 text-left transition hover:text-earth-700"
          aria-expanded={expanded}
          aria-controls={`product-benefits-${product.id}`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
            {copy.viewBenefits}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-earth-400 transition-transform duration-300 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </article>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
