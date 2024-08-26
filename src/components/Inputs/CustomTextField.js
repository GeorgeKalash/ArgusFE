// ** MUI Imports
import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

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
  dir = 'ltr',
  hidden = false,
  phone = false,
  search = false,
  language = '',
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

  const inputRef = useRef(null)
  const [focus, setFocus] = useState(!hasBorder)

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
  }

  const required = props.required || accessLevel === MANDATORY

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
      inputProps={{
        autoComplete: 'off',
        readOnly: _readOnly,
        disabled: _readOnly,
        maxLength: maxLength,
        dir: dir, // Set direction to right-to-left
        inputMode: 'numeric',
        pattern: numberField && '[0-9]*', // Allow only numeric input
        style: {
          textAlign: numberField && 'right',
          '-moz-appearance': 'textfield' // Firefox
        }
      }}
      autoComplete={autoComplete}
      onInput={handleInput}
      onKeyDown={e => (e.key === 'Enter' ? search && onSearch(e.target.value) : setFocus(true))}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            {search && (
              <IconButton tabIndex={-1} edge='start' onClick={() => onSearch(value)} aria-label='search input'>
                <SearchIcon sx={{ border: '0px', fontSize: 20 }} />
              </IconButton>
            )}
            {!clearable &&
              !readOnly &&
              (value || value === 0) && ( // Only show the clear icon if readOnly is false
                <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
                  <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                </IconButton>
              )}
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: !hasBorder && 'none' // Hide border
          },
          height: `${props.height}px !important`
        }
      }}
      required={required}
      {...props}
    />
  )
}

export default CustomTextField
