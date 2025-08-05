'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Turno = {
  id: string
  fecha: string
  paciente: { nombre: string } | null
  tratamiento: { nombre: string } | null
}

type TurnoDesdeDB = {
  id: string
  fecha: string
  paciente: { nombre: string }[] | null
  tratamiento: { nombre: string }[] | null
}

export default function TurnosPage() {
  const router = useRouter()
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'hoy' | 'futuros'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [exportado, setExportado] = useState('')

  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      let query = supabase
        .from('consultas')
        .select(`
          id,
          fecha,
          paciente ( nombre ),
          tratamiento ( nombre )
        `)
        .order('fecha', { ascending: true })

      if (filtro === 'hoy') {
        const inicio = hoy.toISOString()
        const fin = new Date(hoy)
        fin.setHours(23, 59, 59, 999)
        query = query.gte('fecha', inicio).lte('fecha', fin.toISOString())
      }

      if (filtro === 'futuros') {
        const ahora = new Date().toISOString()
        query = query.gt('fecha', ahora)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error al obtener turnos:', error)
      } else {
        const turnosMapeados = (data as TurnoDesdeDB[]).map((t) => ({
          id: t.id,
          fecha: t.fecha,
          paciente: t.paciente?.[0] ?? { nombre: 'Paciente desconocido' },
          tratamiento: t.tratamiento?.[0] ?? { nombre: 'Tratamiento sin especificar' },
        }))
        setTurnos(turnosMapeados)
      }

      setLoading(false)
    }

    fetchTurnos()
  }, [filtro])

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este turno?')) return
    const { error } = await supabase.from('consultas').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar turno')
    } else {
      setTurnos((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const handleExportar = () => {
    const texto = turnos
      .map((t) => {
        const fecha = new Date(t.fecha).toLocaleString()
        const paciente = t.paciente?.nombre ?? 'Paciente'
        const tratamiento = t.tratamiento?.nombre ?? 'Tratamiento'
        return `🕒 ${fecha}\n👤 ${paciente}\n🧴 ${tratamiento}\n`
      })
      .join('\n---\n')
    setExportado(texto)
    navigator.clipboard.writeText(texto)
    alert('Agenda copiada al portapapeles 📋')
  }

  const turnosFiltrados = turnos.filter((t) =>
    t.paciente?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-6">📅 Citas agendadas</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={() => setFiltro('todos')} variant={filtro === 'todos' ? 'primary' : 'secondary'}>📋 Todos</Button>
        <Button onClick={() => setFiltro('hoy')} variant={filtro === 'hoy' ? 'primary' : 'secondary'}>📆 Hoy</Button>
        <Button onClick={() => setFiltro('futuros')} variant={filtro === 'futuros' ? 'primary' : 'secondary'}>🔜 Futuros</Button>
        <Button onClick={handleExportar}>📤 Exportar agenda</Button>
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="🔍 Buscar por paciente..."
        className="mb-6 w-full p-2 border border-lino-borde rounded"
      />

      {loading ? (
        <p>Cargando turnos...</p>
      ) : turnosFiltrados.length === 0 ? (
        <p>No hay turnos para mostrar.</p>
      ) : (
        <ul className="space-y-2">
          {turnosFiltrados.map((turno) => (
            <li key={turno.id} className="p-4 bg-white border border-lino-borde rounded-xl">
              <div className="mb-2">
                <strong>{new Date(turno.fecha).toLocaleString()}</strong><br />
                👤 {turno.paciente?.nombre || 'Paciente desconocido'}<br />
                🧴 {turno.tratamiento?.nombre || 'Tratamiento sin especificar'}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => router.push(`/admin/turnos/${turno.id}/editar`)} variant="secondary">✏️ Editar</Button>
                <Button onClick={() => handleEliminar(turno.id)} variant="secondary">🗑️ Eliminar</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {exportado && (
        <textarea
          className="mt-6 w-full p-2 border border-lino-borde rounded bg-lino-fondo-secundario"
          rows={6}
          readOnly
          value={exportado}
        />
      )}
    </main>
  )
}
