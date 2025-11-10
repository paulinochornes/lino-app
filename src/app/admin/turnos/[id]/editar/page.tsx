'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Tratamiento = {
  id: string
  nombre: string
}

type Turno = {
  id: string
  fecha_hora: string
  estado: string
  tratamiento_id: string | null
}

export default function EditarTurnoPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [turno, setTurno] = useState<Turno | null>(null)
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [fechaHora, setFechaHora] = useState('')
  const [tratamientoId, setTratamientoId] = useState('')
  const [estado, setEstado] = useState('pendiente')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTurnoYTratamientos = async () => {
      setError('')

      // Obtener turno y tratamientos en paralelo
      const [{ data: turnoData, error: turnoError }, { data: tratamientosData, error: tratamientosError }] =
        await Promise.all([
          supabase.from('turnos').select('id, fecha_hora, estado, tratamiento_id').eq('id', id).maybeSingle(),
          supabase.from('tratamientos').select('id, nombre').eq('activo', true).order('nombre'),
        ])

      if (turnoError) {
        setError(turnoError.message)
      } else if (turnoData) {
        setTurno(turnoData)
        setFechaHora(turnoData.fecha_hora.slice(0, 16)) // ISO -> datetime-local
        setTratamientoId(turnoData.tratamiento_id || '')
        setEstado(turnoData.estado || 'pendiente')
      }

      if (tratamientosError) {
        setError(tratamientosError.message)
      } else {
        setTratamientos(tratamientosData || [])
      }

      setLoading(false)
    }

    fetchTurnoYTratamientos()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fechaHora) {
      setError('Debe seleccionar fecha y hora.')
      return
    }

    const { error: updateError } = await supabase
      .from('turnos')
      .update({
        fecha_hora: fechaHora,
        tratamiento_id: tratamientoId || null,
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/admin/turnos')
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar turno</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : !turno ? (
        <p>No se encontró el turno.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 font-medium">Fecha y hora</label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              required
              className="w-full p-2 border border-lino-borde rounded bg-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tratamiento</label>
            <select
              value={tratamientoId}
              onChange={(e) => setTratamientoId(e.target.value)}
              className="w-full p-2 border border-lino-borde rounded bg-white"
            >
              <option value="">Sin tratamiento asignado</option>
              {tratamientos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Estado del turno</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-2 border border-lino-borde rounded bg-white"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit">Guardar cambios</Button>
        </form>
      )}
    </main>
  )
}
