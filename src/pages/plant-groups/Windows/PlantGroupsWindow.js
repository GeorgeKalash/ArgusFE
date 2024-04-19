// ** Custom Imports
import Window from 'src/components/Shared/Window'
import PlantGroupsForm from '../forms/PlantGroupsForm'

const PlantWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='PlantWindow' Title={labels.plantGroup} controlled={true} onClose={onClose} width={500} height={300}>
      <PlantGroupsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default PlantWindow
