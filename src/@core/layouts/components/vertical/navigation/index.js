import { useEffect, useRef, useState, useContext } from 'react'
import * as React from 'react'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import GradeIcon from '@mui/icons-material/Grade'
import { createTheme, responsiveFontSizes, styled, ThemeProvider } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import themeConfig from 'src/configs/themeConfig'
import Drawer from './Drawer'
import VerticalNavItems from './VerticalNavItems'
import VerticalNavHeader from './VerticalNavHeader'
import Dropdown from './Dropdown'
import themeOptions from 'src/@core/theme/ThemeOptions'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useRouter } from 'next/router'
import { MenuContext } from 'src/providers/MenuContext'
import { useAuth } from 'src/hooks/useAuth'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { ControlContext } from 'src/providers/ControlContext'

function ArrowBackIcon() {
  return (
    <KeyboardArrowRightIcon
      sx={{
        transform: 'rotate(180Deg)'
      }}
    />
  )
}

const StyledBoxForShadow = styled(Box)(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(${theme.palette.background.default} ${
    theme.direction === 'rtl' ? '95%' : '5%'
  },${hexToRGBA(theme.palette.background.default, 0.85)} 30%,${hexToRGBA(
    theme.palette.background.default,
    0.5
  )} 65%,${hexToRGBA(theme.palette.background.default, 0.3)} 75%,transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = props => {
  const {
    saveSettings,
    toggleNavVisibility,
    menuLockedIcon: userMenuLockedIcon,
    menuUnlockedIcon: userMenuUnlockedIcon
  } = props

  const router = useRouter()
  const { hidden, settings, afterNavMenuContent, beforeNavMenuContent, navMenuContent: userNavMenuContent } = props

  const { setLastOpenedPage, openTabs, setReloadOpenedPage, currentTabIndex, setCurrentTabIndex } =
    useContext(MenuContext)
  const { platformLabels } = useContext(ControlContext)
  const [currentActiveGroup, setCurrentActiveGroup] = useState([])
  const [filteredMenu, setFilteredMenu] = useState([])
  const [openFolders, setOpenFolders] = useState([])
  const menu = props.verticalNavItems
  const gear = useContext(MenuContext)
  const [isArabic, setIsArabic] = useState(false)
  const auth = useAuth()
  const shadowRef = useRef(null)
  const { navCollapsed } = settings
  const { afterVerticalNavMenuContentPosition, beforeVerticalNavMenuContentPosition } = themeConfig
  const MenuLockedIcon = () => userMenuLockedIcon || <ArrowBackIcon />
  const MenuUnlockedIcon = () => userMenuUnlockedIcon || <KeyboardArrowRightIcon />

  const navMenuContentProps = {
    ...props,
    currentActiveGroup,
    setCurrentActiveGroup
  }

  // ** Create new theme for the navigation menu when mode is `semi-dark`
  let darkTheme = createTheme(themeOptions(settings, 'dark'))

  // ** Set responsive font sizes to true
  if (themeConfig.responsiveFontSizes) {
    darkTheme = responsiveFontSizes(darkTheme)
  }

  // ** Fixes Navigation InfiniteScroll
  const handleInfiniteScroll = ref => {
    if (ref) {
      // @ts-ignore
      ref._getBoundingClientRect = ref.getBoundingClientRect
      ref.getBoundingClientRect = () => {
        // @ts-ignore
        const original = ref._getBoundingClientRect()

        return { ...original, height: Math.floor(original.height) }
      }
    }
  }

  useEffect(() => {
    if (auth?.user?.languageId === 2) setIsArabic(true)
    else setIsArabic(false)
  }, [])

  // ** Scroll Menu
  const scrollMenu = container => {
    if (beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) {
      container = hidden ? container.target : container
      if (shadowRef && container.scrollTop > 0) {
        // @ts-ignore
        if (!shadowRef.current.classList.contains('scrolled')) {
          // @ts-ignore
          shadowRef.current.classList.add('scrolled')
        }
      } else {
        // @ts-ignore
        shadowRef.current.classList.remove('scrolled')
      }
    }
  }

  // ** filterMenu
  const handleSearch = e => {
    const term = e.target.value

    if (term === '') {
      setFilteredMenu(menu)
      setOpenFolders([])
    } else {
      const [filteredChildren, updatedActiveGroups] = filterMenu(menu, term)
      setFilteredMenu(filteredChildren)
    }
  }

  // const filterMenu = (items, term, newActiveGroups = []) => {

  //   const filtered = items.map((item) => {
  //     if (item.children) {
  //       // Recursively filter children
  //       const [filteredChildren, updatedActiveGroups] = filterMenu(item.children, term, newActiveGroups);

  //       // Keep the folder if any of its children match the search term
  //       if (filteredChildren.length > 0) {
  //         if (!newActiveGroups.includes(item.id)) {
  //           newActiveGroups.push(item.id);
  //         }

  //         return {
  //           ...item,
  //           children: filteredChildren,
  //         };
  //       }
  //     }

  //     // Check if the item's title includes the search term
  //     if (item.title.toLowerCase().includes(term.toLowerCase())) {
  //       if (item.children && item.children.length > 0 && !newActiveGroups.includes(item.id)) {
  //         newActiveGroups.push(item.id);
  //       }

  //       return item;
  //     }

  //     return null;
  //   });

  //   // Remove null values and return filtered items
  //   const filteredItems = filtered.filter((item) => item !== null);

  //   return [filteredItems, newActiveGroups];
  // };

  const filterMenu = (items, term) => {
    const filteredItems = items.map(item => {
      if (item.children) {
        const [filteredChildren, hasMatchingChild] = filterMenu(item.children, term)
        if (filteredChildren.length > 0 || hasMatchingChild) {
          setOpenFolders(prevState => {
            return [...prevState, item.id]
          })

          return {
            ...item,
            children: filteredChildren,
            isOpen: true // Open folders with matching children
          }
        }
      }
      const isMatch = item.title.toLowerCase().includes(term.toLowerCase())

      return isMatch ? { ...item, isOpen: true } : null
    })

    const filteredItemsWithoutNull = filteredItems.filter(item => item !== null)
    const hasMatchingItem = filteredItemsWithoutNull.some(item => item.isOpen)

    return [filteredItemsWithoutNull, hasMatchingItem]
  }

  const filterFav = menu => {
    const iconName = 'FavIcon'
    const favorites = []

    const traverse = items => {
      items?.forEach(item => {
        if (item?.children && item?.children?.length > 0) {
          traverse(item?.children)
        } else {
          if (item?.iconName === iconName) {
            favorites?.push(item)
          }
        }
      })
    }
    traverse(menu)

    return favorites
  }

  useEffect(() => {
    setFilteredMenu(props.verticalNavItems)
  }, [props.verticalNavItems])

  const ScrollWrapper = hidden ? Box : PerfectScrollbar

  const go = node => {
    if (openTabs[currentTabIndex]?.route === node.path.replace(/\/$/, '') + '/') {
      setReloadOpenedPage([])
      setReloadOpenedPage(node)
    } else if (openTabs.find(tab => tab.route === node.path.replace(/\/$/, '') + '/')) {
      const index = openTabs.findIndex(tab => tab.route === node.path.replace(/\/$/, '') + '/')
      setCurrentTabIndex(index)
      window.history.replaceState(null, '', openTabs[index].route)
    } else {
      router.push(node)
    }

    setLastOpenedPage(node)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Drawer {...props}>
        <VerticalNavHeader isArabic={isArabic} {...props} />
        {beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'fixed'
          ? beforeNavMenuContent(navMenuContentProps)
          : null}
        {(beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) && (
          <StyledBoxForShadow ref={shadowRef} />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: '10px', pt: 2 }}>
          <TextField
            placeholder={platformLabels.Filter}
            variant='outlined'
            fullWidth
            size='small'
            onChange={handleSearch}
            autoComplete='off'
            InputProps={{
              sx: {
                display: 'flex',
                alignItems: navCollapsed ? 'center !important' : 'left',
                justifyContent: navCollapsed ? 'center !important' : 'left',
                border: 'transparent',
                background: '#231f20',
                fieldset: {
                  borderColor: 'transparent !important'
                },
                height: '30px',
                borderRadius: '5px',
                pr: 1
              },
              endAdornment: <SearchIcon sx={{ border: '0px', fontSize: 20 }} />
            }}
          />
          <TextField sx={{ display: 'none' }} />
          <Dropdown
            Image={<SettingsIcon />}
            TooltipTitle={platformLabels.Gear}
            onClickAction={GearItem => {
              go(GearItem)
            }}
            map={gear.gear}
            navCollapsed={navCollapsed}
          />
          {filterFav(menu) && filterFav(menu).length > 0 && (
            <Dropdown
              Image={<GradeIcon style={{ color: 'yellow' }} />}
              TooltipTitle={platformLabels.Favorite}
              onClickAction={favorite => {
                go(favorite)
              }}
              map={filterFav(menu)}
              navCollapsed={navCollapsed}
            />
          )}
        </Box>
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <ScrollWrapper
            {...(hidden
              ? {
                  onScroll: container => scrollMenu(container),
                  sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' }
                }
              : {
                  options: { wheelPropagation: false },
                  onScrollY: container => scrollMenu(container),
                  containerRef: ref => handleInfiniteScroll(ref)
                })}
          >
            {beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'static'
              ? beforeNavMenuContent(navMenuContentProps)
              : null}
            {userNavMenuContent ? (
              userNavMenuContent(navMenuContentProps)
            ) : (
              <List
                className='nav-items'
                sx={{
                  pt: 0,
                  transition: 'padding .25s ease',
                  '& > :first-child': { mt: '0' }
                }}
              >
                <VerticalNavItems
                  navCollapsed={navCollapsed}
                  currentActiveGroup={currentActiveGroup}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  openFolders={openFolders}
                  setOpenFolders={setOpenFolders}
                  {...props}
                  verticalNavItems={filteredMenu}
                  isArabic={isArabic}
                />
              </List>
            )}
            {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'static'
              ? afterNavMenuContent(navMenuContentProps)
              : null}
          </ScrollWrapper>
        </Box>
        {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'fixed'
          ? afterNavMenuContent(navMenuContentProps)
          : null}
      </Drawer>
      {hidden ? (
        <IconButton
          disableRipple
          onClick={toggleNavVisibility}
          sx={{ p: 0, backgroundColor: 'transparent !important' }}
        >
          <Icon icon='mdi:close' fontSize={15} />
        </IconButton>
      ) : userMenuLockedIcon === null && userMenuUnlockedIcon === null ? null : (
        <IconButton
          disableRipple
          disableFocusRipple
          onClick={() => saveSettings({ ...settings, navCollapsed: !navCollapsed })}
          sx={{
            p: 0,
            color: 'white',
            backgroundColor: '#231f20 !important',
            borderRadius: '0 !important',
            width: '10px !important',
            '& svg': {
              fontSize: '1.2rem',
              transition: 'opacity .25s ease-in-out'
            }
          }}
        >
          {navCollapsed
            ? isArabic
              ? MenuLockedIcon()
              : MenuUnlockedIcon()
            : isArabic
            ? MenuUnlockedIcon()
            : MenuLockedIcon()}
        </IconButton>
      )}
    </ThemeProvider>
  )
}

export default Navigation
