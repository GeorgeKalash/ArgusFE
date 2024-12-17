import React from 'react'
import Switch from '@mui/material/Switch'
import { FormControlLabel } from '@mui/material'

export default function CustomSwitch({ label, onChange, ...props }) {
  return <FormControlLabel control={<Switch color='primary' onChange={onChange} {...props} />} label={label} />
}
