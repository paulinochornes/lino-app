'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Tratamiento = {
  id: string
  nombre: string
}

export default function NuevaConsultaPage() {
  const router = useRouter()
  const { id: pacienteId } = useParams() as { id: string }

  const [fecha, setFecha] = useState('')
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [tratamientoId, setTratamientoId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTratamientos = async () => {
      const { data, error } = await supabase.from('tratamientos').select('id, nombre')
      if (error) {
        console.error('Error al obtener tratamientos:', error)
      } else {
        setTratamientos(data)
      }
    }

    fetchTratamientos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fecha || !tratamientoId) {
      setError('Completá todos los campos')
      return
    }

    const { error } = await supabase.from('consultas').insert({
      paciente_id: pacienteId,
      fecha,
      tratamiento_id: tratamientoId
    })

    if (error) {
      setError(error.message)
    } else {
      router.push(`/admin/pacientes/${pacienteId}`)
    }
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">➕ Nueva consulta</h1>

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

        <Button type="submit">Guardar consulta</Button>
      </form>
    </main>
  )
}
