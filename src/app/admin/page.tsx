'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/UI/Button'

export default function AdminPanel() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-lino-fondo flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-lino-texto mb-8">Panel de Administración</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 max-w-md w-full">
       <Button onClick={() => router.push('/admin/pacientes')}> Pacientes</Button>
<Button onClick={() => router.push('/admin/turnos')}> Citas agendadas</Button>
<Button onClick={() => router.push('/admin/pacientes/nuevo-paciente')}> Nuevo paciente</Button>
<Button onClick={() => router.push('/admin/turnos/nuevo-turno')}> Nuevo turno</Button>
<Button onClick={() => router.push('/admin/tratamientos')}> Tratamientos</Button>
<Button onClick={() => router.push('/admin/tips')}> Tips & Certificaciones</Button>
<Button onClick={() => router.push('/admin/config')}> Configuración</Button>

      </div>
    </main>
  )
}
