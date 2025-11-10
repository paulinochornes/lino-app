'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

type Paciente = { id: string; nombre: string; apellido: string; telefono: string | null }
type Tratamiento = { id: string; nombre: string; duracion_minutos: number | null }
type Profesional = { id: string; full_name: string | null }
type Sala = { id: string; nombre: string }
type HorarioSlot = { hora_inicio: string; hora_fin: string }

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function TurnoForm({ turnoId }: { turnoId?: string }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [fecha, setFecha] = useState('')
  const [fechaHora, setFechaHora] = useState('')
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioSlot[]>([])
  const [pacienteId, setPacienteId] = useState('')
  const [tratamientoId, setTratamientoId] = useState('')
  const [profesionalId, setProfesionalId] = useState('')
  const [salaId, setSalaId] = useState('')
  const [notas, setNotas] = useState('')
  const [estado, setEstado] = useState('pendiente')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  // Cargar datos base
  useEffect(() => {
    const cargarDatos = async () => {
      setError('')

      const [{ data: pac }, { data: trat }, { data: prof }, { data: sal }] = await Promise.all([
        supabase.from('pacientes').select('id, nombre, apellido, telefono').order('nombre'),
        supabase.from('tratamientos').select('id, nombre, duracion_minutos').eq('activo', true).order('nombre'),
        supabase.from('profiles').select('id, full_name, role').eq('role', 'profesional').order('full_name'),
        supabase.from('salas').select('id, nombre').eq('activo', true).order('nombre'),
      ])

      setPacientes(pac || [])
      setTratamientos(trat || [])
      setProfesionales(prof || [])
      setSalas(sal || [])
    }
    cargarDatos()
  }, [])

  // Si es edición, cargar turno existente
  useEffect(() => {
    if (!turnoId) return
    setModoEdicion(true)

    const cargarTurno = async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('id', turnoId)
        .single()

      if (error || !data) {
        setError(error?.message || 'No se encontró el turno.')
        return
      }

      setPacienteId(data.paciente_id)
      setTratamientoId(data.tratamiento_id || '')
      setProfesionalId(data.profesional_id || '')
      setSalaId(data.sala_id || '')
      setFecha(data.fecha_hora?.slice(0, 10))
      setFechaHora(data.fecha_hora)
      setNotas(data.notas || '')
      setEstado(data.estado || 'pendiente')
    }

    cargarTurno()
  }, [turnoId])

  // Cargar horarios disponibles
  useEffect(() => {
    const cargarHorarios = async () => {
      setHorariosDisponibles([])
      setFechaHora('')

      if (!fecha || !tratamientoId || !profesionalId) return

      setCargandoHorarios(true)
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
      setHorariosDisponibles(data || [])
    }

    cargarHorarios()
  }, [fecha, tratamientoId, profesionalId, salaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    if (!pacienteId || !tratamientoId || !profesionalId || !fechaHora) {
      setError('Faltan datos obligatorios.')
      return
    }

    const tratamiento = tratamientos.find((t) => t.id === tratamientoId)
    const duracion = tratamiento?.duracion_minutos ?? 0

    const payload = {
      paciente_id: pacienteId,
      tratamiento_id: tratamientoId,
      profesional_id: profesionalId,
      sala_id: salaId || null,
      fecha_hora: fechaHora,
      duracion_minutos: duracion,
      estado,
      origen: 'admin',
      notas,
    }

    const { error: dbError } = modoEdicion
      ? await supabase.from('turnos').update(payload).eq('id', turnoId)
      : await supabase.from('turnos').insert(payload)

    if (dbError) {
      setError(dbError.message)
      return
    }

    setMensaje(modoEdicion ? 'Turno actualizado correctamente.' : 'Turno agendado correctamente.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl w-full">
      {/* Paciente */}
      <div>
        <label className="block mb-1">Paciente</label>
        <select
          value={pacienteId}
          onChange={(e) => setPacienteId(e.target.value)}
          required
          disabled={modoEdicion}
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
        >
          <option value="">Seleccioná un paciente</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido} {p.telefono ? `- ${p.telefono}` : ''}
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
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
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
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
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
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
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
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
        />
      </div>

      {/* Horarios */}
      <div>
        <label className="block mb-1">Horario disponible</label>
        {cargandoHorarios ? (
          <p className="text-sm">Cargando horarios...</p>
        ) : horariosDisponibles.length > 0 ? (
          <select
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
          >
            <option value="">Seleccioná un horario</option>
            {horariosDisponibles.map((slot) => (
              <option key={slot.hora_inicio} value={slot.hora_inicio}>
                {formatTime(slot.hora_inicio)}
              </option>
            ))}
          </select>
        ) : fecha && tratamientoId && profesionalId ? (
          <p className="text-sm text-red-600">No hay horarios disponibles.</p>
        ) : (
          <p className="text-sm text-gray-500">
            Seleccioná tratamiento, profesional y fecha para ver horarios.
          </p>
        )}
      </div>

      {/* Estado */}
      {modoEdicion && (
        <div>
          <label className="block mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className="block mb-1">Notas (opcional)</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white text-lino-texto"
        />
      </div>

      <button
        type="submit"
        disabled={!fechaHora}
        className="bg-lino-acento text-lino-encabezado font-medium py-2 px-6 rounded hover:opacity-90 transition disabled:opacity-50"
      >
        {modoEdicion ? 'Guardar cambios' : 'Agendar turno'}
      </button>

      {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  )
}
