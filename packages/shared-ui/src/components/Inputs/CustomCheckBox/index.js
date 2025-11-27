import React from 'react'
import { FormControlLabel, Checkbox } from '@mui/material'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import styles from './CustomCheckBox.module.css'
import inputs from '../Inputs.module.css'

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
  error = false,
  helperText = '',
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(name, maxAccess, required, readOnly, hidden)

  const _disabled = _readOnly || _hidden || disabled

  const handleChange = event => {
    if (onChange) onChange(event)
  }

  return _hidden ? null : (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={!!value}
          required={_required}
          onChange={handleChange}
          disabled={_disabled}
          inputProps={{ 'aria-label': label }}
          className={[
             styles.checkbox,
            error ? styles.errorCheckbox : '',
            _disabled ? styles.disabledCheckbox : ''
          ].join(' ')}
          {...props}
        />
      }
      label={<span className={inputs.inputLabel}>{label}</span>} 
      className={inputs.outlinedRoot}
      disabled={_disabled}
    />
  )
}

export default CustomCheckBox
