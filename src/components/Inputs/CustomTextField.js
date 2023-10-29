// ** MUI Imports
import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

const CustomTextField = ({
  type = 'text', //any valid HTML5 input type
  variant = 'outlined', //outlined, standard, filled
  value,
  onClear,
  size = 'small', //small, medium
  fullWidth = true,
  autoFocus = false,
  readOnly = false,
  autoComplete = 'off',
  numberField = false,
  editMode = false,
  ...props
}) => {

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const _readOnly = editMode ?
    editMode && maxAccess < 3
    : readOnly

  return (
    <TextField
      type={type}
      variant={variant}
      value={value}
      size={size}
      fullWidth={fullWidth}
      autoFocus={autoFocus}
      inputProps={{
        readOnly: _readOnly,
        pattern: numberField && '[0-9]*', // Allow only numeric input
        style: {
          textAlign: numberField && 'right'
        }
      }}
      autoComplete={autoComplete}
      style={{ textAlign: 'right' }}
      InputProps={{
        endAdornment: !readOnly &&
          value && ( // Only show the clear icon if readOnly is false
            <InputAdornment position='end'>
              <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
      }}
      {...props}
    />
  )
}

export default CustomTextField
