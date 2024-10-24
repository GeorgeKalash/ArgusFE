import { useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'

import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

import PopperComponent from '../Shared/Popper/PopperComponent'
import { DateTimePicker } from '@mui/x-date-pickers'

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
  ...props
}) => {
  const dateFormat =
    `${window.localStorage.getItem('default') && JSON.parse(window.localStorage.getItem('default'))['dateFormat']} ${formatTime}`

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

  const newDate = new Date(disabledRangeDate.date)
  newDate.setDate(newDate.getDate() + disabledRangeDate.day)

  const isRequired = required || accessLevel === MANDATORY

  const getDefaultValue = () => {
    let value;
  
    switch (defaultValue) {
      case 'today':
        value = new Date();
        break;
        
      case 'yesterday':
        value = new Date();
        value.setDate(value.getDate() - 1); 
        break;
        
      case 'boy': 
        value = new Date(new Date().getFullYear(), 0, 1);
        break;
        
      default:
        value = null;
    }
  
    return value;
  };
  

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        variant={variant}
        size={size}
        value={value || getDefaultValue()}
        label={label}
        views={views}
        minDate={!!min ? min : disabledRangeDate.date}
        maxDate={!!max ? max : newDate}
        fullWidth={fullWidth}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none'
            }
          }
        }}
        autoFocus={autoFocus}
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
            required: isRequired,
            size: size,
            fullWidth: fullWidth,
            error: error,
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

export default CustomDateTimePicker
