import { useState } from 'react'

import { InputAdornment, IconButton, Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import ClearIcon from '@mui/icons-material/Clear'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { PickersActionBar } from '@mui/x-date-pickers/PickersActionBar'

import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import PopperComponent from '../Shared/Popper/PopperComponent'

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
        fullWidth={fullWidth}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none'
            }
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
          actionBar: props => <PickersActionBar {...props} actions={['accept']} />,
          popper: PopperComponent
        }}
      />
    </LocalizationProvider>
  )
}

export default CustomTimePicker
