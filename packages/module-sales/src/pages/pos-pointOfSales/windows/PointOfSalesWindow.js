import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import PointOfSalesForm from '../forms/PointOfSalesForm'
import UsersForm from '../forms/UsersForm'
import SalesPersonForm from '../forms/SalesPersonForm'
import CashAccountForm from '../forms/CashAccountForm'

const PointOfSalesWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId
  })

  const tabs = [
    { label: labels.pos },
    { label: labels.user, disabled: !store.recordId },
    { label: labels.salePerson, disabled: !store.recordId },
    { label: labels.caAcc, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} disabledApply={!editMode && true} maxAccess={maxAccess}>
        <PointOfSalesForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <UsersForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <SalesPersonForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <CashAccountForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default PointOfSalesWindow
