import { Box } from '@mui/material'
import React from 'react'

export const Layout2 = ({ children }) => (
    <Box sx={{ flexDirection: 'column', flex:'1 !important',overflow: 'auto'}}>
        {children}
    </Box>
);
