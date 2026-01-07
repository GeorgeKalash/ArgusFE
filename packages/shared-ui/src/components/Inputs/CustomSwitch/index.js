import React from 'react'
import Switch from '@mui/material/Switch'
import { FormControlLabel } from '@mui/material'
import inputs from '../Inputs.module.css'
import styles from './CustomSwitch.module.css'

export default function CustomSwitch({ label, readOnly, onChange, ...props }) {
  return (
    <FormControlLabel  className={`${inputs.outlinedRoot} ${styles.smallSwitch}` }
     control={<Switch color='primary' onChange={!readOnly && onChange} {...props} />}  label={<div className={inputs.inputLabel}>{label}</div>} 
    />
  )
}
