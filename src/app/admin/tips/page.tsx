// src/app/tips/page.tsx

import Link from 'next/link'

const tips = [
  {
    slug: 'limpieza-facial',
    titulo: '💧 Limpieza facial diaria',
    resumen: 'Consejos prácticos para mantener una piel fresca y limpia cada día.',
  },
  {
    slug: 'proteccion-solar',
    titulo: '🌞 Protección solar',
    resumen: 'Por qué y cómo aplicar protector solar incluso en días nublados.',
  },
  {
    slug: 'hidratacion',
    titulo: '🧴 Importancia de la hidratación',
    resumen: 'Cómo mantener la piel hidratada durante todo el año.',
  },
]

export default function TipsPage() {
  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">🌿 Tips de Cuidado</h1>
      <p className="mb-6">Consejos rápidos y útiles para el cuidado de la piel.</p>

      <ul className="space-y-4">
        {tips.map((tip) => (
          <li key={tip.slug} className="bg-white border border-lino-borde rounded-xl p-4">
            <Link
              href={`/tips/${tip.slug}`}
              className="text-lg font-semibold text-lino-acento hover:underline"
            >
              {tip.titulo}
            </Link>
            <p className="text-sm mt-1 text-lino-texto">{tip.resumen}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
