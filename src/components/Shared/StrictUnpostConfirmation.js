import React, { useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import WindowToolbar from './WindowToolbar'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'

const StrictUnpostConfirmation = ({ window, action }) => {
  const [confirmationText, setConfirmationText] = useState('')

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.SmsTemplates
  })

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
          {_labels.areYouSure}
          <br />
          {_labels.youAreAboutToUnpost}
        </p>
        <p style={{ paddingLeft: '2rem' }}>{_labels.typeUnpost}</p>
      </Grid>
      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        <CustomTextField
          name='unpostConfirmation'
          value={confirmationText}
          onChange={handleChange}
          onClear={handleClear}
          placeholder={_labels.placeHolderUnpost}
        />
      </Grid>
      <Grid item xs={12}>
        <WindowToolbar actions={actions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

export default StrictUnpostConfirmation
