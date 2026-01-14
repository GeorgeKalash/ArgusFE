import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import BPMasterDataForm from '../forms/BPMasterDataForm'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import IDNumberForm from '../forms/IDNumberForm'
import AddressMasterDataForm from '../forms/AddressMasterDataForm'
import RelationList from '../forms/RelationList'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import RolesTab from '../forms/RolesTab'
import SalesForm from '../forms/SalesForm'
import PurchaseForm from '../forms/PurchaseForm'
import BankTab from '../forms/BankTab'

const BPMasterDataWindow = ({ labels, maxAccess, recordId, invalidate, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    category: null,
    bp: { ref: '', name: '' }
  })

  const tabs = [
    { label: labels.general },
    { label: labels.idNumber, disabled: !store.recordId },
    { label: labels.relation, disabled: !store.recordId },
    { label: labels.address, disabled: !store.recordId },
    { label: labels.role, disabled: !store.recordId },
    { label: labels.sales, disabled: !store.recordId },
    { label: labels.purchase, disabled: !store.recordId },
    { label: labels.bank, disabled: !store.recordId }
  ]

  return (
    <VertLayout>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <BPMasterDataForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          invalidate={invalidate}
          window={window}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <IDNumberForm store={store} maxAccess={maxAccess} labels={labels} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <RelationList store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <AddressMasterDataForm store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab} maxAccess={maxAccess}>
        <RolesTab store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab} maxAccess={maxAccess}>
        <SalesForm store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={6} value={activeTab} maxAccess={maxAccess}>
        <PurchaseForm store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={7} value={activeTab} maxAccess={maxAccess}>
        <BankTab store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </VertLayout>
  )
}

export default BPMasterDataWindow
