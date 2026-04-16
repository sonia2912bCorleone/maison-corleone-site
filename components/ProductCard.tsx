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
      <div className="relative bg-carte border-2 border-carte-border shadow-luxury-sm hover:shadow-luxury-lg hover:border-or/60 transition-all duration-300 overflow-hidden">
        {/* Accent line top — révèle au hover */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-or via-or-light to-or opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gris-mid">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={nom}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gris-light text-xs font-montserrat">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-[9px] text-or/70 font-montserrat tracking-[0.3em] uppercase mb-1">
            {product.reference}
          </p>
          <h3 className="font-cormorant text-2xl text-texte leading-tight mb-2 group-hover:text-or transition-colors duration-300">
            {nom}
          </h3>
          {desc && (
            <p className="text-gris-light text-xs font-montserrat leading-relaxed line-clamp-2 mb-3">
              {desc}
            </p>
          )}
          {/* Divider */}
          <div className="h-px bg-gris-mid/50 mb-3" />
          <div className="flex items-center justify-between">
            {product.prix ? (
              <span className="text-or font-cormorant text-xl">
                {product.prix.toLocaleString('fr-FR')} {t(lang, 'product_price_unit')}
              </span>
            ) : (
              <span className="text-gris-light text-xs font-montserrat tracking-wider">
                {lang === 'fr' ? 'Prix sur demande' : 'Price on request'}
              </span>
            )}
            <span className="text-[9px] text-gris-light font-montserrat tracking-widest uppercase border-2 border-gris-mid px-3 py-1.5 group-hover:border-or group-hover:text-or transition-all duration-300">
              {lang === 'fr' ? 'Voir' : 'View'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
