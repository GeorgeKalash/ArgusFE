import { useEffect, useRef, useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import inputs from '../Inputs.module.css'

const CustomDatePicker = ({
  name,
  label,
  value,
  onChange = () => {},
  onAccept = () => {},
  onBlur = () => {},
  onClear,
  error,
  helperText,
  disabledRangeDate = {},
  max = null,
  min = null,
  variant = 'outlined',
  size = 'small',
  views = ['year', 'month', 'day'],
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  disabledDate = null,
  readOnly = false,
  editMode = false,
  hasBorder = true,
  hidden = false,
  ...props
}) => {
  const inputRef = useRef(null)
  const inputValue = useRef(null)

  const dateFormat =
    window.localStorage.getItem('default') && JSON.parse(window.localStorage.getItem('default'))['dateFormat']

  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, required, readOnly, hidden)

  const shouldDisableDate = dates => {
    const date = new Date(dates)

    const today = new Date()
    today.setDate(today.getDate())
    date.setDate(date.getDate())

    if (disabledDate === '>=') {
      return date >= today
    }
    if (disabledDate === '<') {
      return date < today
    }
    if (disabledDate === '>') {
      return date > today
    }
  }

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus, inputRef.current])

  const newDate = new Date(disabledRangeDate.date)
  newDate.setDate(newDate.getDate() + disabledRangeDate.day)

  function formatDate(newValue) {
    const offsetMinutes = -new Date().getTimezoneOffset()
    const hours = Math.floor(offsetMinutes / 60)
    const minutes = offsetMinutes % 60

    const value = new Date(newValue)
    value.setHours(hours, minutes, 0, 0)

    return value
  }

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        variant={variant}
        size={size}
        value={value}
        label={label}
        onClick={() => setIsFocused(true)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        minDate={!!min ? min : disabledRangeDate.date}
        maxDate={!!max ? max : newDate}
        onAccept={newValue => {
          if (!(newValue instanceof Date) || isNaN(newValue)) return

          const value = formatDate(newValue)

          onAccept(value)
        }}
        fullWidth={fullWidth}
        autoFocus={autoFocus}
        format={dateFormat}
        onChange={newValue => {
          if (!(newValue instanceof Date) || isNaN(newValue)) return
          const value = formatDate(newValue)
          inputValue.current = value
          onChange(name, value)
        }}
        onClose={() => setOpenDatePicker(false)}
        open={openDatePicker}
        disabled={disabled}
        readOnly={_readOnly}
        clearable
        shouldDisableDate={disabledDate && shouldDisableDate}
        slotProps={{
          textField: {
            required: _required,
            size: size,
            fullWidth: fullWidth,
            error: error,
            helperText: helperText,
            inputRef: inputRef,
            inputProps: {
              tabIndex: _readOnly ? -1 : 0
            },
            className: inputs.inputLabels,

            onBlur: e => {
              onBlur(e, inputValue?.current || value)
            },
            InputProps: {
              classes: {
                root: inputs.outlinedRoot,
                notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
                input: inputs.inputBase,
                shrink: inputs.inputLabelShrink,
              },
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end' className={inputs.inputAdornment}>
                  {value && (
                    <IconButton
                      tabIndex={-1}
                      onClick={typeof onClear === 'function' ? onClear : () => onChange(name, null)}
                      className={inputs.iconButton}
                    >
                      <ClearIcon className={inputs.icon} />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1}  onClick={() => setOpenDatePicker(true)} className={inputs.iconButton} >
                    <EventIcon  className={inputs.icon}   size={1} />
                  </IconButton>
                </InputAdornment>
              )
            },
            InputLabelProps: {
              classes: {
                root: inputs.inputLabel,
                shrink: inputs.inputLabelShrink, 
              },
            }
          },
          actionBar: {
            actions: ['accept', 'today']
          }
        }}
        slots={{
          actionBar: props => <PickersActionBar {...props} actions={['accept', 'today']} />,
          popper: PopperComponent
        }}
      />
    </LocalizationProvider>
  )
}

export default CustomDatePicker

