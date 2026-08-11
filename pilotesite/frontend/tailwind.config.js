/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E6F1FB',
          100: '#B5D4F4',
          200: '#85B7EB',
          400: '#378ADD',
          600: '#185FA5',
          800: '#0C447C',
          900: '#042C53',
        },
        danger: {
          50:  '#FCEBEB',
          400: '#E24B4A',
          600: '#A32D2D',
        },
        warning: {
          50:  '#FAEEDA',
          400: '#EF9F27',
          600: '#854F0B',
        },
        success: {
          50:  '#EAF3DE',
          400: '#639922',
          600: '#3B6D11',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        DEFAULT: '0.5px',
      },
    },
  },
  plugins: [],
}
