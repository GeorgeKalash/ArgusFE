import { useRef, useState } from 'react'

import { InputAdornment, IconButton, Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'

import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

const CustomTimePicker = ({
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  disabledRangeTime = {},
  variant = 'outlined',
  size = 'small',

  //views = ['hours', 'minutes', 'AM/PM'],
  fullWidth = true,
  required = false,
  autoFocus = false,
  disabled = false,
  disabledTime = null,
  readOnly = false,
  editMode = false,
  hasBorder = true,
  hidden = false,
  ...props
}) => {
  const [openTimePicker, setOpenTimePicker] = useState(false)

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const { accessLevel } = (props?.maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? 0

  const _readOnly =
    maxAccess < 3 ||
    accessLevel === DISABLED ||
    (readOnly && accessLevel !== MANDATORY && accessLevel !== FORCE_ENABLED)

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  /*  const shouldDisableDate = dates => {
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
  } */

  /*  const newDate = new Date(disabledRangeDate.date)
  newDate.setDate(newDate.getDate() + disabledRangeDate.day) */

  const isRequired = required || accessLevel === MANDATORY

  return _hidden ? (
    <></>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        variant={variant}
        size={size}
        value={value}
        label={label}

        //minTime={dayjs().set('hour', 8).set('minute', 0)}
        //maxTime={dayjs()}
        //maxTime={dayjs().set('hour', 18).set('minute', 0)}
        //minutesStep={30}
        //minDate={disabledRangeDate.date}
        fullWidth={fullWidth}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none' // Hide border
            }
          }
        }}
        autoFocus={autoFocus}
        
        //format='HH:MM' //check if specific format needed
        onChange={newValue => onChange(name, newValue)}
        onClose={() => setOpenTimePicker(false)}
        open={openTimePicker}
        disabled={disabled}
        readOnly={_readOnly}
        clearable //bug from mui not working for now
        //shouldDisableTime={disabledTime && shouldDisableTime} // Enable this prop for date disabling
        slotProps={{
          // replacing clearable behaviour
          textField: {
            required: isRequired,
            size: size,
            fullWidth: fullWidth,
            error: error,
            helperText: helperText,
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {value && (
                    <IconButton tabIndex={-1} edge='start' onClick={() => onChange(name, null)} sx={{ mr: -2 }}>
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
          actionBar: props => <PickersActionBar {...props} actions={['accept']} />
        }}
      />
    </LocalizationProvider>
  )
}

//fix scroll
export default CustomTimePicker
