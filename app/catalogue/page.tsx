import { Suspense } from 'react'
import { fetchAllProducts, fetchCategories, Product } from '@/lib/airtable'
import CataloguePage from './CataloguePage'

export const revalidate = 300

async function CatalogueData() {
  let products: Product[] = []
  let categories: string[] = []

  try {
    ;[products, categories] = await Promise.all([fetchAllProducts(), fetchCategories()])
  } catch (err) {
    console.error('Catalogue fetch error:', err)
  }

  return <CataloguePage initialProducts={products} categories={categories} />
}

export default function Catalogue() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-blanc flex items-center justify-center">
          <p className="text-gris-light font-montserrat text-sm tracking-widest">
            Chargement…
          </p>
        </div>
      }
    >
      <CatalogueData />
    </Suspense>
  )
}
