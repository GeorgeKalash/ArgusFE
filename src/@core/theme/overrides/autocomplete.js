const Autocomplete = skin => {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }) => ({
          ...(skin === 'bordered' && { boxShadow: 'none', border: `1px solid ${theme.palette.divider}` })
        })
      }
    }
  }
}

export default Autocomplete
