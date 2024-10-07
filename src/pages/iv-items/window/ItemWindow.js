import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

import ItemsForm from '../forms/ItemsForm.js'
import PhysicalForm from '../forms/PhysicalForm.js'
import VendorList from '../forms/VendorList.js'
import SalesList from '../forms/SaleList.js'
import PropertiesForm from '../forms/PropertiesForm.js'
import BarcodeForm from '../forms/BarcodeForm.js'
import ItemProductionForm from '../forms/ItemProductionForm.js'
import KitForm from '../forms/KitForm.js'

const ItemWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formikInitial, setFormikInitial] = useState([])
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    _msId: null,
    measurementId: null,
    priceGroupId: null,
    returnPolicy: null,
    _kit: false,
    _name: null,
    _reference: null,
    _isMetal: false,
    _metal: null
  })

  const tabs = [
    { label: labels.items },
    { label: labels.barcode, disabled: !store.recordId },
    { label: labels.sales, disabled: !store.recordId },
    { label: labels.properties, disabled: !store.recordId },
    { label: labels.physical, disabled: !store.recordId },
    { label: labels.vendor, disabled: !store.recordId },
    { label: labels.production, disabled: !store.recordId },
    { label: 'kit', disabled: !store.recordId || !store._kit }
  ]
  console.log(tabs[7].disabled, 'dis')
  console.log(store, 'store')

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
        <BarcodeForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={2} value={activeTab}>
        <SalesList labels={labels} maxAccess={maxAccess} store={store} formikInitial={formikInitial} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={3} value={activeTab}>
        <PropertiesForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={4} value={activeTab}>
        <PhysicalForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={5} value={activeTab}>
        <VendorList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={6} value={activeTab}>
        <ItemProductionForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel height={660} index={7} value={activeTab}>
        <KitForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default ItemWindow
