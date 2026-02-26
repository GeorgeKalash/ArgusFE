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

  // ✅ label should turn red when required + submitted (editMode) OR parent sets error
  const isLabelError = _required && !value && (editMode || error)

  const handleChange = event => {
    if (onChange) onChange(event)
  }

  return _hidden ? null : (
    <FormControlLabel
      control={
        <Checkbox
          name={name}
          checked={!!value}
          required={false}
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
      label={
        <div
          className={[
            inputs.inputLabel,
            inputs.fieldLabel,
            inputs.checkboxLabelInline,
            isLabelError ? styles.errorLabel : ''
          ].join(' ')}
        >
          <span className={inputs.checkboxLabelText}>{label}</span>
          {_required && <span className={inputs.requiredStar}>*</span>}
        </div>
      }
      className={inputs.outlinedRoot}
      disabled={_disabled}
    />
  )
}

export default CustomCheckBox
