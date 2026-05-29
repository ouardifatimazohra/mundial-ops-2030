/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════
        // 🎨 Palette MUNDIAL-OPS 2030
        // ═══════════════════════════════════════════
        
        // 🏛️ Fond Mission Control
        bg: {
          primary:   '#0A0E1A',  // Noir profond — fond principal
          secondary: '#0F1525',  // Légèrement plus clair — cards
          tertiary:  '#1A2030',  // Encore plus clair — éléments hover
          panel:     '#141A2A',  // Panels intermédiaires
        },
        
        // 🎯 Bordures et séparateurs
        border: {
          subtle:  '#1F2740',
          default: '#2A3144',
          accent:  '#3A4660',
        },
        
        // ✨ Couleur signature : OR FIFA
        gold: {
          50:  '#FBF5E5',
          100: '#F7E9C2',
          200: '#F1D690',
          300: '#E5BC5C',
          400: '#D4AF37',  // ⭐ Or FIFA principal
          500: '#B8941F',
          600: '#8B6F0F',
          700: '#5E4A07',
        },
        
        // 🇲🇦 Couleur Maroc
        morocco: {
          DEFAULT: '#006233',
          light:   '#16804F',
          dark:    '#004D27',
          accent:  '#5DCAA5',  // Pour les valeurs "OK"
        },
        
        // 🇪🇸 Couleur Espagne
        spain: {
          DEFAULT: '#AA151B',
          light:   '#D63A40',
          dark:    '#7A0E12',
          accent:  '#F4C842',  // Pour les valeurs "OK"
        },
        
        // 🇵🇹 Couleur Portugal
        portugal: {
          DEFAULT: '#046A38',
          light:   '#1A8550',
          dark:    '#024D26',
          accent:  '#FF0000',  // Rouge drapeau
        },
        
        // 📊 États
        ok:       '#5DCAA5',   // Vert succès / opérationnel
        warning:  '#F4C842',   // Jaune avertissement
        critical: '#FF3B30',   // Rouge alerte critique
        info:     '#00D9FF',   // Cyan données / flux
        
        // 📝 Textes
        text: {
          primary:   '#E6E8EE',  // Texte principal (sur fond noir)
          secondary: '#8B92A8',  // Texte secondaire
          muted:     '#5A6178',  // Texte discret
          inverse:   '#0A0E1A',  // Texte sur fond clair
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      
      // 🎬 Animations cinématiques signature
      animation: {
        'pulse-soft':    'pulse-soft 2s ease-in-out infinite',
        'pulse-glow':    'pulse-glow 1.5s ease-in-out infinite',
        'fade-in':       'fade-in 0.6s ease-out',
        'slide-up':      'slide-up 0.5s ease-out',
        'slide-in':      'slide-in 0.4s ease-out',
        'scan':          'scan 3s linear infinite',
        'flow':          'flow 2s linear infinite',
        'typewriter':    'typewriter 2s steps(40, end)',
        'blink':         'blink 1s step-end infinite',
      },
      
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 20px 8px rgba(212, 175, 55, 0)',
            transform: 'scale(1.05)',
          },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flow': {
          '0%':   { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        'blink': {
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}