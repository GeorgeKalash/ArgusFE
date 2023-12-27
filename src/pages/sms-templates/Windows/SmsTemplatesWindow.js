// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SmsTemplatesTab from 'src/pages/sms-templates/Tabs/SmsTemplatesTab'

const SmsTemplatesWindow = ({
  onClose,
  width,
  height,
  onSave,
  smsTemplatesValidation,
  labels,
  maxAccess
}) => {
  return (
    <Window
      id='SmsTemplatesWindow'
      Title={labels.smsTemplate}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      smsTemplatesValidation={smsTemplatesValidation}
    >
      <CustomTabPanel>
        <SmsTemplatesTab
          labels={labels}
          smsTemplatesValidation={smsTemplatesValidation}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default SmsTemplatesWindow
