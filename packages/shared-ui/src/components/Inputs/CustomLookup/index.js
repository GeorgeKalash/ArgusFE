import { Box, Grid, Autocomplete, TextField, IconButton, Paper, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import CircularProgress from '@mui/material/CircularProgress'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import { formatDateDefault } from '@argus/shared-domain/src/lib/date-helper'
import styles from './CustomLookup.module.css'
import dropdownStyles from '../SharedDropdown.module.css'
import inputs from '../Inputs.module.css'

const CustomLookup = ({
  type = 'text',
  name,
  fullName,
  label,
  firstValue,
  secondValue,
  secondDisplayField = true,
  columnsInDropDown,
  secondField = { name: '', editable: false, onChange: () => {} },
  store = [],
  setStore,
  onKeyUp,
  valueField = 'key',
  displayField = 'value',
  secondFieldLabel = '',
  onLookup,
  onChange,
  onKeyDown,
  error,
  firstFieldWidth = secondDisplayField ? 6 : 12,
  displayFieldWidth = 1,
  helperText,
  variant = 'outlined',
  size = 'small',
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  editMode,
  hasBorder = true,
  hidden = false,
  isLoading,
  minChars,
  onBlur = () => {},
  onFocus = () => {},
  onValueClick,
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(
    fullName,
    props.maxAccess,
    required,
    readOnly,
    hidden
  )

  const [freeSolo, setFreeSolo] = useState(false)
  const [focus, setAutoFocus] = useState(autoFocus)

  const valueHighlightedOption = useRef(null)
  const selectFirstValue = useRef(null)
  const autocompleteRef = useRef(null)

  const inputElRef = useRef(null)
  const textMeasureRef = useRef(null)

  const [inputValue, setInputValue] = useState(firstValue || '')

  useEffect(() => {
    function handleBlur(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        selectFirstValue.current = 'click'
      }
    }

    document.addEventListener('mousedown', handleBlur)
    return () => document.removeEventListener('mousedown', handleBlur)
  }, [])

  useEffect(() => {
    if (!firstValue) setInputValue('')
  }, [firstValue])

  const measureTextWidth = (text, inputEl) => {
    if (!textMeasureRef.current || !inputEl) return 0
    const style = window.getComputedStyle(inputEl)

    textMeasureRef.current.style.font = style.font
    textMeasureRef.current.style.letterSpacing = style.letterSpacing
    textMeasureRef.current.style.textTransform = style.textTransform
    textMeasureRef.current.textContent = text || ''

    return textMeasureRef.current.getBoundingClientRect().width
  }

  if (_hidden) return <></>

  return (
    <Grid container spacing={0} className={styles.lookupContainer} style={{ position: 'relative' }}>
      <Grid item xs={firstFieldWidth}>
        <Autocomplete
          fullWidth
          ref={autocompleteRef}
          name={name}
          key={firstValue || null}
          value={firstValue}
          {...(!firstValue && { inputValue })}
          size={size}
          options={store}
          PopperComponent={PopperComponent}
          slotProps={{
            popper: {
              className: dropdownStyles.dropdownPopper,
              style: {
                '--dropdown-min-width': `${displayFieldWidth * 100}%`
              }
            }
          }}
          noOptionsText={
            <div className={dropdownStyles.dropdownNoOptionsRow}>
              {columnsInDropDown?.length > 0 ? (
                columnsInDropDown.map((col, i) => (
                  <div
                    key={i}
                    className={dropdownStyles.dropdownNoOptionsCell}
                    style={{
                      width: `${
                        ((col.grid ?? 2) /
                          columnsInDropDown.reduce((s, c) => s + (c.grid ?? 2), 0)) *
                        100
                      }%`
                    }}
                  >
                    {i === 0 ? 'No options' : ''}
                  </div>
                ))
              ) : (
                <div className={dropdownStyles.dropdownNoOptionsSingle}>No options</div>
              )}
            </div>
          }
          filterOptions={options => (displayField ? options.filter(option => option) : options)}
          getOptionLabel={option => {
            if (typeof valueField === 'object') {
              const text = valueField
                .map(header => option[header]?.toString())
                .filter(Boolean)
                .join(' ')
              return text || firstValue
            }
            return typeof option === 'object' ? `${option[valueField] ?? ''}` : option
          }}
          onChange={(_, newValue) => {
            setInputValue(newValue ? newValue[valueField] : '')
            onChange(name, newValue)
            setAutoFocus(true)
          }}
          onHighlightChange={(_, newValue) => {
            valueHighlightedOption.current = newValue
          }}
          PaperComponent={({ children }) =>
            props.renderOption && <Paper style={{ width: 'max-content' }}>{children}</Paper>
          }
          renderOption={(propsOption, option) => {
            if (columnsInDropDown?.length > 0) {
              const columnsWithGrid = columnsInDropDown.map(col => ({
                ...col,
                grid: col.grid ?? 2
              }))
              const totalGrid = columnsWithGrid.reduce((sum, col) => sum + col.grid, 0)

              return (
                <Box>
                  {propsOption.id.endsWith('-0') && (
                    <li className={`${propsOption.className} ${dropdownStyles.dropdownHeaderRow}`}>
                      {columnsWithGrid.map((header, i) => (
                        <Box
                          key={i}
                          className={dropdownStyles.dropdownHeaderCell}
                          style={{ width: `${(header.grid / totalGrid) * 100}%` }}
                        >
                          {header.value.toUpperCase()}
                        </Box>
                      ))}
                    </li>
                  )}

                  <li
                    {...propsOption}
                    className={`${propsOption.className} ${dropdownStyles.dropdownOptionRow}`}
                  >
                    {columnsWithGrid.map((header, i) => {
                      let displayValue = option[header.key]
                      if (header?.type === 'date' && displayValue) {
                        displayValue = formatDateDefault(displayValue)
                      }
                      return (
                        <Box
                          key={i}
                          className={dropdownStyles.dropdownOptionCell}
                          style={{ width: `${(header.grid / totalGrid) * 100}%` }}
                        >
                          {displayValue}
                        </Box>
                      )
                    })}
                  </li>
                </Box>
              )
            }

            return (
              <Box>
                {propsOption.id.endsWith('-0') && (
                  <li className={`${propsOption.className} ${dropdownStyles.dropdownHeaderRow}`}>
                    {secondDisplayField && (
                      <Box className={dropdownStyles.dropdownHeaderCellMain}>
                        {valueField.toUpperCase()}
                      </Box>
                    )}
                    {secondDisplayField && (
                      <Box className={dropdownStyles.dropdownHeaderCellSecondary}>
                        {displayField.toUpperCase()}
                      </Box>
                    )}
                  </li>
                )}

                <li
                  {...propsOption}
                  className={`${propsOption.className} ${dropdownStyles.dropdownOptionRow}`}
                >
                  <Box className={dropdownStyles.dropdownOptionCellMain}>{option[valueField]}</Box>

                  {secondDisplayField && (
                    <Box className={dropdownStyles.dropdownOptionCellSecondary}>
                      {option[displayField]}
                    </Box>
                  )}
                </li>
              </Box>
            )
          }}
          renderInput={params => {
            const hasSelectedValue = !!(firstValue || inputValue)
            const isValueLink = typeof onValueClick === 'function' && hasSelectedValue && !_readOnly

            return (
              <TextField
                {...params}
                fullWidth
                className={`${secondDisplayField && styles.firstField} ${styles.root}`}
                onChange={e => {
                  const v = e.target.value
                  setInputValue(v)

                  if (v) {
                    if (!minChars || v.length >= minChars) {
                      onLookup(v)
                      setFreeSolo(true)
                    }
                  } else {
                    setStore([])
                    setFreeSolo(false)
                  }
                }}
                onKeyDown={onKeyDown}
                onBlur={e => {
                  if (
                    !store.some(item => item?.[valueField] === inputValue) &&
                    e.target.value !== firstValue
                  ) {
                    setInputValue('')
                    setFreeSolo(true)
                  }

                  if (selectFirstValue.current !== 'click') {
                    onBlur(e, valueHighlightedOption.current)
                  }

                  valueHighlightedOption.current = null
                }}
                onFocus={e => {
                  setStore([])
                  setFreeSolo(true)
                  selectFirstValue.current = ''
                  onFocus(e)
                }}
                type={type}
                variant={variant}
                label={label}
                required={_required}
                onKeyUp={e => {
                  onKeyUp(e, valueHighlightedOption.current)
                  if (e.key !== 'Enter') setFreeSolo(false)
                }}
                inputProps={{
                  ...params.inputProps,
                  ref: node => {
                    if (typeof params.inputProps.ref === 'function') params.inputProps.ref(node)
                    else if (params.inputProps.ref) params.inputProps.ref.current = node

                    inputElRef.current = node
                  },
                  tabIndex: _readOnly ? -1 : 0,
                  style: {
                    ...(params.inputProps?.style || {}),
                    ...(isValueLink
                      ? {
                          color: '#1976d2',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }
                      : {})
                  },
                  onMouseDown: e => {
                    params.inputProps?.onMouseDown?.(e)
                  },
                  onClick: e => {
                    params.inputProps?.onClick?.(e)
                    if (!isValueLink) return

                    const inputEl = inputElRef.current
                    if (!inputEl) return

                    const valueText = (inputEl.value ?? '').toString()
                    if (!valueText) return

                    const rect = inputEl.getBoundingClientRect()
                    const clickX = e.clientX - rect.left

                    const style = window.getComputedStyle(inputEl)
                    const paddingLeft = parseFloat(style.paddingLeft || '0')
                    const paddingRight = parseFloat(style.paddingRight || '0')

                    const textWidth = measureTextWidth(valueText, inputEl)

                    const textStart = paddingLeft
                    const textEnd = rect.width - paddingRight
                    const effectiveTextEnd = Math.min(textStart + textWidth, textEnd)

                    const clickedOnText = clickX >= textStart && clickX <= effectiveTextEnd
                    if (!clickedOnText) return

                    e.preventDefault()
                    e.stopPropagation()
                    onValueClick()
                  }
                }}
                autoFocus={focus}
                error={error}
                helperText={helperText}
                InputProps={{
                  ...params.InputProps,
                  classes: {
                    root: inputs.outlinedRoot,
                    notchedOutline: hasBorder
                      ? !secondDisplayField && inputs.outlinedFieldset
                      : inputs.outlinedNoBorder,
                    input: inputs.inputBase
                  },
                  endAdornment: !_readOnly && (
                    <InputAdornment position="end" className={inputs.inputAdornment}>
                      {!isLoading ? (
                        <IconButton edge="start" className={inputs.iconButton} tabIndex={-1}>
                          <SearchIcon className={inputs.icon} />
                        </IconButton>
                      ) : (
                        <CircularProgress size={15} className={inputs.icon} />
                      )}

                      <IconButton
                        className={inputs.iconButton}
                        tabIndex={-1}
                        onClick={() => {
                          setInputValue('')
                          onChange(name, '')
                          setStore([])
                          setFreeSolo(true)
                        }}
                        aria-label="clear input"
                      >
                        <ClearIcon className={inputs.icon} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                InputLabelProps={{
                  classes: {
                    root: inputs.inputLabel,
                    shrink: inputs.inputLabelShrink
                  }
                }}
              />
            )
          }}
          readOnly={_readOnly}
          freeSolo={_readOnly || freeSolo}
          disabled={disabled}
        />
      </Grid>

      {secondDisplayField && (
        <Grid item xs={12 - firstFieldWidth}>
          <TextField
            size={size}
            variant={variant}
            placeholder={
              secondFieldLabel === '' ? displayField.toUpperCase() : secondFieldLabel.toUpperCase()
            }
            value={secondValue || ''}
            required={_required}
            onChange={e => {
              if (secondField?.onChange && secondField?.name) {
                secondField.onChange(secondField.name, e.target.value)
              }
            }}
            InputProps={{
              classes: {
                root: inputs.outlinedRoot,
                notchedOutline: hasBorder ? '' : inputs.outlinedNoBorder,
                input: inputs.inputBase
              },
              inputProps: {
                tabIndex: _readOnly || secondField?.editable === '' ? -1 : 0
              },
              readOnly: secondField ? !secondField.editable : _readOnly
            }}
            className={secondDisplayField && styles.secondField}
            error={error}
            helperText={helperText}
          />
        </Grid>
      )}

      <span
        ref={textMeasureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          pointerEvents: 'none'
        }}
      />
    </Grid>
  )
}

export default CustomLookup
