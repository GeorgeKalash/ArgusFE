import React, { useEffect } from 'react'
import { Box, IconButton, Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'
import RefreshIcon from '@mui/icons-material/Refresh'

export const CustomTabPanel = styled(Box)(() => ({
  display: 'flex !important',
  flexDirection: 'column',
  width: '100%',
  flex: '0 !important',
  overflow: 'auto',
  paddingTop: '5px',
  position: 'relative',
  backgroundColor: 'white'
}))

export const Hidden = styled(Box)(() => ({
  display: 'none !important'
}))

const TabsContainer = styled(Box)(() => ({
  display: 'flex !important',
  flexDirection: 'column',
  width: '100%',
  minHeight: '32px',
  height: 'auto',
  overflow: 'visible',
  '@media (min-width: 1025px)': {
    height: '30px'
  }
}))

const TabsWrapper = styled(Box)(() => ({
  backgroundColor: '#231f20',
  paddingTop: '5px',
  position: 'relative !important',
  zIndex: '3 !important'
}))

const StyledTabs = styled(Tabs)(() => ({
  minHeight: '35px !important',

  '& .MuiTabs-indicator': {
    backgroundColor: 'white !important'
  },

  '@media (min-width: 1025px)': {
    minHeight: '25px !important'
  },

  '@media (max-width: 1024px)': {
    minHeight: '27px !important'
  },

  '@media (max-width: 768px)': {
    minHeight: '20px !important'
  },

  '@media (min-width: 768px) and (max-width: 1024px)': {
    minHeight: '26px !important',
    height: '26px !important',

    '& .MuiTabs-flexContainer': {
      height: '26px !important'
    },

    '& .MuiTab-root': {
      minHeight: '26px !important',
      height: '26px !important'
    },

    '& .MuiTab-root span, & .MuiTab-root .MuiTab-wrapper': {
      lineHeight: '1 !important'
    }
  },

  '@media (max-width: 600px)': {
    minHeight: '18px !important'
  },

  '@media (max-width: 480px)': {
    minHeight: '16px !important'
  },

  '@media (max-width: 375px)': {
    minHeight: '14px !important'
  }
}))

const StyledTab = styled(Tab)(() => ({
  fontSize: '20px',
  color: 'white !important',
  backgroundColor: '#868686 !important',
  minHeight: '35px !important',
  borderTopLeftRadius: '5px !important',
  borderTopRightRadius: '5px !important',
  padding: '0px 5px !important',
  marginRight: '2px !important',
  display: 'flex',
  alignItems: 'center',
  transition: 'background-color 0.2s ease, color 0.2s ease',

  '&:hover': {
    color: 'grey !important',
    backgroundColor: '#ddd !important'
  },

  '&.Mui-selected': {
    color: '#231f20 !important',
    backgroundColor: 'white !important'
  },

  '&.Mui-disabled': {
    opacity: '0.5 !important',
    pointerEvents: 'none !important',
    color: '#949494 !important',
    backgroundColor: '#555555 !important'
  },

  '@media (min-width: 1025px)': {
    minHeight: '25px !important',
    padding: '0px 3px !important',
    fontSize: '11px !important'
  },

  '@media (max-width: 1024px)': {
    minHeight: '22px !important',
    padding: '0px 6px !important',
    fontSize: '9px !important'
  },

  '@media (max-width: 768px)': {
    minHeight: '20px !important',
    padding: '0px 5px !important',
    fontSize: '8px !important'
  },

  '@media (min-width: 768px) and (max-width: 1024px)': {
    minHeight: '26px !important',
    height: '26px !important',
    padding: '0 6px !important',
    fontSize: '10px !important'
  },

  '@media (max-width: 600px)': {
    minHeight: '18px !important',
    padding: '0px 4px !important',
    fontSize: '7px !important'
  },

  '@media (max-width: 480px)': {
    minHeight: '16px !important',
    padding: '0px 3px !important',
    fontSize: '6px !important'
  },

  '@media (max-width: 375px)': {
    minHeight: '14px !important',
    padding: '0px 2px !important',
    fontSize: '5.5px !important'
  }
}))

const RefreshButton = styled(IconButton)(() => ({
  padding: '0 !important',
  marginLeft: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& .MuiSvgIcon-root': {
    fontSize: '18px !important'
  },

  '@media (max-width: 1024px)': {
    marginLeft: '4px',
    '& .MuiSvgIcon-root': {
      fontSize: '14px !important'
    }
  },

  '@media (max-width: 768px)': {
    marginLeft: '3px',
    '& .MuiSvgIcon-root': {
      fontSize: '12px !important'
    }
  },

  '@media (min-width: 768px) and (max-width: 1024px)': {
    '& .MuiSvgIcon-root': {
      fontSize: '14px !important'
    }
  },

  '@media (max-width: 600px)': {
    marginLeft: '2px',
    '& .MuiSvgIcon-root': {
      fontSize: '10px !important'
    }
  },

  '@media (max-width: 480px)': {
    marginLeft: '2px',
    '& .MuiSvgIcon-root': {
      fontSize: '9px !important'
    }
  },

  '@media (max-width: 375px)': {
    marginLeft: '1px',
    '& .MuiSvgIcon-root': {
      fontSize: '8px !important'
    }
  }
}))

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

  const _activeTab = _tabs?.[activeTab]?.id
  const _disabledTab = _tabs?.[activeTab]?.disabled

  useEffect(() => {
    if (_activeTab >= 0 && !_disabledTab && activeTab != _activeTab) {
      setActiveTab(_activeTab)
    }
  }, [])

  return (
    <TabsContainer>
      <TabsWrapper>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant='scrollable'
          scrollButtons={_tabs.length > 3 ? 'auto' : 'off'}
          aria-label='scrollable tabs'
        >
          {_tabs?.map(tab => (
            <StyledTab
              key={tab.id}
              value={tab.id}
              disabled={tab?.disabled}
              label={
                <Box display='flex' alignItems='center'>
                  <span>{tab.label}</span>

                  {tab.id === activeTab && tab?.onRefetch && (
                    <RefreshButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()
                        tab.onRefetch()
                      }}
                    >
                      <RefreshIcon />
                    </RefreshButton>
                  )}
                </Box>
              }
            />
          ))}
        </StyledTabs>
      </TabsWrapper>
    </TabsContainer>
  )
}
