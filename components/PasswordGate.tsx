'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Lang, t } from '@/lib/i18n'

const STORAGE_KEY = 'mc_auth'
const CORRECT = process.env.NEXT_PUBLIC_SITE_PASSWORD ?? 'Corleone2026'

interface Props {
  children: ReactNode
  lang: Lang
}

export default function PasswordGate({ children, lang }: Props) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    setUnlocked(stored === 'ok')
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === CORRECT) {
      sessionStorage.setItem(STORAGE_KEY, 'ok')
      setUnlocked(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (unlocked === null) return null // hydration guard
  if (unlocked) return <>{children}</>

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-cormorant text-4xl text-white tracking-[0.15em] uppercase">
            Maison Corleone
          </h1>
          <div className="w-16 h-px bg-or mx-auto mt-3 mb-4" />
          <p className="text-gris-light text-sm font-montserrat tracking-widest uppercase">
            {t(lang, 'password_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gris-light font-montserrat tracking-widest uppercase mb-2">
              {t(lang, 'password_label')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t(lang, 'password_placeholder')}
              className="w-full bg-gris border border-gris-mid text-white px-4 py-3 font-montserrat text-sm focus:outline-none focus:border-or transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-montserrat">
              {t(lang, 'password_error')}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-or text-noir py-3 font-montserrat text-sm font-semibold tracking-widest uppercase hover:bg-or-light transition-colors"
          >
            {t(lang, 'password_submit')}
          </button>
        </form>

        <p className="text-center text-gris-light text-xs font-montserrat mt-8">
          contact@maisoncorleone.com
        </p>
      </div>
    </div>
  )
}
