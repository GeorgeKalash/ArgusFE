import { Box } from '@mui/material'
import PopperComponent from 'src/components/Shared/Popper/PopperComponent'
import ResourceComboBox from './ResourceComboBox'

export default function ColorComboBox({
  name = 'color',
  value,
  colors,
  onChange,
  label,
  maxAccess,
  required,
  ...rest
}) {
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
      name={name}
      required={required}
      label={label}
      maxAccess={maxAccess}
      value={value || null}
      onChange={(_, newValue) => {
        onChange?.(name, newValue || null)
      }}
      filterOptions={options => options}
      size='small'
      isOptionEqualToValue={(option, value) => option === value}
      options={colors || colorPalette}
      PopperComponent={PopperComponent}
      getOptionLabel={option => option.replace('#', '').toUpperCase()}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 0, margin: 0 }}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '4px',
              backgroundColor: option,
              border: selected ? '2px solid #000' : '1px solid #ccc',
              cursor: 'pointer',
              transition: 'opacity 0.2s, border 0.2s',
              '&:hover': {
                opacity: 0.8
              },
              '&.Mui-focused': {
                opacity: 0.9
              }
            }}
          />
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
