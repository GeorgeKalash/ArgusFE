import PercentIcon from '@mui/icons-material/Percent'
import PinIcon from '@mui/icons-material/Pin'
import React, { useEffect, useState, useRef } from 'react'
import { NumericFormat } from 'react-number-format'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { checkAccess } from 'src/lib/maxAccess'
import { iconMap } from 'src/utils/iconMap'
import styles from './CustomNumberField.module.css'
import inputs from '../Inputs.module.css'

const CustomNumberField = ({
  variant = 'outlined',
  value = '',
  size = 'small',
  label,
  onChange = () => {},
  onMouseLeave = () => {},
  onBlur = () => {},
  readOnly = false,
  allowClear = false,
  decimalScale = 2,
  onClear,
  hidden = false,
  unClearable = false,
  error,
  helperText,
  hasBorder = true,
  autoSelect = false,
  editMode = false,
  maxLength = 15,
  thousandSeparator = ',',
  min,
  max,
  allowNegative = true,
  arrow = false,
  displayCycleButton = false,
  align = 'left',
  handleButtonClick,
  cycleButtonLabel = '',
  iconMapIndex = 0,
  ...props
}) => {
  const isEmptyFunction = onMouseLeave.toString() === '()=>{}'
  const name = props.name
  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, props.required, readOnly, hidden)
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyPress = e => {
    const regex = /[0-9.-]/
    const key = String.fromCharCode(e.which || e.keyCode)
    if (!regex.test(key)) {
      e.preventDefault()
    }
  }

  function isDotFollowedByOnlyZeros(val) {
    if (typeof val !== 'string') return false

    return /^0?\.0+$/.test(val)
  }

  const parseInputValue = (val, blur) => {
    val = val.replace(/,/g, '')
    if (!val.startsWith('.') && val.endsWith('.') && !/\.\d+$/.test(val) && blur) {
      val = val.slice(0, -1)
    }

    if (val?.indexOf('.') > -1 && val.toString().split('.')[1] == 0 && !blur) return val.toString()

    if (val?.endsWith('.') && !blur) {
      return val
    }
    if (isDotFollowedByOnlyZeros(val) && !blur) {
      return val.startsWith('.') ? ('0' + val).toString() : val.toString()
    }

    if (val == '.' && blur) {
      return null
    }

    const num = val != '' ? val : null

    return isNaN(num) ? null : num
  }

  const handleNumberChangeValue = (e, blur) => {
    const value = formatNumber(e)
    if (value) e.target.value = value

    onChange(e, parseInputValue(value, blur))
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
    const regex = /^-?[0-9,]+(\.\d+)?$/
    if (inputValue && regex.test(inputValue)) {
      inputValue = inputValue.replace(/(?!^-)[^0-9.]/g, '')

      return getNumberWithoutCommas(inputValue)
    }

    return inputValue
  }

  const handleInput = e => {
    const inputValue = e?.target?.value?.replaceAll(',', '').replaceAll('.', '')

    if (e?.target?.value?.indexOf('.') > 0) {
      if (inputValue?.length > maxLength) e.target.value = value
    } else {
      if (inputValue?.length > maxLength - (decimalScale || 0)) {
        e.target.value = value
      }
    }
  }

  const displayButtons = (!_readOnly || allowClear) && !props.disabled && (value || value === 0)

  useEffect(() => {
    if (value) formatNumber({ target: { value } })
  }, [])

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
      value={value ?? ''}
      variant={variant}
      size={size}
      fullWidth
      error={error}
      helperText={helperText}
      required={_required}
      onInput={handleInput}
      onFocus={e => {
        autoSelect && e.target.select()
        setIsFocused(true)
      }}
      onBlur={e => {
        onBlur(e)
        if (e.target.value?.endsWith('.')) {
          handleNumberChangeValue(e, true)
        }
        setIsFocused(false)
      }}
      InputProps={{
        inputProps: {
          min: min,
          max: max,
          type: arrow ? 'number' : 'text',
          tabIndex: readOnly ? -1 : 0,
          onKeyPress: handleKeyPress,
          style: { textAlign: align }
        },
        autoComplete: 'off',
        readOnly: _readOnly,
        classes: {
          root: inputs.outlinedRoot,
          notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
          input: inputs.inputBase
        },
        endAdornment: (!_readOnly || allowClear) && !unClearable && !props.disabled && (
          <InputAdornment position='end'>
            {iconMap[props?.iconKey] && (
              <IconButton tabIndex={iconMapIndex} onClick={handleButtonClick} className={styles['search-icon']}>
                {iconMap[props?.iconKey]}
              </IconButton>
            )}
            {displayButtons && (value || value === 0) && (
              <IconButton
                tabIndex={-1}
                edge='end'
                onClick={onClear}
                aria-label='clear input'
                className={styles['search-icon']}
              >
                <ClearIcon className={styles['search-icon']} />
              </IconButton>
            )}
          </InputAdornment>
        )
      }}
      InputLabelProps={{
        className: isFocused || value ? inputs.inputLabelFocused : inputs.inputLabel
      }}
      customInput={TextField}
      onChange={e => handleNumberChangeValue(e)}
      onMouseLeave={e => handleNumberMouseLeave(e)}
      {...props}
    />
  )
}

export default CustomNumberField
