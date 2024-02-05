// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import MachinesForm from '../forms/MachinesForm'

const MachinesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='MachinesWindow'
      Title={labels.Machines}
      controlled={true}
      onClose={onClose}
      width={600}
      height={600}
    >
      <CustomTabPanel>
        <MachinesForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default MachinesWindow
