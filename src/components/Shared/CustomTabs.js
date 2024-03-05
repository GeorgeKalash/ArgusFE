import { Tab, Tabs } from '@mui/material'
import React from 'react'

export const CustomTabs = ({tabs ,activeTab,  setActiveTab }) => {
  return (
    <>
      <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
        {tabs.map((tab, i) => (
          <Tab key={i} label={tab.label} disabled={tab?.disabled} />
        ))}
      </Tabs>
    </>
  )
}
