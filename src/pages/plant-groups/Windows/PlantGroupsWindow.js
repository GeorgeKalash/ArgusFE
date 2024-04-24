// ** Custom Imports
import PlantGroupsForm from '../forms/PlantGroupsForm'

const PlantWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return <PlantGroupsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
}

export default PlantWindow
