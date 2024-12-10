import React from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'

const CustomRadioButtonGroup = ({
  options = [],
  value,
  onChange,
  row = true,
  labelStyle = {},
  iconStyle = {},
  ...props
}) => {
  return (
    <RadioGroup
      row={row}
      value={value}
      onChange={onChange}
      sx={{
        '.MuiFormControlLabel-label': {
          fontSize: '0.9rem'
        },
        '.MuiSvgIcon-root': {
          fontSize: '1.2rem'
        }
      }}
      {...props}
    >
      {options.map(({ label, value, disabled = false }) => (
        <FormControlLabel key={value} value={value} control={<Radio />} label={label} disabled={disabled} />
      ))}
    </RadioGroup>
  )
}

export default CustomRadioButtonGroup
