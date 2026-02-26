import { useEffect, useRef, useState, useContext } from 'react'
import * as React from 'react'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import GradeIcon from '@mui/icons-material/Grade'
import { createTheme, responsiveFontSizes, ThemeProvider, useTheme } from '@mui/material/styles'
import themeConfig from '@argus/shared-configs/src/configs/themeConfig'
import MuiSwipeableDrawer from '@mui/material/SwipeableDrawer'
import Dropdown from './Dropdown'
import themeOptions from '@argus/shared-core/src/@core/theme/ThemeOptions'
import { useRouter } from 'next/router'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import IconButton from '@mui/material/IconButton'
import Icon from '@argus/shared-core/src/@core/components/icon'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Remove } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import Link from 'next/link'
import UserDropdown from './UserDropdown'
import Image from 'next/image'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import styles from './Navigation.module.css'

const SwipeableDrawer = MuiSwipeableDrawer

const NodeIcon = React.memo(function NodeIcon({ icon, title }) {
  return icon ? (
    <div className={styles['node-icon']}>
      <Image src={icon} alt={title} width={22} height={22} />
    </div>
  ) : (
    <div className={styles['node-icon-placeholder']} />
  )
})

const Navigation = props => {
  const {
    hidden,
    settings,
    beforeNavMenuContent,
    navMenuBranding,
    collapsedNavWidth,
    navigationBorderWidth,
    saveSettings,
    toggleNavVisibility,
    menuLockedIcon: userMenuLockedIcon,
    menuUnlockedIcon: userMenuUnlockedIcon,
    navWidth,
    navVisible,
    navMenuProps,
    setNavVisible
  } = props

  const { setLastOpenedPage, openTabs, setReloadOpenedPage, currentTabIndex, setCurrentTabIndex, handleBookmark } =
    useContext(MenuContext)
  const { platformLabels } = useContext(ControlContext)
  const [filteredMenu, setFilteredMenu] = useState([])
  const [openFolders, setOpenFolders] = useState([])
  const [selectedNode, setSelectedNode] = useState(false)
  const menu = props.verticalNavItems
  const gear = useContext(MenuContext)
  const [isArabic, setIsArabic] = useState(false)
  const auth = useAuth()
  const shadowRef = useRef(null)
  const { navCollapsed } = settings
  const { beforeVerticalNavMenuContentPosition } = themeConfig
  const MenuLockedIcon = () => userMenuLockedIcon || <KeyboardArrowRightIcon sx={{ transform: 'rotate(180deg)' }} />
  const MenuUnlockedIcon = () => userMenuUnlockedIcon || <KeyboardArrowRightIcon />
  const theme = useTheme()
  const router = useRouter()

  const [drawerWidth, setDrawerWidth] = useState(navWidth)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      let newWidth

      if (width <= 768) newWidth = navCollapsed ? 0 : 180
      else if (width <= 1024) newWidth = navCollapsed ? 0 : 200
      else if (width <= 1366) newWidth = navCollapsed ? 0 : 220
      else if (width <= 1600) newWidth = navCollapsed ? 0 : 240
      else newWidth = navCollapsed ? 0 : 300

      setDrawerWidth(newWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [navCollapsed])

  useEffect(() => {
    const handleAutoCollapse = () => {
      const width = window.innerWidth
      if (width <= 1024) {
        if (!settings.navCollapsed) {
          saveSettings({ ...settings, navCollapsed: true })
        }
      }
    }

    handleAutoCollapse()
    window.addEventListener('resize', handleAutoCollapse)

    return () => window.removeEventListener('resize', handleAutoCollapse)
  }, [])


  const MobileDrawerProps = {
    open: navVisible,
    onOpen: () => setNavVisible(true),
    onClose: () => setNavVisible(false),
    ModalProps: { keepMounted: true }
  }

  const DesktopDrawerProps = { open: true, onOpen: () => null, onClose: () => null }

  let userNavMenuStyle = {}
  let userNavMenuPaperStyle = {}

  if (navMenuProps?.sx) userNavMenuStyle = navMenuProps.sx
  if (navMenuProps?.PaperProps?.sx) userNavMenuPaperStyle = navMenuProps.PaperProps.sx

  const userNavMenuProps = { ...navMenuProps }
  delete userNavMenuProps.sx
  delete userNavMenuProps.PaperProps

  const menuHeaderPaddingLeft = () => {
    if (navCollapsed) {
      return navMenuBranding ? 0 : (collapsedNavWidth - navigationBorderWidth - 30) / 8
    } else return 6
  }

  let darkTheme = createTheme(themeOptions(settings, 'dark'))
  if (themeConfig.responsiveFontSizes) darkTheme = responsiveFontSizes(darkTheme)

  useEffect(() => {
    if (auth?.user?.languageId === 2) setIsArabic(true)
    else setIsArabic(false)
  }, [])

  const scrollMenu = container => {
    if (beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) {
      container = hidden ? container.target : container
      if (shadowRef && container.scrollTop > 0) {
        if (!shadowRef.current?.classList.contains('scrolled')) shadowRef.current?.classList.add('scrolled')
      } else shadowRef.current?.classList.remove('scrolled')
    }
  }

  const handleSearch = e => {
    const term = e.target.value
    if (term === '') {
      setFilteredMenu(menu)
      setOpenFolders([])
    } else {
      const [filteredChildren] = filterMenu(menu, term)
      setFilteredMenu(filteredChildren)
    }
  }

  const filterMenu = (items, term) => {
    const filteredItems = items.map(item => {
      if (item.children) {
        const [filteredChildren, hasMatchingChild] = filterMenu(item.children, term)
        if (filteredChildren.length > 0 || hasMatchingChild) {
          setOpenFolders(prev => [...prev, item.id])

          return { ...item, children: filteredChildren, isOpen: true }
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
    const favorites = []

    const traverse = items => {
      items?.forEach(item => {
        if (item?.children?.length > 0) traverse(item.children)
        else if (item?.iconName === 'FavIcon') favorites.push(item)
      })
    }
    traverse(menu)

    return favorites
  }

  useEffect(() => {
    setFilteredMenu(props.verticalNavItems)
  }, [props.verticalNavItems])

  const onCollapse = () => setOpenFolders([])
  const closeDialog = () => setSelectedNode(false)

  const handleRightClick = (e, node, imgName) => {
    e.preventDefault()
    setSelectedNode([node, Boolean(imgName)])
  }

  const toggleFolder = folderId => {
    setOpenFolders(prev => (prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]))
  }

  const handleNodeClick = node => {
    if (node.children) {
      toggleFolder(node.id)

      return
    }
    const normalizedPath = node.path.replace(/\/$/, '') + '/'
    const existingTabIndex = openTabs.findIndex(tab => tab.route === normalizedPath)
    const isCurrentTab = openTabs[currentTabIndex]?.route === normalizedPath
    if (isCurrentTab) {
      setReloadOpenedPage([])
      setReloadOpenedPage(node)
    } else if (existingTabIndex !== -1) {
      setCurrentTabIndex(existingTabIndex)
      window.history.replaceState(null, '', openTabs[existingTabIndex].route)
    } else router.push(node.path)
    setLastOpenedPage(node)
  }

  const getNodeIcon = (node, isOpen, isRoot) => {
    if (!node.iconName) return null

    return isRoot
      ? `${isOpen ? node.iconName + 'Active' : node.iconName}.png`
      : `${node.iconName}.png`
  }

  const renderArrowIcon = (isOpen, isArabic) => {
    if (isOpen) return <ExpandMoreIcon style={{ fontSize: 20 }} />

    return isArabic ? (
      <ArrowBackIosIcon style={{ fontSize: 13, height: '100%', paddingBottom: '5px' }} />
    ) : (
      <ChevronRightIcon style={{ fontSize: 20 }} />
    )
  }

  const truncateTitle = (title, level) => {
    let baseLength

    if (typeof window !== 'undefined') {
      const width = window.innerWidth

      if (width <= 768) baseLength = 16
      else if (width <= 1024) baseLength = 20
      else if (width <= 1366) baseLength = 26
      else if (width <= 1600) baseLength = 30
      else baseLength = 34
    } else {
      baseLength = 31
    }

    const maxLength = Math.max(8, baseLength - level)

    return title.length > maxLength ? `${title.slice(0, maxLength - 3)}...` : title
  }

  const renderNode = (node, level = 0) => {
    const isOpen = openFolders.includes(node.id)
    const isRoot = node.parentId === 0
    const isFolder = Boolean(node.children)
    const image = getNodeIcon(node, isOpen, isRoot)
    const truncatedTitle = truncateTitle(node.title, level)

    const icon =
      image &&
      require(`@argus/shared-ui/src/components/images/folderIcons/${image}`).default.src

    return (
      <div key={node.id} style={{ paddingBottom: isRoot ? 5 : undefined }}>
        <div
          className={`${styles.node} ${isFolder ? styles.folder : styles.file} ${isOpen ? styles.open : ''}`}
          style={{ display: !isFolder && navCollapsed ? 'none' : 'flex' }}
          onClick={() => handleNodeClick(node)}
          onContextMenu={e => !isFolder && handleRightClick(e, node, icon)}
        >
          <div className={styles['node-content']}>
            <NodeIcon icon={icon} title={node.title} />

            {!navCollapsed && (
              <>
                <div className={styles['node-text']}>
                  <div className='text' title={truncatedTitle == node.title ? null : node.title}>
                    {truncatedTitle}
                  </div>
                </div>

                {isFolder && (
                  <div className={styles.arrow}>
                    {renderArrowIcon(isOpen, isArabic)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isOpen && isFolder && (
          <div className={styles.children} style={{ paddingLeft: navCollapsed ? '0px' : '10px' }}>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <SwipeableDrawer
        className={styles['layout-vertical-nav']}
        variant={hidden ? 'temporary' : 'permanent'}
        {...(hidden ? { ...MobileDrawerProps } : { ...DesktopDrawerProps })}
        PaperProps={{
          sx: {
            backgroundColor: 'background.default',
            width: drawerWidth,
            transition: 'width 0.3s ease-in-out',
            borderRight: navigationBorderWidth === 0 ? 0 : `${navigationBorderWidth}px solid ${theme.palette.divider}`,
            ...userNavMenuPaperStyle
          },
          ...navMenuProps?.PaperProps
        }}
        sx={{ width: drawerWidth, ...userNavMenuStyle }}
        {...userNavMenuProps}
      >
        <Box
          className={styles['menu-header-wrapper']}
          sx={{
            pl: menuHeaderPaddingLeft(),
            backgroundColor: '#231f20',
            flexDirection: navCollapsed ? 'column' : 'row'
          }}
        >
          <Box className={styles['menu-header-box']}>
            {navMenuBranding ? (
              navMenuBranding(props)
            ) : (
              <Link href='/' className={styles['link-styled']}>
                <img
                  src={
                    !navCollapsed
                      ? require('@argus/shared-ui/src/components/images/logos/ArgusNewLogo2.png').default.src
                      : require('@argus/shared-ui/src/components/images/logos/WhiteA.png').default.src
                  }
                  alt='Argus'
                  className={styles['Argus-Icon']}
                />
              </Link>
            )}
            {!navCollapsed && <UserDropdown settings={settings} />}
          </Box>
        </Box>
        <Box className={styles['menu-search-box']}>
          <TextField
            placeholder={platformLabels.Filter}
            variant='outlined'
            fullWidth
            size='small'
            onChange={handleSearch}
            autoComplete='off'
            className={styles['search-field']}
            InputProps={{
              endAdornment: <SearchIcon className={styles['search-icon']} />
            }}
          />
          <Tooltip title={platformLabels.collapse}>
            <Box onClick={onCollapse} className={styles.box}>
              <Remove />
            </Box>
          </Tooltip>
          <Dropdown
            Image={<SettingsIcon sx={{ fontSize: 20 }} />}
            TooltipTitle={platformLabels.Gear}
            onClickAction={GearItem => handleNodeClick(GearItem)}
            map={gear.gear}
            navCollapsed={navCollapsed}
          />
          {filterFav(menu)?.length > 0 && (
            <Dropdown
              Image={<GradeIcon sx={{ color: 'yellow', fontSize: 20 }} />}
              TooltipTitle={platformLabels.Favorite}
              onClickAction={favorite => handleNodeClick(favorite)}
              map={filterFav(menu)}
              navCollapsed={navCollapsed}
            />
          )}
        </Box>
        <Box className={styles['menu-scroll-wrapper']} onScroll={scrollMenu}>
          <List className='nav-items'>
            <div className={styles.sidebar}>{filteredMenu.map(node => renderNode(node, 0))}</div>
          </List>
        </Box>
      </SwipeableDrawer>
      {hidden ? (
        <IconButton disableRipple onClick={toggleNavVisibility} sx={{ p: 0, backgroundColor: 'transparent !important' }}>
          <Icon icon='mdi:close' fontSize={15} />
        </IconButton>
      ) : userMenuLockedIcon === null && userMenuUnlockedIcon === null ? null : (
        <IconButton
          disableRipple
          disableFocusRipple
          onClick={() => saveSettings({ ...settings, navCollapsed: !navCollapsed })}
          className={styles['collapse-button']}
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
      {selectedNode && (
        <ConfirmationDialog
          openCondition={Boolean(selectedNode)}
          closeCondition={closeDialog}
          DialogText={selectedNode[1] ? platformLabels.RemoveFav : platformLabels.AddFav}
          okButtonAction={() => handleBookmark(selectedNode[0], selectedNode[1], closeDialog)}
          cancelButtonAction={closeDialog}
        />
      )}
    </ThemeProvider>
  )
}

export default Navigation
