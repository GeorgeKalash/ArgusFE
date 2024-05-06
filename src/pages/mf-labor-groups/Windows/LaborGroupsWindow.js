// ** Custom Imports
import Window from 'src/components/Shared/Window'
import LaborGroupsForm from '../forms/LaborGroupsForm'

const LaborGroupsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='LaborGroupsWindow' Title={labels.LaborGroups} controlled={true} onClose={onClose}>
      <LaborGroupsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default LaborGroupsWindow
