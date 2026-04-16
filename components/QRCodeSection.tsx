'use client'

import { QRCodeSVG } from 'qrcode.react'

interface Props {
  lang: 'fr' | 'en'
  url?: string
}

export default function QRCodeSection({ lang, url = 'https://maison-corleone-site-jv69.vercel.app/catalogue' }: Props) {
  return (
    <div className="border border-gris-mid p-6 flex flex-col items-center justify-center text-center">
      <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-4">
        {lang === 'fr' ? 'Accès rapide catalogue' : 'Quick catalogue access'}
      </p>
      <div className="p-3 border border-gris-mid/40 bg-blanc inline-block mb-4">
        <QRCodeSVG
          value={url}
          size={100}
          fgColor="#1A1A1A"
          bgColor="#FAFAF8"
          level="M"
        />
      </div>
      <p className="text-[9px] text-gris-light font-montserrat tracking-widest uppercase leading-relaxed">
        {lang === 'fr' ? 'Scanner pour accéder\nau catalogue' : 'Scan to access\nthe catalogue'}
      </p>
    </div>
  )
}
