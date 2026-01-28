import React from 'react'
import Window from '../Window'
import { Box, DialogActions, DialogContent } from '@mui/material'
import styles from './PageError.module.css'
import CustomButton from '../../Inputs/CustomButton'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

const PageError = ({ onClose, message, height = '', spacing }) => {
  const { width } = useWindowDimensions()

  const scaleFactor = (() => {
    if (width >= 1680) return 1
    if (width >= 1600) return 0.9

    const minW = 1024
    const maxW = 1600
    const minScale = 0.7
    const maxScale = 0.92

    if (width <= minW) return minScale
    return minScale + ((width - minW) / (maxW - minW)) * (maxScale - minScale)
  })()

  const heightDefault =
    width <= 960 ? 110 : width <= 1280 ? 120 : width <= 1366 ? 160 : width < 1600 ? 160 : 170

  const errorMessage =
    typeof message === 'string'
      ? message
      : !message?.response
      ? message?.error
        ? message.error
        : message?.message
      : message?.response?.data?.error
      ? message.response.data.error
      : message?.response?.data

  return (
    <Window
      Title='Error'
      width={450}
      spacing={spacing}
      height={height || heightDefault}
      onClose={onClose}
      expandable={false}
      controlled={true}
      isLoading={false}
      refresh={false}
    >
      <DialogContent className={styles.dialogContent} style={{ '--sf': scaleFactor }}>
        <p className={styles.errorMessageText}>{errorMessage}</p>
      </DialogContent>

      <DialogActions sx={{ pb: 2 }}>
        <Box sx={{ pt: 2, pl: 2 }}>
          <CustomButton label="ok" onClick={onClose} autoFocus />
        </Box>
      </DialogActions>
    </Window>
  )
}

export default PageError
