// ** MUI Imports
import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { checkAccess } from 'src/lib/maxAccess'

const CustomTextField = ({
  type = 'text', //any valid HTML5 input type
  variant = 'outlined', //outlined, standard, filled
  value,
  onClear,
  onSearch,
  size = 'small', //small, medium
  fullWidth = true,
  autoFocus = false,
  readOnly = false,
  clearable = false,
  autoComplete = 'off',
  numberField = false,
  editMode = false,
  maxLength = '1000',
  position,
  dir = '',
  hidden = false,
  phone = false,
  search = false,
  language = '',
  hasBorder = true,
  forceUpperCase = false,
  ...props
}) => {
  const name = props.name

  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, props.required, readOnly, hidden)

  const inputRef = useRef(null)

  const [focus, setFocus] = useState(!hasBorder)
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(Boolean(value))

  useEffect(() => {
    setHasValue(Boolean(value && value.length > 0))
  }, [value])

  useEffect(() => {
    if (inputRef.current && inputRef.current.selectionStart !== undefined && focus && value && value?.length < 1) {
      inputRef.current.focus()
    }
  }, [value])

  useEffect(() => {
    if (inputRef.current && typeof inputRef.current.selectionStart !== undefined && position) {
      inputRef.current.setSelectionRange(position, position)
    }
  }, [position])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    const detectAutofill = () => {
      if (input.matches(':-webkit-autofill') || (input.value && input.value.length > 0)) {
        if (!hasValue) {
          setHasValue(true)
        }
      }
    }

    input.addEventListener('animationstart', detectAutofill)
    detectAutofill()
    const timeout = setTimeout(detectAutofill, 50)

    return () => {
      input.removeEventListener('animationstart', detectAutofill)
      clearTimeout(timeout)
    }
  }, [hasValue])

  const handleInput = e => {
    const inputValue = e.target.value
    if (type === 'number' && props && e.target.value && inputValue.length > maxLength) {
      const truncatedValue = inputValue.slice(0, maxLength)
      e.target.value = truncatedValue
      props?.onChange(e)
    }

    if (phone) {
      const truncatedValue = inputValue.slice(0, maxLength)
      e.target.value = truncatedValue?.replace(/[^\d+]/g, '')

      props?.onChange(e)
    }

    if (language === 'number') {
      e.target.value = inputValue?.replace(/[^0-9.]/g, '')
      props?.onChange(e)
    }

    if (language === 'arabic') {
      e.target.value = inputValue?.replace(/[^؀-ۿ\s]/g, '')
      props?.onChange(e)
    }

    if (language === 'english') {
      e.target.value = inputValue?.replace(/[^a-zA-Z]/g, '')
      props?.onChange(e)
    }
    setHasValue(inputValue.length > 0)
  }

  useEffect(() => {
    if (autoFocus && inputRef.current && value == '' && !focus) {
      inputRef.current.focus()
    }
  }, [autoFocus, inputRef.current, value])

  return _hidden ? (
    <></>
  ) : (
    <TextField
      inputRef={inputRef}
      type={type}
      variant={variant}
      defaultValue={value}
      value={value ?? ''}
      size={size}
      fullWidth={fullWidth}
      autoFocus={focus}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false), setFocus(false)
      }}
      inputProps={{
        autoComplete: 'off',
        readOnly: _readOnly,
        maxLength: maxLength,
        ...(dir ? { dir } : {}),
        inputMode: numberField && 'numeric',
        pattern: numberField && '[0-9]*',
        style: {
          textAlign: numberField && 'right',
          '-moz-appearance': 'textfield',
          textTransform: forceUpperCase ? 'uppercase' : 'none'
        },
        tabIndex: _readOnly ? -1 : 0,
        'data-search': search ? 'true' : 'false'
      }}
      InputLabelProps={{
        shrink: hasValue || undefined
      }}
      autoComplete={autoComplete}
      onInput={handleInput}
      onKeyDown={e => (e.key === 'Enter' ? search && onSearch(e.target.value) : setFocus(true))}
      InputProps={{
        endAdornment: !_readOnly && (
          <InputAdornment position='end'>
            {search && (
              <IconButton tabIndex={-1} edge='start' onClick={() => onSearch(value)} aria-label='search input'>
                <SearchIcon sx={{ border: '0px', fontSize: 17 }} />
              </IconButton>
            )}
            {!clearable && !readOnly && (value || value === 0) && (
              <IconButton
                tabIndex={-1}
                id={props.ClearId}
                edge='end'
                onClick={e => {
                  onClear(e)
                  setFocus(true)
                }}
                aria-label='clear input'
              >
                <ClearIcon sx={{ border: '0px', fontSize: 17 }} />
              </IconButton>
            )}
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: !hasBorder && 'none',
            borderColor: '#959d9e',
            borderRadius: '6px'
          },
          height: `33px !important`
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.90rem',
          top: isFocused || value ? '0px' : '-3px'
        },
        '& .MuiInputBase-input': {
          fontSize: '0.90rem'
        }
      }}
      required={_required}
      {...props}
    />
  )
}

export default CustomTextField
