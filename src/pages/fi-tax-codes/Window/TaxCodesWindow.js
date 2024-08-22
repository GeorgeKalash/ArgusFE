// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import TaxCodesForm from '../forms/TaxCodesForm'
import HistoryForm from '../forms/HistoryForm'

const TaxCodesWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    TaxHistoryViewList: []
  })

  const editMode = !!store.recordId

  const tabs = [{ label: labels.taxCodes }, { label: labels.history, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel index={0} value={activeTab}>
        <TaxCodesForm labels={labels} setStore={setStore} store={store} editMode={editMode} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <HistoryForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} editMode={editMode} />
      </CustomTabPanel>
    </>
  )
}

export default TaxCodesWindow
