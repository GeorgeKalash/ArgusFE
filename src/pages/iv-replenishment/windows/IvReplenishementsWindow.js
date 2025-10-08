import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import IvReplenishementsForm from '../forms/IvReplenishementsForm.js'
import IvReplenishementsList from '../forms/IvReplenishementsList.js'

const IvReplenishementsWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [{ label: labels.itemRep }, { label: labels.repTra, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <IvReplenishementsForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <IvReplenishementsList labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default IvReplenishementsWindow
