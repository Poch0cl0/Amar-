import { ProductCard } from '@/components/cards/ProductCard'
import { SectionHeading } from '@/components/common/SectionHeading'
import { getLandingContent } from '@/lib/landing-content'

export function ProductShowcase() {
  const { products } = getLandingContent()

  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Productos"
          title="Tarjetas claras, visuales y listas para escalar."
          description="Esta base representa bien tu tabla de productos, su linea y sus beneficios, sin necesidad de backend al inicio."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
