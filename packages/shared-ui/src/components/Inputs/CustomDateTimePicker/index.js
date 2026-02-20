import { useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import ClearIcon from '@mui/icons-material/Clear'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import { DateTimePicker } from '@mui/x-date-pickers'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import inputs from '../Inputs.module.css'

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
  const dateFormat = `${
    window.localStorage.getItem('default') &&
    JSON.parse(window.localStorage.getItem('default'))['dateFormat']
  } ${formatTime}`

  const [openDatePicker, setOpenDatePicker] = useState(false)

  const { _readOnly, _required, _hidden } = checkAccess(name, props.maxAccess, required, readOnly, hidden)

  const shouldDisableDate = dates => {
    const date = new Date(dates)
    const today = new Date()
    today.setDate(today.getDate())
    date.setDate(date.getDate())

    if (disabledDate === '>=') return date >= today
    if (disabledDate === '<') return date < today
    if (disabledDate === '>') return date > today
    return false
  }

  const newDate = new Date(disabledRangeDate.date)
  newDate.setDate(newDate.getDate() + disabledRangeDate.day)

  const getDefaultValue = () => {
    let v
    switch (defaultValue) {
      case 'today':
        v = new Date()
        break
      case 'yesterday':
        v = new Date()
        v.setDate(v.getDate() - 1)
        break
      case 'boy':
        v = new Date(new Date().getFullYear(), 0, 1)
        break
      default:
        v = null
    }
    return v
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
          // ✅ the important part: keep the popper in the same DOM tree
          popper: { disablePortal: true },

          textField: {
            required: _required,
            size: size,
            fullWidth: fullWidth,
            error: error,
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
                  {resolvedValue && (
                    <IconButton
                      tabIndex={-1}
                      edge='start'
                      onClick={() => onChange(name, null)}
                      className={inputs.iconButton}
                    >
                      <ClearIcon className={inputs.icon} />
                    </IconButton>
                  )}
                  <IconButton
                    tabIndex={-1}
                    onClick={() => setOpenDatePicker(true)}
                    className={inputs.iconButton}
                  >
                    <EventIcon className={inputs.icon} />
                  </IconButton>
                </InputAdornment>
              )
            },
            InputLabelProps: {
              classes: {
                root: inputs.inputLabel,
                shrink: inputs.inputLabelShrink
              }
            }
          },
          actionBar: {
            actions: ['accept', 'today']
          }
        }}
        slots={{
          actionBar: p => <PickersActionBar {...p} actions={['accept', 'today']} />,

          popper: p => <PopperComponent isDateTimePicker={true} {...p} />
        }}
      />
    </LocalizationProvider>
  )
}

export default CustomDateTimePicker
