import React, { useContext, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import { Grid } from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const StrictDeleteConfirmation = ({ window, action }) => {
  const [confirmationText, setConfirmationText] = useState('')
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.DeleteConfirmation, window })

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
    <Form
      actions={actions}
      isSaved={false}
      onSave={handleSubmit}
      disabledSubmit={confirmationText.toLowerCase() !== 'delete'}
      isParentWindow={false}
    >
      <VertLayout>
        <Grow>
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
                autoFocus={true}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

StrictDeleteConfirmation.width = 500
StrictDeleteConfirmation.height = 300

export default StrictDeleteConfirmation
