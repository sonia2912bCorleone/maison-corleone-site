export interface AirtableImage {
  id: string
  url: string
  filename: string
  size: number
  type: string
  width?: number
  height?: number
  thumbnails?: {
    small?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
    full?: { url: string; width: number; height: number }
  }
}

export interface Product {
  id: string
  slug: string
  nom: string
  reference: string
  description: string
  descriptionEn: string
  prix: number | null
  images: AirtableImage[]
  tags: string[]
  categories: string
  materiaux?: string
}

interface AirtableRecord {
  id: string
  fields: {
    NOM?: string
    REFERENCE?: string
    Description?: string
    'description anglais'?: string
    'Prix Circuit Direct Usine'?: number
    [key: string]: unknown
    Images?: AirtableImage[]
    Tags?: string[]
    Categories?: string
    materiaux?: string
  }
}

const BASE_URL = 'https://api.airtable.com/v0'
const TOKEN = process.env.AIRTABLE_TOKEN!
const BASE_ID = process.env.AIRTABLE_BASE_ID!
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function recordToProduct(record: AirtableRecord): Product {
  const f = record.fields
  const nom = f.NOM || 'Produit sans nom'
  const reference = f.REFERENCE || record.id

  // Find prix field — exact name may vary
  const prixKey = Object.keys(f).find(
    (k) => k.toLowerCase().startsWith('prix circuit direct')
  )
  const prix = prixKey ? (f[prixKey] as number | undefined) ?? null : null

  return {
    id: record.id,
    slug: slugify(reference || nom),
    nom,
    reference,
    description: f.Description || '',
    descriptionEn: f['description anglais'] || '',
    prix,
    images: (f.Images as AirtableImage[]) || [],
    tags: f.Tags || [],
    categories: f.Categories || '',
    materiaux: f.materiaux as string | undefined,
  }
}

export async function fetchAllProducts(): Promise<Product[]> {
  const products: Product[] = []
  let offset: string | undefined

  do {
    const params = new URLSearchParams({ pageSize: '100' })
    if (offset) params.set('offset', offset)

    const res = await fetch(
      `${BASE_URL}/${BASE_ID}/${TABLE_ID}?${params}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
        next: { revalidate: 300 }, // cache 5 min
      }
    )

    if (!res.ok) {
      console.error('Airtable error:', res.status, await res.text())
      break
    }

    const data = await res.json() as { records: AirtableRecord[]; offset?: string }
    products.push(...data.records.map(recordToProduct))
    offset = data.offset
  } while (offset)

  return products.filter((p) => p.images.length > 0)
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const all = await fetchAllProducts()
  return all.find((p) => p.slug === slug) ?? null
}

export async function fetchCategories(): Promise<string[]> {
  const products = await fetchAllProducts()
  const cats = new Set(products.map((p) => p.categories).filter(Boolean))
  return Array.from(cats).sort()
}
