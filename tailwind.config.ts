import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blanc: '#FAFAF8',       // fond principal
        texte: '#1A1A1A',       // texte courant
        noir: '#0A0A0A',        // usage interne sombre
        or: '#8B6914',          // or foncé — titres, CTA, accents
        'or-light': '#C9A84C',  // or clair — hover
        'or-pale': '#E8C97A',   // or très clair — fonds subtils
        carte: '#FFFFFF',       // fond cards produits
        'carte-border': '#E8E3DC', // bordure cards
        gris: '#F0EDE8',        // fond sections secondaires
        'gris-mid': '#E0DDD8',  // bordures, squelettes
        'gris-light': '#666666',// texte secondaire
        'footer-bg': '#1A1A1A', // fond footer
        'footer-text': '#AAAAAA', // texte footer
      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'Georgia', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-noir': 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
}

export default config
