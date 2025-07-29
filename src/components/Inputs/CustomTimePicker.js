import { useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import PopperComponent from '../Shared/Popper/PopperComponent'
import { checkAccess } from 'src/lib/maxAccess'

const CustomTimePicker = ({
  name,
  label,
  value,
  onChange,
  error = false,
  helperText = '',
  disabledRangeTime = {},
  variant = 'outlined',
  size = 'small',
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  disabledTime = null,
  readOnly = false,
  editMode = false,
  hasBorder = true,
  hidden = false,
  use24Hour = false,
  min = null,
  max = null,
  ...props
}) => {
  const [openTimePicker, setOpenTimePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, required, readOnly, hidden)

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        variant={variant}
        size={size}
        value={value}
        label={label}
        fullWidth={fullWidth}
        ampm={!use24Hour}
        minTime={min}
        maxTime={max}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none',
              borderColor: '#959d9e',
              borderRadius: '6px'
            },
            height: '33px !important'
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
        autoFocus={autoFocus}
        onChange={newValue => onChange(name, newValue)}
        onClose={() => setOpenTimePicker(false)}
        open={openTimePicker}
        disabled={disabled}
        readOnly={_readOnly}
        clearable
        slotProps={{
          textField: {
            required: _required,
            size,
            fullWidth,
            error: !!error,
            helperText: typeof error === 'string' ? error : helperText,
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {value && (
                    <IconButton tabIndex={-1} edge='start' onClick={() => onChange(name, null)} sx={{ mr: -3 }}>
                      <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1} onClick={() => setOpenTimePicker(true)} sx={{ mr: -2 }}>
                    <AccessTimeIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          },
          actionBar: {
            actions: ['accept']
          }
        }}
        slots={{
          actionBar: props => <PickersActionBar {...props} actions={['accept']} />,
          popper: PopperComponent
        }}
        {...props}
      />
    </LocalizationProvider>
  )
}

export default CustomTimePicker
