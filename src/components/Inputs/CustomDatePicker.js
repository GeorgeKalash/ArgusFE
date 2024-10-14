// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'

import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

import PopperComponent from '../Shared/Popper/PopperComponent'

const CustomDatePicker = ({
  name,
  label,
  value,
  onChange,
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
  const inputRef = useRef(null) // Step 1: Create a ref for the input field

  const dateFormat =
    window.localStorage.getItem('default') && JSON.parse(window.localStorage.getItem('default'))['dateFormat']

  const [openDatePicker, setOpenDatePicker] = useState(false)

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly =
    maxAccess < 3 ||
    accessLevel === DISABLED ||
    (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

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
    if (autoFocus) {
      setOpenDatePicker(true)
    }
  }, [autoFocus])

  useEffect(() => {
    if (autoFocus && openDatePicker && inputRef.current) {
      inputRef.current.focus() // Focus on the input
    }
  }, [autoFocus, openDatePicker])

  const newDate = new Date(disabledRangeDate.date)
  newDate.setDate(newDate.getDate() + disabledRangeDate.day)

  const isRequired = required || accessLevel === MANDATORY

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        variant={variant}
        size={size}
        value={value}
        label={label}
        minDate={!!min ? min : disabledRangeDate.date}
        maxDate={!!max ? max : newDate}
        fullWidth={fullWidth}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none' // Hide border
            }
          }
        }}
        // autoFocus={autoFocus}
        format={dateFormat}
        onChange={newValue => onChange(name, newValue)}
        onClose={() => setOpenDatePicker(false)}
        open={openDatePicker}
        disabled={disabled}
        readOnly={_readOnly}
        clearable //bug from mui not working for now
        shouldDisableDate={disabledDate && shouldDisableDate} // Enable this prop for date disabling
        slotProps={{
          // replacing clearable behaviour
          textField: {
            required: isRequired,
            size: size,
            fullWidth: fullWidth,
            error: error,
            helperText: helperText,
            inputRef: inputRef,
            inputProps: {
              tabIndex: _readOnly ? -1 : 0
            },
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {value && (
                    <IconButton tabIndex={-1} edge='start' onClick={() => onChange(name, null)} sx={{ mr: -2 }}>
                      <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1} onClick={() => setOpenDatePicker(true)} sx={{ mr: -2 }}>
                    <EventIcon />
                  </IconButton>
                </InputAdornment>
              )
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
