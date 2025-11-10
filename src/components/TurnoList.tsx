'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import Link from 'next/link'

type Turno = {
  id: string
  fecha_hora: string
  estado: string
  paciente: { nombre: string; apellido: string } | null
  profesional: { full_name: string | null } | null
  tratamiento: { nombre: string } | null
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function TurnoList() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    const cargarTurnos = async () => {
      setError('')

      const { data, error } = await supabase
        .from('turnos')
        .select(
          `
          id,
          fecha_hora,
          estado,
          paciente:pacientes ( nombre, apellido ),
          profesional:profiles!profesional_id ( full_name ),
          tratamiento:tratamientos ( nombre )
        `,
        )
        .order('fecha_hora', { ascending: true })

      if (error) {
        setError(error.message)
        return
      }

      const normalizados: Turno[] =
        data?.map((t: any) => ({
          id: t.id,
          fecha_hora: t.fecha_hora,
          estado: t.estado,
          paciente: t.paciente ?? null,
          profesional: t.profesional ?? null,
          tratamiento: t.tratamiento ?? null,
        })) ?? []

      setTurnos(normalizados)
    }

    cargarTurnos()
  }, [])

  const hoy = new Date()
  const futuros = turnos.filter((t) => new Date(t.fecha_hora) >= hoy)
  const pasados = turnos.filter((t) => new Date(t.fecha_hora) < hoy)

  const filtrar = (lista: Turno[]) =>
    lista.filter((t) => {
      const texto = `${t.paciente?.nombre ?? ''} ${t.paciente?.apellido ?? ''} ${t.tratamiento?.nombre ?? ''}`.toLowerCase()
      return texto.includes(filtro.toLowerCase())
    })

  return (
    <section className="space-y-4">
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <input
        type="text"
        placeholder="Buscar por paciente o tratamiento..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full border border-lino-borde rounded-xl px-3 py-2 bg-white text-sm"
      />

      {/* Turnos próximos */}
      <div>
        <h2 className="text-lg font-semibold mt-4 mb-2">Próximos turnos</h2>
        {filtrar(futuros).length === 0 ? (
          <p className="text-sm text-lino-texto/70">No hay turnos próximos.</p>
        ) : (
          filtrar(futuros).map((t) => (
            <div
              key={t.id}
              className="border border-lino-borde rounded-xl px-3 py-2 flex justify-between items-center bg-white"
            >
              <div>
                <div className="font-medium">
                  {t.paciente
                    ? `${t.paciente.nombre} ${t.paciente.apellido}`
                    : 'Sin paciente'}
                </div>
                <div className="text-sm text-lino-texto/70">
                  {formatDateTime(t.fecha_hora)}
                </div>
                {t.tratamiento && (
                  <div className="text-xs text-lino-texto/60">
                    💆 {t.tratamiento.nombre}
                  </div>
                )}
                {t.profesional && (
                  <div className="text-xs text-lino-texto/60">
                    👩‍⚕️ {t.profesional.full_name || 'Sin profesional'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded bg-lino-fondo text-lino-texto/80">
                  {t.estado}
                </span>
                <Link
                  href={`/admin/turnos/${t.id}/editar`}
                  className="text-xs underline text-lino-acento"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Turnos pasados */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-lino-texto/70">
          Mostrar turnos pasados ({pasados.length})
        </summary>
        <div className="mt-2 space-y-2">
          {filtrar(pasados).map((t) => (
            <div
              key={t.id}
              className="border border-lino-borde rounded-xl px-3 py-2 flex justify-between items-center bg-lino-fondo-secundario"
            >
              <div>
                <div className="font-medium">
                  {t.paciente
                    ? `${t.paciente.nombre} ${t.paciente.apellido}`
                    : 'Sin paciente'}
                </div>
                <div className="text-sm text-lino-texto/70">
                  {formatDateTime(t.fecha_hora)}
                </div>
                {t.tratamiento && (
                  <div className="text-xs text-lino-texto/60">
                    💆 {t.tratamiento.nombre}
                  </div>
                )}
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                {t.estado}
              </span>
            </div>
          ))}
        </div>
      </details>
    </section>
  )
}
