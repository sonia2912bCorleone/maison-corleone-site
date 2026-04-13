import { fetchAllProducts, fetchCategories } from '@/lib/airtable'
import CataloguePage from './CataloguePage'

export const revalidate = 300

export default async function Catalogue() {
  let products: import('@/lib/airtable').Product[] = []
  let categories: string[] = []

  try {
    ;[products, categories] = await Promise.all([fetchAllProducts(), fetchCategories()])
  } catch (err) {
    console.error('Catalogue fetch error:', err)
  }

  return <CataloguePage initialProducts={products} categories={categories} />
}
