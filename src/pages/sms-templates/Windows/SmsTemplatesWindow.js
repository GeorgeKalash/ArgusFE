// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SmsTemplatesForm from '../forms/SmsTemplatesForm'
import { useState } from 'react'

const SmsTemplatesWindow = ({
  onClose,
  onSave,
  labels,
  maxAccess,
  recordId
}) => {
  
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  return (
    <Window
      id='SmsTemplatesWindow'
      Title={labels.smsTemplate}
      controlled={true}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel index={0} value={activeTab}>
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
