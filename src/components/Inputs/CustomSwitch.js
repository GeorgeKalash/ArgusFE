import React from 'react'
import Switch from '@mui/material/Switch'
import { FormControlLabel } from '@mui/material'

export default function CustomSwitch({ label, readOnly, onChange, ...props }) {
  return (
    <FormControlLabel control={<Switch color='primary' onChange={!readOnly && onChange} {...props} />} label={label} />
  )
}
