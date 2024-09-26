import React from 'react'
import { Button } from '@mui/material'
import { useWindow } from 'src/windows'
import axios from 'axios'

const PosWindow = () => {
  return <div>window</div>
}

const PosTest = () => {
  const { stack } = useWindow()

  return (
    <div>
      <Button
        onClick={() => {
          stack({
            Component: PosWindow,
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

export default PosTest
