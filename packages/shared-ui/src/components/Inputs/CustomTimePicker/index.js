import { useState } from 'react'
import { InputAdornment, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import PopperComponent from '../../Shared/Popper/PopperComponent'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import inputs from '../Inputs.module.css'

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

  if (_hidden) return <></>

  return (
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
              classes: {
                root: inputs.outlinedRoot,
                notchedOutline: hasBorder ? inputs.outlinedFieldset : inputs.outlinedNoBorder,
                input: inputs.inputBase
              },
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end' className={inputs.inputAdornment}>
                  {value && (
                    <IconButton
                      tabIndex={-1}
                      className={inputs.iconButton}
                      onClick={() => onChange(name, null)}
                    >
                      <ClearIcon className={inputs.icon} />
                    </IconButton>
                  )}

                  <IconButton
                    tabIndex={-1}
                    className={inputs.iconButton}
                    onClick={() => setOpenTimePicker(true)}
                  >
                    <AccessTimeIcon className={inputs.icon} />
                  </IconButton>
                </InputAdornment>
              )
            },
            InputLabelProps: {
              className: isFocused || value ? inputs.inputLabelShrink : inputs.inputLabel
            }
          },
          actionBar: {
            actions: ['accept']
          }
        }}
        slots={{
          actionBar: p => <PickersActionBar {...p} actions={['accept']} />,
          popper: popperProps => (
            <PopperComponent
              {...popperProps}
              matchAnchorWidth={false}
              isDateTimePicker
            />
          )
        }}
        {...props}
      />
    </LocalizationProvider>
  )
}

export default CustomTimePicker
