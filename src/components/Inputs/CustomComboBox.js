import { Autocomplete, IconButton, CircularProgress, Paper, TextField } from '@mui/material'
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'
import { Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React, { useState } from 'react'
import PopperComponent from '../Shared/Popper/PopperComponent'

const CustomComboBox = ({
  type = 'text',
  name,
  label,
  value: _value,
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
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const [hover, setHover] = useState(false)

  const [focus, setAutoFocus] = useState(autoFocus)

  const fieldAccess =
    props.maxAccess && props.maxAccess?.record?.controls?.find(item => item.controlId === name)?.accessLevel
  const _readOnly = editMode ? editMode && maxAccess < TrxType.EDIT : readOnly
  const _disabled = disabled || fieldAccess === ControlAccessLevel.Disabled
  const _required = required || fieldAccess === ControlAccessLevel.Mandatory
  const _hidden = fieldAccess === ControlAccessLevel.Hidden

  const value = neverPopulate ? '' : _value

  return (
    <Autocomplete
      name={name}
      value={store?.[defaultIndex] || value}
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
      sx={{ ...sx, display: _hidden ? 'none' : 'unset' }}
      renderOption={(props, option) => {
        if (columnsInDropDown && columnsInDropDown.length > 0) {
          return (
            <Box>
              {props.id.endsWith('-0') && (
                <li className={props.className}>
                  {columnsInDropDown.map((header, i) => {
                    return (
                      <Box key={i} sx={{ flex: 1, fontWeight: 'bold' }}>
                        {header.value.toUpperCase()}
                      </Box>
                    )
                  })}
                </li>
              )}
              <li {...props}>
                {columnsInDropDown.map((header, i) => {
                  return (
                    <Box key={i} sx={{ flex: 1 }}>
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
                <Box sx={{ flex: 1 }}>{option[displayField]}</Box>
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
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {hover &&
                  (_disabled ? null : isLoading ? (
                    <CircularProgress color='inherit' size={18} />
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
                        size='small'
                      >
                        <RefreshIcon />
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
                border: !hasBorder && 'none'
              }
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
