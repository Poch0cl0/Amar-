import type { Product } from '@/lib/landing-content'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-earth-200/80 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="aspect-[4/5] overflow-hidden bg-sand-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
              {product.line}
            </p>
            <h3 className="mt-2 font-display text-2xl text-earth-900">{product.name}</h3>
            <p className="mt-2 text-sm leading-7 text-earth-600">{product.subtitle}</p>
          </div>
          <span className="rounded-full bg-sand-100 px-3 py-1 text-sm font-semibold text-earth-700">
            {product.price}
          </span>
        </div>

        <ul className="space-y-2 text-sm text-earth-600">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span className="mt-1 text-sage-600">●</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
