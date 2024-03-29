// ** Custom Imports
import Window from 'src/components/Shared/Window'
import DescriptionTemplateForm from '../Forms/DescriptionTemplateForm'

const DescriptionTemplateWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='DescriptionTemplateWindow'
      Title={labels.descriptionTemplate}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <DescriptionTemplateForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default DescriptionTemplateWindow
