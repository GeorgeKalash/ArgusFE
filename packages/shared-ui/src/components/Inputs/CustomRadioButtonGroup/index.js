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
  labelStyle = {},
  iconStyle = {},
  maxAccess,
  name,
  readOnly,
  hidden,
  required = false,
  ...props
}) => {
  const { _readOnly, _required, _hidden } = checkAccess(name, maxAccess, required, readOnly, hidden)

  const _disabled = _readOnly || _hidden

  return _hidden ? null : (
    <RadioGroup row={row} value={value} onChange={onChange} className={styles.radioGroup} {...props}>
      {options.map(({ label, value, disabled = false }) => {
        const _optionDisabled = _disabled || disabled

        return (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio className={styles.radio} 
            classes={{
              root: inputs.outlinedRoot, 
            }} />}
            label={label}
            disabled={_optionDisabled}
            required={_required}
            classes={{
              label: inputs.inputLabel,
            }}
          />
        )
      })}
    </RadioGroup>
  )
}

export default CustomRadioButtonGroup
