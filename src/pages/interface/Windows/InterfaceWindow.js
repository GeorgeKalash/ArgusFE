// ** Custom Imports
import Window from 'src/components/Shared/Window'
import InterfaceForm from '../forms/InterfaceForm'

const InterfaceWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='InterfaceWindow' Title={labels.interface} controlled={true} width={500} height={450} onClose={onClose}>
      <InterfaceForm labels={labels} recordId={recordId} maxAccess={maxAccess} />
    </Window>
  )
}

export default InterfaceWindow
