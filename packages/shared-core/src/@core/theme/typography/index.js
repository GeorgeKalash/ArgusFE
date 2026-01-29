const typography = {
  fontFamily: [
    'Inter',
    'sans-serif',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(','),

  h1: { fontSize: '2.125rem', fontWeight: 500, letterSpacing: '-1.5px' },
  h2: { fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.5px' },
  h3: { fontSize: '1.5rem', fontWeight: 500, letterSpacing: 0 },
  h4: { fontSize: '1.25rem', fontWeight: 500, letterSpacing: '0.25px' },
  h5: { fontSize: '1.125rem', fontWeight: 500, letterSpacing: 0 },
  h6: { fontSize: '1rem', letterSpacing: '0.15px' },

  subtitle1: { fontSize: '0.95rem', letterSpacing: '0.15px' },
  subtitle2: { fontSize: '0.875rem', letterSpacing: '0.1px' },

  body1: { fontSize: '0.95rem', letterSpacing: '0.15px' },
  body2: { fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '0.15px' },

  button: { fontSize: '0.875rem', letterSpacing: '0.3px' },
  caption: { fontSize: '0.75rem', letterSpacing: '0.4px' },
  overline: { fontSize: '0.75rem', letterSpacing: '1px' }
}

export default typography
