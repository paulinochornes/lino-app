'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Tratamiento = {
  id: string
  nombre: string
}

export default function EditarTurnoPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [fecha, setFecha] = useState('')
  const [tratamientoId, setTratamientoId] = useState('')
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Obtener datos del turno
  useEffect(() => {
    const fetchTurnoYTratamientos = async () => {
      const [{ data: turno }, { data: tratamientos }] = await Promise.all([
        supabase.from('consultas').select('fecha, tratamiento_id').eq('id', id).single(),
        supabase.from('tratamientos').select('id, nombre')
      ])

      if (turno) {
        setFecha(turno.fecha.slice(0, 16)) // compatible con datetime-local
        setTratamientoId(turno.tratamiento_id)
      }
      if (tratamientos) {
        setTratamientos(tratamientos)
      }

      setLoading(false)
    }

    fetchTurnoYTratamientos()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fecha || !tratamientoId) {
      setError('Completá todos los campos')
      return
    }

    const { error } = await supabase
      .from('consultas')
      .update({ fecha, tratamiento_id: tratamientoId })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      router.push('/admin/turnos')
    }
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar turno</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 font-medium">Fecha y hora</label>
            <input
              type="datetime-local"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2 border border-lino-borde rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tratamiento</label>
            <select
              value={tratamientoId}
              onChange={(e) => setTratamientoId(e.target.value)}
              className="w-full p-2 border border-lino-borde rounded"
            >
              <option value="">Seleccionar tratamiento</option>
              {tratamientos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <Button type="submit">Guardar cambios</Button>
        </form>
      )}
    </main>
  )
}
