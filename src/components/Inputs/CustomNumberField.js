import React, { useEffect, useRef } from 'react'
import PercentIcon from '@mui/icons-material/Percent'
import PinIcon from '@mui/icons-material/Pin'
import { NumericFormat } from 'react-number-format'
import { Button, IconButton, InputAdornment, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import { getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { TrxType } from 'src/resources/AccessLevels'

const CustomNumberField = ({
  variant = 'outlined',
  value = '',
  size = 'small',
  label,
  onChange = () => {},
  onMouseLeave = () => {},
  readOnly = false,
  allowClear = false,
  decimalScale = 2,
  onClear,
  hidden = false,
  unClearable = false,
  error,
  helperText,
  hasBorder = true,
  editMode = false,
  maxLength = 1000,
  thousandSeparator = ',',
  min,
  max,
  allowNegative = true,
  arrow = false,
  displayCycleButton = false,
  handleButtonClick,
  cycleButtonLabel = '',
  ...props
}) => {
  const isEmptyFunction = onMouseLeave.toString() === '()=>{}'
  const name = props.name
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const inputRef = useRef(null)

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly = editMode ? editMode && maxAccess < TrxType.EDIT : accessLevel > DISABLED ? false : readOnly

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const required = props.required || accessLevel === MANDATORY

  const handleKeyPress = e => {
    const regex = /[0-9.-]/
    const key = String.fromCharCode(e.which || e.keyCode)

    if (!regex.test(key)) {
      e.preventDefault()
    }
  }

  const handleNumberChangeValue = e => {
    const value = formatNumber(e)
    if (value) e.target.value = value
    onChange(e)
  }

  const handleNumberMouseLeave = e => {
    if (!isEmptyFunction) {
      const value = formatNumber(e)
      if (value) e.target.value = value

      onMouseLeave(e)
    }
  }

  const formatNumber = e => {
    let inputValue = e?.target?.value
    if (typeof inputValue !== 'string') return inputValue
    const regex = /^[0-9,]+(\.\d+)?$/
    if (inputValue && regex.test(inputValue)) {
      inputValue = inputValue.replace(/[^0-9.]/g, '')

      return getNumberWithoutCommas(inputValue)
    }

    return inputValue
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

  useEffect(() => {
    if (value) formatNumber({ target: { value } })
  }, [])

  const handleFocus = e => {
    if (e.target.value === '0') {
      e.target.value = ''
      onChange({ ...e, target: { ...e.target, value: '' } })
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select() // Select the text when the editor is initialized
    }
  }, [])

  const handleClick = e => {
    // Prevent focus on click
    e.preventDefault()
  }

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
        inputRef,
        autoFocus: false,
        inputProps: {
          onFocus: handleFocus,
          min: min,
          max: max,
          type: arrow ? 'number' : 'text',
          tabIndex: readOnly ? -1 : 0,
          onKeyPress: handleKeyPress
        },
        autoComplete: 'off',
        readOnly: _readOnly,
        endAdornment: (!readOnly || allowClear) && !unClearable && !props.disabled && (value || value === 0) && (
          <InputAdornment position='end'>
            {props.ShowDiscountIcons && (
              <IconButton onClick={handleButtonClick}>
                {props.isPercentIcon ? <PercentIcon /> : <PinIcon sx={{ minWidth: '40px', height: '70px' }} />}
              </IconButton>
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
      onChange={e => handleNumberChangeValue(e)}
      onMouseLeave={e => handleNumberMouseLeave(e)}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: !hasBorder && 'none'
          }
        }
      }}
      {...props}
    />
  )
}

export default CustomNumberField
