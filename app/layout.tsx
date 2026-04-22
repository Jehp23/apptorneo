import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Sidebar } from '@/components/sidebar'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Torneo Interno - Sanatorio El Carmen',
  description: 'Torneo deportivo interno del Sanatorio El Carmen - Fixture, posiciones y resultados',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} bg-background`}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
