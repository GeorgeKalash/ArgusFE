import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import FeesSceduleForm from '../forms/FeesSceduleForm'
import FeesDetailsForm from '../forms/FeesDetailsForm'

const FeesSceduleWindow = ({ height, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab} disabledApply={!editMode && true}>
        <FeesSceduleForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
          onChange={onStrategiesChange}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <FeesDetailsForm labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} editMode={editMode} />
      </CustomTabPanel>
    </>
  )
}

export default FeesSceduleWindow
