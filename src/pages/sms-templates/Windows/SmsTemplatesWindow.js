// ** Custom Imports
import Window from 'src/components/Shared/Window'
import SmsTemplatesForm from '../forms/SmsTemplatesForm'

const SmsTemplatesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='SmsTemplatesWindow'
      Title={labels.smsTemplate}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
        <SmsTemplatesForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
    </Window>
  )
}

export default SmsTemplatesWindow
