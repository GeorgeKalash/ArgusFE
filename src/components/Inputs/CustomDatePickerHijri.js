import * as React from 'react'
import { AdapterMomentHijri } from '@mui/x-date-pickers/AdapterMomentHijri'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers'
import { InputAdornment, IconButton, Box } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterMomentJalaali } from '@mui/x-date-pickers/AdapterMomentJalaali'
import moment from 'moment-jalaali'

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
  const [openDatePicker, setOpenDatePicker] = React.useState(false)

  return (
    <LocalizationProvider dateAdapter={AdapterMomentJalaali}>
      <DatePicker
        variant={variant}
        size={size}
        label={label}
        key={moment(value)}
        fullWidth={fullWidth}
        defaultValue={value && moment(value)}
        onChange={newValue => onChange(name, newValue)}
        onClose={() => setOpenDatePicker(false)}
        open={openDatePicker}
        slotProps={{
          // replacing clearable behaviour
          textField: {
            size: size,
            fullWidth: fullWidth,
            InputProps: {
              endAdornment: !(readOnly || disabled) && (
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
          }
        }}
      />
    </LocalizationProvider>
  )
}
