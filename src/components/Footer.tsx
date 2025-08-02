export default function Footer() {
  return (
    <footer className="bg-lino-fondoSecundario border-t border-lino-borde text-lino-texto text-sm mt-10">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>&copy; {new Date().getFullYear()} Lino Cosmética. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="/contacto" className="hover:underline">Contacto</a>
          <a href="/certificaciones" className="hover:underline">Certificaciones</a>
        </div>
      </div>
    </footer>
  )
}
