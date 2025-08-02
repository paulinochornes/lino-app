'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Turno = {
  id: string
  nombre: string
  fecha: string
  hora: string
  senia: boolean
}

export default function TurnoList() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTurnos = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const uid = session?.user.id
      setUserId(uid ?? null)


      if (!uid) {
        setError('No hay usuario autenticado.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('user_id', uid)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setTurnos(data as Turno[])
      }
      setLoading(false)
    }

    fetchTurnos()
  }, [])

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('¿Estás seguro que querés cancelar este turno?')
    if (!confirm) return

    const { error } = await supabase.from('turnos').delete().eq('id', id)

    if (error) {
      alert('Error al eliminar el turno: ' + error.message)
    } else {
      setTurnos((prev) => prev.filter((t) => t.id !== id))
    }
  }

  if (loading) return <p className="text-lino-texto">Cargando turnos...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (turnos.length === 0) return <p>No hay turnos agendados.</p>

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4 text-lino-encabezado">Turnos agendados</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-lino-borde bg-white">
          <thead className="bg-lino-fondoSecundario text-lino-encabezado">
            <tr>
              <th className="py-2 px-4 text-left">Fecha</th>
              <th className="py-2 px-4 text-left">Hora</th>
              <th className="py-2 px-4 text-left">Paciente</th>
              <th className="py-2 px-4 text-left">Seña</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id} className="border-t border-lino-borde text-lino-texto">
                <td className="py-2 px-4">{turno.fecha}</td>
                <td className="py-2 px-4">{turno.hora}</td>
                <td className="py-2 px-4">{turno.nombre}</td>
                <td className="py-2 px-4">{turno.senia ? 'Sí' : 'No'}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDelete(turno.id)}
                    className="text-red-600 hover:underline"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
