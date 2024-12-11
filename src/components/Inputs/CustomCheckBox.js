import { FormControlLabel, Checkbox } from '@mui/material'
import { useEffect } from 'react'
import { DISABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'

const CustomCheckBox = ({
  value,
  readOnly = false,
  editMode = false,
  dir = 'ltr',
  hidden = false,
  name,
  label,
  onChange,
  maxAccess,
  disabled = false,
  ...props
}) => {
  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId === name) ?? {}

  const _hidden = accessLevel ? accessLevel === HIDDEN : hidden

  const _disabled = accessLevel === DISABLED || disabled

  const handleChange = event => {
    if (onChange) {
      onChange(event)
    }
  }

  return _hidden ? null : (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={value}
          onChange={handleChange}
          disabled={readOnly || _disabled}
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

export default CustomCheckBox
