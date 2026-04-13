import { NextResponse } from 'next/server'
import { fetchAllProducts } from '@/lib/airtable'

export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const products = await fetchAllProducts()

    const filtered = category && category !== 'all'
      ? products.filter((p) => p.categories === category)
      : products

    return NextResponse.json({ products: filtered, total: filtered.length })
  } catch (err) {
    console.error('API /products error:', err)
    return NextResponse.json({ products: [], total: 0, error: String(err) }, { status: 500 })
  }
}
