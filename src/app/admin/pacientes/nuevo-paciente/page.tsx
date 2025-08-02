'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

export default function NuevoPacientePage() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !telefono) {
      setError('Por favor completá todos los campos.')
      return
    }

    const { error } = await supabase.from('pacientes').insert({ nombre, telefono })

    if (error) {
      setError(error.message)
    } else {
      router.push('/admin/pacientes')
    }
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">➕ Nuevo paciente</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-lino-borde rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full p-2 border border-lino-borde rounded"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <Button type="submit">Guardar paciente</Button>
      </form>
    </main>
  )
}
