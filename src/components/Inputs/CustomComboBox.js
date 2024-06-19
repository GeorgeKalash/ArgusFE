// ** MUI Imports
import { Autocomplete, TextField } from '@mui/material'
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'
import { Box } from '@mui/material'
import React from 'react'
import PopperComponent from '../Shared/Popper/PopperComponent'

const CustomComboBox = ({
  type = 'text', //any valid HTML5 input type
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
  variant = 'outlined', //outlined, standard, filled
  size = 'small', //small, medium
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  displayFieldWidth = 1,
  sx,
  columnsInDropDown,
  editMode = false,
  hasBorder = true,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const fieldAccess =
    props.maxAccess && props.maxAccess?.record?.controls?.find(item => item.controlId === name)?.accessLevel
  const _readOnly = editMode ? editMode && maxAccess < TrxType.EDIT : readOnly
  const _disabled = disabled || fieldAccess === ControlAccessLevel.Disabled
  const _required = required || fieldAccess === ControlAccessLevel.Mandatory
  const _hidden = fieldAccess === ControlAccessLevel.Hidden

  return (
    <Autocomplete
      name={name}
      value={value}
      size={size}
      options={store}
      key={value}
      PaperComponent={({ children }) => <Paper style={{ width: `${displayFieldWidth * 100}%` }}>{children}</Paper>}
      PopperComponent={PopperComponent}
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
      isOptionEqualToValue={(option, value) => option[valueField] == getOptionBy}
      onChange={onChange}
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
                {/* <Box sx={{ flex: 1 }}>{option[valueField]}</Box> */}
                <Box sx={{ flex: 1 }}>{option[displayField]}</Box>
              </li>
            </Box>
          )
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          type={type}
          variant={variant}
          label={label}
          required={_required}
          autoFocus={autoFocus}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            style: {
              border: 'none' // Set width to 100%
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: !hasBorder && 'none' // Hide border
              }
            }
          }}
        />
      )}
    />
  )
}

export default CustomComboBox
