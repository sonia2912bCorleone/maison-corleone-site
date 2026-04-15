'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/components/LangProvider'
import { t } from '@/lib/i18n'

export default function EspaceClient() {
  const { lang } = useLang()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        window.location.href = `/catalogue?code=${encodeURIComponent(code.toUpperCase())}`
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blanc flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-4">
            {lang === 'fr' ? 'Accès personnalisé' : 'Personalised access'}
          </p>
          <h1 className="font-cormorant text-4xl text-texte mb-2">
            {t(lang, 'client_title')}
          </h1>
          <div className="w-10 h-px bg-or mx-auto mb-4" />
          <p className="text-gris-light text-xs font-montserrat">
            {t(lang, 'client_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-2">
              {t(lang, 'client_code_label')}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t(lang, 'client_code_placeholder')}
              className="w-full bg-gris border border-gris-mid text-texte px-4 py-3 font-montserrat text-sm tracking-wider focus:outline-none focus:border-or transition-colors uppercase"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-montserrat">{t(lang, 'client_error')}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-or text-noir py-3 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light transition-colors disabled:opacity-50"
          >
            {loading
              ? (lang === 'fr' ? 'Vérification…' : 'Checking…')
              : t(lang, 'client_submit')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gris-light text-xs font-montserrat mb-2">
            {lang === 'fr' ? 'Pas encore client ?' : 'Not a client yet?'}
          </p>
          <Link href="/#contact" className="text-or text-xs font-montserrat hover:text-or-light transition-colors">
            {lang === 'fr' ? 'Demander un accès' : 'Request access'}
          </Link>
        </div>
      </div>
    </div>
  )
}
