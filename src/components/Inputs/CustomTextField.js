// ** MUI Imports
import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useMemo, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { checkAccess } from 'src/lib/maxAccess'

const CustomTextField = ({
  type = 'text', //any valid HTML5 input type
  variant = 'outlined', //outlined, standard, filled
  value,
  onClear,
  onSearch,
  onChange,
  onBlur,
  name,
  size = 'small', //small, medium
  fullWidth = true,
  autoFocus = false,
  readOnly = false,
  clearable = false,
  autoComplete = 'new-password',
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
  displayType,
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, props.required, readOnly, hidden)

  const inputRef = useRef(null)

  const [focus, setFocus] = useState(!hasBorder)
  const [isFocused, setIsFocused] = useState(false)

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

  const handleInput = e => {
    const inputValue = e.target.value
    if (type === 'number' && props && e.target.value && inputValue.length > maxLength) {
      e.target.value = inputValue.slice(0, maxLength)
    }
    if (phone) {
      e.target.value = inputValue.slice(0, maxLength)
    }
    if (language === 'number') {
      e.target.value = inputValue?.replace(/[^0-9.]/g, '')
    }

    if (language === 'arabic') {
      e.target.value = inputValue?.replace(/[^؀-ۿ\s]/g, '')
    }

    if (language === 'english') {
      e.target.value = inputValue?.replace(/[^a-zA-Z]/g, '')
    }
  }

  function getElement(e) {
    return {
      ...e,
      target: {
        ...e.target,
        name,
        value: e.target?.value,
        type: e.target?.type
      },
      currentTarget: {
        ...e?.currentTarget,
        name
      }
    }
  }

  const handleChange = e => {
    onChange?.(getElement(e))
  }

  const handleBlur = e => {
    onBlur?.(getElement(e))
  }

  useEffect(() => {
    if (autoFocus && inputRef.current && value == '' && !focus) {
      inputRef.current.focus()
    }
  }, [autoFocus, inputRef.current, value])

  const id = useMemo(() => `${name}-${Math.random().toString(36).slice(2)}`, [])

  return _hidden ? (
    <></>
  ) : (
    <TextField
      key={(value?.length < 1 || readOnly || value === null) && value}
      inputRef={inputRef}
      type={type}
      variant={variant}
      defaultValue={value}
      value={value ? value : null}
      size={size}
      fullWidth={fullWidth}
      autoFocus={focus}
      onFocus={() => setIsFocused(true)}
      onBlur={e => {
        setIsFocused(false)
        setFocus(false)
        if (onBlur) handleBlur(e)
      }}
      onChange={handleChange}
      inputProps={{
        autoComplete,
        readOnly: _readOnly,
        maxLength: maxLength,
        ...(dir ? { dir } : {}),
        inputMode: numberField && 'numeric',
        pattern: numberField && '[0-9]*',
        style: {
          textAlign: numberField && 'right',
          '-moz-appearance': 'textfield',
          textTransform: forceUpperCase ? 'uppercase' : 'none',
          WebkitTextSecurity: displayType === 'password' ? 'disc' : 'none'
        },
        tabIndex: _readOnly ? -1 : 0,
        'data-search': search ? 'true' : 'false',
        name: id
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
