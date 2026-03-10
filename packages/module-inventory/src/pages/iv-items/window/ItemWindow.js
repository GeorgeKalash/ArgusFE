import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import ItemsForm from '../forms/ItemsForm.js'
import PhysicalForm from '../forms/PhysicalForm.js'
import VendorList from '../forms/VendorList.js'
import SalesList from '../forms/SaleList.js'
import PropertiesForm from '../forms/PropertiesForm.js'
import BarcodeForm from '../forms/BarcodeForm.js'
import ItemProductionForm from '../forms/ItemProductionForm.js'
import KitForm from '../forms/KitForm.js'
import RetailForm from '../forms/RetailForm.js'

const ItemWindow = ({ recordId, labels, msId, maxAccess, window }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formikInitial, setFormikInitial] = useState([])
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    _msId: msId,
    measurementId: null,
    priceGroupId: null,
    returnPolicy: null,
    _kit: false,
    _name: null,
    _reference: null,
    _isMetal: false,
    _metal: null,
    nraId: null,
    productionLevel: null
  })

  const tabs = [
    { label: labels.items },
    { label: labels.barcode, disabled: !store.recordId },
    { label: labels.sales, disabled: !store.recordId },
    { label: labels.properties, disabled: !store.recordId },
    { label: labels.physical, disabled: !store.recordId },
    { label: labels.vendor, disabled: !store.recordId },
    { label: labels.production, disabled: !store.recordId },
    { label: labels.kit, disabled: !store._kit },
    { label: labels.retail, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={670} index={0} value={activeTab} maxAccess={maxAccess}>
        <ItemsForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
          setFormikInitial={setFormikInitial}
          window={window}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <BarcodeForm labels={labels} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <SalesList labels={labels} maxAccess={maxAccess} store={store} formikInitial={formikInitial} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <PropertiesForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab} maxAccess={maxAccess}>
        <PhysicalForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab} maxAccess={maxAccess}>
        <VendorList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={6} value={activeTab} maxAccess={maxAccess}>
        <ItemProductionForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={7} value={activeTab} maxAccess={maxAccess}>
        <KitForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={8} value={activeTab} maxAccess={maxAccess}>
        <RetailForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default ItemWindow
