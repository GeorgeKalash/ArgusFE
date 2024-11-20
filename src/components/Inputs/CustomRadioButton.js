import { FormControlLabel, Radio } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { DISABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

const CustomRadioButton = ({
  value,
  readOnly = false,
  editMode = false,
  dir = 'ltr',
  hidden = false,
  name,
  label,
  onChange,
  maxAccess,
  groupValue,
  disabled = false,
  ...props
}) => {
  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? {}

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const handleChange = event => {
    if (onChange) {
      onChange(event)
    }
  }

  return _hidden ? null : (
    <FormControlLabel
      control={
        <Radio
          name={name}
          value={value}
          checked={groupValue === value}
          onChange={handleChange}
          disabled={readOnly || disabled}
          inputProps={{ 'aria-label': label }}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 17 } }}
        />
      }
      label={label}
      dir={dir}
      componentsProps={{ typography: { sx: { fontSize: 15 } } }}
    />
  )
}

export default CustomRadioButton
