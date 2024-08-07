// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import LabelTemplateForm from '../Forms/LabelTemplateForm'
import ItemList from '../Forms/Itemlist'

const LabelTemplateWindow = ({ labels, editMode, maxAccess, recordId, height }) => {
  const [store, setStore] = useState({
    recordId: recordId || null,
    labelTemplate: null,
    item: null
  })

  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.labeltemplate }, { label: labels.item, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <LabelTemplateForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          editMode={store.recordId}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <ItemList labels={labels} maxAccess={maxAccess} editMode={editMode} recordId={store?.recordId} />
      </CustomTabPanel>
    </>
  )
}

export default LabelTemplateWindow
