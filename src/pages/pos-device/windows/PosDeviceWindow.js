import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import posPaymentService from 'src/services/posPayment/PosPaymentService'

const PosDeviceWindow = () => {
  const [responseData, setResponseData] = useState(null)
  const [deviceStatus, setDeviceStatus] = useState(false)

  useEffect(() => {
    return () => posPaymentService.resolvePamyent()
  }, [])

  const checkDeviceActions = [
    {
      key: 'Check Device',
      condition: true,
      onClick: async () => setDeviceStatus(await posPaymentService.isDeviceOnline())
    }
  ]

  const startTransactionActions = [
    {
      key: 'Start Transaction',
      condition: true,
      onClick: () =>
        posPaymentService.startPayment(
          {
            msgId: 'PUR',
            ecrno: '',
            ecR_RCPT: '',
            amount: '',
            a1: '',
            a2: '',
            a3: '',
            a4: '',
            a5: '',
            ipaddressOrPort: '',
            log: 0
          },
          data => setResponseData(data)
        )
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
        {deviceStatus ? 'Device is connected' : 'Device not connected, you can not start transaction'}
      </Grid>

      <Grid item xs={12}>
        <WindowToolbar actions={checkDeviceActions} smallBox={true} />
      </Grid>

      <Grid item xs={12}>
        <WindowToolbar actions={startTransactionActions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

export default PosDeviceWindow
