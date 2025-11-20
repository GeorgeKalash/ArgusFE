import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useRef, useState } from 'react'
import { checkAccess } from 'src/lib/maxAccess'
import styles from './CustomTextField.module.css'

const CustomTextField = ({
  type = 'text',
  variant = 'outlined',
  value,
  onClear,
  onSearch,
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
  ...props
}) => {
  const name = props.name

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
              <IconButton className={styles['search-icon']} tabIndex={-1}>
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
      autoComplete={autoComplete}
      onInput={handleInput}
      onKeyDown={e => (e.key === 'Enter' ? search && onSearch(e.target.value) : setFocus(true))}
      InputProps={{
        ...props.InputProps,

        classes: {
          root: styles.outlinedRoot,
          notchedOutline: hasBorder ? styles.outlinedFieldset : styles.outlinedNoBorder,
          input: styles.inputBase
        },
        startAdornment: dynamicStartAdornment,
        endAdornment: (
          <>
            {props.InputProps?.endAdornment}
            {!_readOnly && search && (
              <InputAdornment position='end'>
                <IconButton className={styles['search-icon']} tabIndex={-1} onClick={() => onSearch(value)}>
                  <SearchIcon className={styles['search-icon']} />
                </IconButton>
              </InputAdornment>
            )}
            {!_readOnly && !clearable && (value || value === 0) && (
              <InputAdornment position='end'>
                <IconButton
                  className={styles['search-icon']}
                  tabIndex={-1}
                  id={props.ClearId}
                  onClick={e => {
                    onClear(e)
                    setFocus(true)
                  }}
                >
                  <ClearIcon className={styles['search-icon']} />
                </IconButton>
              </InputAdornment>
            )}
            {endIcons.map((iconBtn, index) => (
              <InputAdornment key={index} position='end'>
                {iconBtn && (
                  <IconButton className={styles['search-icon']} tabIndex={-1}>
                    {iconBtn}
                  </IconButton>
                )}
              </InputAdornment>
            ))}
          </>
        )
      }}
      InputLabelProps={{
        className: isFocused || value ? styles.inputLabelFocused : styles.inputLabel
      }}
      required={_required}
      {...props}
    />
  )
}

export default CustomTextField
