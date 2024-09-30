import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import posPaymentService from 'src/services/posPayment/PosPaymentService'

const PosDeviceWindow = () => {
  useEffect(() => {
    return () => {
      posPaymentService.resolvePamyent()
    }
  }, [])

  const actions = [
    {
      key: 'Check Device',
      condition: true,
      onClick: () => posPaymentService.isDeviceOnline()
    }
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <p style={{ fontWeight: 'bold', paddingLeft: '2rem' }}>
          POS Device Status
          <br />
        </p>
      </Grid>
      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        Connecting...
      </Grid>

      <Grid item xs={12}>
        <WindowToolbar actions={actions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

export default PosDeviceWindow
