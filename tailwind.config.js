/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563EB', // Trust-building blue (blue-600)
        'primary-50': '#EFF6FF', // Light blue tint (blue-50)
        'primary-100': '#DBEAFE', // Lighter blue (blue-100)
        'primary-500': '#3B82F6', // Medium blue (blue-500)
        'primary-600': '#2563EB', // Primary blue (blue-600)
        'primary-700': '#1D4ED8', // Darker blue (blue-700)
        'primary-900': '#1E3A8A', // Deep blue (blue-900)

        // Secondary Colors
        'secondary': '#64748B', // Sophisticated slate (slate-500)
        'secondary-100': '#F1F5F9', // Light slate (slate-100)
        'secondary-200': '#E2E8F0', // Lighter slate (slate-200)
        'secondary-300': '#CBD5E1', // Medium light slate (slate-300)
        'secondary-400': '#94A3B8', // Medium slate (slate-400)
        'secondary-500': '#64748B', // Base slate (slate-500)
        'secondary-600': '#475569', // Darker slate (slate-600)
        'secondary-700': '#334155', // Deep slate (slate-700)

        // Accent Colors
        'accent': '#F59E0B', // Attention-grabbing amber (amber-500)
        'accent-50': '#FFFBEB', // Light amber tint (amber-50)
        'accent-100': '#FEF3C7', // Lighter amber (amber-100)
        'accent-400': '#FBBF24', // Medium amber (amber-400)
        'accent-500': '#F59E0B', // Base amber (amber-500)
        'accent-600': '#D97706', // Darker amber (amber-600)

        // Background Colors
        'background': '#FAFBFC', // Soft off-white background
        'surface': '#FFFFFF', // Pure white surface

        // Text Colors
        'text-primary': '#1E293B', // Deep charcoal (slate-800)
        'text-secondary': '#64748B', // Muted slate (slate-500)

        // Status Colors
        'success': '#10B981', // Confident green (emerald-500)
        'success-50': '#ECFDF5', // Light green tint (emerald-50)
        'success-100': '#D1FAE5', // Lighter green (emerald-100)
        'success-500': '#10B981', // Base green (emerald-500)
        'success-600': '#059669', // Darker green (emerald-600)

        'warning': '#F59E0B', // Amber for pending states (amber-500)
        'warning-50': '#FFFBEB', // Light warning tint (amber-50)
        'warning-100': '#FEF3C7', // Lighter warning (amber-100)
        'warning-500': '#F59E0B', // Base warning (amber-500)

        'error': '#EF4444', // Clear red for errors (red-500)
        'error-50': '#FEF2F2', // Light error tint (red-50)
        'error-100': '#FEE2E2', // Lighter error (red-100)
        'error-500': '#EF4444', // Base error (red-500)
        'error-600': '#DC2626', // Darker error (red-600)

        // Border Colors
        'border': 'rgba(148, 163, 184, 0.2)', // Subtle border (slate-400 with opacity)
        'border-light': 'rgba(148, 163, 184, 0.1)', // Lighter border
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'caption': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'modal': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        '50': '50',
        '100': '100',
        '200': '200',
        '1000': '1000',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-in': 'slideIn 400ms ease-in-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'subtle': '8px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}