import { Box } from '@mui/material'
import React from 'react'

export default function PreviewReport({ pdfURL }) {
  console.log(pdfURL)

  return (
    <div>
      <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2 }}>
        <iframe title={'Preview'} src={pdfURL} width='100%' height='100%' allowFullScreen />
      </Box>
    </div>
  )
}
