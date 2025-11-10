// src/app/admin/tratamientos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Tratamiento = {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  duracion_minutos: number | null
  precio_base: number | null
  activo: boolean
}

export default function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [duracion, setDuracion] = useState<number | ''>('')
  const [precio, setPrecio] = useState<number | ''>('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargarTratamientos = async () => {
    setError('')
    const { data, error } = await supabase
      .from('tratamientos')
      .select('id, nombre, descripcion, categoria, duracion_minutos, precio_base, activo')
      .order('nombre')

    if (error) {
      setError(error.message)
      return
    }
    setTratamientos(data || [])
  }

  useEffect(() => {
    cargarTratamientos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    const { error } = await supabase.from('tratamientos').insert({
      nombre,
      descripcion: descripcion || null,
      categoria: categoria || null,
      duracion_minutos: duracion === '' ? null : duracion,
      precio_base: precio === '' ? null : precio,
      activo: true,
    })

    if (error) {
      setError(error.message)
      return
    }

    setMensaje('Tratamiento creado.')
    setNombre('')
    setDescripcion('')
    setCategoria('')
    setDuracion('')
    setPrecio('')
    await cargarTratamientos()
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from('tratamientos').update({ activo: !activo }).eq('id', id)
    await cargarTratamientos()
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">💆‍♀️ Tratamientos</h1>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl mb-8">
        <h2 className="font-semibold">Nuevo tratamiento</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
        />

        <input
          type="text"
          placeholder="Categoría (opcional)"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Duración (min)</label>
            <input
              type="number"
              min={0}
              value={duracion}
              onChange={(e) => setDuracion(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Precio base</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-lino-borde rounded px-3 py-2 bg-white"
            />
          </div>
        </div>

        <Button type="submit">Guardar tratamiento</Button>

        {mensaje && <p className="text-green-700 text-sm">{mensaje}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      <section className="max-w-3xl">
        <h2 className="font-semibold mb-2">Listado</h2>
        <div className="space-y-2">
          {tratamientos.map((t) => (
            <div
              key={t.id}
              className="border border-lino-borde rounded-xl px-3 py-2 flex justify-between items-center bg-white"
            >
              <div>
                <div className="font-medium">
                  {t.nombre}{' '}
                  {t.duracion_minutos ? <span className="text-xs">({t.duracion_minutos} min)</span> : null}
                </div>
                {t.precio_base != null && (
                  <div className="text-sm text-lino-texto/70">${t.precio_base.toFixed(2)}</div>
                )}
                {t.categoria && <div className="text-xs text-lino-texto/60">{t.categoria}</div>}
              </div>
              <button
                type="button"
                onClick={() => toggleActivo(t.id, t.activo)}
                className={`text-xs px-2 py-1 rounded ${
                  t.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {t.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
