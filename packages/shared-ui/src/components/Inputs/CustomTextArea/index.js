import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import DropDownArrow from '@argus/shared-ui/src/components/images/buttonsIcons/bottom-arrow.png'
import AddAction from '@argus/shared-ui/src/components/images/buttonsIcons/add.png'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import styles from './CustomTextArea.module.css'
import inputs from '../Inputs.module.css'

const CustomTextArea = ({
  type = 'text', 
  variant = 'outlined', 
  paddingRight = 0,
  value,
  name,
  onClear,
  onDropDown,
  viewDropDown = false,
  handleAddAction,
  viewAdd = false,
  size = 'small', 
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

  useEffect(() => {
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
      autoComplete={autoComplete}
   
      InputProps={{
        classes: {
          root: styles.root,
          notchedOutline: inputs.outlinedFieldset,
          input: inputs.inputBase
        },
        endAdornment: (
          <InputAdornment position='end'  className={inputs.inputAdornment}>
            <div className={styles.textAreaEndAdornmentContainer}>
              {!_readOnly && value && (
                <IconButton tabIndex={-1}  className={inputs.iconButton}  onClick={onClear} aria-label='clear input'>
                  <ClearIcon className={inputs.icon} />
                </IconButton>
              )}
              {viewAdd && (
                <IconButton tabIndex={-1}  className={inputs.iconButton}  onClick={handleAddAction} aria-label='Add' disabled={_disabled}>
                  <Image src={AddAction} alt='Add' width={18} height={18} />
                </IconButton>
              )}
              {viewDropDown && (
                <IconButton tabIndex={-1}  className={inputs.iconButton}  onClick={onDropDown} aria-label='Drop down' disabled={_disabled}>
                  <Image  className={inputs.icon}  src={DropDownArrow} alt='Drop Down' width={18} height={18} />
                </IconButton>
              )}
            </div>
          </InputAdornment>
        )
      }}
        InputLabelProps={{
          classes: {
            root: inputs.inputLabel,
            shrink: inputs.inputLabelShrink, 
          }            
        }}
      required={_required}
      {...props}
    />
  )
}

export default CustomTextArea

