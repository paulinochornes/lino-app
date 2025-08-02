'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/tratamientos', label: 'Tratamientos' },
    { href: '/tips', label: 'Tips' },
    { href: '/quienes-somos', label: 'Quiénes somos' },
    { href: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="bg-lino-fondoSecundario border-b border-lino-borde text-lino-texto">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
  <img
    src="/logo.png"
    alt="Lino logo"
    className="h-8 w-auto"
  />
  <span className="text-xl font-semibold text-lino-encabezado hidden sm:inline">
    Lino
  </span>
</Link>


        {/* Versión desktop */}
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:underline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="bg-lino-acento text-lino-encabezado px-4 py-1.5 rounded-full hover:opacity-90 transition text-sm"
          >
            Administrar
          </Link>
        </nav>

        {/* Versión móvil */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-lino-encabezado"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú desplegable mobile */}
      {open && (
        <nav className="md:hidden px-4 pb-4 flex flex-col gap-2 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:underline"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="bg-lino-acento text-lino-encabezado px-4 py-2 rounded-full hover:opacity-90 transition text-center"
            onClick={() => setOpen(false)}
          >
            Administrar
          </Link>
        </nav>
      )}
    </header>
  )
}
