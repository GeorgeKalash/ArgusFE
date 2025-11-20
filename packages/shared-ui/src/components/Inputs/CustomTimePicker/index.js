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
import styles from './CustomTimePicker.module.css'

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
            className: [
              styles.customTimeTextField,
              !hasBorder ? styles.noBorder : '',
              isFocused || value ? styles.labelFocused : styles.labelUnfocused
            ]
              .filter(Boolean)
              .join(' '),
            InputProps: {
              endAdornment: !(_readOnly || disabled) && (
                <InputAdornment position='end'>
                  {value && (
                    <IconButton
                      tabIndex={-1}
                      edge='start'
                      onClick={() => onChange(name, null)}
                      className={styles.clearIconButton}
                    >
                      <ClearIcon className={styles.dateIcon} />
                    </IconButton>
                  )}
                  <IconButton
                    tabIndex={-1}
                    onClick={() => setOpenTimePicker(true)}
                    className={styles.eventIconButton}
                  >
                    <AccessTimeIcon className={styles.dateIcon} />
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
