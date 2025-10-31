import { Box, IconButton, Tab, Tabs } from '@mui/material'
import React, { useEffect } from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'

export const CustomTabs = ({ tabs, activeTab, setActiveTab, maxAccess, name = 'tab' }) => {
  const indexes =
    maxAccess?.record?.controls
      ?.filter(c => c.accessLevel === 4 && c.controlId?.startsWith(`${name}.`))
      .map(c => c.controlId.split('.')[1]) || []

  const _tabs = tabs
    ?.map((tab, index) => ({
      ...tab,
      id: index
    }))
    ?.filter((_, index) => !indexes.includes(String(index)))

  const _activeTab = _tabs[activeTab]?.id
  const _disabledTab = _tabs[activeTab]?.disabled

  useEffect(() => {
    if (_activeTab >= 0 && !_disabledTab && activeTab != _activeTab) {
      setActiveTab(_activeTab)
    }
  }, [])

  return (
    <>
      <Box sx={{ backgroundColor: '#231f20', pt: '5px' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant='scrollable'
          scrollButtons='auto'
          aria-label='scrollable auto tabs example'
          sx={{
            minHeight: '35px !important',
            '.MuiTab-root': {
              color: 'white',
              backgroundColor: 'grey',
              '&:hover': {
                color: 'white',
                backgroundColor: '#ddd'
              }
            },
            '.Mui-disabled': {
              color: '#6A6A6A !important',
              backgroundColor: '#333333'
            },
            '.Mui-selected': {
              color: '#231f20',
              backgroundColor: 'white'
            },
            '.MuiTabs-indicator': {
              backgroundColor: 'white'
            }
          }}
        >
          {_tabs?.map(tab => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              disabled={tab?.disabled}
              icon={
                tab?.onRefetch ? (
                  <IconButton
                    size='small'
                    onClick={() => {
                      tab?.onRefetch()
                    }}
                    sx={{ ml: 1, p: 0.5 }}
                  >
                    <RefreshIcon fontSize='small' />
                  </IconButton>
                ) : null
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
                px: '5px !important'
              }}
            />
          ))}
        </Tabs>
      </Box>
    </>
  )
}
