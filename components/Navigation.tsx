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

  const navLinks = [
    { href: '/', label: t(lang, 'nav_accueil') },
    { href: '/catalogue', label: t(lang, 'nav_catalogue') },
    { href: '/espace-client', label: t(lang, 'nav_espace_client') },
    { href: '/#contact', label: t(lang, 'nav_contact') },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/92 backdrop-blur-md border-b border-or/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-cormorant text-xl text-or tracking-[0.25em] uppercase hover:text-or-light transition-colors"
            >
              Maison Corleone
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs font-montserrat tracking-widest uppercase text-gris-light hover:text-or transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <LanguageSwitcher lang={lang} onSwitch={onLangSwitch} />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden text-or hover:text-or-light transition-colors p-1"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-blanc flex flex-col md:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gris-mid flex-shrink-0">
          <span className="font-cormorant text-lg text-or tracking-[0.2em] uppercase">
            Maison Corleone
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-gris-light hover:text-or transition-colors p-1"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer links */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center h-14 text-xs font-montserrat tracking-widest uppercase text-texte hover:text-or transition-colors border-b border-gris-mid/40"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Drawer footer — language switcher */}
        <div className="px-6 py-6 border-t border-gris-mid flex-shrink-0">
          <p className="text-[9px] text-gris-light font-montserrat tracking-widest uppercase mb-3">
            {lang === 'fr' ? 'Langue' : 'Language'}
          </p>
          <LanguageSwitcher lang={lang} onSwitch={onLangSwitch} />
        </div>
      </div>
    </>
  )
}
