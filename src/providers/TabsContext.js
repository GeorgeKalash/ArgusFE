// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import { Tabs, Tab, Box } from '@mui/material'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'

const TabsContext = createContext()

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props

  //NOTE: EVERY PAGE PADDING CAN BE ADDED HERE

  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{ height: '100%' }}
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
  // ** Hooks
  const router = useRouter()

  const getLabel = () => {
    const parts = router.route.split('/')

    return parts[parts.length - 1]
  }

  var initialActiveTab = router.route === '/default' ? [] : [{ page: children, route: router.route, label: getLabel() }]

  // ** States
  const [activeTabs, setActiveTabs] = useState(initialActiveTab)
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const closeTab = tabRoute => {
    const index = activeTabs.findIndex(tab => tab.route === tabRoute)
    if (index === value) {
      const newValue = index > 0 ? index - 1 : 1
      if (activeTabs[newValue]) {
        router.push(activeTabs[newValue].route)
      }
      setValue(newValue - 1 >= 0 ? newValue - 1 : 0)
    } else if (value === activeTabs.length - 1) {
      if (activeTabs[index - 1]) {
        router.push(activeTabs[index - 1].route)
      }
      setValue(activeTabs.length - 2)
    }

    setActiveTabs(prevState => {
      prevState = prevState.filter(tab => tab.route !== tabRoute)

      return prevState
    })
  }

  useEffect(() => {
    if (router.route != '/default') {
      const isTabOpen = activeTabs.some(activeTab => activeTab.page === children || activeTab.route === router.route)
      if (isTabOpen) return
      else {
        const newValueState = activeTabs.length
        setActiveTabs(prevState => {
          return [...prevState, { page: children, route: router.route, label: getLabel() }]
        })
        setValue(newValueState)
      }
    }
  }, [children, router.route])

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label='basic tabs example'>
            {activeTabs.length > 0 &&
              activeTabs.map(
                (activeTab, i) =>
                  !activeTab.isDefault && (
                    <Tab
                      key={i}
                      label={activeTab?.label?.replace(/-/g, ' ')}
                      onClick={() => router?.push(activeTab.route)}
                      icon={
                        <IconButton
                          size='small'
                          onClick={event => {
                            event.stopPropagation()
                            closeTab(activeTab.route)
                          }}
                        >
                          <CloseIcon fontSize='small' />
                        </IconButton>
                      }
                      iconPosition='end'
                    />
                  )
              )}
          </Tabs>
        </Box>
        {activeTabs.length > 0 &&
          activeTabs.map((activeTab, i) => (
            <CustomTabPanel key={i} index={i} value={value}>
              {activeTab.page}
            </CustomTabPanel>
          ))}
      </Box>
    </>
  )
}

export { TabsContext, TabsProvider }
