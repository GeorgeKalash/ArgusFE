// ** React Imports
import { useRef, useState } from 'react'

// ** MUI Imports
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

const CustomDatePicker = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  disabledRangeDate = {},
  variant = 'outlined', //outlined, standard, filled
  size = 'small', //small, medium
  views = ['year', 'month', 'day'],
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  disabledDate = null,
  readOnly = false,
  editMode = false,
  ...props
}) => {
  const dateFormat =
    window.localStorage.getItem('default') && JSON.parse(window.localStorage.getItem('default'))['dateFormat']

  const [openDatePicker, setOpenDatePicker] = useState(false)
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const _readOnly = editMode ? editMode && maxAccess < TrxType.EDIT : readOnly

  // Function to check if a date should be disabled
  const shouldDisableDate = dates => {
    const date = new Date(dates)

    const today = new Date()
    today.setDate(today.getDate())
    date.setDate(date.getDate())

    if (disabledDate === '>=') {
      return date >= today
    }
    if (disabledDate === '<') {
      return date < today // Disable today and future dates
    }
    if (disabledDate === '>') {
      return date > today // Disable today and future dates
    }
  }
  const newDate = new Date(disabledRangeDate.date) // Create a new Date object to avoid mutating the initialDate
  newDate.setDate(newDate.getDate() + disabledRangeDate.day)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        variant={variant}
        size={size}
        value={value}
        label={label}
        minDate={disabledRangeDate.date}
        maxDate={newDate}
        fullWidth={fullWidth}
        autoFocus={autoFocus}
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
            required: required,
            size: size,
            fullWidth: fullWidth,
            error: error,
            helperText: helperText,
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {value && (
                    <IconButton tabIndex={-1} edge='start' onClick={() => onChange(name, null)} sx={{ mr: -2 }}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1} onClick={() => setOpenDatePicker(true)} sx={{ mr: -2 }}>
                    <EventIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          }
        }}
      />
    </LocalizationProvider>
  )
}

export default CustomDatePicker
