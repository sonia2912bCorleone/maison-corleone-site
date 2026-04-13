import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-cormorant text-8xl text-or/30 mb-4">404</p>
        <h1 className="font-cormorant text-3xl text-white mb-2">Page introuvable</h1>
        <div className="w-10 h-px bg-or mx-auto mb-6" />
        <p className="text-gris-light text-sm font-montserrat mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block bg-or text-noir px-8 py-3 font-montserrat text-xs font-semibold tracking-widest uppercase hover:bg-or-light transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
