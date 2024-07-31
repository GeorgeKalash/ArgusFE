// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

import FiscalYearForm from '../forms/FiscalYearForm'
import PeriodsForm from '../forms/PeriodsForm'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { height } from '@mui/system'

const FiscalYearWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [{ label: labels.fiscalYear }, { label: labels.periods, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} height={height} value={activeTab}>
        <FiscalYearForm labels={labels} maxAccess={maxAccess} editMode={editMode} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <PeriodsForm maxAccess={maxAccess} labels={labels} editMode={editMode} setStore={setStore} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default FiscalYearWindow
