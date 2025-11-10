// src/app/admin/turnos/page.tsx
'use client'

import Link from 'next/link'
import TurnoList from '@/components/TurnoList'
import { Button } from '@/components/UI/Button'

export default function TurnosPage() {
  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📅 Turnos</h1>
        <Link href="/admin/turnos/nuevo-turno">
          <Button>➕ Nuevo turno</Button>
        </Link>
      </div>

      <TurnoList />
    </main>
  )
}
