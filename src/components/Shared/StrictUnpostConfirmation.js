import React, { useContext, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import WindowToolbar from './WindowToolbar'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'

const StrictUnpostConfirmation = ({ window, action }) => {
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
      key: 'Unpost',
      condition: true,
      onClick: handleSubmit,
      disabled: confirmationText.toLowerCase() !== 'unpost'
    }
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <p style={{ fontWeight: 'bold', paddingLeft: '2rem' }}>
          {platformLabels.areYouSure}
          <br />
          {platformLabels.youAreAboutToUnpost}
        </p>
        <p style={{ paddingLeft: '2rem' }}>{platformLabels.typeUnpost}</p>
      </Grid>
      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        <CustomTextField
          name='unpostConfirmation'
          value={confirmationText}
          onChange={handleChange}
          onClear={handleClear}
          placeholder={platformLabels.placeHolderUnpost}
        />
      </Grid>
      <Grid item xs={12}>
        <WindowToolbar actions={actions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

export default StrictUnpostConfirmation
