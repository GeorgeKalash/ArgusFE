import React from 'react'
import { useWindow } from 'src/windows'
import { Button } from '@mui/material'
import PosDeviceWindow from './windows/PosDeviceWindow'

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
