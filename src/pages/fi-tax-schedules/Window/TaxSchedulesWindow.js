// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import TaxSchedulesForm from '../forms/TaxSchedulesForm'

import DetailsForm from '../forms/DetailsForm'

const TaxSchedulesWindow = ({ height, recordId, labels, maxAccess, expanded }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store, setStore] = useState({
    recordId: recordId || null,
    TaxDetail: []
  })

  const tabs = [{ label: labels.taxSchedules }, { label: labels.details, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel height={height} index={0} value={activeTab}>
        <TaxSchedulesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <DetailsForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          expanded={expanded}
        />
      </CustomTabPanel>
    </>
  )
}

export default TaxSchedulesWindow
