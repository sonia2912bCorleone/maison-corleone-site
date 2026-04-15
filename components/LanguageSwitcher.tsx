'use client'

import { Lang } from '@/lib/i18n'

interface Props {
  lang: Lang
  onSwitch: (l: Lang) => void
}

export default function LanguageSwitcher({ lang, onSwitch }: Props) {
  return (
    <div className="flex items-center gap-1 text-xs font-montserrat tracking-widest">
      <button
        onClick={() => onSwitch('fr')}
        className={`px-2 py-0.5 transition-colors ${
          lang === 'fr'
            ? 'text-or border-b border-or'
            : 'text-gris-light hover:text-texte'
        }`}
      >
        FR
      </button>
      <span className="text-gris-light">|</span>
      <button
        onClick={() => onSwitch('en')}
        className={`px-2 py-0.5 transition-colors ${
          lang === 'en'
            ? 'text-or border-b border-or'
            : 'text-gris-light hover:text-texte'
        }`}
      >
        EN
      </button>
    </div>
  )
}
