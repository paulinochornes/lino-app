'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Paciente = {
  id: string
  nombre: string
  telefono: string
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase.from('pacientes').select('id, nombre, telefono')
      if (error) {
        console.error('Error al obtener pacientes:', error)
      } else {
        setPacientes(data)
      }
      setLoading(false)
    }

    fetchPacientes()
  }, [])

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">📋 Lista de pacientes</h1>

      <div className="mb-6">
        <Button onClick={() => router.push('/admin/pacientes/nuevo-paciente')}>
          ➕ Nuevo paciente
        </Button>
      </div>

      {loading ? (
        <p>Cargando pacientes...</p>
      ) : pacientes.length === 0 ? (
        <p>No hay pacientes registrados.</p>
      ) : (
        <ul className="space-y-2">
          {pacientes.map((paciente) => (
            <li
              key={paciente.id}
              onClick={() => router.push(`/admin/pacientes/${paciente.id}`)}
              className="p-4 border border-lino-borde rounded-xl bg-white hover:bg-lino-fondo-secundario cursor-pointer transition"
            >
              <strong>{paciente.nombre}</strong> <br />
              📞 {paciente.telefono}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
