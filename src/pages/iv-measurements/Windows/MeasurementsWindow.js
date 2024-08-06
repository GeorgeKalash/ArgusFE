import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import MeasurementForm from '../Forms/MeasurementForm'
import MeasurementUnit from '../Forms/MeasurementUnit'

const MeasurementWindow = ({ onClose, labels, maxAccess, recordId, invalidate }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  return (
    <Window
      id='MeasurementWindow'
      Title={labels.measurement}
      controlled={true}
      onClose={onClose}
      tabs={[{ label: labels.measurement }, { label: labels.measurementUnit, disabled: !editMode }]}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      width={600}
      height={400}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <MeasurementForm labels={labels} maxAccess={maxAccess} recordId={recordId} invalidate={invalidate}/>
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MeasurementUnit labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default MeasurementWindow
