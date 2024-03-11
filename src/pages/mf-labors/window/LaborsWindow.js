import Window from 'src/components/Shared/Window'
import LaborsForm from '../forms/LaborsForm'

const LaborsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
}) => {
  
  return (
    <Window
      id='LaborsWindow'
      Title={labels.labor}
      controlled={true}
      onClose={onClose}
      width={700}
      height={450}
    >
      <LaborsForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default LaborsWindow
