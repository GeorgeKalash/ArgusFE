import { useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import clsx from 'clsx'
import Icon from 'src/@core/components/icon'
import themeConfig from 'src/configs/themeConfig'
import { hasActiveChild, removeChildren } from 'src/@core/layouts/utils'
import VerticalNavItems from './VerticalNavItems'
import UserIcon from 'src/layouts/components/UserIcon'
import Translations from 'src/layouts/components/Translations'
import CanViewNavGroup from 'src/layouts/components/acl/CanViewNavGroup'

const MenuItemTextWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
}))

const VerticalNavGroup = props => {
  // ** Props
  const {
    item,
    parent,
    settings,
    navVisible,
    isSubToSub,
    groupActive,
    setGroupActive,
    collapsedNavWidth,
    currentActiveGroup,
    setCurrentActiveGroup,
    navigationBorderWidth
  } = props

  // ** Hooks & Vars
  const router = useRouter()
  const currentURL = router.asPath
  const { direction, navCollapsed, verticalNavToggleType } = settings

  // ** Accordion menu group open toggle
  // const toggleActiveGroup = (item, parent) => {
  //   let openGroup = groupActive

  //   // ** If Group is already open and clicked, close the group
  //   if (openGroup.includes(item.id)) {
  //     openGroup.splice(openGroup.indexOf(item.id), 1)

  //     // If clicked Group has open group children, Also remove those children to close those groups
  //     if (item.children) {
  //       removeChildren(item.children, openGroup, currentActiveGroup)
  //     }
  //   } else if (parent) {
  //     // ** If Group clicked is the child of an open group, first remove all the open groups under that parent
  //     if (parent.children) {
  //       removeChildren(parent.children, openGroup, currentActiveGroup)
  //     }

  //     // ** After removing all the open groups under that parent, add the clicked group to open group array
  //     if (!openGroup.includes(item.id)) {
  //       openGroup.push(item.id)
  //     }
  //   } else {
  //     // ** If clicked on another group that is not active or open, create openGroup array from scratch
  //     // ** Empty Open Group array
  //     openGroup = []

  //     // ** push Current Active Group To Open Group array
  //     if (currentActiveGroup.every(elem => groupActive.includes(elem))) {
  //       openGroup.push(...currentActiveGroup)
  //     }

  //     // ** Push current clicked group item to Open Group array
  //     if (!openGroup.includes(item.id)) {
  //       openGroup.push(item.id)
  //     }
  //   }
  //   setGroupActive([...openGroup])
  // }

  const toggleActiveGroup = item => {
    let openGroups = groupActive.slice() // Create a copy of the active groups array

    // Check if the item's ID is already in the active groups
    const index = openGroups.indexOf(item.id)

    if (index !== -1) {
      // If it's in the active groups, remove it to close the group
      openGroups.splice(index, 1)
    } else {
      // If it's not in the active groups, add it to open the group
      openGroups.push(item.id)
    }

    setGroupActive([...openGroups])
  }

  // ** Menu Group Click
  const handleGroupClick = () => {
    const openGroup = groupActive
    if (verticalNavToggleType === 'collapse') {
      if (openGroup.includes(item.id)) {
        openGroup.splice(openGroup.indexOf(item.id), 1)
      } else {
        openGroup.push(item.id)
      }
      setGroupActive([...openGroup])
    } else {
      toggleActiveGroup(item, parent)
    }
  }
  useEffect(() => {
    if (hasActiveChild(item, currentURL)) {
      if (!groupActive.includes(item.id)) groupActive.push(item.id)
    } else {
      const index = groupActive.indexOf(item.id)
      if (index > -1) groupActive.splice(index, 1)
    }
    setGroupActive([...groupActive])
    setCurrentActiveGroup([...groupActive])

    // Empty Active Group When Menu is collapsed and not hovered, to fix issue route change
    if (navCollapsed) {
      setGroupActive([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])
  useEffect(() => {
    if (navCollapsed) {
      setGroupActive([])
    }
    if (navCollapsed || (groupActive.length === 0 && !navCollapsed)) {
      setGroupActive([...currentActiveGroup])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navCollapsed])
  useEffect(() => {
    if (groupActive.length === 0 && !navCollapsed) {
      setGroupActive([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const icon = parent && !item.icon ? themeConfig.navSubItemIcon : item.icon
  const menuGroupCollapsedStyles = navCollapsed ? { opacity: 0 } : { opacity: 1 }

  return (
    <CanViewNavGroup navGroup={item}>
      <Fragment>
        <ListItem
          disablePadding
          className='nav-group'
          onClick={handleGroupClick}
          sx={{ mt: 1.5, px: '0 !important', flexDirection: 'column' }}
        >
          <ListItemButton
            className={clsx({
              'Mui-selected': groupActive.includes(item.id) || currentActiveGroup.includes(item.id)
            })}
            sx={{
              py: 2.25,
              width: '100%',
              borderTopRightRadius: 100,
              borderBottomRightRadius: 100,
              transition: 'padding-left .25s ease-in-out',
              pl: navCollapsed ? (collapsedNavWidth - navigationBorderWidth - 24) / 8 : 5.5,
              pr: navCollapsed ? ((collapsedNavWidth - navigationBorderWidth - 24) / 2 - 5) / 4 : 3.5,
              '&.Mui-selected': {
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              },
              '&.Mui-selected.Mui-focusVisible': {
                backgroundColor: 'action.focus',
                '&:hover': {
                  backgroundColor: 'action.focus'
                }
              }
            }}
          >
            {isSubToSub ? null : (
              <ListItemIcon
                sx={{
                  color: 'text.primary',
                  transition: 'margin .25s ease-in-out',
                  ...(parent && navCollapsed ? {} : { mr: 2.5 }),
                  ...(navCollapsed ? { mr: 0 } : {}),
                  ...(parent && item.children ? { ml: 1.25, mr: 3.75 } : {})
                }}
              >
                <UserIcon icon={icon} {...(parent && { fontSize: '0.875rem' })} />
              </ListItemIcon>
            )}
            <MenuItemTextWrapper sx={{ ...menuGroupCollapsedStyles, ...(isSubToSub ? { ml: 9 } : {}) }}>
              <Typography
                {...((themeConfig.menuTextTruncate || (!themeConfig.menuTextTruncate && navCollapsed)) && {
                  noWrap: true
                })}
              >
                <Translations text={item.title} />
              </Typography>
              <Box
                className='menu-item-meta'
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '& svg': {
                    color: 'text.primary',
                    transition: 'transform .25s ease-in-out',
                    ...(groupActive.includes(item.id) && {
                      transform: direction === 'ltr' ? 'rotate(90deg)' : 'rotate(-90deg)'
                    })
                  }
                }}
              >
                {item.badgeContent ? (
                  <Chip
                    label={item.badgeContent}
                    color={item.badgeColor || 'primary'}
                    sx={{
                      mr: 1.5,
                      height: 20,
                      fontWeight: 500,
                      '& .MuiChip-label': { px: 1.5, textTransform: 'capitalize' }
                    }}
                  />
                ) : null}
                <Icon icon={direction === 'ltr' ? 'mdi:chevron-right' : 'mdi:chevron-left'} />
              </Box>
            </MenuItemTextWrapper>
          </ListItemButton>
          <Collapse
            component='ul'
            onClick={e => e.stopPropagation()}
            in={groupActive.includes(item.id)}
            sx={{
              pl: 0,
              width: '100%',
              ...menuGroupCollapsedStyles,
              transition: 'all 0.25s ease-in-out'
            }}
          >
            <VerticalNavItems
              {...props}
              parent={item}
              navVisible={navVisible}
              verticalNavItems={item.children}
              isSubToSub={parent && item.children ? item : undefined}
            />
          </Collapse>
        </ListItem>
      </Fragment>
    </CanViewNavGroup>
  )
}

export default VerticalNavGroup
