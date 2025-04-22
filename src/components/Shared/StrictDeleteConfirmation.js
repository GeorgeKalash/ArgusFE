import React, { useContext, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import WindowToolbar from './WindowToolbar'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'

const StrictDeleteConfirmation = ({ window, action }) => {
  const [confirmationText, setConfirmationText] = useState('')
  const { platformLabels } = useContext(ControlContext)

  const handleChange = event => {
    const value = event.target.value
    setConfirmationText(value)
  }

  const handleClear = () => {
    setConfirmationText('')
  }

  const handleSubmit = async () => {
    action()
    window.close()
  }

  const actions = [
    {
      key: 'Delete',
      condition: true,
      onClick: handleSubmit,
      disabled: confirmationText.toLowerCase() !== 'delete'
    }
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <p style={{ fontWeight: 'bold', paddingLeft: '2rem' }}>
          {platformLabels.areYouSure}
          <br />
          {platformLabels.youAreAbout}
        </p>
        <p style={{ paddingLeft: '2rem' }}>{platformLabels.typeDelete}</p>
      </Grid>
      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        <CustomTextField
          name='deleteConfirmation'
          value={confirmationText}
          onChange={handleChange}
          onClear={handleClear}
          placeholder={platformLabels.placeHolder}
        />
      </Grid>
      <Grid item xs={12}>
        <WindowToolbar actions={actions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

export default StrictDeleteConfirmation
