'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TurnoForm() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [senia, setSenia] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])

  const horariosPorDia = {
    default: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    sabado: ['10:00', '11:00', '12:00', '13:00'],
    domingo: [],
  }

  useEffect(() => {
    const actualizarHorarios = async () => {
      if (!fecha) return

      const dia = new Date(fecha).getDay()
      const baseHorarios =
        dia === 6 ? horariosPorDia.sabado : dia === 0 ? horariosPorDia.domingo : horariosPorDia.default

      const { data: turnosOcupados } = await supabase
        .from('turnos')
        .select('hora')
        .eq('fecha', fecha)

      const ocupados = turnosOcupados?.map((t) => t.hora) || []

      const disponibles = baseHorarios.filter((h) => !ocupados.includes(h))

      setHorariosDisponibles(disponibles)
      setHora('')
    }

    actualizarHorarios()
  }, [fecha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    // Validación mínima del número
    if (!/^\+?\d{8,15}$/.test(telefono)) {
      setError('Número de teléfono inválido')
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user_id = session?.user.id

    if (!user_id) {
      setError('No se pudo verificar el usuario.')
      return
    }

    const { error } = await supabase.from('turnos').insert({
      nombre,
      telefono,
      fecha,
      hora,
      senia,
      user_id,
    })

    if (error) {
      setError(error.message)
    } else {
      setMensaje('Turno agendado correctamente.')
      setNombre('')
      setTelefono('')
      setFecha('')
      setHora('')
      setSenia(false)
      setHorariosDisponibles([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl w-full">
      <div>
        <label className="block mb-1">Nombre del paciente</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
        />
      </div>

      <div>
        <label className="block mb-1">Teléfono (WhatsApp)</label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          placeholder="+598 91234567"
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
        />
      </div>

      <div>
        <label className="block mb-1">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
        />
      </div>

      {fecha && horariosDisponibles.length > 0 ? (
        <div>
          <label className="block mb-1">Horario disponible</label>
          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
          >
            <option value="">Seleccioná un horario</option>
            {horariosDisponibles.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      ) : fecha ? (
        <p className="text-sm text-red-600">No hay horarios disponibles para esta fecha.</p>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={senia}
          onChange={(e) => setSenia(e.target.checked)}
          className="accent-lino-acento"
        />
        <label>Dejó seña</label>
      </div>

      <button
        type="submit"
        disabled={!hora}
        className="bg-lino-acento text-lino-encabezado font-medium py-2 px-6 rounded hover:opacity-90 transition disabled:opacity-50"
      >
        Agendar turno
      </button>

      {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  )
}
