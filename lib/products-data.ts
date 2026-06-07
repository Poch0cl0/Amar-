import productsJson from '@/data/products.json'
import type { Product } from '@/lib/products'

export function getProducts(): Product[] {
  return (productsJson as Product[])
    .filter((product) => product.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}
