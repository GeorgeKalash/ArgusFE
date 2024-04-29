// ** MUI Imports
import {
    Typography,
    Box,
} from '@mui/material'

import PropTypes from 'prop-types'

const CustomTabPanel = (props) => {
    const { children, value,  height ,index, ...other  } = props

return (
        <Box
            role="tabpanel"
            id={`simple-tabpanel-${index}`}
            sx={{display: value !== index ? 'none !important' : 'flex !important', flexDirection: 'column', width: '100%',flex :'1 !important'}}

            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box sx={{ p: 3 }}>
                <Typography sx={{ height : height, display: 'flex',
                        flexDirection: 'column', }}>{children}</Typography>
            </Box>
        </Box>
    )
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
}

export default CustomTabPanel
