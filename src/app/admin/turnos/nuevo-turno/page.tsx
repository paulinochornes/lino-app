'use client'

import TurnoForm from '@/components/TurnoForm'

export default function NuevoTurnoPage() {
  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">➕ Agendar nuevo turno</h1>
      <p className="mb-6 text-sm text-lino-texto/80">
        Seleccioná paciente, tratamiento, profesional y horario disponible.
      </p>

      <TurnoForm />
    </main>
  )
}
