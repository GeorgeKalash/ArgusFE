// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AccountsForm from '../forms/AccountsForm'
import DimensionsForm from '../forms/DimensionsForm'
import CreditLimitsForm from '../forms/CreditLimitsForm'
import AccountBalanceForm from '../forms/AccountBalanceForm'
import { useState } from 'react'


const AccountsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store , setStore] = useState({
    recordId : recordId || null,
    list: null,
  })

  return (

    <Window
      id='AccountsWindow'
      Title={labels.Accounts}
      controlled={true}
      onClose={onClose}
      width={600}
      height={550}
      tabs={[
        { label: labels.Accounts },
        { label: labels.Dimensions, disabled: !editMode },
        { label: labels.CreditLimits, disabled: !editMode },
        { label: labels.AccountBalance, disabled: !editMode },
      ]}
      activeTab={activeTab}
      setActiveTab={setActiveTab}

    >
      <CustomTabPanel index={0} value={activeTab}>
      <AccountsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
      <DimensionsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
      <CreditLimitsForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
        />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
      <AccountBalanceForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default AccountsWindow
