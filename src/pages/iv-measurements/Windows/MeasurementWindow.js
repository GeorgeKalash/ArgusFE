import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import MeasurementForm from '../Forms/MeasurementForm'
import MeasurementUnit from '../Forms/MeasurementUnit'

const MeasurementWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })
  const editMode = !!store.recordId

  const tabs = [{ label: labels.measurement }, { label: labels.measurementUnit, disabled: !editMode }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel index={0} value={activeTab}>
        <MeasurementForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MeasurementUnit labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default MeasurementWindow
