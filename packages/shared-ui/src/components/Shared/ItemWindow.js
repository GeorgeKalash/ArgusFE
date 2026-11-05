import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext.js'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository.js'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams.js'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds.js'
import ItemsForm from './ItemPages/ItemsForm'
import BarcodeForm from './ItemPages/BarcodeForm'
import SalesList from './ItemPages/SaleList'
import PropertiesForm from './ItemPages/PropertiesForm'
import PhysicalForm from './ItemPages/PhysicalForm'
import VendorList from './ItemPages/VendorList'
import ItemProductionForm from './ItemPages/ItemProductionForm'
import KitForm from './ItemPages/KitForm'
import RetailForm from './ItemPages/RetailForm'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ItemWindow = ({ obj, window, onSaved }) => {
  const { recordId, msId, dmgId } = obj || {}

  const [activeTab, setActiveTab] = useState(0)
  const [formikInitial, setFormikInitial] = useState([])
  const editMode = !!recordId
  const { getRequest } = useContext(RequestsContext)
  const { labels, access: maxAccess } = useResourceParams({ datasetId: ResourceIds.Items, editMode: !!recordId })
  useSetWindow({ title: labels.items, window })
  

  const [store, setStore] = useState({
    recordId: recordId || null,
    _msId: msId || null,
    measurementId: null,
    priceGroupId: null,
    returnPolicy: null,
    _kit: false,
    _name: null,
    _reference: null,
    _isMetal: false,
    _metal: null,
    nraId: null,
    productionLevel: null,
    _dmgId: dmgId || null,
    packB: null,
    retailSettings: []
  })

  useEffect(() => {
    async function loadPack() {
      const res = await getRequest({
        extension: InventoryRepository.Items.pack,
        parameters: ''
      })

      if (res?.record) {
        setStore(prev => ({
          ...prev,
          ...res.record,
          _retailSettings: res?.record?.retailSettings
        }))
      }
    }

    loadPack()
  }, [])

  const refreshItem = async () => {
    if (!store._msId || !store.retailSettings?.length) return

    const response = await getRequest({
      extension: InventoryRepository.Items.pack_B,
      parameters: `_itemId=${store.recordId}&_dimGroupId=${store._dmgId || 0}&_itemRetailCount=${store?.retailSettings?.length}&_msId=${store._msId}`
    })

    setStore(prev => ({
      ...prev,
      packB: response.record,
      _measurementUnits: response.record.measurementUnits
    }))
  }

  useEffect(() => {
    if (!store.recordId || store.packB) return

    refreshItem()
  }, [store.recordId, store._dmgId, store._msId, store.retailSettings])

  const tabs = [
    { label: labels.items },
    { label: labels.barcode, disabled: !store.recordId },
    { label: labels.sales, disabled: !store.recordId },
    { label: labels.dimension, disabled: !store.recordId },
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
          onSaved={onSaved}
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
        <VendorList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store}/>
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
ItemWindow.width = 1200
ItemWindow.height = 670

export default ItemWindow
