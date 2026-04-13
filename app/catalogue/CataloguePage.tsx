'use client'

import { useLang } from '@/components/LangProvider'
import { t } from '@/lib/i18n'
import { Product } from '@/lib/airtable'
import ProductGrid from '@/components/ProductGrid'

interface Props {
  initialProducts: Product[]
  categories: string[]
}

export default function CataloguePage({ initialProducts, categories }: Props) {
  const { lang } = useLang()

  return (
    <div className="min-h-screen bg-noir">
      {/* Header */}
      <div className="border-b border-gris-mid bg-gris py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-4">
            {lang === 'fr' ? 'Collection complète' : 'Full collection'}
          </p>
          <h1 className="font-cormorant text-5xl sm:text-6xl text-white mb-4">
            {t(lang, 'catalogue_title')}
          </h1>
          <p className="text-gris-light font-montserrat text-sm">
            {t(lang, 'catalogue_subtitle')}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProductGrid
          initialProducts={initialProducts}
          categories={categories}
          lang={lang}
        />
      </div>
    </div>
  )
}
