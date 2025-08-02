import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-lino-fondoSecundario border-b border-lino-borde text-lino-texto">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-lino-encabezado">
          Lino
        </Link>
        <nav className="space-x-4 text-sm font-medium">
          <Link href="/" className="hover:underline">Inicio</Link>
          <Link href="/tratamientos" className="hover:underline">Tratamientos</Link>
          <Link href="/tips" className="hover:underline">Tips</Link>
          <Link href="/nosotros" className="hover:underline">Quiénes somos</Link>
        </nav>
      </div>
    </header>
  )
}
