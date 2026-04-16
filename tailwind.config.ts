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
        blanc: '#FAF7F2',        // ivoire chaud — fond principal
        texte: '#1A1A1A',        // texte courant
        noir: '#0A0A0A',         // usage interne sombre
        or: '#A67C3C',           // or champagne brossé — titres, CTA, accents
        'or-light': '#C9A96E',   // or chaud — hover
        'or-pale': '#EDD9A3',    // reflet nacré — fonds subtils
        'or-deep': '#8B6508',    // or profond — accents forts
        ivoire: '#F5EFE3',       // fond sections alternées
        carte: '#FEFCF8',        // ivoire très pâle — fond cards
        'carte-border': '#E2D9CC', // bordure cards chaude
        gris: '#EDE8E0',         // warm greige — sections secondaires
        'gris-mid': '#D9D0C4',   // bordures, squelettes
        'gris-light': '#666666', // texte secondaire
        'footer-bg': '#1A1A1A',  // fond footer
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
