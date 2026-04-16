'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/airtable'
import { Lang, t } from '@/lib/i18n'
import ProductCard from './ProductCard'

interface Props {
  initialProducts: Product[]
  categories: string[]
  lang: Lang
}

export default function ProductGrid({ initialProducts, categories, lang }: Props) {
  const [active, setActive] = useState('all')
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (active === 'all') {
      setProducts(initialProducts)
      return
    }
    setLoading(true)
    fetch(`/api/products?category=${encodeURIComponent(active)}`)
      .then((r) => r.json())
      .then((data: { products: Product[] }) => {
        setProducts(data.products)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [active, initialProducts])

  const allCategories = ['all', ...categories]

  return (
    <div>
      {/* Filter pills — horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-2 mb-10 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`flex-none text-[10px] font-montserrat tracking-widest uppercase px-4 py-2 border transition-colors whitespace-nowrap ${
              active === cat
                ? 'border-or text-or bg-or/10'
                : 'border-gris-mid text-gris-light hover:border-or/40 hover:text-texte'
            }`}
          >
            {cat === 'all' ? t(lang, 'catalogue_all') : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-gris-light font-montserrat text-sm">{t(lang, 'catalogue_loading')}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gris-light font-montserrat text-sm">{t(lang, 'catalogue_no_products')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-gris-light text-xs font-montserrat mt-6 text-center">
        {products.length} {lang === 'fr' ? 'produits' : 'products'}
      </p>
    </div>
  )
}
