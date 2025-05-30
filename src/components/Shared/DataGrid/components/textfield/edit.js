import CustomTextField from 'src/components/Inputs/CustomTextField'
import IconButton from '@mui/material/IconButton'
import PercentIcon from '@mui/icons-material/Percent'
import PinIcon from '@mui/icons-material/Pin'
import InputAdornment from '@mui/material/InputAdornment'
import ClearIcon from '@mui/icons-material/Clear'

export default function TextFieldEdit({ id, column: { props, field, ...column }, value, update, updateRow }) {
  const isPercentIcon = props?.gridData ? props?.gridData[id - 1]?.mdType === 1 : false

  const handleIconClick = () => {
    props.iconsClicked(id, updateRow)
  }

  const handleChange = e => {
    const inputValue = e.target.value
    if (props?.type === 'numeric') {
      if (/^\d*\.?\d*$/.test(inputValue)) {
        update({
          id,
          field,
          value: inputValue || ''
        })
      }
    } else {
      update({
        id,
        field,
        value: inputValue || ''
      })
    }
  }

  const handleKeyPress = e => {
    if (props.type === 'numeric' && !/^[0-9.]$/.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault()
    }
    if (props.type === 'numeric' && e.key === '.' && value.includes('.')) {
      e.preventDefault()
    }
  }

  return (
    <CustomTextField
      value={value?.[field] || undefined}
      label={''}
      autoFocus
      hasBorder={false}
      onBlur={e => {
        if (column?.onBlur) {
          column?.onBlur(e, id)
        }
      }}
      onKeyDown={e => {
        if (column?.onKeyDown) {
          column?.onKeyDown(e, id)
        }
      }}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      inputMode={props.type === 'numeric' ? 'decimal' : 'text'}
      onClear={() => update({ id, field, value: '' })}
      {...props}
      sx={{
        flexGrow: 1,
        border: 'none',
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          '& fieldset': {
            border: 'none'
          }
        }
      }}
    />
  )
}
