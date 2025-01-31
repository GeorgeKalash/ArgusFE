import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import TRXForm from '../forms/TRXForm.js'
import InvoicesForm from '../forms/InvoicesForm.js'
import TransactionTab from '../forms/TransactionTab.js'
import DistributionTab from '../forms/DistributionTab.js'
import InvoicesItemsTab from '../forms/InvoicesItemsTab.js'

const PuCostAllocationWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    isPosted: false,
    isClosed: false,
    invoicesItemsData: []
  })

  const tabs = [
    { label: labels.TRX },
    { label: labels.invoices, disabled: !store.recordId },
    { label: labels.invoicesItems, disabled: !store.recordId },
    { label: labels.transaction, disabled: !store.recordId },
    { label: labels.distribution, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={670} index={0} value={activeTab}>
        <TRXForm labels={labels} setStore={setStore} store={store} access={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <InvoicesForm labels={labels} setStore={setStore} editMode={editMode} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <InvoicesItemsTab labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <TransactionTab store={store} labels={labels} access={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab}>
        <DistributionTab labels={labels} access={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default PuCostAllocationWindow
