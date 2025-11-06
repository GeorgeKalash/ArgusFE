import React from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

function Dropdown({ Image, TooltipTitle, onClickAction, map, navCollapsed }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const OpenItems = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title={TooltipTitle}>
        <Box
          onClick={OpenItems}
          sx={{
            display: navCollapsed ? 'none' : 'flex',
            flexDirection: 'row',
            justifyContent: 'left',
            alignItems: 'left',
            backgroundColor: '#231f20',
            borderRadius: '4px',
            marginLeft: '10px',
            padding: '0px'
          }}
        >
          <div
            style={{
              height: '30px',
              padding: '3px',

              margin: '0px'
            }}
          >
            {Image}
          </div>
        </Box>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {map &&
          map.map((element, index) => (
            <MenuItem key={index} onClick={() => onClickAction(element)}>
              <div style={{ display: navCollapsed ? 'none' : 'flex' }}>{element.name}</div>
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}

export default Dropdown
