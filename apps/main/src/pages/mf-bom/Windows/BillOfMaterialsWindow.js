import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import BillOfMaterialsForm from '../Forms/BillOfMaterialsForm'
import ComponentBOM from '../Forms/Component'

const BillOfMaterialsWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [{ label: labels.BillOfMaterials }, { label: labels.Component, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <BillOfMaterialsForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <ComponentBOM labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default BillOfMaterialsWindow
