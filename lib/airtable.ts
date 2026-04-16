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
  imageUrl: string        // URL Cloudinary permanente (source vérité)
  images: AirtableImage[] // Pièces jointes Airtable (fallback / miniatures)
  categories: string
  materiaux?: string
  imageLifestyle1: string | null
  imageLifestyle2: string | null
  imageLifestyle3: string | null
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
    ImageURL?: string
    Categories?: string
    CATEGORIES?: string
    materiaux?: string
    ImageLifestyle1?: string
    ImageLifestyle2?: string
    ImageLifestyle3?: string
  }
}

const BASE_URL = 'https://api.airtable.com/v0'
const TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE_ID = process.env.AIRTABLE_TABLE_ID

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
  // Trim trailing \n from text fields
  const nom = (f.NOM || 'Produit sans nom').trim()
  const reference = (f.REFERENCE || record.id).trim()

  // Find prix field — exact name may vary
  const prixKey = Object.keys(f).find(
    (k) => k.toLowerCase().startsWith('prix circuit direct')
  )
  const prix = prixKey ? (f[prixKey] as number | undefined) ?? null : null

  // CATEGORIES: champ uppercase dans Airtable réel
  const categories: string = (() => {
    const raw = f.CATEGORIES ?? f.Categories ?? ''
    return Array.isArray(raw) ? String((raw as string[])[0] ?? '').trim() : String(raw).trim()
  })()

  const images: AirtableImage[] = Array.isArray(f.Images) ? (f.Images as AirtableImage[]) : []
  // ImageURL Cloudinary en priorité — fallback sur pièce jointe Airtable
  const imageUrl: string = (f.ImageURL as string | undefined)?.trim() || images[0]?.url || ''

  return {
    id: record.id,
    slug: slugify(reference || nom),
    nom,
    reference,
    description: f.Description || '',
    descriptionEn: f['description anglais'] || '',
    prix,
    imageUrl,
    images,
    categories,
    materiaux: f.materiaux as string | undefined,
    imageLifestyle1: (f.ImageLifestyle1 as string | undefined) || null,
    imageLifestyle2: (f.ImageLifestyle2 as string | undefined) || null,
    imageLifestyle3: (f.ImageLifestyle3 as string | undefined) || null,
  }
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (!TOKEN || !BASE_ID || !TABLE_ID) {
    console.error('Airtable env vars missing: AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID')
    return []
  }

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

  return products.filter((p) => p.imageUrl || p.images.length > 0)
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
