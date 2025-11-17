import React, { useContext, useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import Form from './Form'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const StrictConfirmation = ({ window, action, type = '' }) => {
  const { platformLabels } = useContext(ControlContext)

  const [confirmation, setConfirmation] = useState({
    text: '',
    title: '',
    actionMsg: '',
    typeText: '',
    placeHolder: '',
    buttonKey: ''
  })

  useEffect(() => {
    switch (type) {
      case 'close':
        setConfirmation({
          text: '',
          title: platformLabels.closeConfirmation,
          actionMsg: platformLabels.youAreAboutToClose,
          typeText: platformLabels.typeClose,
          placeHolder: platformLabels.placeHolderClose,
          buttonKey: 'Confirm'
        })
        break

      case 'open':
        setConfirmation({
          text: '',
          title: platformLabels.openConfirmation,
          actionMsg: platformLabels.youAreAboutToOpen,
          typeText: platformLabels.typeOpen,
          placeHolder: platformLabels.placeHolderOpen,
          buttonKey: 'Confirm'
        })
        break

      case 'delete':
        setConfirmation({
          text: '',
          title: platformLabels.DeleteConfirmation,
          actionMsg: platformLabels.youAreAbout,
          typeText: platformLabels.typeDelete,
          placeHolder: platformLabels.placeHolder,
          buttonKey: 'Delete'
        })
        break

      default:
        setConfirmation({
          text: '',
          title: '',
          actionMsg: '',
          typeText: '',
          placeHolder: '',
          buttonKey: ''
        })
        break
    }
  }, [type, platformLabels])

  useSetWindow({ title: confirmation.title, window })

  const handleChange = event => setConfirmation(prev => ({ ...prev, text: event.target.value }))
  const handleClear = () => setConfirmation(prev => ({ ...prev, text: '' }))

  const handleSubmit = () => {
    action()
    window.close()
  }

  const actions = [
    {
      key: confirmation.buttonKey,
      condition: true,
      onClick: handleSubmit,
      disabled: confirmation.text.toLowerCase() !== type
    }
  ]

  return (
    <Form
      actions={actions}
      isSaved={false}
      onSave={handleSubmit}
      disabledSubmit={confirmation.text.toLowerCase() !== type}
      isParentWindow={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <p style={{ fontWeight: 'bold' }}>
                {platformLabels.areYouSure}
                <br />
                {confirmation.actionMsg}
              </p>
              <p>{confirmation.typeText}</p>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='confirmation'
                value={confirmation.text}
                onChange={handleChange}
                onClear={handleClear}
                placeholder={confirmation.placeHolder}
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
