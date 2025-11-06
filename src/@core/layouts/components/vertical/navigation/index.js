import { useEffect, useRef, useState, useContext } from 'react'
import * as React from 'react'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import GradeIcon from '@mui/icons-material/Grade'
import { createTheme, responsiveFontSizes, ThemeProvider, useTheme } from '@mui/material/styles'
import themeConfig from 'src/configs/themeConfig'
import MuiSwipeableDrawer from '@mui/material/SwipeableDrawer'
import Dropdown from './Dropdown'
import themeOptions from 'src/@core/theme/ThemeOptions'
import { useRouter } from 'next/router'
import { MenuContext } from 'src/providers/MenuContext'
import { useAuth } from 'src/hooks/useAuth'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { ControlContext } from 'src/providers/ControlContext'
import { Remove } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import Link from 'next/link'
import UserDropdown from '../../shared-components/UserDropdown'
import Image from 'next/image'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import styles from './Navigation.module.css'

const SwipeableDrawer = MuiSwipeableDrawer

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
      ? `/images/folderIcons/${isOpen ? node.iconName + 'Active' : node.iconName}.png`
      : `/images/folderIcons/${node.iconName}.png`
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
    const maxLength = Math.max(10, 31 - level)

    return title.length > maxLength ? `${title.slice(0, maxLength - 3)}...` : title
  }

  const renderNode = (node, level = 0) => {
    const isOpen = openFolders.includes(node.id)
    const isRoot = node.parentId === 0
    const isFolder = Boolean(node.children)
    const imgName = getNodeIcon(node, isOpen, isRoot)
    const truncatedTitle = truncateTitle(node.title, level)

    return (
      <div key={node.id} style={{ paddingBottom: isRoot ? 5 : undefined }}>
        <div
          className={`${styles.node} ${isFolder ? styles.folder : styles.file} ${isOpen ? styles.open : ''}`}
          style={{ display: !isFolder && navCollapsed ? 'none' : 'flex' }}
          onClick={() => handleNodeClick(node)}
          onContextMenu={e => !isFolder && handleRightClick(e, node, imgName)}
        >
          <div className={styles['node-content']}>
            {imgName ? (
              <div className={styles['node-icon']}>
                <Image src={imgName} alt={node.title} width={22} height={22} />
              </div>
            ) : (
              <div style={{ width: 30, height: 22 }} />
            )}

            {!navCollapsed && (
              <div className={styles['node-text']}>
                <div className='text' title={truncatedTitle == node.title ? null : node.title}>
                  {truncatedTitle}
                </div>
                {isFolder && (
                  <div className={styles.arrow} style={{ right: isArabic ? '260px' : '8px' }}>
                    {renderArrowIcon(isOpen, isArabic)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isOpen && isFolder && (
          <div className={styles.children} style={{ paddingLeft: navCollapsed ? '0px' : '12px' }}>
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
            width: navCollapsed ? collapsedNavWidth : navWidth,
            ...(!hidden && navCollapsed ? { boxShadow: 9 } : {}),
            borderRight: navigationBorderWidth === 0 ? 0 : `${navigationBorderWidth}px solid ${theme.palette.divider}`,
            ...userNavMenuPaperStyle
          },
          ...navMenuProps?.PaperProps
        }}
        sx={{ width: navCollapsed ? collapsedNavWidth : navWidth, ...userNavMenuStyle }}
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
                  src={!navCollapsed ? '/images/logos/ArgusNewLogo2.png' : '/images/logos/WhiteA.png'}
                  alt='Argus'
                  style={{ maxHeight: '25px' }}
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
            InputProps={{
              sx: {
                border: 'transparent',
                background: '#231f20',
                fieldset: { borderColor: 'transparent !important' },
                height: '30px',
                borderRadius: '5px',
                pr: 1
              },
              endAdornment: <SearchIcon sx={{ border: '0px', fontSize: 20 }} />
            }}
          />
          <Tooltip title={platformLabels.collapse}>
            <Remove onClick={onCollapse} width={28} />
          </Tooltip>
          <Dropdown
            Image={<SettingsIcon />}
            TooltipTitle={platformLabels.Gear}
            onClickAction={GearItem => handleNodeClick(GearItem)}
            map={gear.gear}
            navCollapsed={navCollapsed}
          />
          {filterFav(menu)?.length > 0 && (
            <Dropdown
              Image={<GradeIcon style={{ color: 'yellow' }} />}
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
