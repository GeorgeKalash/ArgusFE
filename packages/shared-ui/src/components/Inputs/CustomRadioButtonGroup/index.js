import React from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { checkAccess } from '@argus/shared-domain/src/lib/maxAccess'
import styles from './CustomRadioButtonGroup.module.css'
import inputs from '../Inputs.module.css'

const CustomRadioButtonGroup = ({
  options = [],
  value,
  onChange,
  row = true,
  maxAccess,
  name,
  readOnly,
  hidden,
  required = false,
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(name, maxAccess, required, readOnly, hidden)
  const _disabled = _readOnly || _hidden

  if (_hidden) return null

  return (
    <RadioGroup
      row={row}
      value={value}
      onChange={onChange}
      className={styles.radioGroup}
      {...props}
    >
      {options.map(({ label, value, disabled = false }) => (
        <FormControlLabel
          key={value}
          value={value}
          disabled={_disabled || disabled}
          required={_required}
          label={label}
          classes={{ label: inputs.inputLabel }}
          control={
            <Radio
              className={styles.radio}
              classes={{ root: inputs.outlinedRoot }}
            />
          }
        />
      ))}
    </RadioGroup>
  )
}

export default CustomRadioButtonGroup
