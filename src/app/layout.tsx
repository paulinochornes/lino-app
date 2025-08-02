import '../styles/globals.css'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: 'Lino Cosmética',
  description: 'Agenda, tratamientos y más.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head />
      <body className={`${dmSans.className} bg-lino-fondo text-lino-texto`}>

        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
