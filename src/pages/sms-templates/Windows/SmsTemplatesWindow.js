// ** Custom Imports
import Window from 'src/components/Shared/Window'
import SmsTemplatesForm from '../forms/SmsTemplatesForm'

const SmsTemplatesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='SmsTemplatesWindow' Title={labels.smsTemplate} controlled={true} onClose={onClose} height={350} width={500}>
      <SmsTemplatesForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default SmsTemplatesWindow
