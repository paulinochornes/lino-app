export default function ConfigPage() {
  return (
    <main className="min-h-screen p-6 bg-lino-fondo text-lino-texto">
      <h1 className="text-2xl font-bold mb-4">⚙️ Configuración</h1>

      <section className="space-y-4">
        <p className="text-base">
          Desde aquí vas a poder configurar los ajustes de la aplicación: horarios de atención, recordatorios, colores, y más.
        </p>

        <ul className="list-disc list-inside text-sm">
          <li>📅 Horarios de atención</li>
          <li>🔔 Recordatorios automáticos</li>
          <li>🎨 Estilo visual</li>
          <li>🔒 Seguridad</li>
        </ul>

        <p className="text-sm text-lino-texto/60">
          (Esta sección todavía está en desarrollo)
        </p>
      </section>
    </main>
  )
}
