// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import OperationsForm from '../forms/OperationsForm'

const OperationsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='OperationsWindow'
      Title={labels.Operations}
      controlled={true}
      onClose={onClose}
      width={500}
      height={400}
    >
      <CustomTabPanel>
        <OperationsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default OperationsWindow
