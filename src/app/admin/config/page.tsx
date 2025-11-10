'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Excepcion = {
  id: string
  fecha: string
  tipo: 'cerrado' | 'bloqueado'
  hora_inicio: string | null
  hora_fin: string | null
  motivo: string | null
}

export default function ConfigPage() {
  const [horarioInicio, setHorarioInicio] = useState('10:00')
  const [horarioFin, setHorarioFin] = useState('20:00')
  const [intervalo, setIntervalo] = useState(15)
  const [recordatorio, setRecordatorio] = useState(60)
  const [colorPrimario, setColorPrimario] = useState('#d19bbc')
  const [colorSecundario, setColorSecundario] = useState('#f8e5ee')

  const [excepciones, setExcepciones] = useState<Excepcion[]>([])
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevoTipo, setNuevoTipo] = useState<'cerrado' | 'bloqueado'>('cerrado')
  const [horaInicioBloque, setHoraInicioBloque] = useState('')
  const [horaFinBloque, setHoraFinBloque] = useState('')
  const [motivo, setMotivo] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  // Cargar configuración y excepciones
  useEffect(() => {
    const cargar = async () => {
      const { data: conf, error: errConf } = await supabase.from('configuracion').select('*').limit(1).single()
      if (!errConf && conf) {
        setHorarioInicio(conf.horario_inicio)
        setHorarioFin(conf.horario_fin)
        setIntervalo(conf.intervalo_minutos)
        setRecordatorio(conf.recordatorios_anticipacion_minutos)
        setColorPrimario(conf.color_primario)
        setColorSecundario(conf.color_secundario)
      }

      const { data: exc, error: errExc } = await supabase
        .from('agenda_excepciones')
        .select('id, fecha, tipo, hora_inicio, hora_fin, motivo')
        .order('fecha', { ascending: true })
      if (errExc) {
        console.error(errExc)
      } else {
        setExcepciones(exc || [])
      }
    }
    cargar()
  }, [])

  // Guardar configuración general
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    const { error } = await supabase
      .from('configuracion')
      .update({
        horario_inicio: horarioInicio,
        horario_fin: horarioFin,
        intervalo_minutos: intervalo,
        recordatorios_anticipacion_minutos: recordatorio,
        color_primario: colorPrimario,
        color_secundario: colorSecundario,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      setError(error.message)
      return
    }

    setMensaje('Configuración guardada.')
  }

  // Crear nueva excepción
  const handleAddExcepcion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!nuevaFecha) {
      setError('Seleccioná una fecha.')
      return
    }

    const { error } = await supabase.from('agenda_excepciones').insert({
      fecha: nuevaFecha,
      tipo: nuevoTipo,
      hora_inicio: nuevoTipo === 'bloqueado' ? horaInicioBloque || null : null,
      hora_fin: nuevoTipo === 'bloqueado' ? horaFinBloque || null : null,
      motivo: motivo || null,
    })

    if (error) {
      setError(error.message)
      return
    }

    setMensaje('Excepción agregada.')
    setNuevaFecha('')
    setNuevoTipo('cerrado')
    setHoraInicioBloque('')
    setHoraFinBloque('')
    setMotivo('')

    const { data: exc } = await supabase
      .from('agenda_excepciones')
      .select('id, fecha, tipo, hora_inicio, hora_fin, motivo')
      .order('fecha', { ascending: true })
    setExcepciones(exc || [])
  }

  // Eliminar excepción
  const eliminarExcepcion = async (id: string) => {
    const { error } = await supabase.from('agenda_excepciones').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setExcepciones((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto space-y-12">
      <h1 className="text-2xl font-bold">⚙️ Configuración general</h1>

      {/* Configuración básica */}
      <section>
        <form onSubmit={handleSaveConfig} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Horario de inicio</label>
              <input
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
                required
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block mb-1">Horario de fin</label>
              <input
                type="time"
                value={horarioFin}
                onChange={(e) => setHorarioFin(e.target.value)}
                required
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Intervalo (min)</label>
              <input
                type="number"
                min={5}
                value={intervalo}
                onChange={(e) => setIntervalo(Number(e.target.value))}
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block mb-1">Recordatorio antes (min)</label>
              <input
                type="number"
                min={5}
                value={recordatorio}
                onChange={(e) => setRecordatorio(Number(e.target.value))}
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Color primario</label>
              <input
                type="color"
                value={colorPrimario}
                onChange={(e) => setColorPrimario(e.target.value)}
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block mb-1">Color secundario</label>
              <input
                type="color"
                value={colorSecundario}
                onChange={(e) => setColorSecundario(e.target.value)}
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
          </div>

          <Button type="submit">Guardar cambios</Button>

          {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </section>

      {/* Sección de agenda */}
      <section className="border-t border-lino-borde pt-8">
        <h2 className="text-xl font-semibold mb-4">📅 Agenda y días especiales</h2>

        <form onSubmit={handleAddExcepcion} className="space-y-3 max-w-lg mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Fecha</label>
              <input
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                required
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="block mb-1">Tipo</label>
              <select
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value as 'cerrado' | 'bloqueado')}
                className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
              >
                <option value="cerrado">Cerrado todo el día</option>
                <option value="bloqueado">Bloque parcial</option>
              </select>
            </div>
          </div>

          {nuevoTipo === 'bloqueado' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Desde</label>
                <input
                  type="time"
                  value={horaInicioBloque}
                  onChange={(e) => setHoraInicioBloque(e.target.value)}
                  className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Hasta</label>
                <input
                  type="time"
                  value={horaFinBloque}
                  onChange={(e) => setHoraFinBloque(e.target.value)}
                  className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1">Motivo (opcional)</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>

          <Button type="submit">Agregar excepción</Button>
        </form>

        {excepciones.length === 0 ? (
          <p className="text-sm text-gray-500">No hay excepciones configuradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-lino-borde text-sm">
              <thead className="bg-lino-borde/10">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Horario</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {excepciones.map((e) => (
                  <tr key={e.id} className="border-t border-lino-borde/30">
                    <td className="px-3 py-2">{e.fecha}</td>
                    <td className="px-3 py-2">{e.tipo}</td>
                    <td className="px-3 py-2">
                      {e.tipo === 'bloqueado'
                        ? `${e.hora_inicio?.slice(0, 5)} - ${e.hora_fin?.slice(0, 5)}`
                        : 'Todo el día'}
                    </td>
                    <td className="px-3 py-2">{e.motivo || '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => eliminarExcepcion(e.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
