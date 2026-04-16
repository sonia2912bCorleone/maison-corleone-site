import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { LangProvider } from '@/components/LangProvider'
import AppShell from '@/components/AppShell'

export const viewport: Viewport = {
  themeColor: '#8B6914',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Maison Corleone — Mobilier Haut de Gamme Accès Direct Usine',
  description:
    'Maison Corleone : mobilier de prestige sourcing direct ateliers de référence. Qualité B&B Italia, jusqu\'à −87% sous le prix public. Hôtels, promoteurs, architectes.',
  keywords: 'mobilier luxe, canapé haut de gamme, mobilier contract, mobilier hôtelier, sourcing direct',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Maison Corleone',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Maison Corleone',
    description: 'Accès direct aux ateliers. Qualité B&B Italia. Jusqu\'à −87% sous le prix public.',
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning className="bg-blanc text-texte font-montserrat antialiased">
        <LangProvider>
          <AppShell>{children}</AppShell>
        </LangProvider>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
