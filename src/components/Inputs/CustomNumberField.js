import React from 'react'
import { NumericFormat } from 'react-number-format'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

const CustomNumberField = ({
  variant = 'outlined',
  value,
  size = 'small',
  label,
  readOnly = false,
  decimalScale = 0,
  onChange,
  onClear,
  hidden = false,
  error,
  helperText,
  hasBorder = true,
  ...props
}) => {
  const name = props.name

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly =
    maxAccess < 3 ||
    accessLevel === DISABLED ||
    (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const required = props.required || accessLevel === MANDATORY

  return _hidden ? (
    <></>
  ) : (
    <NumericFormat
      label={label}
      allowLeadingZeros
      thousandSeparator=','
      decimalSeparator='.'
      decimalScale={decimalScale}
      value={value}
      variant={variant}
      size={size}
      fullWidth
      error={error}
      helperText={helperText}
      required={required}
      InputProps={{
        readOnly: _readOnly,
        endAdornment: !readOnly && value && (
          <InputAdornment position='end'>
            <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
      customInput={TextField}
      onChange={onChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: !hasBorder && 'none' // Hide border
          }
        }
      }}
      {...props}
    />
  )
}

export default CustomNumberField
