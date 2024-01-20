// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
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
      <CustomTabPanel>
        <SmsTemplatesForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default SmsTemplatesWindow
