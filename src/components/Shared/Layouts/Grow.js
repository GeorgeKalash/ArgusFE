import { Box } from '@mui/material'
import React from 'react'

export const Grow = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>{children}</Box>
)
