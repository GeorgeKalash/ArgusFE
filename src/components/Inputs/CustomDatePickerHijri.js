import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers'
import { InputAdornment, IconButton, TextField } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterMomentHijri } from '@mui/x-date-pickers/AdapterMomentHijri'
import moment from 'moment-hijri'

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

  const datePickerRef = React.useRef(null)

  const zoom = parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom'))
  const datePickerRect = datePickerRef.current?.getBoundingClientRect()

  const thresholdPercentage = 0.35

  const canRenderBelow =
    window.innerHeight / zoom - (datePickerRect && datePickerRect.bottom) > window.innerHeight * thresholdPercentage

  const style = document.createElement('style')
  useEffect(() => {
    function updatePopperComponentPosition() {
      if (datePickerRef.current != null && openDatePicker) {
        if (canRenderBelow) {
          style.innerHTML = `

            .MuiPickersPopper-root {
              transform: translate( ${datePickerRect.left / zoom}px, ${datePickerRect.bottom / zoom}px) !important;
            }
          
          `
        } else {
          style.innerHTML = `

            .MuiPickersPopper-root {
              top: ${datePickerRect?.bottom / zoom}px !important;
              bottom: auto !important;
              transform: translate( ${datePickerRect.left / zoom}px, calc(-100% - 10px - ${
            datePickerRect?.height
          }px)) !important;
            }
          
          `
        }

        document.body.appendChild(style)
      } else {
      }
    }

    window.addEventListener('resize', updatePopperComponentPosition)

    updatePopperComponentPosition()

    return () => {
      window.removeEventListener('resize', updatePopperComponentPosition)
    }
  }, [openDatePicker, datePickerRect, canRenderBelow, zoom])

  return (
    <LocalizationProvider dateAdapter={AdapterMomentHijri}>
      <DatePicker
        variant={variant}
        ref={datePickerRef}
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
        slotProps={{
          textField: {
            readOnly: true,
            size: size,
            fullWidth: fullWidth,
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
