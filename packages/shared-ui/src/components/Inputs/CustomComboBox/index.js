import { Autocomplete, IconButton, CircularProgress, Paper, TextField, InputAdornment } from '@mui/material'
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
import { useOpenResource } from "@argus/shared-hooks/src/hooks/useOpenResource";

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
  allowClear = true,
  isLoading,
  onOpen,
  onBlur = () => {},
  valueLink,
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
  const [inputValue, setInputValue] = useState('')

  const { platformLabels } = useContext(ControlContext)

  const autocompleteRef = useRef(null)
  const valueHighlightedOption = useRef(null)
  const selectFirstValue = useRef(null)
  const filterOptions = useRef(null)

  const openResource = useOpenResource();

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

  function measureTextWidth(text, inputEl) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const style = window.getComputedStyle(inputEl);

    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return context.measureText(text).width;
  }

  function isClickOnText(e) {
    if (!isValueLink) return false;

    const input = e.currentTarget.querySelector("input");
    if (!input) return false;

    const valueText = input.value?.toString();
    if (!valueText) return false;

    const rect = input.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    const style = window.getComputedStyle(input);
    const paddingLeft = parseFloat(style.paddingLeft || "0");
    const paddingRight = parseFloat(style.paddingRight || "0");

    const textWidth = measureTextWidth(valueText, input);

    const textStart = paddingLeft;
    const textEnd = rect.width - paddingRight;
    const effectiveTextEnd = Math.min(textStart + textWidth, textEnd);

    return clickX >= textStart && clickX <= effectiveTextEnd;
  }

  const isValueLink = valueLink?.resourceId && value && value[valueField];

  return _hidden ? (
    <></>
  ) : (
    <Autocomplete
      ref={autocompleteRef}
      name={name}
      value={value}
      inputValue={neverPopulate ? inputValue : undefined}
      onInputChange={(_, newInputValue) => {
        if (neverPopulate) setInputValue(newInputValue)
      }}
      size={size}
      options={store}
      key={value}
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
                    ((col.width ?? 2) / columnsInDropDown.reduce((s, c) => s + (c.width ?? 2), 0)) * 100
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
      {...(!props.renderOption
        ? {
            PaperComponent: ({ children }) => (
              <Paper
                style={{
                  width: 'max-content'
                }}
              >
                {children}
              </Paper>
            )
          }
        : {})}
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
      onChange={(_, newValue) => {
        onChange(name, newValue)
        setAutoFocus(true)

        if (neverPopulate) {
          setInputValue('')
          onChange(name, '')
        }
      }}
      fullWidth={fullWidth}
      readOnly={_readOnly}
      freeSolo={_readOnly}
      disabled={_disabled}
      required={_required}
      onFocus={e => {
        selectFirstValue.current = ''
      }}
      onHighlightChange={(_, newValue) => {
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
                {option.icon && (
                  <img src={option.icon} alt={option[displayField]} className={dropdownStyles.dropdownOptionIcon} />
                )}
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
                {option.icon && (
                  <img src={option.icon} alt={option[displayField]} className={dropdownStyles.dropdownOptionIcon} />
                )}
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
                children: (
                  <InputAdornment position='end' className={inputs.inputAdornment}>
                    {hover &&
                      (_disabled ? null : isLoading ? (
                        <IconButton className={inputs.iconButton}>
                          <CircularProgress color='inherit' size={17} />
                        </IconButton>
                      ) : (
                        refresh &&
                        !readOnly && (
                          <IconButton
                            onClick={fetchData}
                            aria-label='refresh data'
                            tabIndex={-1}
                            className={inputs.iconButton}
                          >
                            <RefreshIcon fontSize='small' className={inputs.icon} />
                          </IconButton>
                        )
                      ))}
                    {!_readOnly && value && allowClear && (
                      <IconButton
                        className={inputs.iconButton}
                        tabIndex={-1}
                        onClick={() => onChange(name, '')}
                        aria-label='clear input'
                      >
                        <ClearIcon className={inputs.icon} />
                      </IconButton>
                    )}
                    {childrenWithoutClear}
                  </InputAdornment>
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
              tabIndex: _readOnly ? -1 : 0
            }}
            onMouseDownCapture={(e) => {
              if (!isClickOnText(e)) return;

              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              if (!isClickOnText(e)) return;

              const resolvedProps =
                typeof valueLink.props === "function"
                  ? valueLink.props(value)
                  : valueLink.props;

              openResource(valueLink.resourceId, {
                props: resolvedProps,
              });
            }}
            type={type}
            variant={variant}
            label={label}
            required={_required}
            autoFocus={focus}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`${styles.customComboTextField} ${
              isValueLink ? styles.linkField : ""
            }`}
            error={error}
            helperText={helperText}
            onBlur={e => {
              const allowSelect =
                selectFirstValue.current !== 'click' && document.querySelector('.MuiAutocomplete-listbox')
              onBlur(e, valueHighlightedOption?.current, filterOptions.current, allowSelect)
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
              ) : props?.startAdornment || (params.InputProps.startAdornment && (
                <InputAdornment position='start' className={inputs.startAdornment}>
                  {props?.startAdornment || params.InputProps.startAdornment}
                </InputAdornment>
              )),
              endAdornment: mergedEndAdornment
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
      {...props}
    />
  )
}

export default CustomComboBox
