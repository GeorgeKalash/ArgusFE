import { Box } from '@mui/material'
import React, { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomButton from '../Inputs/CustomButton'

export default function PreviewReport({ pdf, window: windowInstance }) {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.PreviewReport, window: windowInstance })

  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <iframe title='Preview' src={pdf} width='100%' height='100%' allowFullScreen />
        <Box position='absolute' top={12} right={130} zIndex={1}>
          <CustomButton
            image='popup.png'
            color='#231F20'
            onClick={() => {
              window.open(pdf, '_blank')
            }}
          />
        </Box>
      </Box>
    </>
  )
}

PreviewReport.width = 1000
PreviewReport.height = 500
