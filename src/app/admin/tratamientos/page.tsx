'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import { Button } from '@/components/UI/Button'

type Tratamiento = {
  id: string
  nombre: string
  descripcion?: string
  precio?: number
}

export default function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [modoEdicion, setModoEdicion] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: ''
  })
  const [error, setError] = useState('')

  const fetchTratamientos = async () => {
    const { data, error } = await supabase
      .from('tratamientos')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) console.error(error)
    else setTratamientos(data)
  }

  useEffect(() => {
    fetchTratamientos()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const limpiarFormulario = () => {
    setForm({ nombre: '', descripcion: '', precio: '' })
    setModoEdicion(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nombre) {
      setError('El nombre es obligatorio.')
      return
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      precio: form.precio ? parseFloat(form.precio) : null
    }

    let result
    if (modoEdicion) {
      result = await supabase.from('tratamientos').update(payload).eq('id', modoEdicion)
    } else {
      result = await supabase.from('tratamientos').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      await fetchTratamientos()
      limpiarFormulario()
    }
  }

  const handleEditar = (t: Tratamiento) => {
    setModoEdicion(t.id)
    setForm({
      nombre: t.nombre,
      descripcion: t.descripcion || '',
      precio: t.precio?.toString() || ''
    })
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este tratamiento?')) return
    const { error } = await supabase.from('tratamientos').delete().eq('id', id)
    if (error) {
      alert('Error al eliminar')
    } else {
      await fetchTratamientos()
    }
  }

  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-6">🧴 Tratamientos</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full p-2 border border-lino-borde rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full p-2 border border-lino-borde rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Precio</label>
          <input
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            className="w-full p-2 border border-lino-borde rounded"
            min="0"
            step="0.01"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit">
            {modoEdicion ? '💾 Guardar cambios' : '➕ Agregar tratamiento'}
          </Button>
          {modoEdicion && (
            <Button variant="secondary" type="button" onClick={limpiarFormulario}>
              ❌ Cancelar edición
            </Button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {tratamientos.map((t) => (
          <li
            key={t.id}
            className="p-4 bg-white border border-lino-borde rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
          >
            <div>
              <strong>{t.nombre}</strong><br />
              {t.descripcion && <span className="text-sm">{t.descripcion}</span>}<br />
              {t.precio !== null && t.precio !== undefined && (
                <span className="text-sm">💲 {t.precio.toFixed(2)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleEditar(t)} variant="secondary">✏️ Editar</Button>
              <Button onClick={() => handleEliminar(t.id)} variant="secondary">🗑️ Eliminar</Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
