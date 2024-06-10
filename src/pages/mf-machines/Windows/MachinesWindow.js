import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import MachinesForm from '../forms/MachinesForm'
import MachineSpecificationForm from '../forms/MachineSpecificationForm'
import { useState } from 'react'

const MachinesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  return (
    <Window
      id='MachinesWindow'
      Title={labels.Machines}
      controlled={true}
      onClose={onClose}
      tabs={[{ label: labels.Machines }, { label: labels.MachineSpecification, disabled: !editMode }]}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <MachinesForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MachineSpecificationForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default MachinesWindow
