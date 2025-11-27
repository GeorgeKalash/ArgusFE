import { Box, Grid, Autocomplete, TextField, IconButton, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import CircularProgress from '@mui/material/CircularProgress'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import { formatDateDefault } from '@argus/shared-domain/src/lib/date-helper'
import styles from './CustomLookup.module.css'
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
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(fullName, props.maxAccess, required, readOnly, hidden)

  const [freeSolo, setFreeSolo] = useState(false)
  const [focus, setAutoFocus] = useState(autoFocus)
  const [isFocused, setIsFocused] = useState(false)

  const valueHighlightedOption = useRef(null)
  const selectFirstValue = useRef(null)
  const autocompleteRef = useRef(null)

  const [inputValue, setInputValue] = useState(firstValue || '')

  useEffect(() => {
    function handleBlur(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        selectFirstValue.current = 'click'
      }
    }

    document.addEventListener('mousedown', handleBlur)

    return () => {
      document.removeEventListener('mousedown', handleBlur)
    }
  }, [])

  useEffect(() => {
    if (!firstValue) {
      setInputValue('')
    }
  }, [firstValue])

  return _hidden ? (
    <></>
  ) : (
    <Grid container spacing={0} className={styles.lookupContainer}>
      <Grid item xs={firstFieldWidth}>
        <Autocomplete
          ref={autocompleteRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          name={name}
          key={firstValue || null}
          value={firstValue}
          {...(!firstValue && { inputValue: inputValue })}
          size={size}
          options={store}
          filterOptions={options => {
            if (displayField) {
              return options.filter(option => option)
            }
          }}
          getOptionLabel={option => {
            if (typeof valueField == 'object') {
              const text = valueField
                .map(header => option[header] && option[header]?.toString())
                ?.filter(item => item)
                ?.join(' ')

              return text || firstValue
            }

            return typeof option === 'object' ? `${option[valueField] ? option[valueField] : ''}` : option
          }}
          onChange={(event, newValue) => {
            setInputValue(newValue ? newValue[valueField] : '')

            onChange(name, newValue)
            setAutoFocus(true)
          }}
          onHighlightChange={(event, newValue) => {
            valueHighlightedOption.current = newValue
          }}
          PopperComponent={PopperComponent}
          PaperComponent={({ children }) =>
            props.renderOption && (
              <Paper style={{ minWidth: `${displayFieldWidth * 100}%`, width: 'max-content' }}>{children}</Paper>
            )
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
                    <li className={`${propsOption.className} ${styles.dropdownOptionRow}`}>
                      {columnsWithGrid.map((header, i) => {
                        const widthPercent = `${(header.grid / totalGrid) * 100}%`

                        return (
                          <Box key={i} className={styles.dropdownHeaderCell} style={{ width: widthPercent }}>
                            {header.value.toUpperCase()}
                          </Box>
                        )
                      })}
                    </li>
                  )}
                  <li {...propsOption} className={`${propsOption.className} ${styles.dropdownOptionRow}`}>
                    {columnsWithGrid.map((header, i) => {
                      let displayValue = option[header.key]

                      if (header?.type && header?.type === 'date' && displayValue) {
                        displayValue = formatDateDefault(displayValue)
                      }
                      const widthPercent = `${(header.grid / totalGrid) * 100}%`

                      return (
                        <Box key={i} className={styles.dropdownCell} style={{ width: widthPercent }}>
                          {displayValue}
                        </Box>
                      )
                    })}
                  </li>
                </Box>
              )
            } else {
              return (
                <Box>
                  {propsOption.id.endsWith('-0') && (
                    <li className={`${propsOption.className} ${styles.dropdownOptionRow}`}>
                      {secondDisplayField && (
                        <Box className={styles.dropdownHeaderCellMain}>{valueField.toUpperCase()}</Box>
                      )}
                      {secondDisplayField && (
                        <Box className={styles.dropdownHeaderCellSecondary}>{displayField.toUpperCase()}</Box>
                      )}
                    </li>
                  )}
                  <li {...propsOption} className={`${propsOption.className} ${styles.dropdownOptionRow}`}>
                    <Box className={styles.dropdownCellMain}>{option[valueField]}</Box>
                    {secondDisplayField && <Box className={styles.dropdownCellSecondary}>{option[displayField]}</Box>}
                  </li>
                </Box>
              )
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              className={[secondDisplayField ? styles.firstFieldWithSecond : ''].filter(Boolean).join(' ')}
              onChange={e => {
                setInputValue(e.target.value)

                if (e.target.value) {
                  onLookup(e.target.value)
                  setFreeSolo(true)
                } else {
                  setStore([])
                  setFreeSolo(false)
                }
              }}
              onKeyDown={onKeyDown}
              onBlur={e => {
                if (!store.some(item => item[valueField] === inputValue) && e.target.value !== firstValue) {
                  setInputValue('')

                  setFreeSolo(true)
                }

                if (selectFirstValue.current !== 'click') {
                  onBlur(e, valueHighlightedOption?.current)
                }
                valueHighlightedOption.current = ''
              }}
              onFocus={e => {
                setStore([]), setFreeSolo(true)
                selectFirstValue.current = ''
                onFocus(e)
              }}
              type={type}
              variant={variant}
              label={label}
              required={_required}
              onKeyUp={e => {
                onKeyUp(e, valueHighlightedOption?.current)

                if (e.key !== 'Enter') setFreeSolo(false)
              }}
              inputProps={{
                ...params.inputProps,
                tabIndex: _readOnly ? -1 : 0
              }}
              autoFocus={focus}
              error={error}
              helperText={helperText}
              InputProps={{
                ...params.InputProps,
                classes: {
                  root: inputs.outlinedRoot,
                  notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
                  input: inputs.inputBase
                },
                endAdornment: !_readOnly && (
                  <Box className={`${styles.iconAdornment} ${!hasBorder ? styles.iconAdornmentNoBorder : ''}`}>
                    {!isLoading ? (
                      <IconButton className={styles.searchIconButton} tabIndex={-1}>
                        <SearchIcon className={styles.searchIcon} />
                      </IconButton>
                    ) : (
                      <CircularProgress size={15} className={styles.loadingSpinner} />
                    )}
                    <IconButton
                      className={styles.clearIconButton}
                      tabIndex={-1}
                      edge='end'
                      onClick={() => {
                        setInputValue('')
                        onChange(name, '')
                        setStore([])
                        setFreeSolo(true)
                      }}
                      aria-label='clear input'
                    >
                      <ClearIcon className={styles.clearIcon} />
                    </IconButton>
                  </Box>
                )
              }}
              InputLabelProps={{
                className: isFocused ? inputs.inputLabelFocused : inputs.inputLabel
              }}
            />
          )}
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
            placeholder={secondFieldLabel == '' ? displayField.toUpperCase() : secondFieldLabel.toUpperCase()}
            value={secondValue ? secondValue : ''}
            required={_required}
            onChange={e => {
              if (secondField?.onChange && secondField?.name) {
                secondField?.onChange(secondField?.name, e.target.value)
              }
            }}
            InputProps={{
              classes: {
                root: inputs.outlinedRoot,
                notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
                input: inputs.inputBase
              },
              inputProps: {
                tabIndex: _readOnly || secondField?.editable === '' ? -1 : 0
              },
              readOnly: secondField ? !secondField?.editable : _readOnly
            }}
            className={[styles.secondField].filter(Boolean).join(' ')}
            error={error}
            helperText={helperText}
          />
        </Grid>
      )}
    </Grid>
  )
}

export default CustomLookup
