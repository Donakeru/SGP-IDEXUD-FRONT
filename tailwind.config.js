/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base: naranja #FF4E00, gris #737373 y blanco #FFFFFF.
        // El resto de tonos se derivan de estos tres.
        primary: {
          DEFAULT: '#FF4E00', // fondos de acción, indicadores activos, barras de progreso
          hover: '#E04400', // hover de botones primarios
          strong: '#C43A00', // texto/enlaces naranjas (5,3:1 sobre blanco)
          tint: '#FFE3D6', // fondo de insignias activas
          soft: '#FFF1EB', // fondo suave de íconos, chips y selección
        },
        ink: '#262626', // títulos y texto principal
        body: '#525252', // texto secundario
        muted: '#737373', // texto de apoyo (4,7:1 sobre blanco)
        line: {
          DEFAULT: '#E5E5E5', // bordes
          soft: '#EFEFEF', // separadores internos
          strong: '#BFBFBF', // bordes de zonas de carga
        },
        canvas: '#FAFAFA', // fondo de página y franjas internas
        wash: '#F5F5F5', // hover sobre fondo blanco
        chip: '#EDEDED', // fondos neutros (estado borrador, métricas)
        // Colores semánticos: solo para estados.
        success: { DEFAULT: '#176B47', soft: '#EAF7F0', line: '#B9DFCB' },
        warning: { DEFAULT: '#8A5800', soft: '#FFF4DC' },
        danger: {
          DEFAULT: '#A33A3A',
          soft: '#FDECEC',
          subtle: '#FFFAFA',
          line: '#EFCACA',
        },
      },
    },
  },
  plugins: [],
}
