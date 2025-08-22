import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
  isValidElement,
  cloneElement,
  Children,
  useCallback
} from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import PropTypes from 'prop-types'
import { MenuContext } from 'src/providers/MenuContext'
import { v4 as uuidv4 } from 'uuid'
import { RequestsContext } from './RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { LockedScreensContext } from './LockedScreensContext'

const TabsContext = createContext()

function LoadingOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 250, 250, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    ></Box>
  )
}

function injectRefIntoInnermost(el, setRef) {
  if (!isValidElement(el)) return el
  const t = el.type
  const isForwardRef = typeof t === 'object' && t?.$$typeof === Symbol.for('react.forward_ref')
  if (isForwardRef) return cloneElement(el, { ref: setRef })

  const kids = Children.toArray(el.props?.children)
  if (kids.length === 1 && isValidElement(kids[0])) {
    const inner = injectRefIntoInnermost(kids[0], setRef)

    return cloneElement(el, { children: inner })
  }

  return el
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)

  const actionRef = useRef(null)

  const setAction = useCallback(api => {
    actionRef.current = api
  }, [])

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowOverlay(true)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <Box
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{
        display: value !== index ? 'none !important' : 'flex !important',
        flexDirection: 'column',
        width: '100%',
        flex: '1 !important',
        overflow: 'auto',
        paddingTop: '5px',
        position: 'relative',
        backgroundColor: 'white'
      }}
      {...other}
      onKeyDown={e => {
        const target = e.target
        const role = target.getAttribute('role') || ''
        const isSearchField = target.getAttribute('data-search') === 'true'

        if (actionRef.current?.submit) {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault()
            actionRef.current?.submit()
          }
          if (e.key === 'Enter') {
            if (isSearchField) {
              return
            }
            const isDropDownOpen = target.getAttribute('aria-expanded') === 'true'
            const isEqual = (role === 'combobox' && isDropDownOpen) || role === 'gridcell'

            if (!isEqual) {
              e.preventDefault()
              actionRef.current?.submit()
            }
          }
        }
      }}
    >
      {!showOverlay && LoadingOverlay()}

      {injectRefIntoInnermost(children, setAction)}
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
  const { dashboardId } = JSON.parse(window.sessionStorage.getItem('userData'))
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId
  const { postRequest } = useContext(RequestsContext)

  const open = Boolean(anchorEl)

  const OpenItems = (event, i) => {
    setTabsIndex(i)
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setTabsIndex(null)
  }

  const findNode = (nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findNode(node.children, targetRouter)
        if (result) {
          return result
        }
      } else if (node.path && node.path === targetRouter) {
        return node.name
      }
    }

    return null
  }

  const findResourceId = (nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findResourceId(node.children, targetRouter)
        if (result) {
          return result
        }
      } else if (node.path && node.path === targetRouter) {
        return node.resourceId
      }
    }

    return null
  }

  const handleChange = (event, newValue) => {
    setCurrentTabIndex(newValue)
    if (newValue === 0 && !openTabs[newValue].page) {
      router.push(openTabs[newValue].route)
    } else {
      window.history.replaceState(null, '', openTabs[newValue].route)
    }
  }

  const handleCloseAllTabs = () => {
    const firstTab = openTabs[0]
    window.history.replaceState(null, '', firstTab.route)
    setOpenTabs([firstTab])
    setCurrentTabIndex(0)
  }

  const handleCloseOtherTab = tabIndex => {
    const homeTab = openTabs[0]
    const selectedTab = openTabs[tabIndex]
    const isHomeTabSelected = selectedTab.route === homeTab.route

    const newOpenTabs = openTabs.filter((tab, index) => index === 0 || index === tabIndex)

    window.history.replaceState(null, '', selectedTab.route)

    setOpenTabs(newOpenTabs)

    setCurrentTabIndex(isHomeTabSelected ? 0 : newOpenTabs.length - 1)
  }

  const closeTab = tabRoute => {
    const index = openTabs.findIndex(tab => tab.route === tabRoute)
    const activeTabsLength = openTabs.length

    if (activeTabsLength === 2) {
      handleCloseAllTabs()

      return
    }

    if (currentTabIndex === index) {
      const newValue = index === activeTabsLength - 1 ? index - 1 : index + 1

      // if closing last tab

      if (newValue === index - 1 || router.asPath === window?.history?.state?.as) {
        setCurrentTabIndex(newValue)
      }

      window.history.replaceState(null, '', openTabs?.[newValue]?.route)
    } else if (index < currentTabIndex) {
      setCurrentTabIndex(currentValue => currentValue - 1)
    }

    setOpenTabs(prevState => prevState.filter(tab => tab.route !== tabRoute))
  }

  const reopenTab = tabRoute => {
    if (tabRoute === router.asPath) {
      setOpenTabs(openTabs => openTabs.map(tab => (tab.route === tabRoute ? { ...tab, id: uuidv4() } : tab)))
      setReloadOpenedPage([])
    } else {
      router.push(tabRoute)
    }
  }

  const refreshHomeTab = () => {
    const homeTabIndex = openTabs.findIndex(tab => tab.route === '/default/')
    if (homeTabIndex !== -1) {
      setOpenTabs(prev => prev.map((tab, index) => (index === homeTabIndex ? { ...tab, id: uuidv4() } : tab)))
      setReloadOpenedPage([])
    }
  }

  useEffect(() => {
    if (reloadOpenedPage) {
      setOpenTabs(openTabs => openTabs.map(tab => (tab.route === router.asPath ? { ...tab, id: uuidv4() } : tab)))
      setReloadOpenedPage([])
    }
  }, [router.asPath])

  useEffect(() => {
    if (initialLoadDone) {
      const isTabOpen = openTabs.some((activeTab, index) => {
        if (activeTab.route === router.asPath || !window?.history?.state?.as) {
          return true
        }

        return false
      })

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
              return { ...tab, page: children }
            }

            return tab
          })
        )
      }
    }
  }, [router.asPath, window.history?.state?.as])

  useEffect(() => {
    if (openTabs[currentTabIndex]?.route === reloadOpenedPage?.path + '/') reopenTab(reloadOpenedPage?.path + '/')

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

        const index = newTabs.findIndex(tab => tab.route === router.asPath)

        setCurrentTabIndex(index)
      }

      setOpenTabs(newTabs)
      menu.length > 0 && setInitialLoadDone(true)
    }
  }, [router.asPath, menu, gear, children, lastOpenedPage, initialLoadDone, reloadOpenedPage])

  function unlockRecord(resourceId) {
    const body = {
      resourceId: resourceId,
      recordId: 0,
      reference: '',
      userId: userId,
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
      <Box
        sx={{
          display: 'flex !important',
          flexDirection: 'column',
          width: '100%',
          flex: '1 !important',
          overflow: 'auto'
        }}
      >
        <Box sx={{ backgroundColor: '#231f20', pt: '5px', position: 'relative !important', zIndex: '3 !important' }}>
          <Tabs
            value={currentTabIndex}
            onChange={handleChange}
            variant='scrollable'
            scrollButtons={openTabs.length > 3 ? 'auto' : 'off'}
            aria-label='scrollable auto tabs example'
            sx={{
              minHeight: '35px !important',
              '.MuiTab-root': {
                color: 'white',
                backgroundColor: 'grey',
                '&:hover': {
                  color: 'grey',
                  backgroundColor: '#ddd'
                }
              },
              '.Mui-selected': {
                color: '#231f20',
                backgroundColor: 'white'
              },
              '.MuiTabs-indicator': {
                backgroundColor: 'white'
              },
              '.MuiSvgIcon-root': {
                color: 'white!important'
              },
              '.MuiTab-root .MuiSvgIcon-root': {
                color: '#5A585E !important'
              }
            }}
          >
            {openTabs.length > 0 &&
              openTabs.map((activeTab, i) => (
                <Tab
                  key={activeTab?.id}
                  label={
                    <Box display='flex' alignItems='center'>
                      <span>{activeTab.label}</span>
                      {activeTab.route === '/default/' && currentTabIndex === i && (
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()
                            refreshHomeTab()
                          }}
                          sx={{ ml: 1, p: 0.5 }}
                        >
                          <RefreshIcon fontSize='small' />
                        </IconButton>
                      )}
                    </Box>
                  }
                  onContextMenu={event => OpenItems(event, i)}
                  icon={
                    activeTab.route === '/default/' ? null : (
                      <IconButton
                        size='small'
                        onClick={event => {
                          event.stopPropagation()
                          if (activeTab) unlockIfLocked(activeTab)
                          closeTab(activeTab.route)
                        }}
                      >
                        <CloseIcon fontSize='small' />
                      </IconButton>
                    )
                  }
                  iconPosition='end'
                  sx={{
                    minHeight: '35px !important',
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    py: '0px !important',
                    mb: '0px !important',
                    borderBottom: '0px !important',
                    mr: '2px !important',
                    fontWeight: '1.5rem',
                    pr: '0px !important',
                    pl: '10px !important',
                    display: activeTab.route === '/default/' && dashboardId === null ? 'none' : 'flex'
                  }}
                />
              ))}
          </Tabs>
        </Box>
        {openTabs.length > 0 &&
          openTabs.map((activeTab, i) => (
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
      >
        <MenuItem
          onClick={event => {
            closeTab(openTabs[tabsIndex]?.route)
            event.stopPropagation()
            handleClose()
          }}
        >
          <div>Close Tab</div>
        </MenuItem>
        <MenuItem
          onClick={event => {
            event.stopPropagation()
            handleCloseOtherTab(tabsIndex)
            handleClose()
          }}
        >
          <div>Close Other Tabs</div>
        </MenuItem>
        <MenuItem
          onClick={event => {
            event.stopPropagation()
            handleCloseAllTabs()
            handleClose()
          }}
        >
          <div>Close All Tabs</div>
        </MenuItem>
      </Menu>
    </>
  )
}

export { TabsContext, TabsProvider }
