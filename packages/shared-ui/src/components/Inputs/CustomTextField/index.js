import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useRef, useState } from 'react'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import inputs from '../Inputs.module.css'

const CustomTextField = ({
  type = 'text',
  variant = 'outlined',
  value,
  onClear,
  onSearch,
  allowClear = false,
  size = 'small',
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
  startIcons = [],
  endIcons = [],
  InputLabelProps,
  ...props
}) => {
  const name = props.name

  const { _readOnly, _required, _hidden } = checkAccess(
    name,
    props.maxAccess,
    props.required,
    readOnly,
    hidden
  )

  const inputRef = useRef(null)

  const [focus, setFocus] = useState(!hasBorder)
  const [isFocused, setIsFocused] = useState(false)

  const [hasValue, setHasValue] = useState(
    value !== null && value !== undefined && String(value).length > 0
  )

  useEffect(() => {
    setHasValue(value !== null && value !== undefined && String(value).length > 0)
  }, [value])

  useEffect(() => {
    if (inputRef.current && inputRef.current.selectionStart !== undefined && focus && value && String(value).length < 1) {
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

  const dynamicStartAdornment =
    props.InputProps?.startAdornment || startIcons.length > 0 ? (
      <>
        {props.InputProps?.startAdornment}
        {startIcons.map((iconBtn, index) => (
          <InputAdornment key={index} position='start'>
            {iconBtn && (
              <IconButton className={inputs.iconButton} tabIndex={-1}>
                {iconBtn}
              </IconButton>
            )}
          </InputAdornment>
        ))}
      </>
    ) : undefined

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
        setIsFocused(false)
        setFocus(false)
        setHasValue(value !== null && value !== undefined && String(value).length > 0)
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
      autoComplete={autoComplete}
      onInput={handleInput}
      onKeyDown={e => (e.key === 'Enter' ? search && onSearch(e.target.value) : setFocus(true))}
      InputProps={{
        ...props.InputProps,
        classes: {
          root: search ? inputs.searchRoot : inputs.outlinedRoot,
          notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
          input: inputs.inputBase
        },
        startAdornment: dynamicStartAdornment,
        endAdornment: (
          <InputAdornment position='end' className={inputs.inputAdornment}>
            {props.InputProps?.endAdornment}

            {!_readOnly && search && (
              <IconButton className={inputs.iconButton} tabIndex={-1} onClick={() => onSearch(value)}>
                <SearchIcon className={inputs.icon} />
              </IconButton>
            )}

            {(allowClear || (!clearable && !readOnly && (value || value === 0))) && onClear && (
              <IconButton
                className={inputs.iconButton}
                tabIndex={-1}
                id={props.ClearId}
                onMouseDown={e => {
                  e.preventDefault()
                  setIsFocused(false)
                  }
                }
                onClick={e => {
                  onClear(e)
                  setFocus(true)
                }}
              >
                <ClearIcon className={inputs.icon} />
              </IconButton>
            )}

            {endIcons.map((iconBtn, _) => (
              <>
                {iconBtn && (
                  <IconButton className={inputs.iconButton} tabIndex={-1}>
                    {iconBtn}
                  </IconButton>
                )}
              </>
            ))}
          </InputAdornment>
        )
      }}
      InputLabelProps={{
        ...InputLabelProps,
        shrink: Boolean(InputLabelProps?.shrink || isFocused || hasValue),
        className:
          isFocused || value || InputLabelProps?.shrink
            ? inputs.inputLabelShrink
            : inputs.inputLabel
      }}
      required={_required}
      {...props}
    />
  )
}

export default CustomTextField
