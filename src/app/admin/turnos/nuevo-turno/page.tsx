'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

export default function NuevoTurnoPage() {
  const [fecha, setFecha] = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const [tratamiento, setTratamiento] = useState('')
  const [pacientes, setPacientes] = useState<{ id: string; nombre: string }[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre')
        .order('nombre')

      if (error) {
        console.error('Error al cargar pacientes:', error)
      } else {
        setPacientes(data || [])
      }
    }

    fetchPacientes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.from('consultas').insert({
      fecha,
      paciente_id: pacienteId,
      tratamiento: { nombre: tratamiento },
    })

    if (error) {
      console.error('Error al guardar el turno:', error)
      setError('No se pudo guardar el turno.')
      return
    }

    router.push('/admin/turnos')
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">➕ Agendar nuevo turno</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">👤 Paciente</label>
          <select
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            required
            className="w-full border border-lino-borde rounded-xl p-2"
          >
            <option value="">Seleccionar paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">📅 Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-lino-borde rounded-xl p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">💆‍♀️ Tratamiento</label>
          <input
            type="text"
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            className="w-full border border-lino-borde rounded-xl p-2"
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit" className="mt-4">Guardar turno</Button>
      </form>
    </main>
  )
}
