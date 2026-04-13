import { fetchAllProducts, fetchProductBySlug } from '@/lib/airtable'
import { notFound } from 'next/navigation'
import ProductDetailPage from './ProductDetailPage'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const products = await fetchAllProducts()
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

interface Props {
  params: { slug: string }
}

export default async function ProductPage({ params }: Props) {
  let product = null
  try {
    product = await fetchProductBySlug(params.slug)
  } catch (err) {
    console.error('Product fetch error:', err)
  }

  if (!product) return notFound()

  return <ProductDetailPage product={product} />
}
