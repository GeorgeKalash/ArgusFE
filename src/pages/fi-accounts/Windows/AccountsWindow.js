// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import AccountsForm from '../forms/AccountsForm'
import DimensionsForm from '../forms/DimensionsForm'
import CreditLimitsForm from '../forms/CreditLimitsForm'
import AccountBalanceForm from '../forms/AccountBalanceForm'

const AccountsWindow = ({
  height,
  recordId,
  labels,
  maxAccess,
  expanded
}) => {
  const [activeTab , setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store , setStore] = useState({
    recordId : recordId || null,
    currencies: null
  })

  const tabs = [
    { label: labels.Accounts },
    { label: labels.Dimensions, disabled: !store.recordId },
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
          setEditMode={setEditMode}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <DimensionsForm
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
      <CustomTabPanel height={height} index={3} value={activeTab}>
        <AccountBalanceForm
          store={store}
          labels={labels}
          height={height}
          maxAccess={maxAccess}
          expanded={expanded}
        />
      </CustomTabPanel>
    </>
  )
}

export default AccountsWindow
