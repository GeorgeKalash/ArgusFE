import Link from 'next/link'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import UserDropdown from '../../shared-components/UserDropdown'

const MenuHeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingRight: theme.spacing(4.5),
  transition: 'padding .25s ease-in-out',
  minHeight: theme.mixins.toolbar.minHeight
}))

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  lineHeight: 'normal',
  textTransform: 'uppercase',
  color: theme.palette.text.primary,
  transition: 'opacity .25s ease-in-out, margin .25s ease-in-out'
}))

const LinkStyled = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none'
})

const VerticalNavHeader = props => {
  const {
    hidden,
    settings,
    saveSettings,
    collapsedNavWidth,
    toggleNavVisibility,
    navigationBorderWidth,
    menuLockedIcon: userMenuLockedIcon,
    navMenuBranding: userNavMenuBranding,
    menuUnlockedIcon: userMenuUnlockedIcon,
    isArabic
  } = props

  const theme = useTheme()
  const { navCollapsed } = settings

  const menuHeaderPaddingLeft = () => {
    if (navCollapsed) {
      if (userNavMenuBranding) {
        return 0
      } else {
        return (collapsedNavWidth - navigationBorderWidth - 30) / 8
      }
    } else {
      return 6
    }
  }

  return (
    <MenuHeaderWrapper
      sx={{
        pl: menuHeaderPaddingLeft(),
        display: 'flex',
        backgroundColor: '#231f20',
        flexDirection: navCollapsed ? 'column' : 'row'
      }}
    >
      <Box
        sx={{
          minHeight: 40,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between !important'
        }}
      >
        {userNavMenuBranding ? (
          userNavMenuBranding(props)
        ) : (
          <LinkStyled href='/'>
            <img
              src={!navCollapsed ? '/images/logos/ArgusNewLogo2.png' : '/images/logos/WhiteA.png'}
              alt='Argus'
              style={{ maxHeight: '25px' }}
            />
          </LinkStyled>
        )}
        {!navCollapsed && <UserDropdown settings={settings} />}
      </Box>
    </MenuHeaderWrapper>
  )
}

export default VerticalNavHeader
