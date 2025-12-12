import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import FiscalYearForm from '../forms/FiscalYearForm'
import PeriodsForm from '../forms/PeriodsForm'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'

const FiscalYearWindow = ({ labels, maxAccess, recordId, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [{ label: labels.fiscalYear }, { label: labels.periods, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <FiscalYearForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <PeriodsForm maxAccess={maxAccess} labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default FiscalYearWindow
