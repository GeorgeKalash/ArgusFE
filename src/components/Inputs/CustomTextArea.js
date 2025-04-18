import { TextField, InputAdornment, IconButton, Box } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import DropDownArrow from '/public/images/buttonsIcons/bottom-arrow.png'
import AddAction from '/public/images/buttonsIcons/add.png'
import { checkAccess } from 'src/lib/maxAccess'

const CustomTextArea = ({
  type = 'text', //any valid HTML5 input type
  variant = 'outlined', //outlined, standard, filled
  paddingRight = 0,
  value,
  name,
  onClear,
  onDropDown,
  viewDropDown = false,
  handleAddAction,
  viewAdd = false,
  size = 'small', //small, medium
  fullWidth = true,
  autoFocus = false,
  readOnly = false,
  disabled = false,
  autoComplete = 'off',
  numberField = false,
  editMode = false,
  maxLength = '',
  position,
  rows = 4,
  hidden = false,
  ...props
}) => {
  const { _readOnly, _required, _hidden, _disabled } = checkAccess(
    name,
    props.maxAccess,
    props.required,
    readOnly,
    hidden,
    disabled
  )

  const inputRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    // Save the cursor position before the value changes
    if (inputRef.current && typeof inputRef.current.selectionStart !== undefined && position) {
      inputRef.current.setSelectionRange(position, position)
    }
  }, [position])

  return _hidden ? (
    <></>
  ) : (
    <TextField
      multiline
      rows={rows}
      inputRef={inputRef}
      name={name}
      type={type}
      variant={variant}
      value={value}
      size={size}
      fullWidth={fullWidth}
      autoFocus={autoFocus}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      inputProps={{
        tabIndex: _readOnly ? -1 : 0,
        readOnly: _readOnly,
        maxLength: maxLength,
        inputMode: 'numeric',
        pattern: numberField && '[0-9]*',
        style: {
          textAlign: numberField && 'right',
          paddingRight: paddingRight
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#959d9e',
            borderRadius: '6px'
          }
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
      autoComplete={autoComplete}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {!_readOnly && value && (
                <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
                  <ClearIcon sx={{ border: '0px', fontSize: 17 }} />
                </IconButton>
              )}
              {viewAdd && (
                <IconButton tabIndex={-1} edge='end' onClick={handleAddAction} aria-label='Add' disabled={_disabled}>
                  <Image src={AddAction} alt='Add' width={18} height={18} />
                </IconButton>
              )}
              {viewDropDown && (
                <IconButton tabIndex={-1} edge='end' onClick={onDropDown} aria-label='Drop down' disabled={_disabled}>
                  <Image src={DropDownArrow} alt='Drop Down' width={18} height={18} />
                </IconButton>
              )}
            </div>
          </InputAdornment>
        )
      }}
      required={_required}
      {...props}
    />
  )
}

export default CustomTextArea
