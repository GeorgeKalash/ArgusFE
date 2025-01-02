import { FormControlLabel, Checkbox } from '@mui/material'
import { checkAccess } from 'src/lib/maxAccess'

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
  required = false,
  disabled = false,
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(name, maxAccess, required, readOnly, hidden)

  const _disabled = _readOnly || _hidden || disabled

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
          required={_required}
          onChange={handleChange}
          disabled={_disabled}
          inputProps={{ 'aria-label': label }}
          sx={{ ml: 2, '& .MuiSvgIcon-root': { fontSize: 15 }, '&.aria-label': { fontSize: 15 } }}
        />
      }
      label={label}
      dir={dir}
      componentsProps={{ typography: { sx: { fontSize: 15 } } }}
    />
  )
}

export default CustomCheckBox
