import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

import CategoryForm from '../forms/CategoryForm'
import CurrencyForm from '../forms/CurrencyForm'

const CategoryWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId
  })

  const tabs = [
    { label: labels.categories },

    { label: labels.currency, disabled: !store.recordId }

    // { label: labels.salePerson, disabled: !store.recordId },
    // { label: labels.caAcc, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab} disabledApply={!editMode && true}>
        <CategoryForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <CurrencyForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      {/*  <CustomTabPanel index={2} value={activeTab}>
        <SalesPersonForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <CashAccountForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel> */}
    </>
  )
}

export default CategoryWindow
