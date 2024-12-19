import * as React from 'react'
import { useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker, PickersActionBar } from '@mui/x-date-pickers'
import { InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterMomentHijri } from '@mui/x-date-pickers/AdapterMomentHijri'
import moment from 'moment-hijri'
import PopperComponent from '../Shared/Popper/PopperComponent'
import { checkAccess } from 'src/lib/maxAccess'

export default function CustomDatePickerHijri({
  variant = 'outlined',
  size = 'small',
  value,
  name,
  label,
  onChange,
  readOnly,
  disabled,
  disabledDate,
  fullWidth = true,
  hidden = false,
  required = false,
  editMode = false,
  ...props
}) {
  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, required, readOnly, hidden)

  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

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

  const handleDateChange = newValue => {
    const timestamp = newValue ? newValue.valueOf() : null
    onChange(name, timestamp)
  }

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterMomentHijri}>
      <DatePicker
        variant={variant}
        size={size}
        label={label}
        fullWidth={fullWidth}
        value={value ? moment(new Date(value)) : null}
        defaultValue={value ? moment(new Date(value)) : null}
        onChange={handleDateChange}
        onClose={() => setOpenDatePicker(false)}
        open={openDatePicker}
        minDate={moment(new Date(1938, 0, 1))}
        maxDate={moment(new Date(2075, 11, 31))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        shouldDisableDate={disabledDate && shouldDisableDate} // Enable this prop for date disabling
        slots={{
          actionBar: props => <PickersActionBar {...props} actions={['accept', 'today']} />,
          popper: PopperComponent
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
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
          }
        }}
        slotProps={{
          textField: {
            required: _required,
            required: _required,
            readOnly: _readOnly,
            size: size,
            fullWidth: fullWidth,
            inputProps: {
              tabIndex: _readOnly ? -1 : 0
            },
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {Boolean(value) && (
                    <IconButton tabIndex={-1} edge='start' onClick={() => onChange(name, null)} sx={{ mr: -3 }}>
                      <ClearIcon sx={{ border: '0px', fontSize: 17 }} />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1} onClick={() => setOpenDatePicker(true)} sx={{ mr: -2 }}>
                    <EventIcon sx={{ border: '0px', fontSize: 18 }} />
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
