// ** MUI Imports
import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'

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
  maxLength = '',
  position,
  hidden = false,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const _readOnly = editMode ? editMode && maxAccess < 3 : readOnly

  const inputRef = useRef(null)

  useEffect(() => {
    // Save the cursor position before the value changes
    if (typeof inputRef.current.selectionStart !== undefined && position) {
      inputRef.current.setSelectionRange(position, position)
    }
  }, [position])

  return (
    <div style={{ display: hidden ? 'none' : 'block' }}>
      <TextField
        inputRef={inputRef}
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
    </div>
  )
}

export default CustomTextField
