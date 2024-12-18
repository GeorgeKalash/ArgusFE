import { useEffect, useRef, useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'
import PopperComponent from '../Shared/Popper/PopperComponent'
import { checkAccess } from 'src/lib/maxAccess'

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
  const inputRef = useRef(null)

  const dateFormat =
    window.localStorage.getItem('default') && JSON.parse(window.localStorage.getItem('default'))['dateFormat']

  const [openDatePicker, setOpenDatePicker] = useState(false)

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

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        variant={variant}
        size={size}
        value={value}
        label={label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        minDate={!!min ? min : disabledRangeDate.date}
        maxDate={!!max ? max : newDate}
        fullWidth={fullWidth}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none',
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
        autoFocus={autoFocus}
        format={dateFormat}
        onChange={newValue => onChange(name, newValue)}
        onClose={() => setOpenDatePicker(false)}
        open={openDatePicker}
        disabled={disabled}
        readOnly={_readOnly}
        clearable //bug from mui not working for now
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
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {value && (
                    <IconButton tabIndex={-1} edge='start' onClick={() => onChange(name, null)} sx={{ mr: -3 }}>
                      <ClearIcon sx={{ border: '0px', fontSize: 17 }} />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1} onClick={() => setOpenDatePicker(true)} sx={{ mr: -2 }}>
                    <EventIcon sx={{ border: '0px', fontSize: 17 }} />
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
