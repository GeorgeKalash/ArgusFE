import Window from 'src/components/Shared/Window'
import StatesForm from '../forms/StatesForm'

const StatesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='StatesWindow'
      Title={labels.State}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <StatesForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default StatesWindow
