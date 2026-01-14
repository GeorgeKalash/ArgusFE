import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback
} from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import PropTypes from 'prop-types'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { v4 as uuidv4 } from 'uuid'
import { RequestsContext } from '../RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { LockedScreensContext } from '../LockedScreensContext'
import styles from './TabsProvider.module.css'

const TabsContext = createContext()

function LoadingOverlay() {
  return <Box className={styles.loadingOverlay}></Box>
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)

  const isActive = value === index

  useEffect(() => {
    if (!isActive) return
    if (loading) {
      setShowOverlay(false)
      return
    }
    const timer = setTimeout(() => setShowOverlay(true), 300)
    return () => clearTimeout(timer)
  }, [loading, isActive])

  useEffect(() => {
    if (isActive && loading) setShowOverlay(false)
  }, [isActive, loading])

  return (
    <Box
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`${styles.customTabPanel} ${value !== index ? styles.hidden : ''}`}
      {...other}
    >
      {!showOverlay && isActive && <LoadingOverlay />}
      {children}
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

const TabsProvider = ({ children }) => {
  const router = useRouter()

  const {
    menu,
    gear,
    lastOpenedPage,
    reloadOpenedPage,
    setReloadOpenedPage,
    openTabs,
    setOpenTabs,
    currentTabIndex,
    setCurrentTabIndex
  } = useContext(MenuContext)

  const { lockedScreens, removeLockedScreen } = useContext(LockedScreensContext)
  const [anchorEl, setAnchorEl] = useState(null)
  const [tabsIndex, setTabsIndex] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const tabsWrapperRef = useRef(null)

  const userDataParsed = useMemo(() => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = window.sessionStorage.getItem('userData')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [])

  const { dashboardId } = userDataParsed
  const userId = userDataParsed?.userId

  const { postRequest } = useContext(RequestsContext)
  const open = Boolean(anchorEl)

  const navigateTo = useCallback(
    async route => {
      if (!route) return
      try {
        await router.push(route, undefined, { shallow: true, scroll: false })
      } catch (e) {
        if (typeof window !== 'undefined') window.history.replaceState(null, '', route)
      }
    },
    [router]
  )

  useEffect(() => {
    if (!tabsWrapperRef.current || typeof window === 'undefined') return

    const updateHeight = () => {
      const h = tabsWrapperRef.current.offsetHeight
      const currentHeight = getComputedStyle(document.documentElement).getPropertyValue('--tabs-height')
      if (currentHeight !== `${h}px`) {
        document.documentElement.style.setProperty('--tabs-height', `${h}px`)
      }
    }

    updateHeight()

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateHeight)
      ro.observe(tabsWrapperRef.current)
    } else {
      window.addEventListener('resize', updateHeight)
    }

    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', updateHeight)
    }
  }, [])

  const OpenItems = useCallback((event, i) => {
    setTabsIndex(i)
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setTabsIndex(null)
  }, [])

  const findNode = useCallback((nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findNode(node.children, targetRouter)
        if (result) return result
      } else if (node.path && node.path === targetRouter) {
        return node.name
      }
    }
    return null
  }, [])

  const findResourceId = useCallback((nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findResourceId(node.children, targetRouter)
        if (result) return result
      } else if (node.path && node.path === targetRouter) {
        return node.resourceId
      }
    }
    return null
  }, [])

  const handleChange = useCallback(
    async (event, newValue) => {
      if (newValue === currentTabIndex) return

      setCurrentTabIndex(newValue)

      const nextRoute = openTabs?.[newValue]?.route
      if (!nextRoute) return

      if (nextRoute === router.asPath) return

      if (newValue === 0 && !openTabs?.[newValue]?.page) {
        await navigateTo(nextRoute)
      } else {
        await navigateTo(nextRoute)
        if (typeof window !== 'undefined' && nextRoute) window.history.replaceState(null, '', nextRoute)
      }
    },
    [openTabs, setCurrentTabIndex, navigateTo, currentTabIndex, router.asPath]
  )

  const handleCloseAllTabs = useCallback(async () => {
    const firstTab = openTabs?.[0]
    if (firstTab?.route) {
      await navigateTo(firstTab.route)
      if (typeof window !== 'undefined') window.history.replaceState(null, '', firstTab.route)
    }
    setOpenTabs([firstTab])
    setCurrentTabIndex(0)
  }, [openTabs, navigateTo, setOpenTabs, setCurrentTabIndex])

  const handleCloseOtherTab = useCallback(
    async tabIndex => {
      const homeTab = openTabs?.[0]
      const selectedTab = openTabs?.[tabIndex]
      const isHomeTabSelected = selectedTab?.route === homeTab?.route

      const newOpenTabs = openTabs.filter((tab, index) => index === 0 || index === tabIndex)

      if (selectedTab?.route) {
        await navigateTo(selectedTab.route)
        if (typeof window !== 'undefined') window.history.replaceState(null, '', selectedTab.route)
      }

      setOpenTabs(newOpenTabs)
      setCurrentTabIndex(isHomeTabSelected ? 0 : newOpenTabs.length - 1)
    },
    [openTabs, navigateTo, setOpenTabs, setCurrentTabIndex]
  )

  const closeTab = useCallback(
    async tabRoute => {
      const index = openTabs.findIndex(tab => tab.route === tabRoute)
      const activeTabsLength = openTabs.length

      if (activeTabsLength === 2) return handleCloseAllTabs()

      if (currentTabIndex === index) {
        const newValue = index === activeTabsLength - 1 ? index - 1 : index + 1
        if (newValue === index - 1 || router.asPath === window?.history?.state?.as) setCurrentTabIndex(newValue)

        const nextRoute = openTabs?.[newValue]?.route
        if (nextRoute) {
          await navigateTo(nextRoute)
          if (typeof window !== 'undefined') window.history.replaceState(null, '', nextRoute)
        }
      } else if (index < currentTabIndex) setCurrentTabIndex(currentValue => currentValue - 1)

      setOpenTabs(prevState => prevState.filter(tab => tab.route !== tabRoute))
    },
    [openTabs, currentTabIndex, handleCloseAllTabs, navigateTo, router.asPath, setCurrentTabIndex, setOpenTabs]
  )

  const reopenTab = useCallback(
    async tabRoute => {
      if (tabRoute === router.asPath) {
        setOpenTabs(openTabs => openTabs.map(tab => (tab.route === tabRoute ? { ...tab, id: uuidv4() } : tab)))
        setReloadOpenedPage([])
      } else await navigateTo(tabRoute)
    },
    [router.asPath, navigateTo, setOpenTabs, setReloadOpenedPage]
  )

  const historyAs = typeof window !== 'undefined' ? window.history?.state?.as : undefined

  useEffect(() => {
    if (initialLoadDone) {
      const isTabOpen = openTabs.some(tab => tab.route === router.asPath || !window?.history?.state?.as)
      if (!isTabOpen) {
        const newValueState = openTabs.length
        setOpenTabs(prevState => [
          ...prevState,
          {
            page: children,
            id: uuidv4(),
            route: router.asPath,
            label: lastOpenedPage
              ? lastOpenedPage.name
              : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, '')),
            resourceId: findResourceId(menu, router.asPath.replace(/\/$/, ''))
          }
        ])
        setCurrentTabIndex(newValueState)
      } else {
        setOpenTabs(prevState =>
          prevState.map(tab => {
            if (tab.route === router.asPath) {
              if (tab.route === '/default/' && tab.page) return tab
              return { ...tab, page: children }
            }
            return tab
          })
        )
      }
    }
  }, [router.asPath, historyAs])

  useEffect(() => {
    if (openTabs?.[currentTabIndex]?.route === reloadOpenedPage?.path + '/') reopenTab(reloadOpenedPage?.path + '/')

    if (!initialLoadDone && router.asPath && (menu.length > 0 || dashboardId)) {
      const newTabs = [
        {
          page: router.asPath === '/default/' ? children : null,
          id: uuidv4(),
          route: '/default/',
          label: 'Home'
        }
      ]

      if (router.asPath !== '/default/') {
        newTabs.push({
          page: children,
          id: uuidv4(),
          route: router.asPath,
          label: lastOpenedPage
            ? lastOpenedPage.name
            : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, '')),
          resourceId: findResourceId(menu, router.asPath.replace(/\/$/, ''))
        })
        setCurrentTabIndex(newTabs.findIndex(tab => tab.route === router.asPath))
      }

      setOpenTabs(newTabs)
      menu.length > 0 && setInitialLoadDone(true)
    }
  }, [router.asPath, menu, gear, children, lastOpenedPage, initialLoadDone, reloadOpenedPage])

  function unlockRecord(resourceId) {
    const body = {
      resourceId,
      recordId: 0,
      reference: '',
      userId,
      clockStamp: new Date()
    }
    postRequest({
      extension: AccessControlRepository.unlockRecord,
      record: JSON.stringify(body)
    })

    removeLockedScreen(resourceId)
  }

  const unlockIfLocked = tab => {
    if (!tab?.resourceId) return
    const locked = lockedScreens.some(screen => screen.resourceId === tab.resourceId)
    if (locked) unlockRecord(tab.resourceId)
  }

  return (
    <>
      <Box ref={tabsWrapperRef} className={styles.tabsWrapper}>
        <Tabs
          value={currentTabIndex}
          onChange={handleChange}
          variant='scrollable'
          scrollButtons={openTabs.length > 3 ? 'auto' : 'off'}
          aria-label='scrollable auto tabs example'
          classes={{ indicator: styles.tabsIndicator }}
          className={styles.tabs}
        >
          {openTabs.map((activeTab, i) => (
            <Tab
              key={activeTab?.id}
              className={styles.tabName}
              label={
                <Box display='flex' alignItems='center'>
                  <span>{activeTab.label}</span>
                  {i === currentTabIndex && (
                    <IconButton
                      size='small'
                      className={styles.svgIcon}
                      onClick={e => {
                        e.stopPropagation()
                        setReloadOpenedPage({ path: openTabs[i].route.replace(/\/$/, ''), name: openTabs[i].label })
                      }}
                    >
                      <RefreshIcon className={styles.svgIcon} />
                    </IconButton>
                  )}
                  {activeTab.route !== '/default/' && (
                    <IconButton
                      size='small'
                      className={styles.svgIcon}
                      onClick={async event => {
                        event.stopPropagation()
                        if (activeTab) unlockIfLocked(activeTab)
                        await closeTab(activeTab.route)
                      }}
                    >
                      <CloseIcon className={styles.svgIcon} />
                    </IconButton>
                  )}
                </Box>
              }
              onContextMenu={event => OpenItems(event, i)}
              classes={{
                root: styles.tabRoot,
                selected: styles.selectedTab
              }}
            />
          ))}
        </Tabs>
      </Box>

      {openTabs.map((activeTab, i) => (
        <CustomTabPanel key={activeTab.id} index={i} value={currentTabIndex}>
          {activeTab.page}
        </CustomTabPanel>
      ))}

      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        className={styles.dropdownMenu}
      >
        <MenuItem
          className={styles.dropdownItem}
          onClick={async event => {
            await closeTab(openTabs[tabsIndex]?.route)
            event.stopPropagation()
            handleClose()
          }}
        >
          Close Tab
        </MenuItem>
        <MenuItem
          className={styles.dropdownItem}
          onClick={async event => {
            event.stopPropagation()
            await handleCloseOtherTab(tabsIndex)
            handleClose()
          }}
        >
          Close Other Tabs
        </MenuItem>
        <MenuItem
          className={styles.dropdownItem}
          onClick={async event => {
            event.stopPropagation()
            await handleCloseAllTabs()
            handleClose()
          }}
        >
          Close All Tabs
        </MenuItem>
      </Menu>
    </>
  )
}

export { TabsContext, TabsProvider }
