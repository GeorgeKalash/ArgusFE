import Window from 'src/components/Shared/Window'
import RelationTypesForm from '../forms/RelationTypesForm'

const RelationTypesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='RelationTypesWindow' Title={labels.RelationTypes} controlled={true} onClose={onClose}>
      <RelationTypesForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default RelationTypesWindow
