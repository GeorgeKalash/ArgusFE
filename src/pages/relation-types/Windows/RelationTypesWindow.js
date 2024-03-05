import Window from 'src/components/Shared/Window'
import RelationTypesForm from '../forms/RelationTypesForm'

const RelationTypesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='RelationTypesWindow'
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

export default RelationTypesWindow
