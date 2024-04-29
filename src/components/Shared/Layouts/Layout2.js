import { Box } from '@mui/material'
import React from 'react'

export const Layout2 = ({ children }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column' , zIndex:1}}>
        {children}
    </Box>
);
