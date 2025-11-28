import { Autocomplete, IconButton, CircularProgress, Paper, TextField } from '@mui/material'
import { Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React, { useContext, useEffect, useRef, useState } from 'react'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import { formatDateDefault } from '@argus/shared-domain/src/lib/date-helper'
import styles from './CustomComboBox.module.css'
import dropdownStyles from '../SharedDropdown.module.css'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import inputs from '../Inputs.module.css'
import ClearIcon from '@mui/icons-material/Clear'

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
  const { platformLabels } = useContext(ControlContext)

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
      PaperComponent={({ children }) => (
        <Paper
          style={{
            minWidth: `${displayFieldWidth * 100}%`,
            width: 'max-content'
          }}
        >
          {children}
        </Paper>
      )}
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
      loading={isLoading}
      loadingText={`${platformLabels.loading}...`}
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
      renderOption={(propsOption, option) => {
        if (columnsInDropDown && columnsInDropDown.length > 0) {
          const columnsWithGrid = columnsInDropDown.map(col => ({
            ...col,
            grid: col.width ?? 2
          }))

          const totalGrid = columnsWithGrid.reduce((sum, col) => sum + col.grid, 0)

          return (
            <Box>
              {propsOption.id.endsWith('-0') && (
                <li className={`${propsOption.className} ${dropdownStyles.dropdownHeaderRow}`}>
                  {columnsWithGrid.map((header, i) => {
                    const widthPercent = `${(header.grid / totalGrid) * 100}%`

                    return (
                      <Box key={i} className={dropdownStyles.dropdownHeaderCell} style={{ width: widthPercent }}>
                        {header.value.toUpperCase()}
                      </Box>
                    )
                  })}
                </li>
              )}
              <li {...propsOption} className={`${propsOption.className} ${dropdownStyles.dropdownOptionRow}`}>
                {option.icon && (<img src={option.icon} alt={option[displayField]} className={dropdownStyles.dropdownOptionIcon} />)}
                {columnsWithGrid.map((header, i) => {
                  let displayValue = option[header.key]
                  const widthPercent = `${(header.grid / totalGrid) * 100}%`
                  if (header?.type && header?.type === 'date' && displayValue) {
                    displayValue = formatDateDefault(displayValue)
                  }

                  return (
                    <Box key={i} className={dropdownStyles.dropdownOptionCell} style={{ width: widthPercent }}>
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
              <li {...propsOption} className={`${propsOption.className} ${dropdownStyles.dropdownOptionRow}`}>
                {option.icon && (<img src={option.icon} alt={option[displayField]} className={dropdownStyles.dropdownOptionIcon} />)}
                <Box className={dropdownStyles.dropdownOptionSingleText}>{option[displayField]}</Box>
              </li>
            </Box>
          )
        }
      }}
      renderInput={params => {
        const defaultEndAdornment = params.InputProps.endAdornment

        let childrenWithoutClear = null

        if (React.isValidElement(defaultEndAdornment)) {
          const childrenArray = React.Children.toArray(defaultEndAdornment.props.children)

          const filtered = childrenArray.filter(child => child?.props?.['aria-label'] !== 'Clear')

          childrenWithoutClear = filtered
        }

        const mergedEndAdornment =
          !_readOnly && React.isValidElement(defaultEndAdornment)
            ? React.cloneElement(defaultEndAdornment, {
                className: `${inputs.inputAdornment}`,
                children: (
                  <>
                    {hover &&
                      (_disabled ? null : isLoading ? (
                        <IconButton   edge='end' className={inputs.iconButton}>
                          <CircularProgress     color='inherit' size={17} />
                        </IconButton>
                      ) : (
                        refresh &&
                        !readOnly && (
                          <IconButton
                            edge='end'
                            onClick={fetchData}
                            aria-label='refresh data'
                            tabIndex={-1}
                            className={inputs.iconButton}
                          >
                            <RefreshIcon fontSize='small' className={inputs.icon} />
                          </IconButton>
                        )
                      ))}
                 { !_readOnly && value && <IconButton
                      className={inputs.iconButton}
                      tabIndex={-1}
                      onClick={() => onChange(name, '')}
                      aria-label='clear input'
                    >
                      <ClearIcon className={inputs.icon} />
                    </IconButton>}
                    {childrenWithoutClear}
                  </>
                )
              })
            : _readOnly
            ? null
            : null

        return (
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
            className={[styles.customComboTextField]}
            error={error}
            helperText={helperText}
            onBlur={e => {
              const allowSelect =
                selectFirstValue.current !== 'click' && document.querySelector('.MuiAutocomplete-listbox')
              onBlur(e, valueHighlightedOption?.current, filterOptions.current, allowSelect)
              setIsFocused(false)
            }}
            InputProps={{
              ...params.InputProps,
              classes: {
                root: inputs.outlinedRoot,
                notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
                input: inputs.inputBase
              },
              startAdornment: value?.icon ? (
                <img src={value.icon} alt={value[displayField]} className={styles.comboStartIcon} />
              ) : (
                props?.startAdornment || params.InputProps.startAdornment
              ),
              endAdornment: mergedEndAdornment
            }}
            InputLabelProps={{
              className: isFocused || value || value =='->' ? inputs.inputLabelFocused : inputs.inputLabel
            }}
          />
        )
      }}
      {...props}
    />
  )
}

export default CustomComboBox

