import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import PointOfSalesForm from '../forms/PointOfSalesForm'
import UsersForm from '../forms/UsersForm'
import SalesPersonForm from '../forms/SalesPersonForm'

const PointOfSalesWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [
    { label: labels.pos },
    { label: labels.user, disabled: !store.recordId },
    { label: labels.salePerson, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab} disabledApply={!editMode && true}>
        <PointOfSalesForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <UsersForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <SalesPersonForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default PointOfSalesWindow
