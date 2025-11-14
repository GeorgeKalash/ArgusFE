import { Autocomplete, IconButton, CircularProgress, Paper, TextField } from '@mui/material'
import { Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React, { useEffect, useRef, useState } from 'react'
import PopperComponent from '../Shared/Popper/PopperComponent'
import { checkAccess } from 'src/lib/maxAccess'
import { formatDateDefault } from 'src/lib/date-helper'

const CustomComboBox = ({
  type = 'text',
  name,
  fullName,
  label,
  value,
  hidden = false,
  valueField = 'key',
  displayField = 'value',
  store = [],
  getOptionBy,
  onChange,
  error,
  helperText,
  variant = 'outlined',
  size = 'small',
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  neverPopulate = false,
  displayFieldWidth = 1,
  sx,
  columnsInDropDown,
  editMode = false,
  hasBorder = true,
  fetchData,
  refresh = true,
  isLoading,
  onOpen,
  onBlur = () => {},
  ...props
}) => {
  const { _readOnly, _required, _hidden, _disabled } = checkAccess(
    fullName,
    props.maxAccess,
    required,
    readOnly,
    hidden,
    disabled
  )

  const [hover, setHover] = useState(false)

  const [focus, setAutoFocus] = useState(autoFocus)
  const [isFocused, setIsFocused] = useState(false)

  const autocompleteRef = useRef(null)

  const valueHighlightedOption = useRef(null)

  const selectFirstValue = useRef(null)

  const filterOptions = useRef(null)

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

  return _hidden ? (
    <></>
  ) : (
    <Autocomplete
      ref={autocompleteRef}
      name={name}
      value={value}
      size={size}
      options={store}
      key={value}
      PopperComponent={PopperComponent}
      PaperComponent={({ children }) => <Paper style={{ width: `${displayFieldWidth * 100}%` }}>{children}</Paper>}
      getOptionLabel={(option, value) => {
        if (typeof displayField == 'object') {
          const text = displayField
            .map(header => {
              if (typeof header === 'string') {
                return option[header] ? option[header].toString() : header === '->' ? header : ''
              }

              if (typeof header === 'object' && header?.name) {
                let value = option[header.name]
                if (!value) return ''

                return header.type === 'date' ? formatDateDefault(value) : value.toString()
              }

              return ''
            })
            ?.filter(item => item)
            ?.join(' ')
          if (text !== undefined) return text
        }
        if (typeof option === 'object') {
          return `${option[displayField]}`
        } else {
          const selectedOption = store.find(item => {
            return item[valueField] === option
          })
          if (selectedOption) return selectedOption[displayField]
          else return ''
        }
      }}
      onOpen={onOpen}
      filterOptions={(options, { inputValue }) => {
        var results
        filterOptions.current = ''

        if (columnsInDropDown) {
          results = options.filter(option =>
            columnsInDropDown
              .map(header => header.key)
              .some(field => option[field]?.toString()?.toLowerCase()?.toString()?.includes(inputValue?.toLowerCase()))
          )
        } else {
          var displayFields = Array.isArray(displayField) ? displayField : [displayField]

          results = options.filter(option =>
            displayFields.some(field => option[field]?.toString()?.toLowerCase()?.includes(inputValue?.toLowerCase()))
          )
        }

        filterOptions.current = results

        return results
      }}
      isOptionEqualToValue={(option, value) => option[valueField] === value[valueField]}
      onChange={(event, newValue) => {
        onChange(name, newValue)
        setAutoFocus(true)
      }}
      fullWidth={fullWidth}
      readOnly={_readOnly}
      freeSolo={_readOnly}
      disabled={_disabled}
      required={_required}
      onFocus={e => {
        selectFirstValue.current = ''
      }}
      onHighlightChange={(event, newValue) => {
        valueHighlightedOption.current = newValue
      }}
      sx={{ ...sx, display: _hidden ? 'none' : 'unset' }}
      renderOption={(props, option) => {
        if (columnsInDropDown && columnsInDropDown.length > 0) {
          const columnsWithGrid = columnsInDropDown.map(col => ({
            ...col,
            grid: col.width ?? 2
          }))

          const totalGrid = columnsWithGrid.reduce((sum, col) => sum + col.grid, 0)

          return (
            <Box>
              {props.id.endsWith('-0') && (
                <li className={props.className} style={{ borderBottom: '1px solid #ccc' }}>
                  {columnsWithGrid.map((header, i) => {
                    const widthPercent = `${(header.grid / totalGrid) * 100}%`

                    return (
                      <Box
                        key={i}
                        sx={{
                          fontWeight: 'bold',
                          width: widthPercent,
                          fontSize: '0.7rem',
                          height: '15px',
                          display: 'flex'
                        }}
                      >
                        {header.value.toUpperCase()}
                      </Box>
                    )
                  })}
                </li>
              )}
              <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
                {option.icon && (
                  <img
                    src={option.icon}
                    alt={option[displayField]}
                    style={{ width: 20, height: 20, marginRight: 8, objectFit: 'contain' }}
                  />
                )}
                {columnsWithGrid.map((header, i) => {
                  let displayValue = option[header.key]
                  const widthPercent = `${(header.grid / totalGrid) * 100}%`
                  if (header?.type && header?.type === 'date' && displayValue) {
                    displayValue = formatDateDefault(displayValue)
                  }

                  return (
                    <Box
                      key={i}
                      sx={{
                        width: widthPercent,
                        fontSize: '0.88rem',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
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
              <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
                {option.icon && (
                  <img
                    src={option.icon}
                    alt={option[displayField]}
                    style={{ width: 20, height: 20, marginRight: 8, objectFit: 'contain' }}
                  />
                )}
                <Box sx={{ flex: 1, fontSize: '0.88rem', height: '20px', display: 'flex', alignItems: 'center' }}>
                  {option[displayField]}
                </Box>
              </li>
            </Box>
          )
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            tabIndex: _readOnly ? -1 : 0,
            ...(neverPopulate && { value: '' })
          }}
          type={type}
          variant={variant}
          label={label}
          required={_required}
          autoFocus={focus}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setIsFocused(true)}
          error={error}
          helperText={helperText}
          onBlur={e => {
            const allowSelect =
              selectFirstValue.current !== 'click' && document.querySelector('.MuiAutocomplete-listbox')
            onBlur(e, valueHighlightedOption?.current, filterOptions.current, allowSelect)
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: value?.icon ? (
              <img
                src={value.icon}
                alt={value[displayField]}
                style={{ width: 20, height: 20, marginRight: 4, marginLeft: 4, objectFit: 'contain' }}
              />
            ) : (
              props?.startAdornment || params.InputProps.startAdornment
            ),
            endAdornment: !_readOnly && (
              <React.Fragment>
                {hover &&
                  (_disabled ? null : isLoading ? (
                    <CircularProgress color='inherit' size={17} />
                  ) : (
                    refresh &&
                    !readOnly && (
                      <IconButton
                        onClick={fetchData}
                        aria-label='refresh data'
                        tabIndex={-1}
                        sx={{
                          p: '0px !important',
                          marginRight: '-10px'
                        }}
                      >
                        <RefreshIcon size={17} />
                      </IconButton>
                    )
                  ))}
                {params.InputProps.endAdornment}
              </React.Fragment>
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
              fontSize: '0.90rem',
              color: 'black'
            },
            '& .MuiAutocomplete-clearIndicator': {
              pl: '0px !important',
              marginRight: '-10px',
              visibility: 'visible'
            }
          }}
        />
      )}
      {...props}
    />
  )
}

export default CustomComboBox
