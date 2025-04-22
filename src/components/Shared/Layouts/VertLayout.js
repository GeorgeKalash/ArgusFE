import { Box } from '@mui/material'
import React from 'react'

export const VertLayout = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{children}</Box>
)
