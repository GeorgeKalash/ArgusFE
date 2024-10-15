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

  const cancelTransactionActions = [
    {
      key: 'Cancel Transaction',
      condition: true,
      onClick: async () => await posPaymentService.cancelPayment(),
      disabled: responseData == null
    }
  ]

  console.log(responseData)

  const startTransactionActions = [
    {
      key: 'Start Transaction',
      condition: true,
      onClick: async () =>
        await posPaymentService.startPayment(
          {
            msgId: 'PUR',
            ecrno: '1',
            ecR_RCPT: 'Hello2',
            amount: 50,
            a1: '2',
            a2: '3',
            a3: '4',
            a4: '5',
            a5: '6',
            ipaddressOrPort: '80808',
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
      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        Check Device:
        <WindowToolbar actions={checkDeviceActions} smallBox={true} />
      </Grid>

      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        Start Transaction:
        <WindowToolbar actions={startTransactionActions} smallBox={true} />
      </Grid>
      <Grid item xs={12} marginLeft={'1rem'} marginRight={'1rem'}>
        Cancel Transaction:
        <WindowToolbar actions={cancelTransactionActions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

export default PosDeviceWindow
