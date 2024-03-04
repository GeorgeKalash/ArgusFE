import Window from 'src/components/Shared/Window'
import RelationTypesForm from '../forms/RelationTypesForm'

const RelationTypessWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='RelationTypessWindow'
      Title={labels.RelationTypes}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <RelationTypesForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default RelationTypessWindow
