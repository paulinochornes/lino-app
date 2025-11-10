// src/app/admin/turnos/[id]/editar/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Paciente = {
  id: string
  nombre: string
  apellido: string
}

type Tratamiento = {
  id: string
  nombre: string
  duracion_minutos: number | null
}

type Profesional = {
  id: string
  full_name: string | null
}

type Sala = {
  id: string
  nombre: string
}

type HorarioSlot = {
  hora_inicio: string
  hora_fin: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function toDateInputValue(iso: string) {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function EditarTurnoPage({ params }: { params: { id: string } }) {
  const turnoId = params.id
  const router = useRouter()

  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [salas, setSalas] = useState<Sala[]>([])

  const [pacienteId, setPacienteId] = useState('')
  const [tratamientoId, setTratamientoId] = useState('')
  const [profesionalId, setProfesionalId] = useState('')
  const [salaId, setSalaId] = useState('')
  const [fecha, setFecha] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaOriginal, setHoraOriginal] = useState('')
  const [estado, setEstado] = useState<'pendiente' | 'confirmado' | 'asistio' | 'no_asistio' | 'cancelado'>('pendiente')
  const [notas, setNotas] = useState('')

  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioSlot[]>([])
  const [cargandoHorarios, setCargandoHorarios] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const cargarTurnoYDatos = async () => {
      setError('')
      setCargando(true)

      // turno
      const { data: turno, error: errTurno } = await supabase
        .from('turnos')
        .select('id, paciente_id, tratamiento_id, profesional_id, sala_id, fecha_hora, estado, notas')
        .eq('id', turnoId)
        .single()

      if (errTurno || !turno) {
        setError(errTurno?.message || 'No se pudo cargar el turno.')
        setCargando(false)
        return
      }

      // catálogos
      const { data: pac, error: errPac } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido')
        .order('nombre')

      if (errPac) {
        setError(errPac.message)
        setCargando(false)
        return
      }

      const { data: trat, error: errTrat } = await supabase
        .from('tratamientos')
        .select('id, nombre, duracion_minutos')
        .eq('activo', true)
        .order('nombre')

      if (errTrat) {
        setError(errTrat.message)
        setCargando(false)
        return
      }

      const { data: prof, error: errProf } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'profesional')
        .order('full_name')

      if (errProf) {
        setError(errProf.message)
        setCargando(false)
        return
      }

      const { data: sal, error: errSal } = await supabase
        .from('salas')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')

      if (errSal) {
        setError(errSal.message)
        setCargando(false)
        return
      }

      setPacientes(pac || [])
      setTratamientos(trat || [])
      setProfesionales((prof || []).map((p) => ({ id: p.id, full_name: p.full_name })))
      setSalas(sal || [])

      setPacienteId(turno.paciente_id)
      setTratamientoId(turno.tratamiento_id || '')
      setProfesionalId(turno.profesional_id || '')
      setSalaId(turno.sala_id || '')
      setFecha(toDateInputValue(turno.fecha_hora))
      setHoraInicio(turno.fecha_hora)
      setHoraOriginal(turno.fecha_hora)
      setEstado(turno.estado)
      setNotas(turno.notas || '')

      setCargando(false)
    }

    cargarTurnoYDatos()
  }, [turnoId])

  useEffect(() => {
    const cargarHorarios = async () => {
      setHorariosDisponibles([])
      if (!fecha || !tratamientoId || !profesionalId) return
      setCargandoHorarios(true)
      setError('')

      const { data, error } = await supabase.rpc('obtener_horarios_disponibles', {
        p_fecha: fecha,
        p_profesional_id: profesionalId,
        p_sala_id: salaId || null,
        p_tratamiento_id: tratamientoId,
      })

      setCargandoHorarios(false)

      if (error) {
        setError(error.message)
        return
      }

      let slots: HorarioSlot[] = data || []

      // asegurar que el horario original aparezca como opción
      if (horaOriginal && fecha === toDateInputValue(horaOriginal)) {
        const yaExiste = slots.some((s) => s.hora_inicio === horaOriginal)
        if (!yaExiste) {
          slots = [...slots, { hora_inicio: horaOriginal, hora_fin: horaOriginal }]
          slots.sort((a, b) => new Date(a.hora_inicio).getTime() - new Date(b.hora_inicio).getTime())
        }
      }

      setHorariosDisponibles(slots)
    }

    cargarHorarios()
  }, [fecha, tratamientoId, profesionalId, salaId, horaOriginal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!pacienteId || !tratamientoId || !profesionalId || !fecha || !horaInicio) {
      setError('Faltan datos obligatorios.')
      return
    }

    const tratamiento = tratamientos.find((t) => t.id === tratamientoId)
    const duracion = tratamiento?.duracion_minutos ?? 0

    const { error: updError } = await supabase
      .from('turnos')
      .update({
        paciente_id: pacienteId,
        tratamiento_id: tratamientoId,
        profesional_id: profesionalId,
        sala_id: salaId || null,
        fecha_hora: horaInicio,
        duracion_minutos: duracion,
        estado,
        notas,
      })
      .eq('id', turnoId)

    if (updError) {
      setError(updError.message)
      return
    }

    setMensaje('Turno actualizado.')
    router.push('/admin/turnos')
  }

  if (cargando) {
    return (
      <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
        <p>Cargando turno...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar turno</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* Paciente */}
        <div>
          <label className="block mb-1">Paciente</label>
          <select
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          >
            <option value="">Seleccioná un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Tratamiento */}
        <div>
          <label className="block mb-1">Tratamiento</label>
          <select
            value={tratamientoId}
            onChange={(e) => setTratamientoId(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          >
            <option value="">Seleccioná un tratamiento</option>
            {tratamientos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} {t.duracion_minutos ? `(${t.duracion_minutos} min)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Profesional */}
        <div>
          <label className="block mb-1">Profesional</label>
          <select
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          >
            <option value="">Seleccioná un profesional</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>

        {/* Sala */}
        <div>
          <label className="block mb-1">Sala / cabina (opcional)</label>
          <select
            value={salaId}
            onChange={(e) => setSalaId(e.target.value)}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          >
            <option value="">Sin sala específica</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        {/* Horarios */}
        <div>
          <label className="block mb-1">Horario</label>
          {cargandoHorarios ? (
            <p className="text-sm">Cargando horarios...</p>
          ) : horariosDisponibles.length > 0 ? (
            <select
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            >
              <option value="">Seleccioná un horario</option>
              {horariosDisponibles.map((s) => (
                <option key={s.hora_inicio} value={s.hora_inicio}>
                  {formatTime(s.hora_inicio)}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-red-600">
              No hay horarios disponibles para esta combinación.
            </p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value as typeof estado)
            }
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="asistio">Asistió</option>
            <option value="no_asistio">No asistió</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Notas */}
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

        <Button type="submit">Guardar cambios</Button>
      </form>
    </main>
  )
}
