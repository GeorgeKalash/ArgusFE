// ** MUI Imports
import {
    Tabs,
    Tab,
    Typography,
    Box,
} from '@mui/material'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'

const CustomTabPanel = (props) => {
    const { children, value,  height ,index, ...other  } = props
console.log( height)

return (
        <Box

            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
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
