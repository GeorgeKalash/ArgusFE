import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import LoansForm from '../Forms/LoansForm'
import DeductionTab from '../Forms/DeductionTab'

const LoanWindow = ({ recordId, labels, access }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId,
    isClosed: false,
    loanAmount: 0
  })

  const tabs = [{ label: labels.LoanInfo }, { label: labels.Deduction, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <LoansForm labels={labels} setStore={setStore} store={store} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <DeductionTab labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default LoanWindow
