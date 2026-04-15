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
        blanc: '#FAFAF8',    // fond principal
        texte: '#1A1A1A',   // texte courant
        noir: '#0A0A0A',    // texte sur bouton doré
        or: '#C9A84C',
        'or-light': '#E8C97A',
        gris: '#F0EDE8',    // fond sections secondaires
        'gris-mid': '#E0DDD8', // bordures, squelettes
        'gris-light': '#666666', // texte secondaire
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
