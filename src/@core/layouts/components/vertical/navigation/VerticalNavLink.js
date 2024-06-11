// ** React Imports
import { useContext, useState } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import { styled } from '@mui/material/styles'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'

// ** Configs Import
import themeConfig from 'src/configs/themeConfig'

// ** Custom Components Imports
import UserIcon from 'src/layouts/components/UserIcon'
import Translations from 'src/layouts/components/Translations'
import CanViewNavLink from 'src/layouts/components/acl/CanViewNavLink'

// ** Util Import
import { handleURLQueries } from 'src/@core/layouts/utils'

// ** Context
import { MenuContext } from 'src/providers/MenuContext'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { ControlContext } from 'src/providers/ControlContext'

// ** Styled Components
const MenuNavLink = styled(ListItemButton)(({ theme }) => ({
  width: '100%',
  borderTopRightRadius: 100,
  borderBottomRightRadius: 100,
  color: theme.palette.text.primary,
  transition: 'padding-left .25s ease-in-out',
  '&.active': {
    '&, &:hover': {
      boxShadow: theme.shadows[3],
      backgroundImage: `linear-gradient(98deg, ${theme.palette.customColors.primaryGradient}, ${theme.palette.primary.main} 94%)`
    },
    '& .MuiTypography-root, & .MuiListItemIcon-root': {
      color: `${theme.palette.common.white} !important`
    }
  }
}))

const MenuItemTextMetaWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
}))

const VerticalNavLink = ({
  item,
  parent,
  settings,
  navVisible,
  isSubToSub,
  collapsedNavWidth,
  toggleNavVisibility,
  navigationBorderWidth
}) => {
  // ** Hooks
  const router = useRouter()
  const { handleBookmark } = useContext(MenuContext)
  const { platformLabels } = useContext(ControlContext)

  // ** States
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(item.icon ? true : false)

  // ** Vars
  const { navCollapsed } = settings
  const icon = parent && !item.icon ? themeConfig.navSubItemIcon : item.icon

  const isNavLinkActive = () => {
    if (router.pathname === item.path || handleURLQueries(router, item.path)) {
      return true
    } else {
      return false
    }
  }

  const openDialog = () => {
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  const toggleBookmarked = () => {
    setIsBookmarked(!isBookmarked)
    closeDialog()
  }

  const handleRightClick = e => {
    e.preventDefault()
    openDialog()
  }

  return (
    <CanViewNavLink navLink={item}>
      <ListItem
        disablePadding
        className='nav-link'
        disabled={item.disabled || false}
        sx={{ mt: 1.5, px: '0 !important' }}
        onContextMenu={handleRightClick}
      >
        <MenuNavLink
          component={Link}
          {...(item.disabled && { tabIndex: -1 })}
          className={isNavLinkActive() ? 'active' : ''}
          href={item.path === undefined ? '/' : `${item.path}`}
          {...(item.openInNewTab ? { target: '_blank' } : null)}
          onClick={e => {
            if (item.path === undefined) {
              e.preventDefault()
              e.stopPropagation()
            }
            if (navVisible) {
              toggleNavVisibility()
            }
          }}
          sx={{
            py: 2.25,
            ...(item.disabled ? { pointerEvents: 'none' } : { cursor: 'pointer' }),
            pl: navCollapsed ? (collapsedNavWidth - navigationBorderWidth - 24) / 8 : 5.5,
            pr: navCollapsed ? ((collapsedNavWidth - navigationBorderWidth - 24) / 2 - 5) / 4 : 3.5
          }}
        >
          {/* {isSubToSub ? null : (
            <ListItemIcon
              sx={{
                color: 'text.primary',
                transition: 'margin .25s ease-in-out',
                ...(navCollapsed && !navHover ? { mr: 0 } : { mr: 2.5 }),
                ...(parent ? { ml: 1.25, mr: 3.75 } : {}),
                '& svg': {
                  fontSize: '0.875rem',
                  ...(!parent ? { fontSize: '1.5rem' } : {}),
                  ...(parent && item.icon ? { fontSize: '0.875rem' } : {})
                }
              }}
            >
              <UserIcon icon={icon} />
            </ListItemIcon>
          )} */}

          <MenuItemTextMetaWrapper
            sx={{
              ...(isSubToSub ? { ml: 2 } : {}), //original ml: 9
              ...(navCollapsed ? { opacity: 0 } : { opacity: 1 })
            }}
          >
            <Typography
              {...((themeConfig.menuTextTruncate || (!themeConfig.menuTextTruncate && navCollapsed)) && {
                noWrap: true
              })}
            >
              <Translations text={item.title} />
            </Typography>
            {item.badgeContent ? (
              <Chip
                label={item.badgeContent}
                color={item.badgeColor || 'primary'}
                sx={{
                  height: 20,
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                }}
              />
            ) : null}
          </MenuItemTextMetaWrapper>
          {isBookmarked && (
            <ListItemIcon
              sx={{
                color: 'text.primary',
                transition: 'margin .25s ease-in-out',
                ...(navCollapsed ? { mr: 0 } : { mr: 2.5 }),
                ...(parent ? { ml: 1.25, mr: 1 } : {}),
                '& svg': {
                  fontSize: '0.875rem',
                  ...(!parent ? { fontSize: '1.5rem' } : {}),
                  ...(parent && item.icon ? { fontSize: '0.875rem' } : {})
                }
              }}
            >
              {/* Favorite Icon */}
              <UserIcon icon='mdi:star' />
            </ListItemIcon>
          )}
        </MenuNavLink>
      </ListItem>
      <ConfirmationDialog
        openCondition={isDialogOpen}
        closeCondition={closeDialog}
        DialogText={isBookmarked ? platformLabels.RemoveFav : platformLabels.AddFav}
        okButtonAction={() => handleBookmark(item, isBookmarked, toggleBookmarked)}
        cancelButtonAction={closeDialog}
      />
    </CanViewNavLink>
  )
}

export default VerticalNavLink
