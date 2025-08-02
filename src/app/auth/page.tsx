'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const authFn = isLogin
      ? supabase.auth.signInWithPassword
      : supabase.auth.signUp

    const { data, error } = await authFn({ email, password })

    if (error) {
      setError(error.message)
    } else if (data.session || data.user) {
      router.push('/admin')
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-lino-fondo px-4">
      <div className="bg-lino-fondoSecundario border border-lino-borde rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-lino-encabezado">
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-lino-texto">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-lino-borde rounded-xl px-4 py-2 bg-white text-lino-texto"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-lino-texto">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-lino-borde rounded-xl px-4 py-2 bg-white text-lino-texto"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lino-acento text-lino-encabezado font-medium py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-lino-texto">
          {isLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="underline hover:text-lino-encabezado"
          >
            {isLogin ? 'Crear una cuenta' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </main>
  )
}
