import { Box, IconButton, Tab, Tabs } from '@mui/material'
import React, { useEffect } from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'
import styles from './CustomTabs.module.css'

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
    <Box className={styles.tabsContainer}>
      <Box className={styles.tabsWrapper}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant='scrollable'
          scrollButtons={_tabs.length > 3 ? 'auto' : 'off'}
          aria-label='scrollable tabs'
          classes={{ indicator: styles.tabsIndicator }}
          className={styles.tabs}
        >
          {_tabs?.map(tab => (
            <Tab
              key={tab.id}
              value={tab.id}
              disabled={tab?.disabled}
              className={`${styles.tabName} ${tab.disabled ? styles.tabDisabled : ''}`}
              classes={{
                root: styles.tabRoot,
                selected: styles.selectedTab
              }}
              label={
                <Box display='flex' alignItems='center'>
                  <span>{tab.label}</span>
                  {tab.id === activeTab && tab?.onRefetch && (
                    <IconButton
                      size='small'
                      className={styles.refreshButton}
                      onClick={e => {
                        e.stopPropagation()
                        tab.onRefetch()
                      }}
                    >
                      <RefreshIcon className={styles.refreshIcon} />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  )
}
