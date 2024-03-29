// ** MUI Imports
import { TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useEffect, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';

const CustomTextField = ({
  type = 'text', //any valid HTML5 input type
  variant = 'outlined', //outlined, standard, filled
  value,
  onClear,
  onSearch,
  size = 'small', //small, medium
  fullWidth = true,
  autoFocus = false,
  readOnly = false,
  autoComplete = 'off',
  numberField = false,
  editMode = false,
  maxLength = '1000',
  position,
  dir='ltr',
  hidden = false,
  phone = false,
  search= false,
  language="",
  hasBorder=true,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const _readOnly = editMode ? editMode && maxAccess < 3 : readOnly

  const inputRef = useRef(null)
  const [focus, setFocus] = useState(!hasBorder);


  useEffect(() => {
    if(inputRef.current.selectionStart !== undefined && focus && value  && value?.length < 1 ){
         inputRef.current.focus();
      }
  }, [value]);


  useEffect(() => {
    if (typeof inputRef.current.selectionStart !== undefined && position   ) {
      inputRef.current.setSelectionRange(position, position)
    }
  }, [position])


  const handleInput = (e) => {
    const inputValue = e.target.value;
    if (type=== 'number' && props && e.target.value && inputValue.length > maxLength) {
      const truncatedValue = inputValue.slice(0, maxLength);
      e.target.value = truncatedValue;
      props?.onChange(e);
    }

    if (phone) {
      const truncatedValue = inputValue.slice(0, maxLength);
      e.target.value = truncatedValue?.replace(/\D/g, '');
      props?.onChange(e);
    }
    if (language ==='number') {
      e.target.value = inputValue?.replace(/[^0-9.]/g, '');
      props?.onChange(e);
    }
    if (language ==='arabic') {
      e.target.value = inputValue?.replace(/[^؀-ۿ\s]/g, '');
      props?.onChange(e);
    }

    if (language ==='english') {
      e.target.value = inputValue?.replace(/[^a-zA-Z]/g, '');
      props?.onChange(e);
    }
  };



  return (
    <div style={{ display: hidden ? 'none' : 'block' }}>
      <TextField
        key={(value?.length < 1 || readOnly  || value === null)  && value }
        inputRef={inputRef}
        type={type}
        variant={variant}
        defaultValue={value}
        value={!readOnly && value ? value : undefined} // Use value conditionally based on readOnly
        size={size}
        fullWidth={fullWidth}
        autoFocus={focus}
        inputProps={{
          autoComplete: "off",
          readOnly: _readOnly,
          maxLength: maxLength,
           dir:  dir, // Set direction to right-to-left
          inputMode: 'numeric',
          pattern: numberField && '[0-9]*', // Allow only numeric input
          style: {
            textAlign: numberField && 'right',
            '-moz-appearance': 'textfield', // Firefox

          }
        }}
        autoComplete={autoComplete}

        onInput={handleInput}
        onKeyDown={(e)=> e.key === 'Enter' ? search && onSearch(e.target.value) : setFocus(true)}
        InputProps={{

          endAdornment:
         <InputAdornment position='end'>
            {search &&   <IconButton tabIndex={-1} edge='start' onClick={() =>onSearch(value)}  aria-label='search input'>
                  <SearchIcon />
                </IconButton>}
         { (!readOnly &&
            ((value || value===0 ) && // Only show the clear icon if readOnly is false
                <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
                  <ClearIcon />
                </IconButton>)
            )}

            </InputAdornment>

        }}

        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: !hasBorder && 'none', // Hide border
            },
          },
        }}
        {...props}
      />
    </div>
  )
}

export default CustomTextField
