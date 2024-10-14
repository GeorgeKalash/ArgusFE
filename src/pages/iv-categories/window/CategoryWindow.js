import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

import CategoryForm from '../forms/CategoryForm'
import CurrencyForm from '../forms/CurrencyForm'
import CategorySiteForm from '../forms/CategorySiteForm'

const CategoryWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId,
    ref: null,
    name: null
  })

  const tabs = [
    { label: labels.categories },

    { label: labels.currency, disabled: !store.recordId },

    { label: labels.categorySite, disabled: !store.recordId }
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
      <CustomTabPanel index={2} value={activeTab}>
        <CategorySiteForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default CategoryWindow
