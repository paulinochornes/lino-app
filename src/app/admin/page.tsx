'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseBrowser'
import TurnoForm from '@/components/TurnoForm'
import TurnoList from '@/components/TurnoList'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth')
      } else {
        // ✅ Corregido: manejamos el posible "undefined"
        setUserEmail(session.user.email ?? null)
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lino-texto">
        Cargando...
      </div>
    )
  }

  return (
    <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-4 bg-lino-fondoSecundario border border-lino-borde rounded-xl p-6 shadow">
        <h1 className="text-2xl font-semibold text-lino-encabezado">
          Panel de administración
        </h1>
        <TurnoForm />
        <TurnoList />
        <p className="text-lino-texto">Sesión iniciada como: {userEmail}</p>
        <button
          onClick={handleLogout}
          className="bg-lino-acento text-lino-encabezado font-medium py-2 px-6 rounded hover:opacity-90 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
