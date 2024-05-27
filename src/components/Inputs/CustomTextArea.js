// ** MUI Imports
import { TextField, InputAdornment, IconButton, Box } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef } from 'react'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

const CustomTextArea = ({
  type = 'text', //any valid HTML5 input type
  variant = 'outlined', //outlined, standard, filled
  paddingRight = 0,
  value,
  name,
  onClear,
  size = 'small', //small, medium
  fullWidth = true,
  autoFocus = false,
  readOnly = false,
  autoComplete = 'off',
  numberField = false,
  editMode = false,
  maxLength = '',
  position,
  rows = 4,
  hidden = false,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly =
    maxAccess < 3 ||
    accessLevel === DISABLED ||
    (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const inputRef = useRef(null)

  useEffect(() => {
    // Save the cursor position before the value changes
    if (inputRef.current && typeof inputRef.current.selectionStart !== undefined && position) {
      inputRef.current.setSelectionRange(position, position)
    }
  }, [position])

  const required = props.required || accessLevel === MANDATORY

  return _hidden ? (
    <></>
  ) : (
    <Box sx={{ width: '100%' }}>
      <TextField
        multiline
        rows={rows} // You can adjust the number of rows as needed
        inputRef={inputRef}
        name={name}
        type={type}
        variant={variant}
        value={value}
        size={size}
        fullWidth={fullWidth}
        autoFocus={autoFocus}
        inputProps={{
          readOnly: _readOnly,
          maxLength: maxLength,
          inputMode: 'numeric',
          pattern: numberField && '[0-9]*', // Allow only numeric input
          style: {
            textAlign: numberField && 'right',
            paddingRight: paddingRight
          }
        }}
        autoComplete={autoComplete}
        InputProps={{
          endAdornment: !readOnly &&
            value && ( // Only show the clear icon if readOnly is false
              <InputAdornment position='end'>
                <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
                  <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                </IconButton>
              </InputAdornment>
            )
        }}
        required={required}
        {...props}
      />
    </Box>
  )
}

export default CustomTextArea
