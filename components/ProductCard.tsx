import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/airtable'
import { Lang, t } from '@/lib/i18n'

interface Props {
  product: Product
  lang: Lang
}

export default function ProductCard({ product, lang }: Props) {
  // ImageURL Cloudinary en priorité — fallback sur pièce jointe Airtable
  const imageUrl = product.imageUrl || product.images[0]?.thumbnails?.large?.url || product.images[0]?.url
  const nom = product.nom
  const desc = lang === 'en' && product.descriptionEn
    ? product.descriptionEn
    : product.description

  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <div className="bg-carte border border-carte-border shadow-sm hover:shadow-md hover:border-or/40 transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gris-mid">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={nom}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gris-light text-xs font-montserrat">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-1">
            {product.reference}
          </p>
          <h3 className="font-cormorant text-lg text-texte leading-tight mb-2 group-hover:text-or transition-colors">
            {nom}
          </h3>
          {desc && (
            <p className="text-gris-light text-xs font-montserrat leading-relaxed line-clamp-2 mb-3">
              {desc}
            </p>
          )}
          <div className="flex items-center justify-between">
            {product.prix ? (
              <span className="text-or font-cormorant text-lg">
                {product.prix.toLocaleString('fr-FR')} {t(lang, 'product_price_unit')}
              </span>
            ) : (
              <span className="text-gris-light text-xs font-montserrat tracking-wider">
                {lang === 'fr' ? 'Prix sur demande' : 'Price on request'}
              </span>
            )}
            <span className="text-[9px] text-gris-light font-montserrat tracking-widest uppercase border border-gris-mid px-2 py-1 group-hover:border-or/40 group-hover:text-or transition-colors">
              {lang === 'fr' ? 'Voir' : 'View'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
