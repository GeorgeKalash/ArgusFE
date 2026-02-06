import { Box } from '@mui/material'
import React from 'react'

export const Fixed = ({ children }) => <Box sx={{ display: 'flex', flexDirection: 'column', flex: 0 }}>{children}</Box>
