'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

export default function NuevoPacientePage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [cedula, setCedula] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      setError(sessionError.message)
      return
    }

    const createdBy = session?.user?.id ?? null

    // Validar cédula duplicada
    if (cedula) {
      const { data: existente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('cedula', cedula)
        .limit(1)
        .maybeSingle()
      if (existente) {
        setError('Ya existe un paciente registrado con esa cédula.')
        return
      }
    }

    const { error: insertError } = await supabase.from('pacientes').insert({
      nombre,
      apellido,
      cedula: cedula || null,
      fecha_nacimiento: fechaNacimiento || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
      notas: notas || null,
      auth_user_id: null, // se vinculará más adelante si el paciente se registra
      created_by: createdBy,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setMensaje('Paciente registrado correctamente.')
    setNombre('')
    setApellido('')
    setCedula('')
    setFechaNacimiento('')
    setTelefono('')
    setEmail('')
    setDireccion('')
    setNotas('')

    setTimeout(() => router.push('/admin/pacientes'), 800)
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">➕ Nuevo paciente</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block mb-1">Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Cédula</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block mb-1">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block mb-1">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block mb-1">Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}

        <Button type="submit" className="mt-2">
          Guardar paciente
        </Button>
      </form>
    </main>
  )
}
