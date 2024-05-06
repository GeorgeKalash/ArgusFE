// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ProfessionsForm from '../forms/ProfessionsForm'

const professionWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <>
      <Window id='ProfessionWindow' Title={labels.profession} controlled={true} onClose={onClose} width={500}>
        <ProfessionsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </Window>
    </>
  )
}

export default professionWindow
