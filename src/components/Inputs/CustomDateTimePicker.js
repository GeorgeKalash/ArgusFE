import { useEffect, useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'
import PopperComponent from '../Shared/Popper/PopperComponent'
import { DateTimePicker } from '@mui/x-date-pickers'
import { checkAccess } from 'src/lib/maxAccess'

const CustomDateTimePicker = ({
  name,
  label,
  value,
  onChange,
  error,
  disabledRangeDate = {},
  max = null,
  min = null,
  variant = 'outlined',
  size = 'small',
  views = ['year', 'month', 'day', 'hours', 'minutes'],
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  disabledDate = null,
  readOnly = false,
  editMode = false,
  hasBorder = true,
  hidden = false,
  formatTime = 'hh:mm aa',
  defaultValue,
  setFieldValidation,
  ...props
}) => {
  const dateFormat = `${
    window.localStorage.getItem('default') && JSON.parse(window.localStorage.getItem('default'))['dateFormat']
  } ${formatTime}`

  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, required, readOnly, hidden)

  useEffect(() => {
    if (typeof setFieldValidation === 'function') {
      setFieldValidation(prev => {
        const existing = prev?.[name]

        const next = {
          required: _required && !_hidden
        }

        const isEqual = existing?.required === next.required

        return isEqual ? prev : { ...prev, [name]: next }
      })
    }
  }, [_required])

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

  const newDate = new Date(disabledRangeDate.date)
  newDate.setDate(newDate.getDate() + disabledRangeDate.day)

  const getDefaultValue = () => {
    let value

    switch (defaultValue) {
      case 'today':
        value = new Date()
        break

      case 'yesterday':
        value = new Date()
        value.setDate(value.getDate() - 1)
        break

      case 'boy':
        value = new Date(new Date().getFullYear(), 0, 1)
        break

      default:
        value = null
    }

    return value
  }

  const resolvedValue = value === undefined ? getDefaultValue() : value

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        variant={variant}
        size={size}
        value={resolvedValue}
        label={label}
        views={views}
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        format={dateFormat}
        onChange={newValue => onChange(name, newValue)}
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
            inputProps: {
              tabIndex: _readOnly ? -1 : 0
            },
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {resolvedValue  && (
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
          popper: props => <PopperComponent isDateTimePicker={true} {...props} />
        }}
      />
    </LocalizationProvider>
  )
}

export default CustomDateTimePicker
