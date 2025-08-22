// ** MUI Imports
import { Box } from '@mui/material'

import PropTypes from 'prop-types'
import { useRef, cloneElement, isValidElement } from 'react'

const CustomTabPanel = props => {
  const { children, value, height, index, ...other } = props

  const actionRef = useRef(null)

  return (
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
      onKeyDown={e => {
        const target = e.target
        const role = target.getAttribute('role') || ''
        const isSearchField = target.getAttribute('data-search') === 'true'

        if (actionRef.current?.submit) {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault()
            actionRef.current?.submit()
          }
          if (e.key === 'Enter') {
            if (isSearchField) {
              return
            }
            const isDropDownOpen = target.getAttribute('aria-expanded') === 'true'
            const isEqual = (role === 'combobox' && isDropDownOpen) || role === 'gridcell'

            if (!isEqual) {
              e.preventDefault()
              actionRef.current?.submit()
            }
          }
        }
      }}
      {...other}
    >
      {isValidElement(children) ? cloneElement(children, { ref: actionRef }) : children}
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

export default CustomTabPanel
