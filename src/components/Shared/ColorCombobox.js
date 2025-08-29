import { Autocomplete, TextField, Box, Paper } from '@mui/material'
import PopperComponent from 'src/components/Shared/Popper/PopperComponent'

export default function ColorComboBox({ name = 'color', value, colorPalette, onChange, label, ...rest }) {

  return (
    <Autocomplete
      {...rest}
      disableClearable
      value={value || null}
      onChange={(_, newValue) => {
        onChange?.(name, newValue || '')
      }}
      size={'small'}
      options={colorPalette}
      PopperComponent={PopperComponent}
      PaperComponent={({ children }) => (
        <Paper sx={{ p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {children}
          </Box>
        </Paper>
      )}
      getOptionLabel={option => option.replace('#', '').toUpperCase()}
      renderOption={(props, option) => (
        <Box
          component='li'
          {...props}
          sx={{
            width: 24,
            height: 26,
            borderRadius: '4px',
            backgroundColor: option,
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            m: 0
          }}
        />
      )}
      ListboxProps={{
        sx: {
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          gap: 1,
          p: 0.5
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            readOnly: true,
            startAdornment: value ? (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '4px',
                  backgroundColor: value,
                  border: '1px solid #ccc',
                  marginRight: 1
                }}
              />
            ) : null
          }}
        />
      )}
    />
  )
}
