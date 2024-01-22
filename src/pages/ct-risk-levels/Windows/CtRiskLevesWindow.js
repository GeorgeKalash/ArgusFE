// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CtRiskLevelsForm from '../forms/CtRiskLevelsForm'

const CtRiskLevelsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='CtRiskLevelsWindow'
      Title={labels.Risklevel}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <CtRiskLevelsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default CtRiskLevelsWindow
