'use client'

import Link from 'next/link'
import { useLang } from '@/components/LangProvider'
import { t } from '@/lib/i18n'

const STATS = [
  { fr: 'jusqu'à −87%', en: 'up to −87%', label_fr: 'sous le prix public', label_en: 'below retail price' },
  { fr: '500+', en: '500+', label_fr: 'références catalogue', label_en: 'catalogue references' },
  { fr: '72h', en: '72h', label_fr: 'délai de réponse devis', label_en: 'quote response time' },
]

const POSITIONING = [
  {
    fr: { title: 'Accès Direct Ateliers', body: 'Zéro intermédiaire. Nous sourceons directement auprès des ateliers de référence pour vous garantir le meilleur rapport qualité-prix du marché.' },
    en: { title: 'Direct Workshop Access', body: 'Zero middlemen. We source directly from reference workshops to guarantee you the best quality-to-price ratio on the market.' },
  },
  {
    fr: { title: 'Qualité Contract', body: 'Mobilier pensé pour l\'usage intensif hôtelier : structures renforcées, matériaux certifiés, finitions dignes des maisons Minotti et B&B Italia.' },
    en: { title: 'Contract Quality', body: 'Furniture designed for intensive hotel use: reinforced structures, certified materials, finishes worthy of Minotti and B&B Italia.' },
  },
  {
    fr: { title: 'Service Sur-Mesure', body: 'Chaque projet bénéficie d\'un interlocuteur dédié, d\'un catalogue personnalisé et d\'un devis sous 72h.' },
    en: { title: 'Bespoke Service', body: 'Every project has a dedicated contact, a personalised catalogue, and a quote within 72 hours.' },
  },
]

export default function HomePage() {
  const { lang } = useLang()

  return (
    <>
      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-blanc">
        {/* Background grid ornament */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#8B6914 1px, transparent 1px), linear-gradient(90deg, #8B6914 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-or/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Eyebrow */}
          <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-8">
            {lang === 'fr' ? 'Mobilier de Prestige · Sourcing Direct' : 'Premium Furniture · Direct Sourcing'}
          </p>

          {/* Main headline */}
          <h1 className="font-cormorant text-5xl sm:text-7xl lg:text-8xl text-texte leading-tight mb-4">
            {t(lang, 'hero_tagline')}
          </h1>
          <h1 className="font-cormorant text-5xl sm:text-7xl lg:text-8xl text-or leading-tight mb-8">
            {t(lang, 'hero_tagline2')}
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px bg-or/40 w-16" />
            <div className="w-1.5 h-1.5 bg-or rotate-45" />
            <div className="h-px bg-or/40 w-16" />
          </div>

          {/* Subtitle */}
          <p className="text-gris-light font-montserrat text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-12">
            {t(lang, 'hero_subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogue"
              className="inline-block bg-or text-white px-10 py-4 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light transition-colors"
            >
              {t(lang, 'hero_cta')}
            </Link>
            <Link
              href="/#contact"
              className="inline-block border border-or/60 text-or px-10 py-4 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or/10 transition-colors"
            >
              {t(lang, 'hero_cta2')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-or/40" />
          <div className="w-4 h-px bg-or/40" />
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-y border-gris-mid bg-gris py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="font-cormorant text-3xl sm:text-4xl text-or mb-1">
                  {lang === 'fr' ? s.fr : s.en}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gris-light font-montserrat tracking-widest uppercase">
                  {lang === 'fr' ? s.label_fr : s.label_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONING */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-4">
              {lang === 'fr' ? 'Notre Différence' : 'Our Difference'}
            </p>
            <h2 className="font-cormorant text-4xl sm:text-5xl text-texte">
              {lang === 'fr' ? 'L\'excellence sans compromis' : 'Excellence without compromise'}
            </h2>
            <div className="w-12 h-px bg-or mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {POSITIONING.map((item, i) => (
              <div key={i} className="border border-gris-mid p-8 hover:border-or/40 transition-colors">
                <div className="w-6 h-px bg-or mb-6" />
                <h3 className="font-cormorant text-2xl text-texte mb-4">
                  {lang === 'fr' ? item.fr.title : item.en.title}
                </h3>
                <p className="text-gris-light text-xs font-montserrat leading-relaxed">
                  {lang === 'fr' ? item.fr.body : item.en.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA CATALOGUE */}
      <section className="py-24 px-4 bg-gris border-y border-gris-mid">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-4">
            {lang === 'fr' ? '500+ références disponibles' : '500+ references available'}
          </p>
          <h2 className="font-cormorant text-4xl sm:text-5xl text-texte mb-6">
            {lang === 'fr' ? 'Explorez notre catalogue' : 'Explore our catalogue'}
          </h2>
          <p className="text-gris-light font-montserrat text-sm mb-10 leading-relaxed">
            {lang === 'fr'
              ? 'Salons, chambres, extérieur, salle à manger — chaque pièce est sélectionnée pour sa qualité contract et son esthétique premium.'
              : 'Living rooms, bedrooms, outdoor, dining rooms — every piece is selected for its contract quality and premium aesthetics.'}
          </p>
          <Link
            href="/catalogue"
            className="inline-block bg-or text-white px-12 py-4 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light transition-colors"
          >
            {lang === 'fr' ? 'Voir le catalogue complet' : 'View full catalogue'}
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-or text-[10px] font-montserrat tracking-[0.35em] uppercase mb-4">Contact</p>
          <h2 className="font-cormorant text-4xl sm:text-5xl text-texte mb-6">
            {lang === 'fr' ? 'Discutons de votre projet' : 'Let\'s discuss your project'}
          </h2>
          <div className="w-10 h-px bg-or mx-auto mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="border border-gris-mid p-6">
              <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-2">Email</p>
              <a href="mailto:contact@maisoncorleone.com" className="text-texte font-montserrat text-sm hover:text-or transition-colors">
                contact@maisoncorleone.com
              </a>
            </div>
            <div className="border border-gris-mid p-6">
              <p className="text-[10px] text-gris-light font-montserrat tracking-widest uppercase mb-2">
                {lang === 'fr' ? 'Site' : 'Website'}
              </p>
              <a href="https://www.maisoncorleone.com" className="text-texte font-montserrat text-sm hover:text-or transition-colors">
                www.maisoncorleone.com
              </a>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/catalogue"
              className="inline-block border border-or/60 text-or px-10 py-4 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or/10 transition-colors"
            >
              {lang === 'fr' ? 'Demander un accès catalogue' : 'Request catalogue access'}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
