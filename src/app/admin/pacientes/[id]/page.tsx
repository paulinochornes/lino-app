'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import Link from 'next/link'
import { Button } from '@/components/UI/Button'

interface Paciente {
  id: string
  nombre: string
  apellido: string
  telefono: string | null
  cedula: string | null
  email: string | null
}

interface Tratamiento {
  nombre: string
}

interface Turno {
  id: string
  fecha_hora: string
  estado: string
  tratamiento: Tratamiento | null
}

interface ConsultaTratamiento {
  tratamiento: Tratamiento
}

interface Profesional {
  full_name: string | null
}

interface Consulta {
  id: string
  fecha: string
  profesional: Profesional | null
  tratamientos: ConsultaTratamiento[]
  notas: string | null
}

export default function PacientePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Datos del paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('id, nombre, apellido, telefono, cedula, email')
          .eq('id', id)
          .maybeSingle()

        if (pacienteError) throw pacienteError
        setPaciente(pacienteData)

        // 2. Turnos con nombre del tratamiento
        const { data: turnosData, error: turnosError } = await supabase
          .from('turnos')
          .select(`
            id,
            fecha_hora,
            estado,
            tratamientos ( nombre )
          `)
          .eq('paciente_id', id)
          .order('fecha_hora', { ascending: false })

        if (turnosError) throw turnosError

        const turnosAdaptados: Turno[] =
          ((turnosData as unknown) as {
            id: string
            fecha_hora: string
            estado: string
            tratamientos: { nombre: string } | { nombre: string }[] | null
          }[] | null)?.map((t) => {
            let tratamiento: Tratamiento | null = null
            if (Array.isArray(t.tratamientos) && t.tratamientos.length > 0) {
              tratamiento = { nombre: t.tratamientos[0].nombre }
            } else if (t.tratamientos && !Array.isArray(t.tratamientos)) {
              tratamiento = { nombre: t.tratamientos.nombre }
            }
            return {
              id: t.id,
              fecha_hora: t.fecha_hora,
              estado: t.estado,
              tratamiento,
            }
          }) ?? []

        setTurnos(turnosAdaptados)

        // 3. Consultas clínicas con tratamientos asociados
        const { data: consultasData, error: consultasError } = await supabase
          .from('consultas')
          .select(`
            id,
            fecha,
            notas,
            profiles ( full_name ),
            consulta_tratamientos ( tratamientos ( nombre ) )
          `)
          .eq('paciente_id', id)
          .order('fecha', { ascending: false })

        if (consultasError) throw consultasError

        const consultasAdaptadas: Consulta[] =
          ((consultasData as unknown) as {
            id: string
            fecha: string
            notas: string | null
            profiles: { full_name: string | null } | null
            consulta_tratamientos:
              | { tratamientos: { nombre: string } | null }[]
              | null
          }[] | null)?.map((c) => ({
            id: c.id,
            fecha: c.fecha,
            profesional: c.profiles ? { full_name: c.profiles.full_name } : null,
            notas: c.notas,
            tratamientos:
              c.consulta_tratamientos?.map((ct) => ({
                tratamiento: { nombre: ct.tratamientos?.nombre || 'Sin nombre' },
              })) ?? [],
          })) ?? []

        setConsultas(consultasAdaptadas)
      } catch (e) {
        console.error('Error al cargar datos del paciente:', e)
      } finally {
        setLoading(false)
      }
    }

    void cargarDatos()
  }, [id])

  if (loading) return <p className="p-6">Cargando datos...</p>
  if (!paciente) return <p className="p-6">Paciente no encontrado.</p>

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto space-y-8">
      {/* Datos del paciente */}
      <section>
        <h1 className="text-2xl font-bold mb-2">
          👤 {paciente.nombre} {paciente.apellido}
        </h1>
        <div className="text-sm text-gray-700 space-y-1">
          {paciente.cedula && <p>🪪 Cédula: {paciente.cedula}</p>}
          {paciente.telefono && <p>📞 Teléfono: {paciente.telefono}</p>}
          {paciente.email && <p>📧 Email: {paciente.email}</p>}
        </div>
      </section>

      {/* Turnos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">📅 Turnos</h2>
          <Button onClick={() => router.push(`/admin/turnos/nuevo-turno`)}>
            ➕ Nuevo turno
          </Button>
        </div>

        {turnos.length === 0 ? (
          <p className="text-sm text-gray-600">No hay turnos registrados.</p>
        ) : (
          <ul className="space-y-2">
            {turnos.map((t) => (
              <li
                key={t.id}
                className="p-4 bg-white border border-lino-borde rounded-xl"
              >
                <strong>
                  {new Date(t.fecha_hora).toLocaleString('es-UY', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </strong>
                <br />
                {t.tratamiento?.nombre ? (
                  <span>💆 {t.tratamiento.nombre}</span>
                ) : (
                  <span>Sin tratamiento asignado</span>
                )}
                <br />
                <span className="text-sm text-gray-600">
                  Estado: {t.estado}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Consultas clínicas */}
      <section className="border-t border-lino-borde pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">🗒️ Consultas clínicas</h2>
          <Link
            href={`/admin/pacientes/${id}/nueva-consulta`}
            className="text-lino-acento underline hover:text-purple-600 text-sm"
          >
            ➕ Registrar nueva consulta
          </Link>
        </div>

        {consultas.length === 0 ? (
          <p className="text-sm text-gray-600">No hay consultas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {consultas.map((c) => (
              <li
                key={c.id}
                className="p-4 bg-white border border-lino-borde rounded-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <strong>
                      {new Date(c.fecha).toLocaleDateString('es-UY')}
                    </strong>
                    <br />
                    👩‍⚕️{' '}
                    {c.profesional?.full_name || 'Profesional no registrado'}
                    <br />
                    💆{' '}
                    {c.tratamientos.length
                      ? c.tratamientos
                          .map((t) => t.tratamiento.nombre)
                          .join(', ')
                      : 'Sin tratamientos'}
                  </div>
                </div>
                {c.notas && (
                  <p className="text-sm text-gray-600 mt-2">📝 {c.notas}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
