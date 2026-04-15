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
      <footer className="bg-footer-bg mt-20 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <h3 className="font-cormorant text-2xl text-or tracking-[0.15em] uppercase mb-2">
                Maison Corleone
              </h3>
              <div className="w-10 h-px bg-or mb-4" />
              <p className="text-footer-text text-xs font-montserrat leading-relaxed">
                Corleone Limited<br />
                Capital social : 100 000 €<br />
                TVA : FR67 999 856 586
              </p>
            </div>
            <div>
              <p className="text-[10px] text-footer-text font-montserrat tracking-widest uppercase mb-3">Contact</p>
              <a
                href="mailto:contact@maisoncorleone.com"
                className="text-white text-sm font-montserrat hover:text-or transition-colors"
              >
                contact@maisoncorleone.com
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#2A2A2A] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-footer-text text-[10px] font-montserrat tracking-widest uppercase">
              © {year} Maison Corleone — {lang === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
            </p>
            <p className="text-footer-text text-[10px] font-montserrat tracking-widest">
              Marque INPI n°5160970 · Classes 36, 39, 42
            </p>
          </div>
        </div>
      </footer>
    </PasswordGate>
  )
}
