import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import TaxSchedulesForm from '../forms/TaxSchedulesForm'

import DetailsForm from '../forms/DetailsForm'

const TaxSchedulesWindow = ({ recordId, labels, maxAccess, expanded }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    TaxDetail: []
  })
  const editMode = !!store.recordId

  const tabs = [{ label: labels.taxSchedules }, { label: labels.details, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <TaxSchedulesForm labels={labels} setStore={setStore} store={store} editMode={editMode} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <DetailsForm
          labels={labels}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
    </>
  )
}

export default TaxSchedulesWindow
