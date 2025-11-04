import { useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useAuth } from 'src/hooks/useAuth'

const UserDropdown = props => {
  const { settings } = props
  const [anchorEl, setAnchorEl] = useState(null)
  const router = useRouter()
  const auth = useAuth()
  const { logout } = useAuth()
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) {
      router.push(url)
    }
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
        sx={{ ml: 2, cursor: 'pointer' }}
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
        sx={{ '& .MuiMenu-paper': { backgroundColor: '#f4f5fa', mt: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', ml: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ color: '#383838', fontWeight: 600, pr: 4 }}>{auth?.user?.username}</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ backgroundColor: '#383838' }} />
        <MenuItem onClick={handleLogout} sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: '#383838' } }}>
          <Icon icon='mdi:logout-variant' />
          <Typography sx={{ color: '#383838', pl: 1 }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
