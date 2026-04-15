'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/airtable'
import { useLang } from '@/components/LangProvider'
import { t } from '@/lib/i18n'
import DevisForm from '@/components/DevisForm'

interface Props { product: Product }

export default function ProductDetailPage({ product }: Props) {
  const { lang } = useLang()
  const [activeImg, setActiveImg] = useState(0)
  const [showDevis, setShowDevis] = useState(false)

  const desc = lang === 'en' && product.descriptionEn
    ? product.descriptionEn
    : product.description

  // ImageURL Cloudinary pour l'image principale (activeImg=0), sinon pièce jointe
  const mainImg = activeImg === 0
    ? (product.imageUrl || product.images[0]?.url)
    : (product.images[activeImg]?.url ?? product.images[0]?.url)

  return (
    <div className="min-h-screen bg-blanc py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/catalogue"
            className="text-gris-light text-xs font-montserrat tracking-widest uppercase hover:text-or transition-colors"
          >
            {t(lang, 'product_back')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square bg-gris-mid mb-4 overflow-hidden">
              {mainImg ? (
                <Image
                  src={mainImg}
                  alt={product.nom}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gris-light text-xs font-montserrat">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 overflow-hidden border-2 transition-colors ${
                      activeImg === i ? 'border-or' : 'border-gris-mid hover:border-or/40'
                    }`}
                  >
                    <Image
                      src={img.thumbnails?.small?.url ?? img.url}
                      alt={`${product.nom} ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Category */}
            {product.categories && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[9px] text-gris-light font-montserrat tracking-widest uppercase border border-gris-mid px-2 py-0.5">
                  {product.categories}
                </span>
              </div>
            )}

            {/* Reference */}
            <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-2">
              {t(lang, 'product_ref')} : {product.reference}
            </p>

            {/* Name */}
            <h1 className="font-cormorant text-4xl sm:text-5xl text-texte mb-4 leading-tight">
              {product.nom}
            </h1>

            {/* Divider */}
            <div className="w-10 h-px bg-or mb-6" />

            {/* Description */}
            {desc && (
              <p className="text-gris-light font-montserrat text-sm leading-relaxed mb-8">
                {desc}
              </p>
            )}

            {/* Price */}
            <div className="border border-gris-mid p-4 mb-6">
              <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-1">
                {t(lang, 'product_price')}
              </p>
              {product.prix ? (
                <p className="font-cormorant text-3xl text-or">
                  {product.prix.toLocaleString('fr-FR')} {t(lang, 'product_price_unit')}
                </p>
              ) : (
                <p className="font-montserrat text-sm text-texte">
                  {lang === 'fr' ? 'Prix sur demande' : 'Price on request'}
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowDevis(!showDevis)}
              className="w-full bg-or text-noir py-4 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light transition-colors mb-6"
            >
              {t(lang, 'product_devis')}
            </button>

            {/* Devis form */}
            {showDevis && (
              <DevisForm
                lang={lang}
                productRef={product.reference}
                productNom={product.nom}
              />
            )}

            {/* Details */}
            {product.materiaux && (
              <div className="border border-gris-mid p-4 mt-4">
                <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-1">
                  {lang === 'fr' ? 'Matériaux' : 'Materials'}
                </p>
                <p className="text-texte font-montserrat text-sm">{product.materiaux}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
