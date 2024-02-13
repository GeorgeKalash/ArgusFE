import { Box } from '@mui/material'
import React from 'react'

export default function PreviewReport({ pdfURL }) {
  console.log(pdfURL)

  return (
      <>
        <iframe title={'Preview'} src={pdfURL} width='100%' height='100%' allowFullScreen />
      </>
  )
}
