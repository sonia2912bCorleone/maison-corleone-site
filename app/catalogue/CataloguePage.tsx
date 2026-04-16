'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLang } from '@/components/LangProvider'
import { t } from '@/lib/i18n'
import { Product } from '@/lib/airtable'
import ProductGrid from '@/components/ProductGrid'

interface Props {
  initialProducts: Product[]
  categories: string[]
}

// Inner component that uses useSearchParams — must be wrapped in Suspense
function CatalogueContent({ initialProducts, categories }: Props) {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const clientCode = searchParams.get('code')

  const [products, setProducts] = useState(initialProducts)

  // Filter by client code if present
  useEffect(() => {
    if (!clientCode) {
      setProducts(initialProducts)
    }
    // Future: fetch personalised catalogue for clientCode
  }, [clientCode, initialProducts])

  return (
    <div className="min-h-screen bg-blanc">
      {/* Header */}
      <div className="border-b border-or/15 bg-ivoire py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-4">
            {lang === 'fr' ? 'Collection complète' : 'Full collection'}
          </p>
          <h1 className="font-cormorant text-5xl sm:text-6xl text-texte mb-4">
            {t(lang, 'catalogue_title')}
          </h1>
          <p className="text-gris-light font-montserrat text-sm">
            {t(lang, 'catalogue_subtitle')}
          </p>
          {clientCode && (
            <p className="text-or text-xs font-montserrat mt-2 tracking-widest uppercase">
              {lang === 'fr' ? `Espace client : ${clientCode}` : `Client space: ${clientCode}`}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProductGrid
          initialProducts={products}
          categories={categories}
          lang={lang}
        />
      </div>
    </div>
  )
}

// Loading skeleton shown during Suspense
function CatalogueSkeleton() {
  return (
    <div className="min-h-screen bg-blanc">
      <div className="border-b border-or/15 bg-ivoire py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-3 w-32 bg-gris-mid rounded mb-4" />
          <div className="h-12 w-64 bg-gris-mid rounded mb-4" />
          <div className="h-4 w-48 bg-gris-mid rounded" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-carte border border-carte-border shadow-sm animate-pulse">
              <div className="aspect-[4/3] bg-gris-mid" />
              <div className="p-4 space-y-2">
                <div className="h-2 w-16 bg-gris-mid rounded" />
                <div className="h-4 w-32 bg-gris-mid rounded" />
                <div className="h-3 w-full bg-gris-mid rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Exported component wraps inner with Suspense
export default function CataloguePage({ initialProducts, categories }: Props) {
  return (
    <Suspense fallback={<CatalogueSkeleton />}>
      <CatalogueContent initialProducts={initialProducts} categories={categories} />
    </Suspense>
  )
}
