import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import PayrollDetailsForm from '../Forms/PayrollDetailsForm'
import SocialSecurity from '../Forms/SocialSecurity'

const PayrollDetailsWindow = ({ seqNo, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    seqNo
  })

  const editMode = !!store.recordId

  const tabs = [{ label: labels.PayrollDetails }, { label: labels.SocialSecurity, disabled: !editMode }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <PayrollDetailsForm labels={labels} store={store} setStore={setStore} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <SocialSecurity labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default PayrollDetailsWindow
