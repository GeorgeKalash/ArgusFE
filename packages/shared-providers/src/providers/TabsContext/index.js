import React, { createContext, useEffect, useState, useContext, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import PropTypes from 'prop-types'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { v4 as uuidv4 } from 'uuid'
import { RequestsContext } from '../RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { LockedScreensContext } from '../LockedScreensContext'

const TabsContext = createContext()

function LoadingOverlay() {
  return (
    <Box className={'loadingOverlay'}>
      <CircularProgress />
      <style jsx global>{`
        .loadingOverlay {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
      `}</style>
    </Box>
  )
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
      className={`customTabPanel ${isActive ? 'activePanel' : 'hiddenPanel'}`}
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

  const [anchorEl, setAnchorEl] = useState(null)
  const [tabsIndex, setTabsIndex] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const tabsWrapperRef = useRef(null)
  const pagesCacheRef = useRef(new Map())

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

  const safeTabIndex = Number.isInteger(currentTabIndex) ? currentTabIndex : 0

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const route = router.asPath
    if (!route) return
    if (children && !pagesCacheRef.current.has(route)) {
      pagesCacheRef.current.set(route, children)
    }
  }, [router.asPath, children])

  const handleChange = useCallback(
    async (_, newValue) => {
      if (newValue === safeTabIndex) return

      const nextRoute = openTabs?.[newValue]?.route
      if (!nextRoute) return
      if (nextRoute === router.asPath) return

      const needsPage = !openTabs?.[newValue]?.page

      if (needsPage) {
        await navigateTo(nextRoute)
        if (typeof window !== 'undefined' && nextRoute) window.history.replaceState(null, '', nextRoute)
        setCurrentTabIndex(newValue)
      } else {
        setCurrentTabIndex(newValue)
        await navigateTo(nextRoute)
        if (typeof window !== 'undefined' && nextRoute) window.history.replaceState(null, '', nextRoute)
      }

      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event('argus-tab-activated'))
          })
        })
      }
    },
    [openTabs, setCurrentTabIndex, navigateTo, safeTabIndex, router.asPath]
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

        const label = lastOpenedPage
          ? lastOpenedPage.name
          : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))

        const resourceId = findResourceId(menu, router.asPath.replace(/\/$/, ''))

        const cachedPage = pagesCacheRef.current.get(router.asPath) || children

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
        setCurrentTabIndex(newValueState)
      } else {
        setOpenTabs(prevState =>
          prevState.map(tab => {
            if (tab.route !== router.asPath) return tab

            if (tab.page) return tab

            const cachedPage = pagesCacheRef.current.get(router.asPath) || children
            return { ...tab, page: cachedPage }
          })
        )
      }
    }
  }, [router.asPath, historyAs])

  useEffect(() => {
    if (openTabs?.[safeTabIndex]?.route === reloadOpenedPage?.path + '/') reopenTab(reloadOpenedPage?.path + '/')

    if (!initialLoadDone && router.asPath) {
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

      if (router.asPath !== homeRoute) {
        const currentPage = pagesCacheRef.current.get(router.asPath) || children

        newTabs.push({
          page: currentPage,
          id: uuidv4(),
          route: router.asPath,
          label: lastOpenedPage
            ? lastOpenedPage.name
            : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, '')) || 'Page',
          resourceId: findResourceId(menu, router.asPath.replace(/\/$/, ''))
        })
        setCurrentTabIndex(newTabs.findIndex(tab => tab.route === router.asPath))
      } else {
        setCurrentTabIndex(0)
      }

      setOpenTabs(newTabs)
      setInitialLoadDone(true)
    }
  }, [router.asPath, menu, gear, children, lastOpenedPage, initialLoadDone, reloadOpenedPage, safeTabIndex])

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
      <Box className={'tabsProviderContainer'}>
        <Box ref={tabsWrapperRef} className={'tabsWrapper'}>
          <Tabs
            value={safeTabIndex}
            onChange={handleChange}
            variant='scrollable'
            scrollButtons={openTabs.length > 3 ? 'auto' : 'off'}
            aria-label='scrollable auto tabs example'
            classes={{ indicator: 'tabsIndicator' }}
            className={'tabs'}
          >
            {openTabs.map((activeTab, i) => (
              <Tab
                key={activeTab?.id}
                className={'tabName'}
                label={
                  <Box display='flex' alignItems='center'>
                    <span>{activeTab.label}</span>
                    {i === safeTabIndex && (
                      <IconButton
                        size='small'
                        className={'svgIcon'}
                        onClick={e => {
                          e.stopPropagation()
                          setReloadOpenedPage({ path: openTabs[i].route.replace(/\/$/, ''), name: openTabs[i].label })
                        }}
                      >
                        <RefreshIcon className={'svgIcon'} />
                      </IconButton>
                    )}
                    {activeTab.route !== '/default/' && (
                      <IconButton
                        size='small'
                        className={'svgIcon'}
                        onClick={async event => {
                          event.stopPropagation()
                          if (activeTab) unlockIfLocked(activeTab)
                          await closeTab(activeTab.route)
                        }}
                      >
                        <CloseIcon className={'svgIcon'} />
                      </IconButton>
                    )}
                  </Box>
                }
                onContextMenu={event => OpenItems(event, i)}
                classes={{
                  root: 'tabRoot',
                  selected: 'selectedTab'
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Box className={'panelsWrapper'} sx={{ position: 'relative', width: '100%', flex: 1, minHeight: 0 }}>
          {openTabs.map((activeTab, i) => (
            <CustomTabPanel key={activeTab.id} index={i} value={safeTabIndex}>
              {activeTab.page}
            </CustomTabPanel>
          ))}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        className={'dropdownMenu'}
      >
        <MenuItem
          className={'dropdownItem'}
          onClick={async event => {
            await closeTab(openTabs[tabsIndex]?.route)
            event.stopPropagation()
            handleClose()
          }}
        >
          Close Tab
        </MenuItem>
        <MenuItem
          className={'dropdownItem'}
          onClick={async event => {
            event.stopPropagation()
            await handleCloseOtherTab(tabsIndex)
            handleClose()
          }}
        >
          Close Other Tabs
        </MenuItem>
        <MenuItem
          className={'dropdownItem'}
          onClick={async event => {
            event.stopPropagation()
            await handleCloseAllTabs()
            handleClose()
          }}
        >
          Close All Tabs
        </MenuItem>
      </Menu>

      <style jsx global>{`
        .tabsProviderContainer {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          height: 100%;
          flex: 1 !important;
          min-height: 0;
          overflow: hidden;
        }

        .panelsWrapper {
          position: relative;
          width: 100%;
          flex: 1 !important;
          min-height: 0;
          overflow: hidden;
        }

        .customTabPanel {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          height: 100%;
          overflow: auto;
          padding-top: 5px;
          position: absolute;
          inset: 0;
          background-color: white;
        }

        .activePanel {
          visibility: visible;
          pointer-events: auto;
        }

        .hiddenPanel {
          visibility: hidden;
          pointer-events: none;
        }

        .tabsWrapper {
          background-color: #231f20;
          padding-top: 5px;
          position: relative !important;
          z-index: 3 !important;
        }

        .tabs {
          min-height: 35px !important;
        }

        .tabRoot {
          color: white !important;
          background-color: #6d6c6c !important;
          min-height: 35px !important;
          border-top-left-radius: 5px !important;
          border-top-right-radius: 5px !important;
          padding: 0px 10px !important;
          margin-right: 2px !important;
          display: flex;
          align-items: center;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .tabRoot:hover {
          color: grey !important;
          background-color: #ddd !important;
        }

        .selectedTab {
          color: #231f20 !important;
          background-color: white !important;
        }

        .tabsIndicator {
          background-color: white !important;
        }

        .svgIcon {
          color: #231f20 !important;
          transition: color 0.2s ease;
          padding: 0px !important;
          padding-left: 1px !important;
          font-size: 20px !important;
        }

        .dropdownMenu {
          min-width: 160px;
          border-radius: 6px !important;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
          padding: 4px 0;
          font-size: 14px;
        }

        .dropdownItem {
          padding: 6px 16px !important;
          color: #231f20 !important;
          font-size: 13px !important;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .dropdownItem:hover {
          background-color: #f0f0f0 !important;
          color: #000 !important;
        }

        @media (min-width: 1025px) and (max-width: 1600px) {
          .tabs {
            min-height: 25px !important;
          }
          .tabRoot {
            min-height: 25px !important;
            padding: 0px 8px !important;
          }
          .tabName {
            font-size: 11px !important;
          }
          .svgIcon {
            font-size: 15px !important;
          }
        }

        @media (max-width: 1366px) {
          .tabs {
            min-height: 24px !important;
          }
          .tabRoot {
            min-height: 24px !important;
            padding: 0px 7px !important;
          }
          .tabName {
            font-size: 11px !important;
          }
          .svgIcon {
            font-size: 15px !important;
          }
          .dropdownItem {
            font-size: 12px !important;
          }
        }

        @media (max-width: 1024px) {
          .tabs {
            min-height: 22px !important;
          }
          .tabRoot {
            min-height: 22px !important;
            padding: 0px 6px !important;
          }
          .tabName {
            font-size: 9px !important;
          }
          .svgIcon {
            font-size: 13px !important;
          }
        }

        @media (max-width: 768px) {
          .tabs {
            min-height: 20px !important;
          }
          .tabRoot {
            min-height: 20px !important;
            padding: 0px 5px !important;
          }
          .tabName {
            font-size: 8px !important;
          }
          .svgIcon {
            font-size: 12px !important;
          }
          .dropdownItem {
            font-size: 11px !important;
          }
        }

        @media (max-width: 600px) {
          .tabs {
            min-height: 18px !important;
          }
          .tabRoot {
            min-height: 18px !important;
            padding: 0px 4px !important;
          }
          .tabName {
            font-size: 7px !important;
          }
          .svgIcon {
            font-size: 11px !important;
          }
        }

        @media (max-width: 480px) {
          .tabs {
            min-height: 16px !important;
          }
          .tabRoot {
            min-height: 16px !important;
            padding: 0px 3px !important;
          }
          .tabName {
            font-size: 6px !important;
          }
          .svgIcon {
            font-size: 10px !important;
          }
        }

        @media (max-width: 375px) {
          .tabs {
            min-height: 14px !important;
          }
          .tabRoot {
            min-height: 14px !important;
            padding: 0px 2px !important;
          }
          .tabName {
            font-size: 5.5px !important;
          }
          .svgIcon {
            font-size: 9px !important;
          }
        }
      `}</style>
    </>
  )
}

export { TabsContext, TabsProvider }
