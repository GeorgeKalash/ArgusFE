import CustomTabPanel from '@argus/shared-ui/components/Shared/CustomTabPanel'
import { useState } from 'react'
import IntegrationLogicForm from '../Forms/IntegrationLogicForm'
import IntegrationLogicDetails from '../Forms/IntegrationLogicDetails'
import { CustomTabs } from '@argus/shared-ui/components/Shared/CustomTabs'

const IntegrationLogicWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })
  const editMode = !!store.recordId

  const tabs = [{ label: labels.integrationLogic }, { label: labels.integrationLogicDetails, disabled: !editMode }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <IntegrationLogicForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <IntegrationLogicDetails labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default IntegrationLogicWindow
