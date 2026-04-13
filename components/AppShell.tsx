'use client'

import { ReactNode } from 'react'
import { useLang } from './LangProvider'
import Navigation from './Navigation'
import PasswordGate from './PasswordGate'

export default function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang()

  return (
    <PasswordGate lang={lang}>
      <Navigation lang={lang} onLangSwitch={setLang} />
      <main className="pt-16">{children}</main>
      <footer className="bg-gris border-t border-gris-mid mt-20 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <h3 className="font-cormorant text-2xl text-white tracking-[0.15em] uppercase mb-2">
                Maison Corleone
              </h3>
              <div className="w-10 h-px bg-or mb-4" />
              <p className="text-gris-light text-xs font-montserrat leading-relaxed">
                177 Av. Georges Clémenceau<br />
                92000 Nanterre, France<br />
                RCS Nanterre 987 948 155<br />
                TVA FR68 987 948 155
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-3">Contact</p>
              <a
                href="mailto:contact@maisoncorleone.com"
                className="text-white text-sm font-montserrat hover:text-or transition-colors"
              >
                contact@maisoncorleone.com
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gris-mid flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gris-light text-[10px] font-montserrat tracking-widest uppercase">
              © {new Date().getFullYear()} Maison Corleone — {lang === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}
            </p>
            <p className="text-gris-light text-[10px] font-montserrat tracking-widest">
              Marque INPI n°5160970 · Classes 36, 39, 42
            </p>
          </div>
        </div>
      </footer>
    </PasswordGate>
  )
}
