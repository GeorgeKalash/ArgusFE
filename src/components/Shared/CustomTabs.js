import { Box, Tab, Tabs } from '@mui/material'
import React from 'react'

export const CustomTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <>
      <Box sx={{ backgroundColor: '#231f20', pt: '5px' }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
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
          {tabs.map((tab, i) => (
            <Tab
              key={i}
              label={tab.label}
              disabled={tab?.disabled}
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
