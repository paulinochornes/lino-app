import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lino: {
          fondo: '#F9F8F3',
          fondoSecundario: '#EBE4D0',
          texto: '#4A4A47',
          encabezado: '#2F2F2F',
          acento: '#D8D3E6',
          borde: '#D6CFC2',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
