import { Autocomplete, IconButton, CircularProgress, Paper, TextField } from '@mui/material'
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'
import { Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React, { useEffect, useRef, useState } from 'react'
import PopperComponent from '../Shared/Popper/PopperComponent'
import { DISABLED } from 'src/services/api/maxAccess'

const CustomComboBox = ({
  type = 'text',
  name,
  label,
  value,
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
  defaultIndex,
  sx,
  columnsInDropDown,
  editMode = false,
  hasBorder = true,
  fetchData,
  refresh = true,
  isLoading,
  onBlur = () => {},
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const [hover, setHover] = useState(false)

  const [focus, setAutoFocus] = useState(autoFocus)
  const [isFocused, setIsFocused] = useState(false)

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const fieldAccess =
    props.maxAccess && props.maxAccess?.record?.controls?.find(item => item.controlId === name)?.accessLevel
  const _readOnly = editMode ? editMode && maxAccess < TrxType.EDIT : accessLevel > DISABLED ? false : readOnly
  const _disabled = disabled || fieldAccess === ControlAccessLevel.Disabled
  const _required = required || fieldAccess === ControlAccessLevel.Mandatory
  const _hidden = fieldAccess === ControlAccessLevel.Hidden

  useEffect(() => {
    if (!value && store?.length > 0 && typeof defaultIndex === 'number' && defaultIndex === 0) {
      onChange(store?.[defaultIndex])
    }
  }, [defaultIndex])
  const autocompleteRef = useRef(null)

  const valueHighlightedOption = useRef(null)

  const selectFirstValue = useRef(null)

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
            .map(header => (option[header] ? option[header]?.toString() : header === '->' && header))
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
      filterOptions={(options, { inputValue }) => {
        if (columnsInDropDown) {
          return options.filter(option =>
            columnsInDropDown
              .map(header => header.key)
              .some(field => option[field]?.toString()?.toLowerCase()?.toString()?.includes(inputValue?.toLowerCase()))
          )
        } else {
          var displayFields = Array.isArray(displayField) ? displayField : [displayField]

          return options.filter(option =>
            displayFields.some(field => option[field]?.toString()?.toLowerCase()?.includes(inputValue?.toLowerCase()))
          )
        }
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
          return (
            <Box>
              {props.id.endsWith('-0') && (
                <li className={props.className} style={{ borderBottom: '1px solid #ccc' }}>
                  {columnsInDropDown.map((header, i) => {
                    return (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          fontWeight: 'bold',
                          width: header.width || 'auto',
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
              <li {...props}>
                {columnsInDropDown.map((header, i) => {
                  return (
                    <Box
                      key={i}
                      sx={{
                        flex: 1,
                        width: header.width || 'auto',
                        fontSize: '0.88rem',
                        height: '20px',
                        display: 'flex'
                      }}
                    >
                      {option[header.key]}
                    </Box>
                  )
                })}
              </li>
            </Box>
          )
        } else {
          return (
            <Box>
              <li {...props}>
                <Box sx={{ flex: 1, fontSize: '0.88rem', height: '20px', display: 'flex' }}>{option[displayField]}</Box>
              </li>
            </Box>
          )
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps, tabIndex: _readOnly ? -1 : 0, ...(neverPopulate && { value: '' }) }}
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
            const listbox = document.querySelector('[role="listbox"]')
            if (selectFirstValue.current !== 'click' && listbox && listbox.offsetHeight > 0) {
              onBlur(e, valueHighlightedOption?.current)
            }
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
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
    />
  )
}

export default CustomComboBox
