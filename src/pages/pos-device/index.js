import React, { useState } from 'react'
import { useWindow } from 'src/windows'
import axios from 'axios'
import { Button, Typography, Box, Card, CardContent, CircularProgress, Grid } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const PosDeviceWindow = () => {
  const [deviceStatus, setDeviceStatus] = useState('undefined')
  const [loading, setLoading] = useState(false)

  const checkDevice = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`http://localhost:5000/api/Ingenico/checkDevice?_port=1`)
      setDeviceStatus(data.data.toString())
    } catch (error) {
      console.error('Error checking device:', error)
    }
    setLoading(false)
  }

  const actions = [
    {
      key: 'Check Device',
      condition: true,
      onClick: checkDevice,
      disabled: loading
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
        {loading ? <CircularProgress /> : <Typography>connection is: {deviceStatus}</Typography>}
      </Grid>

      <Grid item xs={12}>
        <WindowToolbar actions={actions} smallBox={true} />
      </Grid>
    </Grid>
  )
}

const PosDevice = () => {
  const { stack } = useWindow()

  return (
    <div>
      <Button
        onClick={() => {
          stack({
            Component: PosDeviceWindow,
            props: {},
            title: 'Pos Payments'
          })
        }}
      >
        open payments
      </Button>
      <p>This is a dummy component for the POS Test page.</p>
    </div>
  )
}

export default PosDevice
