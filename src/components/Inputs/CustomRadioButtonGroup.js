import React from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { DISABLED, HIDDEN } from 'src/services/api/maxAccess'

const CustomRadioButtonGroup = ({
  options = [],
  value,
  onChange,
  row = true,
  labelStyle = {},
  iconStyle = {},
  maxAccess,
  name,
  ...props
}) => {
  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? {}

  const _hidden = accessLevel === HIDDEN

  return _hidden ? null : (
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
      {options.map(({ label, value, disabled = false }) => {
        const _disabled = accessLevel === DISABLED || disabled

        return <FormControlLabel key={value} value={value} control={<Radio />} label={label} disabled={_disabled} />
      })}
    </RadioGroup>
  )
}

export default CustomRadioButtonGroup
