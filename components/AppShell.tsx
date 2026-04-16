'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useLang } from './LangProvider'
import Navigation from './Navigation'
import PasswordGate from './PasswordGate'

export default function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang()
  const [year, setYear] = useState(2026)
  useEffect(() => { setYear(new Date().getFullYear()) }, [])

  return (
    <PasswordGate lang={lang}>
      <Navigation lang={lang} onLangSwitch={setLang} />
      <main className="pt-16">{children}</main>
      <footer className="bg-footer-bg mt-20 border-t-2 border-or/40 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Top ornement */}
          <div className="flex items-center gap-4 mb-12 justify-center">
            <div className="h-px bg-gradient-to-r from-transparent via-or to-transparent flex-1 max-w-xs" />
            <div className="w-1.5 h-1.5 bg-or rotate-45" />
            <div className="h-px bg-gradient-to-r from-transparent via-or to-transparent flex-1 max-w-xs" />
          </div>

          {/* Grille 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Identité */}
            <div>
              <h3 className="font-cormorant text-2xl text-or tracking-[0.2em] uppercase mb-3">
                Maison Corleone
              </h3>
              <div className="w-8 h-px bg-or-light mb-4" />
              <p className="text-footer-text text-xs font-montserrat leading-loose">
                Corleone Limited<br />
                Capital social : 100 000 €<br />
                TVA : FR67 999 856 586
              </p>
            </div>

            {/* Contact — centré */}
            <div className="md:border-l md:border-r border-or/20 md:px-8">
              <p className="text-[10px] text-or/70 font-montserrat tracking-widest uppercase mb-4">Contact</p>
              <a
                href="mailto:contact@maisoncorleone.com"
                className="flex items-center gap-2 text-white text-sm font-montserrat hover:text-or transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                contact@maisoncorleone.com
              </a>
            </div>

            {/* INPI */}
            <div className="md:text-right">
              <p className="text-[10px] text-or/70 font-montserrat tracking-widest uppercase mb-4">
                {lang === 'fr' ? 'Propriété intellectuelle' : 'Intellectual property'}
              </p>
              <p className="text-footer-text text-xs font-montserrat leading-relaxed">
                Marque INPI n°5160970<br />
                Classes 36, 39, 42
              </p>
            </div>
          </div>

          {/* Divider gradient */}
          <div className="h-px bg-gradient-to-r from-transparent via-or/40 to-transparent mb-8" />

          {/* Copyright */}
          <p className="text-footer-text text-[10px] font-montserrat tracking-widest uppercase text-center">
            © {year} Maison Corleone — {lang === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
          </p>
        </div>
      </footer>
    </PasswordGate>
  )
}
