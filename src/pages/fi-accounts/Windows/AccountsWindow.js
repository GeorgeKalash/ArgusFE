import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import AccountsForm from '../forms/AccountsForm'
import CreditLimitsForm from '../forms/CreditLimitsForm'
import AccountBalanceTable from '../forms/AccountBalanceTable'

const AccountsWindow = ({
  height,
  recordId,
  labels,
  maxAccess,
  expanded
}) => {
  const [activeTab , setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store , setStore] = useState({
    recordId : recordId || null,
    currencies: null
  })

  const tabs = [
    { label: labels.Accounts },
    { label: labels.CreditLimits, disabled: !store.recordId },
    { label: labels.AccountBalance, disabled: !store.recordId },
  ]

  return (
    <>
    <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <AccountsForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <CreditLimitsForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <AccountBalanceTable
          store={store}
          labels={labels}
          maxAccess={maxAccess}
          expanded={expanded}
        />
      </CustomTabPanel>
    </>
  )
}

export default AccountsWindow
