import React, { createContext, useEffect, useState, useContext, useRef, useMemo, useCallback } from 'react'
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

const TabPage = React.memo(
  function TabPage({ page }) {
    return page || null
  },
  (prev, next) => prev.page === next.page
)

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)

  const isActive = value === index

  useEffect(() => {
    if (!isActive) return
    if (loading) {
      setShowOverlay(true)
      return
    }
    setShowOverlay(false)
  }, [loading, isActive])

  return (
    <Box
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`${styles.customTabPanel} ${isActive ? styles.activePanel : styles.hiddenPanel}`}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none'
      }}
      {...other}
    >
      {showOverlay && isActive && <LoadingOverlay />}
      <TabPage page={children} />
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
  const { postRequest } = useContext(RequestsContext)

  const [anchorEl, setAnchorEl] = useState(null)
  const [tabsIndex, setTabsIndex] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const tabsWrapperRef = useRef(null)
  const pagesCacheRef = useRef(new Map())
  const redirectingRef = useRef(false)
  const closingRouteRef = useRef(null)
  const tabSwitchingRef = useRef(false)

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
  const open = Boolean(anchorEl)

  const normalizeRoute = useCallback(route => {
    if (!route) return ''
    return route.replace(/\/+$/, '') || '/'
  }, [])

  const isPublicRoute = useCallback(
    route => {
      const normalizedRoute = normalizeRoute(route)

      return (
        normalizedRoute === '/' ||
        normalizedRoute === '/login' ||
        normalizedRoute === '/forgot-password' ||
        normalizedRoute === '/reset-password'
      )
    },
    [normalizeRoute]
  )

  const shouldManageTabs = useMemo(() => {
    if (!router.asPath) return false
    return !isPublicRoute(router.asPath)
  }, [router.asPath, isPublicRoute])

  const navigateTo = useCallback(
    async route => {
      if (!route) return
      await router.push(route, undefined, { shallow: true, scroll: false })
    },
    [router]
  )

  const findNode = useCallback(
    (nodes, targetRouter) => {
      for (const node of nodes || []) {
        if (node.children) {
          const result = findNode(node.children, targetRouter)
          if (result) return result
        } else if (node.path && normalizeRoute(node.path) === normalizeRoute(targetRouter)) {
          return node.name
        }
      }
      return null
    },
    [normalizeRoute]
  )

  const findResourceId = useCallback(
    (nodes, targetRouter) => {
      for (const node of nodes || []) {
        if (node.children) {
          const result = findResourceId(node.children, targetRouter)
          if (result) return result
        } else if (node.path && normalizeRoute(node.path) === normalizeRoute(targetRouter)) {
          return node.resourceId
        }
      }
      return null
  }, [normalizeRoute])

  const routeExistsInTree = useCallback((nodes, targetRouter) => {
      for (const node of nodes || []) {
        if (node.children) {
          const result = routeExistsInTree(node.children, targetRouter)
          if (result) return true
        } else if (node.path && normalizeRoute(node.path) === normalizeRoute(targetRouter)) {
          return true
        }
      }
      return false
  }, [normalizeRoute])

  const isAllowedRoute = useCallback(
    route => {
      const normalizedRoute = normalizeRoute(route)

      if (
        normalizedRoute === '/default' ||
        normalizedRoute === '/no-access' ||
        normalizedRoute === '/404'
      ) {
        return true
      }

      return routeExistsInTree(menu, normalizedRoute) || routeExistsInTree(gear, normalizedRoute)
    },
    [menu, gear, routeExistsInTree, normalizeRoute]
  )

  useEffect(() => {
    if (!shouldManageTabs || !tabsWrapperRef.current || typeof window === 'undefined') return

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
  }, [shouldManageTabs])

  const OpenItems = useCallback((event, i) => {
    setTabsIndex(i)
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setTabsIndex(null)
  }, [])

  useEffect(() => {
    if (!shouldManageTabs || !children || !router.asPath) return

    const normalizedRoute = normalizeRoute(router.asPath)

    if (normalizedRoute === '/no-access' || normalizedRoute === '/404') {
      pagesCacheRef.current.set(router.asPath, children)
      return
    }

    const cachedPage = pagesCacheRef.current.get(router.asPath)
    if (!cachedPage) {
      pagesCacheRef.current.set(router.asPath, children)
    }
  }, [router.asPath, children, shouldManageTabs, normalizeRoute])

  useEffect(() => {
    if (!shouldManageTabs || !router.asPath || (menu.length === 0 && gear.length === 0)) return

    const normalizedRoute = normalizeRoute(router.asPath)

    if (
      normalizedRoute === '/default' ||
      normalizedRoute === '/no-access' ||
      normalizedRoute === '/404'
    ) {
      redirectingRef.current = false
      return
    }

    if (!isAllowedRoute(normalizedRoute)) {
      if (redirectingRef.current) return
      redirectingRef.current = true
      navigateTo('/no-access/')
      return
    }

    redirectingRef.current = false
  }, [router.asPath, menu, gear, isAllowedRoute, navigateTo, normalizeRoute, shouldManageTabs])

  const handleChange = useCallback(
    async (_, newValue) => {
      if (newValue === currentTabIndex) return

      const nextRoute = openTabs?.[newValue]?.route
      if (!nextRoute) return

      tabSwitchingRef.current = true
      setCurrentTabIndex(newValue)

      if (normalizeRoute(nextRoute) !== normalizeRoute(router.asPath)) {
        await navigateTo(nextRoute)
      }

      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event('argus-tab-activated'))
          })
        })
      }

      queueMicrotask(() => {
        tabSwitchingRef.current = false
      })
    },
    [currentTabIndex, openTabs, router.asPath, navigateTo, normalizeRoute, setCurrentTabIndex]
  )

  const handleCloseAllTabs = useCallback(async () => {
    const firstTab = openTabs?.[0]
    if (!firstTab) return

    closingRouteRef.current = normalizeRoute(router.asPath)

    setOpenTabs([firstTab])
    setCurrentTabIndex(0)

    if (normalizeRoute(router.asPath) !== normalizeRoute(firstTab.route)) {
      await navigateTo(firstTab.route)
    }

    queueMicrotask(() => {
      closingRouteRef.current = null
    })
  }, [openTabs, navigateTo, normalizeRoute, router.asPath, setOpenTabs, setCurrentTabIndex])

  const handleCloseOtherTab = useCallback(
    async tabIndex => {
      const homeTab = openTabs?.[0]
      const selectedTab = openTabs?.[tabIndex]
      if (!homeTab || !selectedTab) return

      const isHomeTabSelected = normalizeRoute(selectedTab.route) === normalizeRoute(homeTab.route)
      const newOpenTabs = openTabs.filter((tab, index) => index === 0 || index === tabIndex)
      const newIndex = isHomeTabSelected ? 0 : newOpenTabs.length - 1

      closingRouteRef.current = normalizeRoute(router.asPath)

      setOpenTabs(newOpenTabs)
      setCurrentTabIndex(newIndex)

      if (normalizeRoute(router.asPath) !== normalizeRoute(selectedTab.route)) {
        await navigateTo(selectedTab.route)
      }

      queueMicrotask(() => {
        closingRouteRef.current = null
      })
    },
    [openTabs, navigateTo, normalizeRoute, router.asPath, setOpenTabs, setCurrentTabIndex]
  )

  const closeTab = useCallback(
    async tabRoute => {
      if (!tabRoute) return

      const normalizedTabRoute = normalizeRoute(tabRoute)
      const currentTabs = openTabs || []
      const index = currentTabs.findIndex(tab => normalizeRoute(tab.route) === normalizedTabRoute)

      if (index === -1) return
      if (currentTabs.length <= 1) return

      const nextTabs = currentTabs.filter(tab => normalizeRoute(tab.route) !== normalizedTabRoute)
      const homeTab = nextTabs.find(tab => normalizeRoute(tab.route) === '/default') || null
      const isClosingCurrentTab = normalizeRoute(router.asPath) === normalizedTabRoute
      const isOnlyHomeLeft = nextTabs.length === 1 && homeTab !== null

      if (isClosingCurrentTab) {
        closingRouteRef.current = normalizedTabRoute
      }

      if (isOnlyHomeLeft) {
        setOpenTabs(nextTabs)
        setCurrentTabIndex(0)

        if (homeTab && normalizeRoute(router.asPath) !== normalizeRoute(homeTab.route)) {
          await navigateTo(homeTab.route)
        }

        if (isClosingCurrentTab) {
          queueMicrotask(() => {
            closingRouteRef.current = null
          })
        }
        return
      }

      let nextIndex = currentTabIndex
      let routeToOpen = null

      if (index < currentTabIndex) {
        nextIndex = currentTabIndex - 1
      } else if (index === currentTabIndex) {
        nextIndex = Math.min(index, nextTabs.length - 1)
        routeToOpen = nextTabs[nextIndex]?.route || null
      }

      setOpenTabs(nextTabs)
      setCurrentTabIndex(nextIndex)

      if (routeToOpen && normalizeRoute(router.asPath) !== normalizeRoute(routeToOpen)) {
        await navigateTo(routeToOpen)
      }

      if (isClosingCurrentTab) {
        queueMicrotask(() => {
          closingRouteRef.current = null
        })
      }
    },
    [openTabs, currentTabIndex, navigateTo, normalizeRoute, router.asPath, setOpenTabs, setCurrentTabIndex]
  )

  const reopenTab = useCallback(
    async tabRoute => {
      if (normalizeRoute(tabRoute) === normalizeRoute(router.asPath)) {
        setOpenTabs(prevTabs =>
          prevTabs.map(tab =>
            normalizeRoute(tab.route) === normalizeRoute(tabRoute) ? { ...tab, id: uuidv4() } : tab
          )
        )
        setReloadOpenedPage([])
      } else {
        await navigateTo(tabRoute)
      }
    },
    [router.asPath, navigateTo, normalizeRoute, setOpenTabs, setReloadOpenedPage]
  )

  useEffect(() => {
    if (!shouldManageTabs || !initialLoadDone || !router.asPath || redirectingRef.current) return

    const normalizedRoute = normalizeRoute(router.asPath)

    if (closingRouteRef.current === normalizedRoute) return

    if (!isAllowedRoute(normalizedRoute) && normalizedRoute !== '/no-access' && normalizedRoute !== '/404') {
      return
    }

    const existingIndex = openTabs.findIndex(tab => normalizeRoute(tab.route) === normalizedRoute)

    if (existingIndex === -1) {
      const label =
        normalizedRoute === '/no-access'
          ? 'No Access'
          : normalizedRoute === '/404'
            ? '404'
            : lastOpenedPage
              ? lastOpenedPage.name
              : findNode(menu, normalizedRoute) || findNode(gear, normalizedRoute)

      const resourceId = findResourceId(menu, normalizedRoute) || findResourceId(gear, normalizedRoute)
      const cachedPage =
        normalizedRoute === '/no-access' || normalizedRoute === '/404'
          ? children || null
          : pagesCacheRef.current.get(router.asPath) || children || null

      setOpenTabs(prevState => [
        ...prevState,
        {
          page: cachedPage,
          id: uuidv4(),
          route: router.asPath,
          label,
          resourceId
        }
      ])

      return
    }

    if (!tabSwitchingRef.current && currentTabIndex !== existingIndex) {
      setCurrentTabIndex(existingIndex)
    }
  }, [
    router.asPath,
    initialLoadDone,
    openTabs,
    children,
    lastOpenedPage,
    menu,
    gear,
    currentTabIndex,
    setOpenTabs,
    setCurrentTabIndex,
    findNode,
    findResourceId,
    isAllowedRoute,
    normalizeRoute,
    shouldManageTabs
  ])

  useEffect(() => {
    if (!shouldManageTabs) return
    if (openTabs?.[currentTabIndex]?.route === reloadOpenedPage?.path + '/') {
      reopenTab(reloadOpenedPage?.path + '/')
    }
  }, [openTabs, currentTabIndex, reloadOpenedPage, reopenTab, shouldManageTabs])

  useEffect(() => {
    if (!shouldManageTabs || initialLoadDone || !router.asPath || !(menu.length > 0 || dashboardId)) return

    const normalizedRoute = normalizeRoute(router.asPath)

    if (!isAllowedRoute(normalizedRoute) && normalizedRoute !== '/no-access' && normalizedRoute !== '/404') {
      return
    }

    const homeRoute = '/default/'
    const homePage = pagesCacheRef.current.get(homeRoute) || (router.asPath === homeRoute ? children : null)

    const newTabs = [
      {
        page: homePage,
        id: uuidv4(),
        route: homeRoute,
        label: 'Home'
      }
    ]

    if (normalizedRoute !== '/default') {
      const currentPage =
        normalizedRoute === '/no-access' || normalizedRoute === '/404'
          ? children || null
          : pagesCacheRef.current.get(router.asPath) || children || null

      if (
        normalizedRoute === '/no-access' ||
        normalizedRoute === '/404' ||
        isAllowedRoute(normalizedRoute)
      ) {
        newTabs.push({
          page: currentPage,
          id: uuidv4(),
          route: router.asPath,
          label:
            normalizedRoute === '/no-access'
              ? 'No Access'
              : normalizedRoute === '/404'
                ? '404'
                : lastOpenedPage
                  ? lastOpenedPage.name
                  : findNode(menu, normalizedRoute) || findNode(gear, normalizedRoute),
          resourceId: findResourceId(menu, normalizedRoute) || findResourceId(gear, normalizedRoute)
        })
      }
    }

    setOpenTabs(newTabs)

    const activeIndex = newTabs.findIndex(tab => normalizeRoute(tab.route) === normalizedRoute)
    setCurrentTabIndex(activeIndex === -1 ? 0 : activeIndex)

    setInitialLoadDone(true)
  }, [
    initialLoadDone,
    router.asPath,
    menu,
    gear,
    children,
    lastOpenedPage,
    dashboardId,
    setCurrentTabIndex,
    setOpenTabs,
    isAllowedRoute,
    normalizeRoute,
    findNode,
    findResourceId,
    shouldManageTabs
  ])

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

  if (!shouldManageTabs) {
    return children
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
                      onMouseDown={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={e => {
                        e.preventDefault()
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
                      onMouseDown={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={async e => {
                        e.preventDefault()
                        e.stopPropagation()
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

      <Box
        className={styles.panelsWrapper}
        sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}
      >
        {openTabs.map((activeTab, i) => (
          <CustomTabPanel key={activeTab.id} index={i} value={currentTabIndex}>
            {activeTab.page}
          </CustomTabPanel>
        ))}
      </Box>

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
            event.preventDefault()
            event.stopPropagation()
            await closeTab(openTabs?.[tabsIndex]?.route)
            handleClose()
          }}
        >
          Close Tab
        </MenuItem>
        <MenuItem
          className={styles.dropdownItem}
          onClick={async event => {
            event.preventDefault()
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
            event.preventDefault()
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