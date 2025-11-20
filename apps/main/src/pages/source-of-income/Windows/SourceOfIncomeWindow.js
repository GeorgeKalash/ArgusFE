// ** Custom Imports
import Window from '@argus/shared-ui/src/components/Shared/Window'

import SourceOfIncomeForm from '../forms/sourceOfIncomeForm'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { InterfacesForm } from '@argus/shared-ui/src/components/Shared/InterfacesForm'
import { useState } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const SourceOfIncomeWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    name: null
  })

  const tabs = [{ label: labels?.sourceOfIncome }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <SourceOfIncomeForm labels={labels} maxAccess={maxAccess} recordId={recordId} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <InterfacesForm
          height={height}
          labels={labels}
          resourceId={ResourceIds.SourceOfIncome}
          recordId={store.recordId}
          maxAccess={maxAccess}
          name={store.name}
        />
      </CustomTabPanel>
    </>
  )
}

export default SourceOfIncomeWindow
