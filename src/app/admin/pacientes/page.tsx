'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Paciente = {
  id: string
  nombre: string
  apellido: string
  telefono: string | null
  cedula: string | null
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido, telefono, cedula')
        .order('nombre', { ascending: true })
      if (error) {
        console.error('Error al obtener pacientes:', error)
      } else {
        setPacientes(data || [])
      }
      setLoading(false)
    }
    fetchPacientes()
  }, [])

  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.telefono ?? ''} ${p.cedula ?? ''}`.toLowerCase()
    return texto.includes(filtro.toLowerCase())
  })

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📋 Lista de pacientes</h1>
        <Button onClick={() => router.push('/admin/pacientes/nuevo-paciente')}>
          ➕ Nuevo paciente
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, cédula o teléfono..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full border border-lino-borde rounded-xl px-3 py-2 bg-white text-lino-texto"
        />
      </div>

      {loading ? (
        <p>Cargando pacientes...</p>
      ) : pacientesFiltrados.length === 0 ? (
        <p>No hay pacientes registrados.</p>
      ) : (
        <ul className="space-y-2">
          {pacientesFiltrados.map((paciente) => (
            <li
              key={paciente.id}
              onClick={() => router.push(`/admin/pacientes/${paciente.id}`)}
              className="p-4 border border-lino-borde rounded-xl bg-white hover:bg-lino-fondo-secundario cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <strong>{paciente.nombre} {paciente.apellido}</strong>
                  <div className="text-sm text-gray-600">
                    {paciente.cedula ? `🪪 ${paciente.cedula}` : ''}
                    {paciente.cedula && paciente.telefono ? ' • ' : ''}
                    {paciente.telefono ? `📞 ${paciente.telefono}` : ''}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
