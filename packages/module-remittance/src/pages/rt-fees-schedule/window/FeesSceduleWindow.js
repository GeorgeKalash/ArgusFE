import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import FeesSceduleForm from '../forms/FeesSceduleForm'
import FeesDetailsForm from '../forms/FeesDetailsForm'

const FeesSceduleWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  function onStrategiesChange(values) {
    setStore({
      ...store,
      ...values
    })
  }

  const tabs = [{ label: labels.feesScedule }, { label: labels.details, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <FeesSceduleForm
          labels={labels}
          setStore={setStore}
          store={store}
          maxAccess={maxAccess}
          onChange={onStrategiesChange}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <FeesDetailsForm labels={labels} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default FeesSceduleWindow
