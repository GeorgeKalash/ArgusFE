import React, { useContext, useRef } from 'react'
import WindowToolbar from '../../../components/Shared/WindowToolbar'
import { Grid, Typography } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'
import { forwardRef } from 'react'
import { useWindow } from 'src/windows'
import CopyToClipboardForm from './CopyToClipboardForm'
import { useReactToPrint } from 'react-to-print'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const PrintConfirmationDialog = forwardRef(({ window, Print, barcode }) => {
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  useSetWindow({ title: platformLabels.Confirmation, window })
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printRef.current
  })

  const handleCopy = () => {
    Print()
    stack({
      Component: CopyToClipboardForm,
      props: {
        barcode
      },
      width: 400,
      height: 200,
      title: platformLabels.printLabel
    })
  }

  const actions = [
    {
      key: 'Copy',
      condition: true,
      onClick: handleCopy,
      disabled: false
    },
    {
      key: 'Print',
      condition: true,
      onClick: handlePrint,
      disabled: false
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography padding={4}>{platformLabels.printConfirmation}</Typography>
          </Grid>
          <div style={{ display: 'none' }}>
            <div ref={printRef} style={{ padding: '20px' }}>
              <p>{barcode}</p>
            </div>
          </div>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar actions={actions} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
})

export default PrintConfirmationDialog
