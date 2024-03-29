// ** Custom Imports
import Window from 'src/components/Shared/Window'
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
      <OperationsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default OperationsWindow
