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
    <Box className={'tabsContainer'}>
      <Box className={'tabsWrapper'}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant='scrollable'
          scrollButtons={_tabs.length > 3 ? 'auto' : 'off'}
          aria-label='scrollable tabs'
          classes={{ indicator: 'tabsIndicator' }}
          className={'tabs'}
        >
          {_tabs?.map(tab => (
            <Tab
              key={tab.id}
              value={tab.id}
              disabled={tab?.disabled}
              className={`tabName ${tab.disabled ? 'tabDisabled' : ''}`}
              classes={{
                root: 'tabRoot',
                selected: 'selectedTab'
              }}
              label={
                <Box display='flex' alignItems='center'>
                  <span>{tab.label}</span>
                  {tab.id === activeTab && tab?.onRefetch && (
                    <IconButton
                      size='small'
                      className={'refreshButton'}
                      onClick={e => {
                        e.stopPropagation()
                        tab.onRefetch()
                      }}
                    >
                      <RefreshIcon className={'refreshIcon'} />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <style jsx global>{`
        .customTabPanel {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          flex: 0 !important;
          overflow: auto;
          padding-top: 5px;
          position: relative;
          background-color: white;
        }

        .hidden {
          display: none !important;
        }

        .tabsContainer {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          min-height: 32px;
          height: auto;
          overflow: visible;
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

        .tabName {
          font-size: 14px;
        }

        .tabRoot {
          color: white !important;
          background-color: #868686 !important;
          min-height: 35px !important;
          border-top-left-radius: 5px !important;
          border-top-right-radius: 5px !important;
          padding: 0px 5px !important;
          margin-right: 2px !important;
          display: flex;
          align-items: center;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .tabRoot:hover {
          color: grey !important;
          background-color: #ddd !important;
        }

        .tabDisabled {
          opacity: 0.5 !important;
          pointer-events: none !important;
          color: #949494 !important;
          background-color: #555555 !important;
        }

        .selectedTab {
          color: #231f20 !important;
          background-color: white !important;
        }

        .tabsIndicator {
          background-color: white !important;
        }

        .refreshButton {
          padding: 0 !important;
          margin-left: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refreshIcon {
          font-size: 18px !important;
        }

        @media (min-width: 1025px) and (max-width: 1600px) {
          .tabs {
            min-height: 25px !important;
          }
          .tabRoot {
            min-height: 25px !important;
            padding: 0px 3px !important;
          }
          .tabName {
            font-size: 11px !important;
          }
          .tabsContainer {
            height: 30px;
          }
        }

        @media (max-width: 1024px) {
            .refreshIcon {
            font-size: 14px !important;
          }
          .refreshButton {
            margin-left: 4px;
          }
          .tabs {
            min-height: 27px !important;
          }
          .tabRoot {
            min-height: 22px !important;
            padding: 0px 6px !important;
          }
          .tabName {
            font-size: 9px !important;
          }
        }

        @media (max-width: 768px) {
          .refreshIcon {
            font-size: 12px !important;
          }
          .refreshButton {
            margin-left: 3px;
          }
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
        }

        @media (min-width: 768px) and (max-width: 1024px) {

          .tabs {
            min-height: 26px !important;
            height: 26px !important;
          }

          .tabs :global(.MuiTabs-flexContainer) {
            height: 26px !important;
          }

          .tabRoot {
            min-height: 26px !important;
            height: 26px !important;
            padding: 0 6px !important;
          }

          .tabs :global(.MuiTab-root) {
            min-height: 26px !important;
            height: 26px !important;
          }

          .tabs :global(.MuiTab-root span),
          .tabs :global(.MuiTab-root .MuiTab-wrapper) {
            line-height: 1 !important;
          }

          .tabName {
            font-size: 10px !important;
          }

          .refreshIcon {
            font-size: 14px !important;
          }
        }

        @media (max-width: 600px) {
            .refreshIcon {
            font-size: 10px !important;
          }
          .refreshButton {
            margin-left: 2px;
          }
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
        }

        @media (max-width: 480px) {
          .refreshIcon {
            font-size: 9px !important;
          }
          .refreshButton {
            margin-left: 2px;
          }
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
        }

        @media (max-width: 375px) {
          .refreshIcon {
            font-size: 8px !important;
          }
          .refreshButton {
            margin-left: 1px;
          }     
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
        }
      `}</style>
    </Box>
  )
}
