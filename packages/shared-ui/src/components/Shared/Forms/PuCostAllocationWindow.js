import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds.js'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams.js'
import TRXForm from '@argus/shared-ui/src/components/Shared/Forms/TRXForm'
import InvoicesForm from '@argus/shared-ui/src/components/Shared/Forms/InvoicesForm'
import InvoicesItemsTab from '@argus/shared-ui/src/components/Shared/Forms/InvoicesItemsTab'
import TransactionTab from '@argus/shared-ui/src/components/Shared/Forms/TransactionTab'
import DistributionTab from '@argus/shared-ui/src/components/Shared/Forms/DistributionTab'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'


const PuCostAllocationWindow = ({ recordId, window }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    isPosted: false,
    isClosed: false,
    baseAmount: 0,
    invoicesItemsData: []
  })

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.PuCostAllocation,
    editMode: !!recordId
  })
  
  useSetWindow({ title: labels.PuCostAllocations, window })

  const tabs = [
    { label: labels.TRX },
    { label: labels.invoices, disabled: !store.recordId },
    { label: labels.invoicesItems, disabled: !store.recordId },
    { label: labels.transaction, disabled: !store.recordId },
    { label: labels.distribution, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={670} index={0} value={activeTab} maxAccess={maxAccess}>
        <TRXForm labels={labels} setStore={setStore} store={store} access={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <InvoicesForm labels={labels} setStore={setStore} editMode={editMode} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <InvoicesItemsTab labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <TransactionTab store={store} labels={labels} access={maxAccess} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab} maxAccess={maxAccess}>
        <DistributionTab labels={labels} access={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

PuCostAllocationWindow.width = 800
PuCostAllocationWindow.height = 500

export default PuCostAllocationWindow
