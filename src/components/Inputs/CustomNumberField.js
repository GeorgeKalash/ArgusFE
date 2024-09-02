import React from 'react'
import { NumericFormat } from 'react-number-format'
import { Button, IconButton, InputAdornment, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import { getNumberWithoutCommas } from 'src/lib/numberField-helper'

const CustomNumberField = ({
  variant = 'outlined',
  value = '',
  size = 'small',
  label,
  onChange,
  readOnly = false,
  allowClear = false,
  decimalScale = 2,
  onClear,
  hidden = false,
  error,
  helperText,
  hasBorder = true,
  maxLength = 1000,
  thousandSeparator = ',',
  min = '',
  max = '',
  allowNegative = true,
  displayCycleButton = false,
  handleCycleButtonClick,
  cycleButtonLabel = '',
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

  const handleNumberFieldNewValue = e => {
    const regex = /^[0-9,]+(\.\d+)?$/
    let value = e?.target?.value
    if (value && regex.test(value)) {
      value = value.replace(/[^0-9.]/g, '')
      const _newValue = getNumberWithoutCommas(value)
      e.target.value = _newValue
      onChange(e)
    }
  }

  const handleInput = e => {
    const inputValue = e?.target?.value?.replaceAll(',', '').replaceAll('.', '')
    if (e?.target?.value?.indexOf('.') > 0) {
      if (inputValue?.length > maxLength) e.target.value = value
    } else {
      if (inputValue?.length > maxLength - decimalScale) {
        e.target.value = value
      }

      onChange(e)
    }
  }

  const displayButtons = (!readOnly || allowClear) && !props.disabled && (value || value === 0)

  return _hidden ? (
    <></>
  ) : (
    <NumericFormat
      label={label}
      allowLeadingZeros
      allowNegative={allowNegative}
      thousandSeparator={thousandSeparator}
      decimalSeparator='.'
      decimalScale={decimalScale}
      value={value}
      variant={variant}
      size={size}
      fullWidth
      error={error}
      helperText={helperText}
      required={required}
      onInput={handleInput}
      InputProps={{
        inputProps: {
          tabIndex: readOnly ? -1 : 0 // Prevent focus on the input field
        },
        autoComplete: 'off',
        readOnly: _readOnly,
        endAdornment: (
          <InputAdornment position='end'>
            {displayCycleButton && (
              <Button
                tabIndex={-1}
                onClick={handleCycleButtonClick}
                aria-label='cycle button'
                sx={{
                  backgroundColor: '#708090',
                  color: 'white',
                  ml: 1,
                  padding: '7px 8px',
                  minHeight: '24px',
                  minWidth: '40px',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#607D8B'
                  }
                }}
              >
                {cycleButtonLabel}
              </Button>
            )}

            {displayButtons && (
              <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
                <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
              </IconButton>
            )}
          </InputAdornment>
        )
      }}
      customInput={TextField}
      onChange={e => handleNumberFieldNewValue(e)}
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
