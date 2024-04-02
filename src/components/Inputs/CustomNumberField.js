import React from 'react'
import { NumericFormat } from 'react-number-format';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search';

 const CustomNumberField = (
  {variant = 'outlined', value ,  size = 'small' , label, readOnly=false , decimalScale=0 , onChange, onClear , error, helperText, hasBorder=true }

 ) => {
  return (
    <NumericFormat
    label={label}
    allowLeadingZeros
    thousandSeparator=","
    decimalSeparator="."
    decimalScale={decimalScale}
    value={value}
    variant={variant} size={size}
    fullWidth
    error={error}
    helperText={helperText}
    InputProps={{
      endAdornment: !readOnly  && value &&
        <InputAdornment position='end'>
          <IconButton tabIndex={-1} edge='end' onClick={onClear} aria-label='clear input'>
            <ClearIcon />
          </IconButton>
        </InputAdornment>

    }}
    customInput={TextField}
    onChange={onChange}
    sx={{
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          border: !hasBorder && 'none', // Hide border
        },
      },
    }}

    />
  )
}

export default CustomNumberField
