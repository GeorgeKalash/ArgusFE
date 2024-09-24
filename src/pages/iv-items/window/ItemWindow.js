import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

import ItemsForm from '../forms/ItemsForm.js'
import PhysicalForm from '../forms/PhysicalForm.js'
import VendorList from '../forms/VendorList.js'
import SalesList from '../forms/SaleList.js'
import PropertiesForm from '../forms/PropertiesForm.js'
import BarcodeForm from '../forms/BarcodeForm.js'

const ItemWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formikInitial, setFormikInitial] = useState([])
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    _msId: null,
    measurementId: null,
    priceGroupId: null,
    returnPolicy: null
  })

  console.log(store, 'store')

  const tabs = [
    { label: labels.items },
    { label: labels.physical, disabled: !store.recordId },
    { label: labels.vendor, disabled: !store.recordId },
    { label: labels.sales, disabled: !store.recordId },
    { label: labels.properties, disabled: !store.recordId },
    { label: labels.barcode, disabled: !store.recordId }
  ]

  console.log(formikInitial, 'initial')

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={660} index={0} value={activeTab}>
        <ItemsForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
          setFormikInitial={setFormikInitial}
        />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={1} value={activeTab}>
        <PhysicalForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={2} value={activeTab}>
        <VendorList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={3} value={activeTab}>
        <SalesList
          labels={labels}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          formikInitial={formikInitial}
        />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={4} value={activeTab}>
        <PropertiesForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={5} value={activeTab}>
        <BarcodeForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default ItemWindow
