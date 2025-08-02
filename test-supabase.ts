import { createClient } from '@supabase/supabase-js'

// Inicialización sin sesión
const supabase = createClient(
  'https://pogsyskvqfxanmjplbxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZ3N5c2t2cWZ4YW5tanBsYnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTIyMDUsImV4cCI6MjA2ODg4ODIwNX0.NbAtNtcmBakwvmbgR2jLuOlZvAvavsZ3qzFgUZy1Czc'
)

async function test() {
  console.log('🔐 Iniciando sesión...')
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'paulinoc.hornes@outlook.fr',
    password: 'Matias2013--'
  })

  if (loginError) {
    console.error('❌ ERROR en login:', loginError.message)
    return
  }

  console.log('✅ LOGIN OK:', loginData.user?.email)

  // 👉 Creamos un nuevo cliente con el token de sesión
  const authedClient = createClient(
    'https://pogsyskvqfxanmjplbxn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZ3N5c2t2cWZ4YW5tanBsYnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTIyMDUsImV4cCI6MjA2ODg4ODIwNX0.NbAtNtcmBakwvmbgR2jLuOlZvAvavsZ3qzFgUZy1Czc',
    {
      global: {
        headers: {
          Authorization: `Bearer ${loginData.session?.access_token}`
        }
      }
    }
  )

  console.log('📄 Probando SELECT...')
  const { data: readData, error: readError } = await authedClient
    .from('turnos')
    .select('*')
    .limit(1)

  if (readError) {
    console.error('❌ ERROR al hacer select:', readError.message)
  } else {
    console.log('✅ SELECT OK:', readData.length ? readData : '[Sin datos]')
  }

  console.log('📝 Probando INSERT...')
  const { error: insertError } = await authedClient.from('turnos').insert([
    {
      nombre: 'Test Lino',
      telefono: '099000000',
      fecha: new Date().toISOString()
    }
  ])

  if (insertError) {
    console.error('❌ ERROR al insertar:', insertError.message)
  } else {
    console.log('✅ INSERT OK')
  }
}

test()
