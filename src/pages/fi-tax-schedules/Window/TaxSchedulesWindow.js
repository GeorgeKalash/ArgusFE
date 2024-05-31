import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel index={0} value={activeTab}>
        <TaxSchedulesForm labels={labels} setStore={setStore} store={store} editMode={editMode} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
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
