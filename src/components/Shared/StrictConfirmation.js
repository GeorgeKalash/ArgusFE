import React, { useContext, useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import Form from './Form'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const StrictConfirmation = ({ window, action, type = '' }) => {
  const [confirmationText, setConfirmationText] = useState('')
  const [confirmationTitle, setConfirmationTitle] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [typeText, setTypeText] = useState('')
  const [placeHolder, setPlaceHolder] = useState('')
  const [key, setButtonKey] = useState('')

  const { platformLabels } = useContext(ControlContext)

  useEffect(() => {
    switch (type) {
      case 'close':
        setConfirmationTitle(platformLabels.closeConfirmation)
        setActionMsg(platformLabels.youAreAboutToClose)
        setTypeText(platformLabels.typeClose)
        setPlaceHolder(platformLabels.placeHolderClose)
        setButtonKey('Confirm')
        break

      case 'open':
        setConfirmationTitle(platformLabels.openConfirmation)
        setActionMsg(platformLabels.youAreAboutToOpen)
        setTypeText(platformLabels.typeOpen)
        setPlaceHolder(platformLabels.placeHolderOpen)
        setButtonKey('Confirm')
        break

      case 'delete':
        setConfirmationTitle(platformLabels.DeleteConfirmation)
        setActionMsg(platformLabels.youAreAbout)
        setTypeText(platformLabels.typeDelete)
        setPlaceHolder(platformLabels.placeHolder)
        setButtonKey('Delete')
        break

      default:
        setConfirmationTitle('')
        setActionMsg('')
        setTypeText('')
        setPlaceHolder('')
        setButtonKey('')
        break
    }
  }, [type, platformLabels])

  useSetWindow({ title: confirmationTitle, window })

  const handleChange = event => setConfirmationText(event.target.value)
  const handleClear = () => setConfirmationText('')

  const handleSubmit = async () => {
    action()
    window.close()
  }

  const actions = [
    {
      key: key,
      condition: true,
      onClick: handleSubmit,
      disabled: confirmationText.toLowerCase() !== type
    }
  ]

  return (
    <Form
      actions={actions}
      isSaved={false}
      onSave={handleSubmit}
      disabledSubmit={confirmationText.toLowerCase() !== type}
      isParentWindow={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <p style={{ fontWeight: 'bold', paddingLeft: '2rem' }}>
                {platformLabels.areYouSure}
                <br />
                {actionMsg}
              </p>
              <p style={{ paddingLeft: '2rem' }}>{typeText}</p>
            </Grid>
            <Grid item xs={12} marginLeft='1rem' marginRight='1rem'>
              <CustomTextField
                name='confirmation'
                value={confirmationText}
                onChange={handleChange}
                onClear={handleClear}
                placeholder={placeHolder}
                autoFocus
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

StrictConfirmation.width = 500
StrictConfirmation.height = 300

export default StrictConfirmation
