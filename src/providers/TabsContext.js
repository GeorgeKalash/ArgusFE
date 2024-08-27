import React, { createContext, useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material'
import PropTypes from 'prop-types'
import { MenuContext } from 'src/providers/MenuContext'
import { RequestsContext } from './RequestsContext'

const TabsContext = createContext()

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props

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
    >
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
  const { menu, gear, lastOpenedPage } = useContext(MenuContext)
  const [anchorEl, setAnchorEl] = useState(null)

  const [openTabs, setOpenTabs] = useState([
    {
      page: children,
      route: '/default/',
      label: 'Home'
    }
  ])
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [tabsIndex, setTabsIndex] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

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

  const handleChange = (event, newValue) => {
    setCurrentTabIndex(newValue)
    router.push(openTabs[newValue].route)
  }

  const handleCloseAllTabs = () => {
    const firstTab = openTabs[0]
    router.push(firstTab.route)
    setOpenTabs([firstTab])
    setCurrentTabIndex(0)
  }

  const handleCloseOtherTab = tabIndex => {
    const homeTab = openTabs[0]
    const selectedTab = openTabs[tabIndex]
    const isHomeTabSelected = selectedTab.route === homeTab.route

    const newOpenTabs = openTabs.filter((tab, index) => index === 0 || index === tabIndex)

    router.push(selectedTab.route)
    setOpenTabs(newOpenTabs)
    setCurrentTabIndex(isHomeTabSelected ? 0 : newOpenTabs.length - 1)
  }

  const closeTab = tabRoute => {
    const index = openTabs.findIndex(tab => tab.route === tabRoute)
    const activeTabsLength = openTabs.length

    setOpenTabs(prevState => prevState.filter(tab => tab.route !== tabRoute))

    if (activeTabsLength === 1) {
      handleCloseAllTabs()

      return
    }

    if (currentTabIndex === index) {
      const newValue = index === activeTabsLength - 1 ? index - 1 : index + 1
      setCurrentTabIndex(newValue)
      router.push(openTabs[newValue].route)
    } else if (index < currentTabIndex) {
      setCurrentTabIndex(currentValue => currentValue - 1)
    }
  }

  useEffect(() => {
    if (initialLoadDone) {
      const isTabOpen = openTabs.some((activeTab, index) => {
        if (activeTab.route === router.asPath) {
          setCurrentTabIndex(index)

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
            route: router.asPath,
            label: lastOpenedPage
              ? lastOpenedPage.name
              : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))
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
  }, [children, router.asPath, initialLoadDone, lastOpenedPage, menu, gear])

  useEffect(() => {
    if (!initialLoadDone && router.asPath && menu.length > 0) {
      const newTabs = [
        {
          page: router.asPath === '/default/' ? children : null,
          route: '/default/',
          label: 'Home'
        }
      ]

      if (router.asPath !== '/default/') {
        newTabs.push({
          page: children,
          route: router.asPath,
          label: lastOpenedPage
            ? lastOpenedPage.name
            : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))
        })
        setCurrentTabIndex(1)
      }

      setOpenTabs(newTabs)
      setInitialLoadDone(true)
    }
  }, [router.asPath, menu, gear, children, lastOpenedPage, initialLoadDone])

  const value = {
    handleCloseOtherTab,
    handleClose,
    OpenItems,
    handleChange,
    currentTabIndex,
    anchorEl,
    closeTab,
    switchTab
  }

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

export { TabsContext, TabsProvider }
