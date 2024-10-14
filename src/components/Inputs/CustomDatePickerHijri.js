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

export default function CustomDatePickerHijri({
  variant = 'outlined',
  size = 'small',
  value,
  name,
  label,
  onChange,
  readOnly,
  disabled,
  fullWidth = true
}) {
  const [openDatePicker, setOpenDatePicker] = useState(false)

  const handleDateChange = newValue => {
    const timestamp = newValue ? newValue.valueOf() : null
    onChange(name, timestamp)
  }

  return (
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
        slots={{
          actionBar: props => <PickersActionBar {...props} actions={['accept', 'today']} />,
          popper: PopperComponent
        }}
        slotProps={{
          textField: {
            readOnly: true,
            size: size,
            fullWidth: fullWidth,
            inputProps: {
              tabIndex: readOnly ? -1 : 0 // Prevent focus on the input field
            },
            InputProps: {
              endAdornment: !(readOnly || disabled) && (
                <InputAdornment position='end'>
                  {Boolean(value) && (
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
          }
        }}
      />
    </LocalizationProvider>
  )
}
