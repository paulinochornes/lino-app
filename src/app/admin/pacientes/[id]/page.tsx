'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import Link from 'next/link'

interface Paciente {
  id: string
  nombre: string
  telefono: string
  // Podés agregar más campos si los necesitás
}

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

export default function PacientePage() {
  const { id } = useParams() as { id: string }

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPacienteYConsultas = async () => {
      const { data: pacienteData } = await supabase
        .from('pacientes')
        .select('id, nombre, telefono')
        .eq('id', id)
        .single()

      const { data: consultasData } = await supabase
        .from('consultas')
        .select('id, fecha, tratamiento ( nombre )')
        .eq('paciente_id', id)
        .order('fecha', { ascending: false })

      setPaciente(pacienteData)
      setConsultas(consultasData || [])
      setLoading(false)
    }

    fetchPacienteYConsultas()
  }, [id])

  if (loading) {
    return <p className="p-6">Cargando datos...</p>
  }

  if (!paciente) {
    return <p className="p-6">Paciente no encontrado.</p>
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-2">👤 {paciente.nombre}</h1>
      <p className="mb-4">📞 {paciente.telefono}</p>

      <Link
        href={`/admin/pacientes/${id}/nueva-consulta`}
        className="inline-block mb-6 text-lino-acento underline hover:text-purple-600"
      >
        ➕ Agendar nueva consulta
      </Link>

      <h2 className="text-xl font-semibold mb-2">🗓️ Historial de consultas</h2>

      {!consultas.length ? (
        <p>No hay consultas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {consultas.map((consulta) => (
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
