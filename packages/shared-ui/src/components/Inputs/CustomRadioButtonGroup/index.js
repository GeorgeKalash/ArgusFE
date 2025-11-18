import React from 'react'
import { RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { checkAccess } from 'src/lib/maxAccess'
import styles from './CustomRadioButtonGroup.module.css'

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
            control={<Radio className={styles.radio} />}
            label={label}
            disabled={_optionDisabled}
            required={_required}
            className={styles.formControl}
          />
        )
      })}
    </RadioGroup>
  )
}

export default CustomRadioButtonGroup
