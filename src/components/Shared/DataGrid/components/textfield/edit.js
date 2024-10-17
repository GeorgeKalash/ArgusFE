import CustomTextField from 'src/components/Inputs/CustomTextField'
import IconButton from '@mui/material/IconButton'
import PercentIcon from '@mui/icons-material/Percent'
import PinIcon from '@mui/icons-material/Pin'
import InputAdornment from '@mui/material/InputAdornment'
import ClearIcon from '@mui/icons-material/Clear'

export default function TextFieldEdit({ column: { props }, id, field, value, update }) {
  const isPercentIcon = props?.gridData ? props?.gridData[id - 1]?.mdType === 1 : false

  const handleIconClick = () => {
    props.iconsClicked(id)
  }

  const handleChange = e => {
    const inputValue = e.target.value

    // Allow only numeric input if props.type is 'numeric'
    if (props.type === 'numeric') {
      if (/^\d*$/.test(inputValue)) {
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
    if (props.type === 'numeric' && !/^[0-9]$/.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault()
    }
  }

  return (
    <CustomTextField
      value={value}
      label={''}
      autoFocus
      hasBorder={false}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      inputMode={props.type === 'numeric' ? 'numeric' : 'text'}
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton onClick={() => update({ id, field, value: '' })}>
              <ClearIcon />
            </IconButton>
            {props?.ShowDiscountIcons && (
              <IconButton onClick={handleIconClick}>{isPercentIcon ? <PercentIcon /> : <PinIcon />}</IconButton>
            )}
          </InputAdornment>
        )
      }}
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
