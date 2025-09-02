import { Box } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'

export default function ColorComboBox({ value, colors, onChange, required, ...rest }) {
  const colorPalette = [
    '#000000',
    '#993300',
    '#333300',
    '#003300',
    '#003366',
    '#000080',
    '#333399',
    '#333333',
    '#800000',
    '#FF6600',
    '#808000',
    '#008000',
    '#008080',
    '#0000FF',
    '#666699',
    '#808080',
    '#FF0000',
    '#FF9900',
    '#99CC00',
    '#339966',
    '#33CCCC',
    '#3366FF',
    '#800080',
    '#969696',
    '#FF00FF',
    '#FFCC00',
    '#FFFF00',
    '#00FF00',
    '#00FFFF',
    '#00CCFF',
    '#993366',
    '#C0C0C0',
    '#FF99CC',
    '#FFCC99',
    '#FFFF99',
    '#CCFFCC',
    '#CCFFFF',
    '#99CCFF',
    '#CC99FF',
    '#FFFFFF'
  ]

  return (
    <ResourceComboBox
      {...rest}
      value={value || null}
      onChange={(_, newValue) => {
        onChange?.(rest?.name, newValue || null)
      }}
      filterOptions={options => options}
      isOptionEqualToValue={(option, value) => option === value}
      options={colors || colorPalette}
      getOptionLabel={option => option.replace('#', '').toUpperCase()}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 0, margin: 0 }}>
          <Box
            sx={{
              width: 29,
              height: 29,
              borderRadius: '6px',
              border: selected ? '2px solid #000' : '0px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'opacity 0.2s, border 0.2s',
              '&:hover': { opacity: 0.7, border: '2px solid #000' }
            }}
          >
            <Box
              sx={{
                width: 25,
                height: 25,
                borderRadius: '4px',
                backgroundColor: option
              }}
            />
          </Box>
        </li>
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
      startAdornment={
        value ? (
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
      }
    />
  )
}
