import React, { useState } from 'react'
import axios from 'axios'
import { Typography, CircularProgress, Grid } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const PosDeviceWindow = () => {
  const [deviceStatus, setDeviceStatus] = useState('connecting...')
  const [loading, setLoading] = useState(false)

  const checkDevice = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`http://localhost:5000/api/Ingenico/checkDevice?_port=22`)
      setDeviceStatus(data.data.toString())
    } catch (error) {
      setDeviceStatus(error.response.data)
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

export default PosDeviceWindow
