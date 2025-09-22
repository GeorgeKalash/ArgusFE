import React, { useContext, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import Form from './Form'

const StrictUnpostConfirmation = ({ window, onSuccess }) => {
  const [confirmationText, setConfirmationText] = useState('')
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.UnpostConfirmation, window })

  const handleChange = event => {
    const value = event.target.value
    setConfirmationText(value)
  }

  const handleClear = () => {
    setConfirmationText('')
  }

  const handleSubmit = async () => {
    onSuccess()
    window.close()
  }

  const actions = [
    {
      key: 'Unlocked',
      condition: true,
      onClick: handleSubmit,
      disabled: confirmationText.toLowerCase() !== 'unpost'
    }
  ]

  return (
    <Form actions={actions} isSaved={false} onSave={confirmationText.toLowerCase() === 'unpost' && handleSubmit}>
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
            autoFocus={true}
          />
        </Grid>
      </Grid>
    </Form>
  )
}

StrictUnpostConfirmation.width = 500
StrictUnpostConfirmation.height = 300

export default StrictUnpostConfirmation
