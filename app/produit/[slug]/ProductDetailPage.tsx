'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/airtable'
import { useLang } from '@/components/LangProvider'
import { t } from '@/lib/i18n'
import DevisForm from '@/components/DevisForm'

interface Props { product: Product }

/** Génère un thumbnail 200×200 depuis une URL Cloudinary */
function cloudinaryThumb(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', '/upload/w_200,h_200,c_fill,f_auto,q_auto/')
}

export default function ProductDetailPage({ product }: Props) {
  const { lang } = useLang()
  const [activeImg, setActiveImg] = useState(0)
  const [showDevis, setShowDevis] = useState(false)

  const desc = lang === 'en' && product.descriptionEn
    ? product.descriptionEn
    : product.description

  // Image principale : Cloudinary pour index 0, Airtable pour les suivantes
  const mainImg = activeImg === 0
    ? (product.imageUrl || product.images[0]?.url)
    : (product.images[activeImg]?.url ?? product.images[0]?.url)

  return (
    <>
      <div className="min-h-screen bg-blanc py-12 px-4 pb-28 md:pb-12">
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
              <div className="relative aspect-square bg-gris-mid mb-4 overflow-hidden shadow-luxury-lg group">
                {/* Corner accents — révèlent au hover */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-or opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-or opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
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

              {/* Thumbnails — Collection */}
              {product.images.length > 1 && (
                <div>
                  <p className="text-[10px] text-gris-light font-montserrat tracking-[0.25em] uppercase mb-3">
                    {lang === 'fr' ? 'Collection' : 'Collection'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.images.map((img, i) => {
                      // Index 0 : utiliser Cloudinary (permanent) — jamais l'URL Airtable
                      const thumbSrc = i === 0
                        ? cloudinaryThumb(product.imageUrl) || img.thumbnails?.small?.url || img.url
                        : img.thumbnails?.small?.url ?? img.url

                      return (
                        <button
                          key={img.id}
                          onClick={() => setActiveImg(i)}
                          className={`relative w-16 h-16 overflow-hidden border-2 transition-colors ${
                            activeImg === i ? 'border-or' : 'border-gris-mid hover:border-or/40'
                          }`}
                        >
                          <Image
                            src={thumbSrc}
                            alt={`${product.nom} ${i + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {/* Category */}
              {product.categories && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[9px] text-or/80 font-montserrat tracking-widest uppercase border-2 border-or/30 px-3 py-1 bg-or/5">
                    {product.categories}
                  </span>
                </div>
              )}

              {/* Reference */}
              <p className="text-[10px] text-gris-light font-montserrat tracking-[0.3em] uppercase mb-2">
                {t(lang, 'product_ref')} : <span className="text-or">{product.reference}</span>
              </p>

              {/* Name */}
              <h1 className="font-cormorant text-5xl sm:text-6xl text-texte mb-4 leading-tight">
                {product.nom}
              </h1>

              {/* Divider gradient */}
              <div className="w-16 h-px bg-gradient-to-r from-or to-or-light mb-6" />

              {/* Description */}
              {desc && (
                <p className="text-gris-light font-montserrat text-sm leading-relaxed mb-8 max-w-md">
                  {desc}
                </p>
              )}

              {/* Price — prestige box */}
              <div className="border-2 border-or p-5 mb-6 bg-or-pale/5 shadow-luxury-sm">
                <p className="text-[10px] text-gris-light font-montserrat tracking-[0.3em] uppercase mb-2">
                  {t(lang, 'product_price')}
                </p>
                {product.prix ? (
                  <p className="font-cormorant text-4xl text-or">
                    {product.prix.toLocaleString('fr-FR')} <span className="text-xl tracking-wider">{t(lang, 'product_price_unit')}</span>
                  </p>
                ) : (
                  <p className="font-montserrat text-sm text-texte italic">
                    {lang === 'fr' ? 'Prix sur demande' : 'Price on request'}
                  </p>
                )}
              </div>

              {/* CTA — desktop only (mobile has fixed bottom bar) */}
              <button
                onClick={() => setShowDevis(!showDevis)}
                className="hidden md:block w-full bg-or text-white py-4 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 mb-6"
              >
                {t(lang, 'product_devis')}
              </button>

              {/* Devis form */}
              {showDevis && (
                <div className="mb-6 border-2 border-gris-mid p-5 bg-ivoire">
                  <DevisForm
                    lang={lang}
                    productRef={product.reference}
                    productNom={product.nom}
                  />
                </div>
              )}

              {/* Details */}
              {product.materiaux && (
                <div className="border-2 border-gris-mid p-5 mt-4 bg-gris/30">
                  <p className="text-[10px] text-gris-light font-montserrat tracking-[0.3em] uppercase mb-2">
                    {lang === 'fr' ? 'Matériaux & Finitions' : 'Materials & Finishes'}
                  </p>
                  <p className="text-texte font-montserrat text-sm leading-relaxed">{product.materiaux}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-noir border-t-2 border-or/40 shadow-luxury-lg px-4 py-3">
        <button
          onClick={() => setShowDevis(!showDevis)}
          className="w-full bg-or text-white py-4 font-montserrat text-xs font-semibold tracking-widest uppercase active:bg-or-light transition-colors"
        >
          {t(lang, 'product_devis')}
        </button>
      </div>
    </>
  )
}
