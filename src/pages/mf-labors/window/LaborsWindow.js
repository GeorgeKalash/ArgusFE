import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import LaborsForm from '../forms/LaborsForm'

const LaborsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,



}) => {
  
  return (
    <Window
      id='LaborsWindow'
      Title={labels.labor}
      controlled={true}
      onClose={onClose}
      width={700}
      height={450}
    >
      <CustomTabPanel>
        <LaborsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}

        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default LaborsWindow
