import { useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Icon from '@argus/shared-core/src/@core/components/icon'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import styles from './Navigation.module.css'

const UserDropdown = props => {
  const { settings } = props
  const [anchorEl, setAnchorEl] = useState(null)
  const router = useRouter()
  const auth = useAuth()
  const { logout,companyName } = useAuth()
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) router.push(url)
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        className={styles.userDropdownIcon}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Icon icon='mdi-account-circle' color='white' fontSize='1.8rem' />
      </Badge>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        classes={{ paper: styles.userMenu }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box className={styles.userHeader}>
          <Typography className={styles.userName}>{companyName}</Typography>
        </Box>
          <Divider className={styles.userMenuDivider} />
        <Box className={styles.userHeader}>
          <Typography className={styles.userName}>{auth?.user?.username}</Typography>
        </Box>

        <Divider className={styles.userMenuDivider} />

        <MenuItem onClick={handleLogout} className={styles.logoutMenuItem}>
          <Icon icon='mdi:logout-variant' />
          <Typography className={styles.logoutText}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
