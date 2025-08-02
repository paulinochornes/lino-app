export default function HomePage() {
  return (
    <section className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-semibold text-lino-encabezado mb-4">
          Bienvenido a Lino Cosmética
        </h1>
        <p className="text-base md:text-lg text-lino-texto mb-6">
          Cuidamos tu piel con dedicación, conocimiento y productos conscientes.
        </p>
        <a
          href="/tratamientos"
          className="inline-block bg-lino-acento text-lino-encabezado font-medium py-2 px-6 rounded-full hover:opacity-90 transition"
        >
          Ver tratamientos
        </a>
      </div>
    </section>
  )
}
