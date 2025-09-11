// ** MUI Imports
import { Box } from '@mui/material'
import PropTypes from 'prop-types'
import { HIDDEN } from 'src/services/api/maxAccess'

const CustomTabPanel = props => {
  const { children, value, height, index, maxAccess, ...other } = props
  const name = `${props.name || 'tab'}.${index}`

  console.log(name, maxAccess)
  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId == name) ?? 0

  const hidden = accessLevel === HIDDEN

  return hidden ? (
    <></>
  ) : (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{
        display: value !== index ? 'none !important' : 'flex !important',
        flexDirection: 'column',
        width: '100%',
        flex: '1 !important',
        position: 'relative',
        overflow: 'auto',
        '.MuiDialogContent-root': {
          padding: '10px !important'
        }
      }}
      {...other}
    >
      {children}
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

export default CustomTabPanel
