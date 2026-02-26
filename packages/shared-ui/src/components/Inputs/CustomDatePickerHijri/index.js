import * as React from 'react'
import { useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker, PickersActionBar } from '@mui/x-date-pickers'
import { InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterMomentHijri } from '@mui/x-date-pickers/AdapterMomentHijri'
import moment from 'moment-hijri'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import inputs from '../Inputs.module.css'

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
  hasBorder = true,
  ...props
}) {
  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, required, readOnly, hidden)

  const [openDatePicker, setOpenDatePicker] = useState(false)

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
        shouldDisableDate={disabledDate && shouldDisableDate}
        slots={{
          actionBar: props => <PickersActionBar {...props} actions={['accept', 'today']} />,
          popper: PopperComponent
        }}
        slotProps={{
          textField: {
            required: _required,
            readOnly: _readOnly,
            size: size,
            fullWidth: fullWidth,
            inputProps: {
              tabIndex: _readOnly ? -1 : 0
            },
            InputProps: {
              classes: {
                root: inputs.outlinedRoot,
                notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
                input: inputs.inputBase
              },

              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end' className={inputs.inputAdornment}>
                  {Boolean(value) && (
                    <IconButton
                      tabIndex={-1}
                      // edge='start'
                      onClick={() => onChange(name, null)}
                      className={inputs.iconButton}
                    >
                      <ClearIcon className={inputs.icon} />
                    </IconButton>
                  )}
                  <IconButton tabIndex={-1} onClick={() => setOpenDatePicker(true)} className={inputs.iconButton}>
                    <EventIcon className={inputs.icon} />
                  </IconButton>
                </InputAdornment>
              )
            },
            InputLabelProps: {
              classes: {
                root: inputs.inputLabel,
                shrink: inputs.inputLabelShrink, 
              }           
            }
          }
        }}
      />
    </LocalizationProvider>
  )
}

