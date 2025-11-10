'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Tratamiento = {
  id: string
  nombre: string
  duracion_minutos: number | null
  precio_base: number | null
}

type Profesional = {
  id: string
  full_name: string | null
}

type Turno = {
  id: string
  fecha_hora: string
}

type Paciente = {
  id: string
  nombre: string
  apellido: string
}

// 👇 Eliminamos tipado explícito de la firma para evitar el error PageProps
export default function NuevaConsultaPage(props: any) {
  const pacienteId = props?.params?.id as string
  const router = useRouter()

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])

  const [profesionalId, setProfesionalId] = useState('')
  const [turnoId, setTurnoId] = useState('')
  const [fechaConsulta, setFechaConsulta] = useState(() => new Date().toISOString().split('T')[0])

  const [motivo, setMotivo] = useState('')
  const [antecedentes, setAntecedentes] = useState('')
  const [contraindicaciones, setContraindicaciones] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [tratamientosSeleccionados, setTratamientosSeleccionados] = useState<string[]>([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      setError('')

      // Paciente
      const { data: pac, error: errPac } = await supabase
        .from('pacientes')
        .select('id, nombre, apellido')
        .eq('id', pacienteId)
        .single()

      if (errPac) {
        setError(errPac.message)
        return
      }

      // Profesionales habilitados
      const { data: prof, error: errProf } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['owner', 'admin', 'profesional'])
        .order('full_name')

      if (errProf) {
        setError(errProf.message)
        return
      }

      // Tratamientos activos
      const { data: trat, error: errTrat } = await supabase
        .from('tratamientos')
        .select('id, nombre, duracion_minutos, precio_base')
        .eq('activo', true)
        .order('nombre')

      if (errTrat) {
        setError(errTrat.message)
        return
      }

      // Turnos del paciente pendientes o recientes
      const { data: turnosData, error: turnosError } = await supabase
        .from('turnos')
        .select('id, fecha_hora')
        .eq('paciente_id', pacienteId)
        .in('estado', ['pendiente', 'realizado'])
        .order('fecha_hora', { ascending: false })

      if (turnosError) {
        setError(turnosError.message)
        return
      }

      setPaciente(pac)
      setProfesionales((prof || []).map((p) => ({ id: p.id, full_name: p.full_name })))
      setTratamientos(trat || [])
      setTurnos(turnosData || [])
    }

    void cargarDatos()
  }, [pacienteId])

  const toggleTratamiento = (id: string) => {
    setTratamientosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!profesionalId) {
      setError('Seleccioná un profesional.')
      return
    }

    // 1) Crear consulta
    const { data: consulta, error: consultaError } = await supabase
      .from('consultas')
      .insert({
        paciente_id: pacienteId,
        profesional_id: profesionalId,
        turno_id: turnoId || null,
        fecha: fechaConsulta,
        motivo: motivo || null,
        antecedentes: antecedentes || null,
        contraindicaciones: contraindicaciones || null,
        observaciones: observaciones || null,
      })
      .select()
      .single()

    if (consultaError || !consulta) {
      setError(consultaError?.message || 'Error al crear la consulta.')
      return
    }

    // 2) Crear consulta_tratamientos
    if (tratamientosSeleccionados.length > 0) {
      const filas = tratamientosSeleccionados.map((id) => {
        const base = tratamientos.find((t) => t.id === id)
        return {
          consulta_id: consulta.id,
          tratamiento_id: id,
          precio_aplicado: base?.precio_base ?? null,
          duracion_minutos: base?.duracion_minutos ?? null,
        }
      })

      const { error: ctError } = await supabase.from('consulta_tratamientos').insert(filas)

      if (ctError) {
        setError(ctError.message)
        return
      }
    }

    setMensaje('Consulta guardada correctamente.')
    router.push(`/admin/pacientes/${pacienteId}`)
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">📝 Nueva consulta</h1>
      {paciente && (
        <p className="mb-4 text-sm">
          Paciente:{' '}
          <span className="font-semibold">
            {paciente.nombre} {paciente.apellido}
          </span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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

        {/* Fecha de consulta */}
        <div>
          <label className="block mb-1">Fecha de la consulta</label>
          <input
            type="date"
            value={fechaConsulta}
            onChange={(e) => setFechaConsulta(e.target.value)}
            required
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        {/* Turno asociado */}
        <div>
          <label className="block mb-1">Turno asociado (opcional)</label>
          <select
            value={turnoId}
            onChange={(e) => setTurnoId(e.target.value)}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          >
            <option value="">Sin turno asociado</option>
            {turnos.map((t) => (
              <option key={t.id} value={t.id}>
                {new Date(t.fecha_hora).toLocaleString('es-UY', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Datos clínicos */}
        <div>
          <label className="block mb-1">Motivo de consulta</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={2}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block mb-1">Antecedentes</label>
          <textarea
            value={antecedentes}
            onChange={(e) => setAntecedentes(e.target.value)}
            rows={2}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block mb-1">Contraindicaciones</label>
          <textarea
            value={contraindicaciones}
            onChange={(e) => setContraindicaciones(e.target.value)}
            rows={2}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          />
        </div>

        {/* Tratamientos realizados */}
        <div>
          <label className="block mb-1">Tratamientos realizados</label>
          <div className="border border-lino-borde rounded px-3 py-2 bg-white max-h-64 overflow-auto space-y-1">
            {tratamientos.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tratamientosSeleccionados.includes(t.id)}
                  onChange={() => toggleTratamiento(t.id)}
                  className="accent-lino-acento"
                />
                <span>
                  {t.nombre}{' '}
                  {t.duracion_minutos ? (
                    <span className="text-xs text-lino-texto/70">
                      ({t.duracion_minutos} min)
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}

        <Button type="submit">Guardar consulta</Button>
      </form>
    </main>
  )
}
