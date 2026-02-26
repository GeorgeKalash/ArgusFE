import React from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import styles from './Navigation.module.css'

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
      <Tooltip
        title={TooltipTitle}
        placement='bottom'
        PopperProps={{
          disablePortal: false
        }}
      >
        <Box onClick={OpenItems} className={styles.box} sx={{ display: navCollapsed ? 'none' : 'flex' }}>
          <div className={styles.image}>{Image}</div>
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
        PaperProps={{
          sx: {
            minWidth: { xs: 100, sm: 120, md: 140, lg: 160 }
          }
        }}
      >
        {map &&
          map.map((element, index) => (
            <MenuItem key={index} onClick={() => onClickAction(element)}>
              <div className={navCollapsed ? styles.hidden : styles.menuItem}>{element.name}</div>
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}

export default Dropdown
