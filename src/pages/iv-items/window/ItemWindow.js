import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

import ItemsForm from '../forms/ItemsForm.js'
import PhysicalForm from '../forms/PhysicalForm.js'
import VendorList from '../forms/VendorList.js'

const ItemWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [
    { label: labels.items },
    { label: labels.physical, disabled: !store.recordId },
    { label: labels.vendor, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={660} index={0} value={activeTab}>
        <ItemsForm labels={labels} setStore={setStore} store={store} editMode={editMode} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={1} value={activeTab}>
        <PhysicalForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={2} value={activeTab}>
        <VendorList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default ItemWindow
