import React, { useEffect, useRef } from 'react'
import { NumericFormat } from 'react-number-format'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { checkAccess } from 'src/lib/maxAccess'
import { iconMap } from 'src/utils/iconMap'

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
  const isEmptyBlurFunction = onBlur.toString() === '()=>{}'

  const name = props.name
  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, props.required, readOnly, hidden)
  const valueShow = useRef(null)

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
    if (val === null || val === undefined) {
      valueShow.current = null

      return null
    }

    val = val?.replace(/,/g, '')

    if (!val.startsWith('.') && val.endsWith('.') && !/\.\d+$/.test(val) && blur) {
      val = val.slice(0, -1)
    }
    valueShow.current = val

    if (val?.endsWith('.') && !blur) {
      return val
    }

    if ((isDotFollowedByOnlyZeros(val) || val.startsWith('.') || val.startsWith('-.')) && !blur) {
      const newVal = val.startsWith('.')
        ? ('0' + val).toString()
        : val.startsWith('-.')
        ? ('-0.' + val?.toString().split('.')[1]).toString()
        : val.toString()

      valueShow.current = newVal

      return Number(newVal)
    }

    if (val == '.' && blur) {
      return null
    }

    if (typeof val === 'number') {
      return Number.isNaN(val) ? null : val
    }

    if (typeof val === 'string') {
      const trimmed = val?.trim()
      if (!trimmed) return null
      const num = Number(trimmed)

      return Number.isNaN(num) ? null : num
    }

    valueShow.current = null

    return null
  }

  const handleNumberChangeValue = (e, blur) => {
    const value = formatNumber(e)
    if (value) e.target.value = value

    onChange(e, parseInputValue(value, blur))
  }

  const handleNumberBlurValue = (e, blur) => {
    const value = formatNumber(e)
    if (value) e.target.value = value

    onBlur(e, parseInputValue(value, blur))
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
      value={valueShow.current || (value ?? '')}
      variant={variant}
      size={size}
      fullWidth
      error={error}
      helperText={helperText}
      required={_required}
      onInput={handleInput}
      onFocus={e => autoSelect && e.target.select()}
      onBlur={e => {
        if (!isEmptyBlurFunction) {
          handleNumberBlurValue(e, true)
        } else if (e.target.value?.endsWith('.')) {
          handleNumberChangeValue(e, true)
        }
      }}
      InputProps={{
        inputProps: {
          min: min,
          max: max,
          type: arrow ? 'number' : 'text',
          tabIndex: readOnly ? -1 : 0,
          onKeyPress: handleKeyPress
        },
        autoComplete: 'off',
        readOnly: _readOnly,
        endAdornment: (!_readOnly || allowClear) && !unClearable && !props.disabled && (
          <InputAdornment position='end'>
            {iconMap[props?.iconKey] && (
              <IconButton tabIndex={iconMapIndex} onClick={handleButtonClick}>
                {iconMap[props?.iconKey]}
              </IconButton>
            )}
            {displayButtons && (value || value === 0) && (
              <IconButton
                tabIndex={-1}
                edge='end'
                onClick={e => {
                  onClear(e)
                  valueShow.current = null
                }}
                aria-label='clear input'
              >
                <ClearIcon sx={{ border: '0px', fontSize: 17 }} />
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
            border: !hasBorder && 'none',
            borderColor: '#959D9E',
            borderRadius: '6px'
          },
          height: `33px !important`
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.90rem',
          top: '0px'
        },
        '& .MuiInputBase-input': {
          fontSize: '0.90rem',
          color: 'black',
          textAlign: align
        },
        '& .MuiAutocomplete-clearIndicator': {
          pl: '0px !important',
          marginRight: '-10px',
          visibility: 'visible'
        }
      }}
      {...props}
    />
  )
}

export default CustomNumberField
