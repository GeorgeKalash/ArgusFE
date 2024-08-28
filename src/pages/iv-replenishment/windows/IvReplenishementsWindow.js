// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

// import IvReplenishementList from '../forms/codeList.js'

import IvReplenishementsForm from '../forms/IvReplenishementsForm.js'
import IvReplenishementsList from '../forms/IvReplenishementsList.js'

const IvReplenishementsWindow = ({ height, recordId, labels, maxAccess, expanded, onApply }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  function onStrategiesChange(values) {
    setStore({
      ...store,
      ...values
    })
  }

  const tabs = [{ label: labels.itemRep }, { label: labels.repTra, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab} disabledApply={!editMode && true}>
        <IvReplenishementsForm
          labels={labels}
          setStore={setStore}
          store={store}
          maxAccess={maxAccess}
          onChange={onStrategiesChange}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <IvReplenishementsList labels={labels} setStore={setStore} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default IvReplenishementsWindow
