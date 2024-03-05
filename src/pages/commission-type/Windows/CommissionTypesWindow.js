import Window from 'src/components/Shared/Window'
import CommissionTypesForm from '../forms/CommissionTypesForm'

const CommissionTypesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='CommissionTypesWindow'
      Title={labels.CommissionTypes}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CommissionTypesForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default CommissionTypesWindow
