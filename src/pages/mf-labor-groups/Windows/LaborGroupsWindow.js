// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import LaborGroupsForm from '../forms/LaborGroupsForm'

const LaborGroupsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='LaborGroupsWindow'
      Title={labels.LaborGroups}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <LaborGroupsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default LaborGroupsWindow
