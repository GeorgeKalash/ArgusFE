import React, { useContext, useCallback } from 'react'
import { useRouter } from 'next/router'
import { TabsContext } from './TabsContext'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material'
import PropTypes from 'prop-types'
import CloseIcon from '@mui/icons-material/Close'

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

const TabBar = () => {
  const router = useRouter()

  const {
    handleCloseOtherTab,
    handleClose,
    handleCloseAllTabs,
    OpenItems,
    handleChange,
    currentTabIndex,
    anchorEl,
    closeTab,
    openTabs,
    tabsIndex
  } = useContext(TabsContext)

  const dashboardId = JSON.parse(window.sessionStorage.getItem('userData'))?.dashboardId // Assuming dashboardId is stored like this

  const open = Boolean(anchorEl)

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
                  key={i}
                  label={activeTab?.label}
                  onClick={() => {
                    setCurrentTabIndex(i)
                    router.push(activeTab.route)
                  }}
                  onContextMenu={event => OpenItems(event, i)}
                  icon={
                    activeTab.route === '/default/' ? null : (
                      <IconButton
                        size='small'
                        onClick={event => {
                          event.stopPropagation()
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
            <CustomTabPanel key={activeTab.route} index={i} value={currentTabIndex}>
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

export default TabBar
