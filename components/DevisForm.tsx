'use client'

import { useState } from 'react'
import { Lang, t } from '@/lib/i18n'

interface Props {
  lang: Lang
  productRef?: string
  productNom?: string
}

export default function DevisForm({ lang, productRef, productNom }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    qty: '1',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    // EmailJS integration — replace placeholders with real IDs in .env.local
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE ?? 'placeholder'
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE ?? 'placeholder'
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_KEY ?? 'placeholder'

    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      phone: form.phone,
      qty: form.qty,
      message: form.message,
      product_ref: productRef ?? '',
      product_nom: productNom ?? '',
    }

    try {
      if (serviceId !== 'placeholder') {
        const emailjs = await import('@emailjs/browser')
        await emailjs.send(serviceId, templateId, templateParams, publicKey)
      } else {
        // Fallback: mailto link
        const subject = encodeURIComponent(
          `Demande de devis — ${productNom ?? 'catalogue'} — ${productRef ?? ''}`
        )
        const body = encodeURIComponent(
          `Nom: ${form.name}\nEmail: ${form.email}\nTél: ${form.phone}\nQuantité: ${form.qty}\n\n${form.message}`
        )
        window.location.href = `mailto:contact@maisoncorleone.com?subject=${subject}&body=${body}`
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-or/40 bg-or/5 p-6 text-center">
        <p className="text-or font-cormorant text-xl mb-2">✓</p>
        <p className="text-texte font-montserrat text-sm">{t(lang, 'devis_success')}</p>
      </div>
    )
  }

  return (
    <div className="border border-gris-mid p-6">
      <h3 className="font-cormorant text-2xl text-texte mb-6">{t(lang, 'devis_title')}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: t(lang, 'devis_name'), type: 'text', required: true },
          { key: 'email', label: t(lang, 'devis_email'), type: 'email', required: true },
          { key: 'phone', label: t(lang, 'devis_phone'), type: 'tel', required: false },
          { key: 'qty', label: t(lang, 'devis_qty'), type: 'number', required: false },
        ].map(({ key, label, type, required }) => (
          <div key={key}>
            <label className="block text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-1.5">
              {label}{required && ' *'}
            </label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key as keyof typeof form, e.target.value)}
              required={required}
              min={type === 'number' ? 1 : undefined}
              className="w-full bg-gris-mid border border-gris-mid text-texte px-3 py-2.5 text-sm font-montserrat focus:outline-none focus:border-or transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="block text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-1.5">
            {t(lang, 'devis_message')}
          </label>
          <textarea
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            rows={4}
            className="w-full bg-gris-mid border border-gris-mid text-texte px-3 py-2.5 text-sm font-montserrat focus:outline-none focus:border-or transition-colors resize-none"
          />
        </div>

        {status === 'error' && (
          <p className="text-red-400 text-xs font-montserrat">{t(lang, 'devis_error')}</p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-or text-noir py-3 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light transition-colors disabled:opacity-50"
        >
          {status === 'sending' ? t(lang, 'devis_sending') : t(lang, 'devis_send')}
        </button>
      </form>
    </div>
  )
}
