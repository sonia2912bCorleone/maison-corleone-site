'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Lang } from '@/lib/i18n'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }

const Ctx = createContext<LangCtx>({ lang: 'fr', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang() { return useContext(Ctx) }
