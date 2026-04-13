'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Lang, t } from '@/lib/i18n'
import LanguageSwitcher from './LanguageSwitcher'

interface Props {
  lang: Lang
  onLangSwitch: (l: Lang) => void
}

export default function Navigation({ lang, onLangSwitch }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-noir/95 backdrop-blur-sm border-b border-gris-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-cormorant text-xl text-white tracking-[0.2em] uppercase hover:text-or transition-colors">
            Maison Corleone
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-xs font-montserrat tracking-widest uppercase text-gris-light hover:text-or transition-colors">
              {t(lang, 'nav_accueil')}
            </Link>
            <Link href="/catalogue" className="text-xs font-montserrat tracking-widest uppercase text-gris-light hover:text-or transition-colors">
              {t(lang, 'nav_catalogue')}
            </Link>
            <Link href="/espace-client" className="text-xs font-montserrat tracking-widest uppercase text-gris-light hover:text-or transition-colors">
              {t(lang, 'nav_espace_client')}
            </Link>
            <Link href="/#contact" className="text-xs font-montserrat tracking-widest uppercase text-gris-light hover:text-or transition-colors">
              {t(lang, 'nav_contact')}
            </Link>
            <LanguageSwitcher lang={lang} onSwitch={onLangSwitch} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher lang={lang} onSwitch={onLangSwitch} />
            <button onClick={() => setOpen(!open)} className="text-gris-light hover:text-or transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gris-mid py-4 space-y-4">
            {[
              { href: '/', label: t(lang, 'nav_accueil') },
              { href: '/catalogue', label: t(lang, 'nav_catalogue') },
              { href: '/espace-client', label: t(lang, 'nav_espace_client') },
              { href: '/#contact', label: t(lang, 'nav_contact') },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block text-xs font-montserrat tracking-widest uppercase text-gris-light hover:text-or transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
