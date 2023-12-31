// ** React Imports
import { useRef, useState } from 'react'

// ** MUI Imports
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'

const CustomDatePicker = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  variant = 'outlined', //outlined, standard, filled
  size = 'small', //small, medium
  views = ['year', 'month', 'day'],
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  disabledDate = false,
  readOnly = false,
  editMode = false,
  ...props
}) => {
  const dateFormat = window.localStorage.getItem('default') && window.localStorage.getItem('default')['formatDate']

  const [openDatePicker, setOpenDatePicker] = useState(false)

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const _readOnly = editMode ? editMode && maxAccess < 3 : readOnly

   // Function to check if a date should be disabled
    const shouldDisableDate = (date) => {
    const today = new Date();
    today.setDate(today.getDate() - 1);

    return date.toISOString()   >= today.toISOString()  ; // Disable today and future dates
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        variant={variant}
        size={size}
        value={value}
        label={label}
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
                <>
                  {value && (
                    <InputAdornment>
                      <IconButton onClick={() => onChange(name, null)} sx={{ mr: -2 }}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )}
                  <InputAdornment>
                    <IconButton onClick={() => setOpenDatePicker(true)} sx={{ mr: -2 }}>
                      <EventIcon />
                    </IconButton>
                  </InputAdornment>
                </>
              )
            }
          }
        }}
      />
    </LocalizationProvider>
  )
}

export default CustomDatePicker
