import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import LabelTemplateForm from '../Forms/LabelTemplateForm'
import ItemList from '../Forms/ItemList'

const LabelTemplateWindow = ({ labels, maxAccess, recordId }) => {
  const [store, setStore] = useState({
    recordId: recordId
  })

  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.labeltemplate }, { label: labels.item, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <LabelTemplateForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <ItemList labels={labels} maxAccess={maxAccess} recordId={store?.recordId} />
      </CustomTabPanel>
    </>
  )
}

export default LabelTemplateWindow
