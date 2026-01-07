import React, { useContext, useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import styles from './StrictConfirmation.module.css'
import Form from '../Form'

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

  const handleChange = event =>
    setConfirmation(prev => ({ ...prev, text: event.target.value }))

  const handleClear = () =>
    setConfirmation(prev => ({ ...prev, text: '' }))

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
          <Grid container spacing={2} className={styles.container}>
            <Grid item xs={12}>
              <p className={styles.title}>
                {platformLabels.areYouSure}
                <br />
                {confirmation.actionMsg}
              </p>

              <p className={styles.message}>
                {confirmation.typeText}
              </p>
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='confirmation'
                value={confirmation.text}
                onChange={handleChange}
                onClear={handleClear}
                placeholder={confirmation.placeHolder}
                autoFocus
                className={styles.input}
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
