import React from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Tratamiento {
  nombre?: string
}

interface Consulta {
  id: string
  fecha: string
  tratamiento: Tratamiento | Tratamiento[] | null
}

function getNombreTratamiento(t: Consulta['tratamiento']): string {
  if (!t) return 'Sin datos'
  if (Array.isArray(t)) return t[0]?.nombre ?? 'Sin datos'
  return t.nombre ?? 'Sin datos'
}

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  const pacienteId = params.id

  const { data: paciente, error: errorPaciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', pacienteId)
    .single()

  if (errorPaciente || !paciente) return notFound()

  const { data: consultas } = await supabase
    .from('consultas')
    .select(`
      id,
      fecha,
      tratamiento ( nombre )
    `)
    .eq('paciente_id', pacienteId)
    .order('fecha', { ascending: false })

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-2">👤 {paciente.nombre}</h1>
      <p className="mb-4">📞 {paciente.telefono}</p>

      <Link
        href={`/admin/pacientes/${pacienteId}/nueva-consulta`}
        className="inline-block mb-6 text-lino-acento underline hover:text-purple-600"
      >
        ➕ Agendar nueva consulta
      </Link>

      <h2 className="text-xl font-semibold mb-2">🗓️ Historial de consultas</h2>

      {!consultas || consultas.length === 0 ? (
        <p>No hay consultas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {consultas.map((consulta: Consulta) => (
            <li
              key={consulta.id}
              className="p-4 bg-white border border-lino-borde rounded-xl"
            >
              <strong>{new Date(consulta.fecha).toLocaleDateString()}</strong>
              <br />
              {getNombreTratamiento(consulta.tratamiento)}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
