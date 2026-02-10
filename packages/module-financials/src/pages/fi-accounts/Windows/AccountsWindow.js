import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import AccountsForm from '../forms/AccountsForm'
import CreditLimitsForm from '../forms/CreditLimitsForm'
import AccountBalanceTable from '../forms/AccountBalanceTable'
import DimensionsForm from '../forms/DimensionsForm'

const AccountsWindow = ({ height, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    currencies: null
  })

  const tabs = [
    { label: labels.Accounts },
    { label: labels.CreditLimits, disabled: !store.recordId },
    { label: labels.AccountBalance, disabled: !store.recordId },
    { label: labels.Dimensions, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <AccountsForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <CreditLimitsForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab} maxAccess={maxAccess}>
        <AccountBalanceTable store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={3} value={activeTab} maxAccess={maxAccess}>
        <DimensionsForm store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default AccountsWindow
